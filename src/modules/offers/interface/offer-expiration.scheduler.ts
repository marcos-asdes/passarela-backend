import { Injectable } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { ExpireOffersUseCase } from '@offers/application/expire-offers.use-case'
import { OfferResponseDto } from '@offers/interface/offer-response.dto'
import { OffersGateway } from '@offers/interface/offers.gateway'
import { AppLoggerService } from '@shared/logger/app-logger.service'

/** Roda a cada minuto: muda pra `Expired` toda offer `Active`/`SoldOut` com `validUntil` no passado, e notifica via WebSocket */
@Injectable()
export class OfferExpirationScheduler {
  constructor(
    private readonly expireOffersUseCase: ExpireOffersUseCase,
    private readonly offersGateway: OffersGateway,
    private readonly logger: AppLoggerService
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleExpiration(): Promise<void> {
    const expiredOffers = await this.expireOffersUseCase.execute()
    if (expiredOffers.length === 0) return

    this.logger.log(`${expiredOffers.length} offer(s) expirada(s)`, 'OfferExpirationScheduler')
    for (const offer of expiredOffers) {
      const responseDto = OfferResponseDto.fromEntity(offer)
      this.offersGateway.notifyOfferUpdated(responseDto)
      this.offersGateway.notifyOfferStatusChanged(responseDto)
    }
  }
}
