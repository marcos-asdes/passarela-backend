/**
 * Testes unitários para ExpireOffersUseCase
 *
 * Cenários testados:
 * - chama expireOverdue com a data atual
 * - retorna as offers expiradas pelo repository
 */

import { ExpireOffersUseCase } from '@offers/application/expire-offers.use-case'
import { IOfferRepository } from '@offers/application/types'
import { Offer } from '@offers/domain/offer.entity'
import { OfferStatus } from '@offers/domain/types'

describe('ExpireOffersUseCase', () => {
  let offerRepository: jest.Mocked<IOfferRepository>
  let useCase: ExpireOffersUseCase

  const expiredOffer = new Offer({
    id: 'offer-1',
    merchantId: 'merchant-1',
    title: '50% OFF',
    description: 'Promoção relâmpago',
    discountPercent: 50,
    stock: 10,
    validUntil: new Date('2020-01-01T00:00:00.000Z'),
    status: OfferStatus.Expired,
    createdAt: new Date(),
    updatedAt: new Date()
  })

  beforeEach(() => {
    offerRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByMerchant: jest.fn(),
      findPublic: jest.fn(),
      findPublicFeed: jest.fn(),
      update: jest.fn(),
      updateStatus: jest.fn(),
      expireOverdue: jest.fn().mockResolvedValue([expiredOffer])
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

  it('retorna as offers expiradas pelo repository', async () => {
    const result = await useCase.execute()
    expect(result).toEqual([expiredOffer])
  })
})
