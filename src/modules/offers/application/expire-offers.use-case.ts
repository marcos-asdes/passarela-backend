import { Inject, Injectable } from '@nestjs/common'
import { IOfferRepository, OFFER_REPOSITORY } from '@offers/application/types'
import { Offer } from '@offers/domain/offer.entity'

/** Caso de uso chamado pelo scheduler: muda pra `Expired` toda offer `Active`/`SoldOut` vencida, devolvendo as afetadas */
@Injectable()
export class ExpireOffersUseCase {
  constructor(@Inject(OFFER_REPOSITORY) private readonly offerRepository: IOfferRepository) {}

  async execute(): Promise<Offer[]> {
    return this.offerRepository.expireOverdue(new Date())
  }
}
