import { Inject, Injectable } from '@nestjs/common'
import { Offer } from '@offers/domain/offer.entity'
import { ICreateOfferInput, IOfferRepository, OFFER_REPOSITORY } from '@offers/application/types'

/** Caso de uso: merchant publica uma nova offer — nasce sempre `Active` */
@Injectable()
export class CreateOfferUseCase {
  constructor(@Inject(OFFER_REPOSITORY) private readonly offerRepository: IOfferRepository) {}

  async execute(input: ICreateOfferInput): Promise<Offer> {
    return this.offerRepository.create({
      merchantId: input.merchantId,
      title: input.title,
      description: input.description,
      discountPercent: input.discountPercent,
      stock: input.stock,
      validUntil: input.validUntil
    })
  }
}
