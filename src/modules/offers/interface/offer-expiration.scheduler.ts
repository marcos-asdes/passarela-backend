import { Injectable } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { ExpireOffersUseCase } from '@offers/application/expire-offers.use-case'
import { AppLoggerService } from '@shared/logger/app-logger.service'

/** Roda a cada minuto: muda pra `Expired` toda offer `Active`/`SoldOut` com `validUntil` no passado */
@Injectable()
export class OfferExpirationScheduler {
  constructor(
    private readonly expireOffersUseCase: ExpireOffersUseCase,
    private readonly logger: AppLoggerService
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleExpiration(): Promise<void> {
    const count = await this.expireOffersUseCase.execute()
    if (count > 0) {
      this.logger.log(`${count} offer(s) expirada(s)`, 'OfferExpirationScheduler')
    }
  }
}
