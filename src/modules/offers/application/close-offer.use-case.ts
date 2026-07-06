import { Inject, Injectable } from '@nestjs/common'
import { OfferNotFoundError } from '@offers/domain/offer-not-found.error'
import { OfferNotOwnedError } from '@offers/domain/offer-not-owned.error'
import { Offer } from '@offers/domain/offer.entity'
import { ICloseOfferInput, IOfferRepository, OFFER_REPOSITORY } from '@offers/application/types'

/** Caso de uso: merchant encerra uma offer própria manualmente */
@Injectable()
export class CloseOfferUseCase {
  constructor(@Inject(OFFER_REPOSITORY) private readonly offerRepository: IOfferRepository) {}

  async execute(input: ICloseOfferInput): Promise<Offer> {
    const offer = await this.offerRepository.findById(input.id)

    if (!offer) {
      throw new OfferNotFoundError()
    }
    if (!offer.isOwnedBy(input.merchantId)) {
      throw new OfferNotOwnedError()
    }

    const newStatus = offer.close()
    const updated = await this.offerRepository.updateStatus(input.id, newStatus)
    if (!updated) {
      throw new OfferNotFoundError()
    }
    return updated
  }
}
