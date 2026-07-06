/**
 * Testes unitários para ExpireOffersUseCase
 *
 * Cenários testados:
 * - chama expireOverdue com a data atual
 * - retorna a quantidade de offers expiradas pelo repository
 */

import { ExpireOffersUseCase } from '@offers/application/expire-offers.use-case'
import { IOfferRepository } from '@offers/application/types'

describe('ExpireOffersUseCase', () => {
  let offerRepository: jest.Mocked<IOfferRepository>
  let useCase: ExpireOffersUseCase

  beforeEach(() => {
    offerRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByMerchant: jest.fn(),
      findPublic: jest.fn(),
      findPublicFeed: jest.fn(),
      update: jest.fn(),
      updateStatus: jest.fn(),
      expireOverdue: jest.fn().mockResolvedValue(2)
    }
    useCase = new ExpireOffersUseCase(offerRepository)
  })

  it('chama expireOverdue com a data atual', async () => {
    const before = Date.now()
    await useCase.execute()
    const calledWith = offerRepository.expireOverdue.mock.calls[0][0]

    expect(calledWith.getTime()).toBeGreaterThanOrEqual(before)
    expect(calledWith.getTime()).toBeLessThanOrEqual(Date.now())
  })

  it('retorna a quantidade de offers expiradas pelo repository', async () => {
    const result = await useCase.execute()
    expect(result).toBe(2)
  })
})
