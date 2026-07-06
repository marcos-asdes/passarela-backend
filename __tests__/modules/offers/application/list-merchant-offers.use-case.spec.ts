/**
 * Testes unitários para ListMerchantOffersUseCase
 *
 * Cenários testados:
 * - busca as offers do merchant e anexa a contagem de interest de cada uma
 * - usa 0 quando a offer não aparece no resultado da contagem
 * - retorna array vazio (sem chamar a contagem) quando o merchant não tem offers
 */

import { ListMerchantOffersUseCase } from '@offers/application/list-merchant-offers.use-case'
import { IInterestCountPort, IOfferRepository } from '@offers/application/types'
import { Offer } from '@offers/domain/offer.entity'
import { OfferStatus } from '@offers/domain/types'

function buildOffer(id: string): Offer {
  return new Offer({
    id,
    merchantId: 'merchant-1',
    title: '50% OFF',
    description: 'Promoção relâmpago',
    discountPercent: 50,
    stock: 10,
    validUntil: new Date(Date.now() + 60_000),
    status: OfferStatus.Active,
    createdAt: new Date(),
    updatedAt: new Date()
  })
}

describe('ListMerchantOffersUseCase', () => {
  let offerRepository: jest.Mocked<IOfferRepository>
  let interestCountPort: jest.Mocked<IInterestCountPort>
  let useCase: ListMerchantOffersUseCase

  beforeEach(() => {
    offerRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByMerchant: jest.fn(),
      findPublic: jest.fn(),
      findPublicFeed: jest.fn(),
      update: jest.fn(),
      updateStatus: jest.fn(),
      expireOverdue: jest.fn()
    }
    interestCountPort = { countByOffers: jest.fn() }
    useCase = new ListMerchantOffersUseCase(offerRepository, interestCountPort)
  })

  it('busca as offers do merchant e anexa a contagem de interest de cada uma', async () => {
    const offerA = buildOffer('offer-a')
    const offerB = buildOffer('offer-b')
    offerRepository.findByMerchant.mockResolvedValue([offerA, offerB])
    interestCountPort.countByOffers.mockResolvedValue({ 'offer-a': 3, 'offer-b': 0 })

    const result = await useCase.execute('merchant-1')

    expect(interestCountPort.countByOffers).toHaveBeenCalledWith(['offer-a', 'offer-b'])
    expect(result).toEqual([
      { offer: offerA, interestCount: 3 },
      { offer: offerB, interestCount: 0 }
    ])
  })

  it('usa 0 quando a offer não aparece no resultado da contagem', async () => {
    const offer = buildOffer('offer-a')
    offerRepository.findByMerchant.mockResolvedValue([offer])
    interestCountPort.countByOffers.mockResolvedValue({})

    const result = await useCase.execute('merchant-1')

    expect(result).toEqual([{ offer, interestCount: 0 }])
  })

  it('retorna array vazio quando o merchant não tem offers', async () => {
    offerRepository.findByMerchant.mockResolvedValue([])
    interestCountPort.countByOffers.mockResolvedValue({})

    const result = await useCase.execute('merchant-1')

    expect(interestCountPort.countByOffers).toHaveBeenCalledWith([])
    expect(result).toEqual([])
  })
})
