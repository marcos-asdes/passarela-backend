/**
 * Testes unitários para ListPublicFeedUseCase
 *
 * Cenários testados:
 * - delega pro repository e retorna o feed público completo
 */

import { ListPublicFeedUseCase } from '@offers/application/list-public-feed.use-case'
import { IOfferRepository } from '@offers/application/types'
import { Offer } from '@offers/domain/offer.entity'
import { OfferStatus } from '@offers/domain/types'

describe('ListPublicFeedUseCase', () => {
  let offerRepository: jest.Mocked<IOfferRepository>
  let useCase: ListPublicFeedUseCase

  beforeEach(() => {
    offerRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByMerchant: jest.fn(),
      findPublic: jest.fn(),
      findPublicFeed: jest.fn().mockResolvedValue([]),
      update: jest.fn(),
      updateStatus: jest.fn(),
      expireOverdue: jest.fn()
    }
    useCase = new ListPublicFeedUseCase(offerRepository)
  })

  it('delega pro repository e retorna o feed público completo', async () => {
    const offer = new Offer({
      id: 'offer-1',
      merchantId: 'merchant-1',
      title: 'Título',
      description: 'Descrição',
      discountPercent: 10,
      stock: 5,
      validUntil: new Date(),
      status: OfferStatus.Active,
      createdAt: new Date(),
      updatedAt: new Date()
    })
    offerRepository.findPublicFeed.mockResolvedValue([offer])

    const result = await useCase.execute()

    expect(offerRepository.findPublicFeed).toHaveBeenCalled()
    expect(result).toEqual([offer])
  })
})
