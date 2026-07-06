/**
 * Testes unitários para CloseOfferUseCase
 *
 * Cenários testados:
 * - encerra a offer quando o merchant é o dono e a transição é válida
 * - lança OfferNotFoundError quando a offer não existe
 * - lança OfferNotOwnedError quando o merchant não é o dono
 * - propaga OfferAlreadyClosedError lançado pela entidade
 * - lança OfferNotFoundError se o updateStatus retornar null
 */

import { CloseOfferUseCase } from '@offers/application/close-offer.use-case'
import { IOfferRepository } from '@offers/application/types'
import { OfferAlreadyClosedError } from '@offers/domain/offer-already-closed.error'
import { OfferNotFoundError } from '@offers/domain/offer-not-found.error'
import { OfferNotOwnedError } from '@offers/domain/offer-not-owned.error'
import { Offer } from '@offers/domain/offer.entity'
import { OfferStatus } from '@offers/domain/types'

function buildOffer(overrides: Partial<{ merchantId: string; status: OfferStatus }> = {}): Offer {
  return new Offer({
    id: 'offer-1',
    merchantId: overrides.merchantId ?? 'merchant-1',
    title: '50% OFF',
    description: 'Promoção relâmpago',
    discountPercent: 50,
    stock: 10,
    validUntil: new Date(Date.now() + 60_000),
    status: overrides.status ?? OfferStatus.Active,
    createdAt: new Date(),
    updatedAt: new Date()
  })
}

describe('CloseOfferUseCase', () => {
  let offerRepository: jest.Mocked<IOfferRepository>
  let useCase: CloseOfferUseCase

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
    useCase = new CloseOfferUseCase(offerRepository)
  })

  it('encerra a offer quando o merchant é o dono e a transição é válida', async () => {
    const offer = buildOffer({ status: OfferStatus.Active })
    const closed = buildOffer({ status: OfferStatus.Closed })
    offerRepository.findById.mockResolvedValue(offer)
    offerRepository.updateStatus.mockResolvedValue(closed)

    const result = await useCase.execute({ id: 'offer-1', merchantId: 'merchant-1' })

    expect(offerRepository.updateStatus).toHaveBeenCalledWith('offer-1', OfferStatus.Closed)
    expect(result).toBe(closed)
  })

  it('lança OfferNotFoundError quando a offer não existe', async () => {
    offerRepository.findById.mockResolvedValue(null)

    await expect(useCase.execute({ id: 'offer-1', merchantId: 'merchant-1' })).rejects.toBeInstanceOf(
      OfferNotFoundError
    )
  })

  it('lança OfferNotOwnedError quando o merchant não é o dono', async () => {
    offerRepository.findById.mockResolvedValue(buildOffer({ merchantId: 'merchant-1' }))

    await expect(useCase.execute({ id: 'offer-1', merchantId: 'merchant-2' })).rejects.toBeInstanceOf(
      OfferNotOwnedError
    )
  })

  it('propaga OfferAlreadyClosedError lançado pela entidade', async () => {
    offerRepository.findById.mockResolvedValue(buildOffer({ status: OfferStatus.Expired }))

    await expect(useCase.execute({ id: 'offer-1', merchantId: 'merchant-1' })).rejects.toBeInstanceOf(
      OfferAlreadyClosedError
    )
    expect(offerRepository.updateStatus).not.toHaveBeenCalled()
  })

  it('lança OfferNotFoundError se o updateStatus retornar null', async () => {
    offerRepository.findById.mockResolvedValue(buildOffer({ status: OfferStatus.Active }))
    offerRepository.updateStatus.mockResolvedValue(null)

    await expect(useCase.execute({ id: 'offer-1', merchantId: 'merchant-1' })).rejects.toBeInstanceOf(
      OfferNotFoundError
    )
  })
})
