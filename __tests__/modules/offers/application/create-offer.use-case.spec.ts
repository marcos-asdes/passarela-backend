/**
 * Testes unitários para CreateOfferUseCase
 *
 * Cenários testados:
 * - cria a offer com os dados de entrada, sempre via repository.create
 * - retorna a offer criada pelo repository
 */

import { CreateOfferUseCase } from '@offers/application/create-offer.use-case'
import { ICreateOfferInput, IOfferRepository } from '@offers/application/types'
import { Offer } from '@offers/domain/offer.entity'
import { OfferStatus } from '@offers/domain/types'

describe('CreateOfferUseCase', () => {
  let offerRepository: jest.Mocked<IOfferRepository>
  let useCase: CreateOfferUseCase

  const input: ICreateOfferInput = {
    merchantId: 'merchant-1',
    title: '50% OFF',
    description: 'Promoção relâmpago',
    discountPercent: 50,
    stock: 10,
    validUntil: new Date(Date.now() + 60_000)
  }

  const createdOffer = new Offer({
    id: 'offer-1',
    merchantId: input.merchantId,
    title: input.title,
    description: input.description,
    discountPercent: input.discountPercent,
    stock: input.stock,
    validUntil: input.validUntil,
    status: OfferStatus.Active,
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
      expireOverdue: jest.fn()
    }
    useCase = new CreateOfferUseCase(offerRepository)
  })

  it('cria a offer com os dados de entrada', async () => {
    offerRepository.create.mockResolvedValue(createdOffer)

    await useCase.execute(input)

    expect(offerRepository.create).toHaveBeenCalledWith({
      merchantId: input.merchantId,
      title: input.title,
      description: input.description,
      discountPercent: input.discountPercent,
      stock: input.stock,
      validUntil: input.validUntil
    })
  })

  it('retorna a offer criada pelo repository', async () => {
    offerRepository.create.mockResolvedValue(createdOffer)

    const result = await useCase.execute(input)

    expect(result).toBe(createdOffer)
  })
})
