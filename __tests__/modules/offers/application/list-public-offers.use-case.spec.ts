/**
 * Testes unitários para ListPublicOffersUseCase
 *
 * Cenários testados:
 * - sem status informado, filtra por Active (default)
 * - com status informado, filtra pelo status pedido
 */

import { ListPublicOffersUseCase } from '@offers/application/list-public-offers.use-case'
import { IOfferRepository } from '@offers/application/types'
import { OfferStatus } from '@offers/domain/types'

describe('ListPublicOffersUseCase', () => {
  let offerRepository: jest.Mocked<IOfferRepository>
  let useCase: ListPublicOffersUseCase

  beforeEach(() => {
    offerRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByMerchant: jest.fn(),
      findPublic: jest.fn().mockResolvedValue([]),
      findPublicFeed: jest.fn(),
      update: jest.fn(),
      updateStatus: jest.fn(),
      expireOverdue: jest.fn()
    }
    useCase = new ListPublicOffersUseCase(offerRepository)
  })

  it('sem status informado, filtra por Active', async () => {
    await useCase.execute()

    expect(offerRepository.findPublic).toHaveBeenCalledWith(OfferStatus.Active)
  })

  it('com status informado, filtra pelo status pedido', async () => {
    await useCase.execute(OfferStatus.SoldOut)

    expect(offerRepository.findPublic).toHaveBeenCalledWith(OfferStatus.SoldOut)
  })
})
