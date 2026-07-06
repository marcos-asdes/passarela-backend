import { Inject, Injectable } from '@nestjs/common'
import { Interest } from '@interest/domain/interest.entity'
import { OfferUnavailableError } from '@interest/domain/offer-unavailable.error'
import {
  IInterestRepository,
  INTEREST_REPOSITORY,
  IOfferStockPort,
  IRegisterInterestInput,
  OFFER_STOCK_PORT
} from '@interest/application/types'

/**
 * Caso de uso: shopper registra interest numa offer. Ordem importa — o insert (passo 1) usa o índice
 * único {offerId, shopperId} do Mongo pra garantir "1 por shopper/offer" mesmo sob concorrência, antes
 * de tocar no estoque compartilhado (passo 2). Se o estoque não puder ser decrementado, o insert é
 * desfeito (compensação manual, não é uma transação Mongo real — trade-off documentado no README).
 */
@Injectable()
export class RegisterInterestUseCase {
  constructor(
    @Inject(INTEREST_REPOSITORY) private readonly interestRepository: IInterestRepository,
    @Inject(OFFER_STOCK_PORT) private readonly offerStockPort: IOfferStockPort
  ) {}

  async execute(input: IRegisterInterestInput): Promise<Interest> {
    const interest = await this.interestRepository.create({
      offerId: input.offerId,
      shopperId: input.shopperId
    })

    const decremented = await this.offerStockPort.decrement(input.offerId)
    if (!decremented) {
      await this.interestRepository.deleteById(interest.id)
      throw new OfferUnavailableError()
    }

    return interest
  }
}
