import { Inject, Injectable } from '@nestjs/common'
import { IOfferRepository, OFFER_REPOSITORY } from '@offers/application/types'

/** Caso de uso chamado pelo scheduler: muda pra `Expired` toda offer `Active`/`SoldOut` vencida */
@Injectable()
export class ExpireOffersUseCase {
  constructor(@Inject(OFFER_REPOSITORY) private readonly offerRepository: IOfferRepository) {}

  async execute(): Promise<number> {
    return this.offerRepository.expireOverdue(new Date())
  }
}
