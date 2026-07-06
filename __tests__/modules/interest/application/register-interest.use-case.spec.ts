/**
 * Testes unitários para RegisterInterestUseCase
 *
 * Cenários testados:
 * - registra o interest e decrementa o estoque, nessa ordem
 * - retorna o interest criado quando o decremento funciona
 * - desfaz o interest e lança OfferUnavailableError quando o decremento falha
 * - propaga AlreadyInterestedError lançado pelo repository, sem tentar decrementar estoque
 */

import { RegisterInterestUseCase } from '@interest/application/register-interest.use-case'
import { IInterestRepository, IOfferStockPort } from '@interest/application/types'
import { AlreadyInterestedError } from '@interest/domain/already-interested.error'
import { Interest } from '@interest/domain/interest.entity'
import { OfferUnavailableError } from '@interest/domain/offer-unavailable.error'

describe('RegisterInterestUseCase', () => {
  let interestRepository: jest.Mocked<IInterestRepository>
  let offerStockPort: jest.Mocked<IOfferStockPort>
  let useCase: RegisterInterestUseCase

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
    useCase = new RegisterInterestUseCase(interestRepository, offerStockPort)
  })

  it('registra o interest e decrementa o estoque, nessa ordem', async () => {
    interestRepository.create.mockResolvedValue(interest)
    offerStockPort.decrement.mockResolvedValue(true)

    await useCase.execute(input)

    const createOrder = interestRepository.create.mock.invocationCallOrder[0]
    const decrementOrder = offerStockPort.decrement.mock.invocationCallOrder[0]
    expect(createOrder).toBeLessThan(decrementOrder)
    expect(interestRepository.create).toHaveBeenCalledWith(input)
    expect(offerStockPort.decrement).toHaveBeenCalledWith('offer-1')
  })

  it('retorna o interest criado quando o decremento funciona', async () => {
    interestRepository.create.mockResolvedValue(interest)
    offerStockPort.decrement.mockResolvedValue(true)

    const result = await useCase.execute(input)

    expect(result).toBe(interest)
  })

  it('desfaz o interest e lança OfferUnavailableError quando o decremento falha', async () => {
    interestRepository.create.mockResolvedValue(interest)
    offerStockPort.decrement.mockResolvedValue(false)

    await expect(useCase.execute(input)).rejects.toBeInstanceOf(OfferUnavailableError)
    expect(interestRepository.deleteById).toHaveBeenCalledWith('interest-1')
  })

  it('propaga AlreadyInterestedError lançado pelo repository, sem tentar decrementar estoque', async () => {
    interestRepository.create.mockRejectedValue(new AlreadyInterestedError())

    await expect(useCase.execute(input)).rejects.toBeInstanceOf(AlreadyInterestedError)
    expect(offerStockPort.decrement).not.toHaveBeenCalled()
  })
})
