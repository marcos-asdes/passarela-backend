/**
 * Testes unitários para RemoveInterestUseCase
 *
 * Cenários testados:
 * - remove o interest encontrado e devolve 1 unidade ao estoque
 * - lança InterestNotFoundError quando o interest não existe, sem deletar nem incrementar estoque
 */

import { RemoveInterestUseCase } from '@interest/application/remove-interest.use-case'
import { IInterestRepository, IOfferStockPort } from '@interest/application/types'
import { InterestNotFoundError } from '@interest/domain/interest-not-found.error'
import { Interest } from '@interest/domain/interest.entity'

describe('RemoveInterestUseCase', () => {
  let interestRepository: jest.Mocked<IInterestRepository>
  let offerStockPort: jest.Mocked<IOfferStockPort>
  let useCase: RemoveInterestUseCase

  const input = { offerId: 'offer-1', shopperId: 'shopper-1' }
  const interest = new Interest({ id: 'interest-1', offerId: 'offer-1', shopperId: 'shopper-1', createdAt: new Date() })

  beforeEach(() => {
    interestRepository = {
      create: jest.fn(),
      deleteById: jest.fn(),
      findByShopperId: jest.fn(),
      findByOfferAndShopper: jest.fn()
    }
    offerStockPort = { decrement: jest.fn(), increment: jest.fn() }
    useCase = new RemoveInterestUseCase(interestRepository, offerStockPort)
  })

  it('remove o interest encontrado e devolve 1 unidade ao estoque', async () => {
    interestRepository.findByOfferAndShopper.mockResolvedValue(interest)

    await useCase.execute(input)

    expect(interestRepository.findByOfferAndShopper).toHaveBeenCalledWith('offer-1', 'shopper-1')
    expect(interestRepository.deleteById).toHaveBeenCalledWith('interest-1')
    expect(offerStockPort.increment).toHaveBeenCalledWith('offer-1')
  })

  it('lança InterestNotFoundError quando o interest não existe, sem deletar nem incrementar estoque', async () => {
    interestRepository.findByOfferAndShopper.mockResolvedValue(null)

    await expect(useCase.execute(input)).rejects.toBeInstanceOf(InterestNotFoundError)
    expect(interestRepository.deleteById).not.toHaveBeenCalled()
    expect(offerStockPort.increment).not.toHaveBeenCalled()
  })
})
