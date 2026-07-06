import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets'
import { Server } from 'socket.io'
import { OfferResponseDto } from '@offers/interface/offer-response.dto'

/**
 * Notifica shoppers conectados quando uma offer nova é publicada. `cors: true` (não amarrado a
 * CORS_ORIGIN) porque o valor de env só fica disponível em runtime via ConfigService, e o decorator
 * é avaliado no import da classe — mesmo trade-off já assumido de handshake sem autenticação (ver
 * plano de arquitetura), aceitável pro MVP do desafio.
 */
@WebSocketGateway({ namespace: '/offers', cors: true })
export class OffersGateway {
  @WebSocketServer()
  private readonly server!: Server

  notifyOfferCreated(offer: OfferResponseDto): void {
    this.server.emit('offer:created', offer)
  }
}
