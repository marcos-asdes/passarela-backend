/**
 * Testes unitários para UpdateOfferUseCase
 *
 * Cenários testados:
 * - edita a offer quando o merchant é o dono e ela está Active
 * - lança OfferNotFoundError quando a offer não existe
 * - lança OfferNotOwnedError quando o merchant não é o dono
 * - lança OfferAlreadyClosedError quando a offer não está Active
 * - lança OfferNotFoundError se o update retornar null (offer removida entre o find e o update)
 */

import { IOfferRepository } from '@offers/application/types'
import { UpdateOfferUseCase } from '@offers/application/update-offer.use-case'
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

describe('UpdateOfferUseCase', () => {
  let offerRepository: jest.Mocked<IOfferRepository>
  let useCase: UpdateOfferUseCase

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
    useCase = new UpdateOfferUseCase(offerRepository)
  })

  it('edita a offer quando o merchant é o dono e ela está Active', async () => {
    const offer = buildOffer()
    const updated = buildOffer()
    offerRepository.findById.mockResolvedValue(offer)
    offerRepository.update.mockResolvedValue(updated)

    const result = await useCase.execute({ id: 'offer-1', merchantId: 'merchant-1', data: { title: 'Novo título' } })

    expect(offerRepository.update).toHaveBeenCalledWith('offer-1', { title: 'Novo título' })
    expect(result).toBe(updated)
  })

  it('lança OfferNotFoundError quando a offer não existe', async () => {
    offerRepository.findById.mockResolvedValue(null)

    await expect(useCase.execute({ id: 'offer-1', merchantId: 'merchant-1', data: {} })).rejects.toBeInstanceOf(
      OfferNotFoundError
    )
  })

  it('lança OfferNotOwnedError quando o merchant não é o dono', async () => {
    offerRepository.findById.mockResolvedValue(buildOffer({ merchantId: 'merchant-1' }))

    await expect(useCase.execute({ id: 'offer-1', merchantId: 'merchant-2', data: {} })).rejects.toBeInstanceOf(
      OfferNotOwnedError
    )
  })

  it('lança OfferAlreadyClosedError quando a offer não está Active', async () => {
    offerRepository.findById.mockResolvedValue(buildOffer({ status: OfferStatus.Closed }))

    await expect(useCase.execute({ id: 'offer-1', merchantId: 'merchant-1', data: {} })).rejects.toBeInstanceOf(
      OfferAlreadyClosedError
    )
  })

  it('lança OfferNotFoundError se o update retornar null', async () => {
    offerRepository.findById.mockResolvedValue(buildOffer())
    offerRepository.update.mockResolvedValue(null)

    await expect(useCase.execute({ id: 'offer-1', merchantId: 'merchant-1', data: {} })).rejects.toBeInstanceOf(
      OfferNotFoundError
    )
  })
})
