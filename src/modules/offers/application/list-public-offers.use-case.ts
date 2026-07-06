import { Inject, Injectable } from '@nestjs/common'
import { Offer } from '@offers/domain/offer.entity'
import { OfferStatus } from '@offers/domain/types'
import { IOfferRepository, OFFER_REPOSITORY } from '@offers/application/types'

/** Caso de uso: listagem pública (feed do shopper) — filtro por status, default `Active` */
@Injectable()
export class ListPublicOffersUseCase {
  constructor(@Inject(OFFER_REPOSITORY) private readonly offerRepository: IOfferRepository) {}

  async execute(status: OfferStatus = OfferStatus.Active): Promise<Offer[]> {
    return this.offerRepository.findPublic(status)
  }
}
