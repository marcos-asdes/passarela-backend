import {
  IInterestRepository,
  INTEREST_REPOSITORY,
  IOfferStockPort,
  IRemoveInterestInput,
  OFFER_STOCK_PORT
} from '@interest/application/types'
import { InterestNotFoundError } from '@interest/domain/interest-not-found.error'
import { Inject, Injectable } from '@nestjs/common'

/**
 * Caso de uso: shopper remove o próprio interest numa offer. Remove o registro e devolve
 * 1 unidade ao estoque atomicamente (reativa a offer se estava SoldOut).
 */
@Injectable()
export class RemoveInterestUseCase {
  constructor(
    @Inject(INTEREST_REPOSITORY) private readonly interestRepository: IInterestRepository,
    @Inject(OFFER_STOCK_PORT) private readonly offerStockPort: IOfferStockPort
  ) {}

  async execute(input: IRemoveInterestInput): Promise<void> {
    const interest = await this.interestRepository.findByOfferAndShopper(input.offerId, input.shopperId)
    if (!interest) throw new InterestNotFoundError()
    await this.interestRepository.deleteById(interest.id)
    await this.offerStockPort.increment(input.offerId)
  }
}
