import { Inject, Injectable } from '@nestjs/common'
import { OfferAlreadyClosedError } from '@offers/domain/offer-already-closed.error'
import { OfferNotFoundError } from '@offers/domain/offer-not-found.error'
import { OfferNotOwnedError } from '@offers/domain/offer-not-owned.error'
import { Offer } from '@offers/domain/offer.entity'
import { IOfferRepository, IUpdateOfferInput, OFFER_REPOSITORY } from '@offers/application/types'

/** Caso de uso: merchant edita uma offer própria — só permitido enquanto ela estiver `Active` */
@Injectable()
export class UpdateOfferUseCase {
  constructor(@Inject(OFFER_REPOSITORY) private readonly offerRepository: IOfferRepository) {}

  async execute(input: IUpdateOfferInput): Promise<Offer> {
    const offer = await this.offerRepository.findById(input.id)

    if (!offer) {
      throw new OfferNotFoundError()
    }
    if (!offer.isOwnedBy(input.merchantId)) {
      throw new OfferNotOwnedError()
    }
    if (!offer.isEditable()) {
      throw new OfferAlreadyClosedError()
    }

    const updated = await this.offerRepository.update(input.id, input.data)
    if (!updated) {
      throw new OfferNotFoundError()
    }
    return updated
  }
}
