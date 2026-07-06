import { IInterestCountPort, IOfferRepository, INTEREST_COUNT_PORT, OFFER_REPOSITORY } from '@offers/application/types'
import { OfferResponseDto } from '@offers/interface/offer-response.dto'
import { Inject, OnModuleInit } from '@nestjs/common'
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets'
import { DomainEventsService } from '@shared/realtime/domain-events.service'
import { Server, Socket } from 'socket.io'

/** Payload emitido por `interest`'s controller (via `DomainEventsService`) quando um interest é registrado/removido. */
interface InterestChangedEvent {
  offerId: string
}

/**
 * Notifica shoppers conectados quando uma offer nova é publicada, e merchants conectados quando uma
 * offer própria muda (status ou contagem de interest). `cors: true` (não amarrado a CORS_ORIGIN)
 * porque o valor de env só fica disponível em runtime via ConfigService, e o decorator é avaliado no
 * import da classe — mesmo trade-off já assumido de handshake sem autenticação (ver plano de
 * arquitetura), aceitável pro MVP do desafio. Por isso `merchant:subscribe` confia no `merchantId` que
 * o próprio client informa, sem validar contra o JWT.
 */
@WebSocketGateway({ namespace: '/offers', cors: true })
export class OffersGateway implements OnModuleInit {
  @WebSocketServer()
  private readonly server!: Server

  constructor(
    private readonly domainEvents: DomainEventsService,
    @Inject(OFFER_REPOSITORY) private readonly offerRepository: IOfferRepository,
    @Inject(INTEREST_COUNT_PORT) private readonly interestCountPort: IInterestCountPort
  ) {}

  /** Assina `interest:changed` (emitido pelo `interest.controller.ts` via `DomainEventsService`) sem importar classe do outro bounded context. */
  onModuleInit(): void {
    this.domainEvents.on('interest:changed', (event: InterestChangedEvent) => {
      void this.handleInterestChanged(event.offerId)
    })
  }

  /** Client entra na sala do próprio merchant — só assim recebe `offer:updated`/`offer:interest-changed` das suas offers. */
  @SubscribeMessage('merchant:subscribe')
  handleMerchantSubscribe(@MessageBody() body: { merchantId?: string }, @ConnectedSocket() socket: Socket): void {
    if (body?.merchantId) socket.join(this.merchantRoom(body.merchantId))
  }

  notifyOfferCreated(offer: OfferResponseDto): void {
    this.server.emit('offer:created', offer)
  }

  /** Notifica só o merchant dono da offer — usado quando ele mesmo encerra (ou o scheduler expira) uma offer própria. */
  notifyOfferUpdated(offer: OfferResponseDto): void {
    this.server.to(this.merchantRoom(offer.merchantId)).emit('offer:updated', offer)
  }

  /** Notifica o namespace inteiro (feed do shopper) quando uma offer é encerrada ou expira — mesmo alcance de `notifyOfferCreated`. */
  notifyOfferStatusChanged(offer: OfferResponseDto): void {
    this.server.emit('offer:status-changed', offer)
  }

  private async handleInterestChanged(offerId: string): Promise<void> {
    const offer = await this.offerRepository.findById(offerId)
    if (!offer) return

    const counts = await this.interestCountPort.countByOffers([offerId])
    this.server.to(this.merchantRoom(offer.merchantId)).emit('offer:interest-changed', {
      offerId,
      interestCount: counts[offerId] ?? 0
    })
  }

  private merchantRoom(merchantId: string): string {
    return `merchant:${merchantId}`
  }
}
