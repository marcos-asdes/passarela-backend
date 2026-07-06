import { Inject, Injectable } from '@nestjs/common'
import {
  IInterestCountPort,
  IMerchantOfferResult,
  INTEREST_COUNT_PORT,
  IOfferRepository,
  OFFER_REPOSITORY
} from '@offers/application/types'

/** Caso de uso: dashboard do merchant — suas offers, cada uma com a contagem de interest */
@Injectable()
export class ListMerchantOffersUseCase {
  constructor(
    @Inject(OFFER_REPOSITORY) private readonly offerRepository: IOfferRepository,
    @Inject(INTEREST_COUNT_PORT) private readonly interestCountPort: IInterestCountPort
  ) {}

  async execute(merchantId: string): Promise<IMerchantOfferResult[]> {
    const offers = await this.offerRepository.findByMerchant(merchantId)
    const counts = await this.interestCountPort.countByOffers(offers.map((offer) => offer.id))

    return offers.map((offer) => ({ offer, interestCount: counts[offer.id] ?? 0 }))
  }
}
