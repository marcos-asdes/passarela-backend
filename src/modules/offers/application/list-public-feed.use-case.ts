import { Inject, Injectable } from '@nestjs/common'
import { IOfferRepository, OFFER_REPOSITORY } from '@offers/application/types'
import { Offer } from '@offers/domain/offer.entity'

/** Caso de uso: feed público completo — Active primeiro, depois Expired, depois SoldOut (cada grupo por data desc). */
@Injectable()
export class ListPublicFeedUseCase {
  constructor(@Inject(OFFER_REPOSITORY) private readonly offerRepository: IOfferRepository) {}

  async execute(): Promise<Offer[]> {
    return this.offerRepository.findPublicFeed()
  }
}
