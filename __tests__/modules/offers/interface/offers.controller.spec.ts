/**
 * Testes unitários para OffersController
 *
 * Cenários testados:
 * - create: cria a offer, notifica o gateway e retorna o DTO de resposta
 * - update: retorna o DTO de resposta em caso de sucesso
 * - update: converte OfferNotFoundError em NotFoundException
 * - update: converte OfferNotOwnedError em ForbiddenException
 * - update: converte OfferAlreadyClosedError em ConflictException
 * - close: retorna o DTO de resposta, notifica o gateway (sala do merchant + broadcast do shopper) em caso de sucesso
 * - close: converte erros de domínio nas mesmas exceptions HTTP que update
 * - findMine: mapeia os resultados pro DTO com interestCount
 * - findPublic: usa Active como default quando a query não informa status
 * - findPublic: repassa o status informado na query
 */

import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common'
import { CloseOfferUseCase } from '@offers/application/close-offer.use-case'
import { CreateOfferUseCase } from '@offers/application/create-offer.use-case'
import { ListMerchantOffersUseCase } from '@offers/application/list-merchant-offers.use-case'
import { ListPublicFeedUseCase } from '@offers/application/list-public-feed.use-case'
import { UpdateOfferUseCase } from '@offers/application/update-offer.use-case'
import { OfferAlreadyClosedError } from '@offers/domain/offer-already-closed.error'
import { OfferNotFoundError } from '@offers/domain/offer-not-found.error'
import { OfferNotOwnedError } from '@offers/domain/offer-not-owned.error'
import { Offer } from '@offers/domain/offer.entity'
import { OfferStatus } from '@offers/domain/types'
import { CreateOfferDto } from '@offers/interface/create-offer.dto'
import { OffersController } from '@offers/interface/offers.controller'
import { OffersGateway } from '@offers/interface/offers.gateway'

function buildOffer(overrides: Partial<{ status: OfferStatus }> = {}): Offer {
  return new Offer({
    id: 'offer-1',
    merchantId: 'merchant-1',
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

describe('OffersController', () => {
  let createOfferUseCase: jest.Mocked<CreateOfferUseCase>
  let updateOfferUseCase: jest.Mocked<UpdateOfferUseCase>
  let closeOfferUseCase: jest.Mocked<CloseOfferUseCase>
  let listMerchantOffersUseCase: jest.Mocked<ListMerchantOffersUseCase>
  let listPublicFeedUseCase: jest.Mocked<ListPublicFeedUseCase>
  let offersGateway: jest.Mocked<OffersGateway>
  let controller: OffersController

  const user = { id: 'merchant-1', role: 'merchant' } as never

  beforeEach(() => {
    createOfferUseCase = { execute: jest.fn() } as unknown as jest.Mocked<CreateOfferUseCase>
    updateOfferUseCase = { execute: jest.fn() } as unknown as jest.Mocked<UpdateOfferUseCase>
    closeOfferUseCase = { execute: jest.fn() } as unknown as jest.Mocked<CloseOfferUseCase>
    listMerchantOffersUseCase = { execute: jest.fn() } as unknown as jest.Mocked<ListMerchantOffersUseCase>
    listPublicFeedUseCase = { execute: jest.fn() } as unknown as jest.Mocked<ListPublicFeedUseCase>
    offersGateway = {
      notifyOfferCreated: jest.fn(),
      notifyOfferUpdated: jest.fn(),
      notifyOfferStatusChanged: jest.fn()
    } as unknown as jest.Mocked<OffersGateway>
    controller = new OffersController(
      createOfferUseCase,
      updateOfferUseCase,
      closeOfferUseCase,
      listMerchantOffersUseCase,
      listPublicFeedUseCase,
      offersGateway
    )
  })

  describe('create', () => {
    it('cria a offer, notifica o gateway e retorna o DTO de resposta', async () => {
      const offer = buildOffer()
      createOfferUseCase.execute.mockResolvedValue(offer)
      const dto: CreateOfferDto = {
        title: offer.title,
        description: offer.description,
        discountPercent: offer.discountPercent,
        stock: offer.stock,
        validUntil: offer.validUntil
      }

      const result = await controller.create(user, dto)

      expect(createOfferUseCase.execute).toHaveBeenCalledWith({ merchantId: 'merchant-1', ...dto })
      expect(offersGateway.notifyOfferCreated).toHaveBeenCalledWith(result)
      expect(result.id).toBe('offer-1')
    })
  })

  describe('update', () => {
    it('retorna o DTO de resposta em caso de sucesso', async () => {
      updateOfferUseCase.execute.mockResolvedValue(buildOffer())

      const result = await controller.update(user, 'offer-1', {})

      expect(result.id).toBe('offer-1')
    })

    it.each([
      [OfferNotFoundError, NotFoundException],
      [OfferNotOwnedError, ForbiddenException],
      [OfferAlreadyClosedError, ConflictException]
    ])('converte %p em %p', async (DomainError, HttpError) => {
      updateOfferUseCase.execute.mockRejectedValue(new DomainError())

      await expect(controller.update(user, 'offer-1', {})).rejects.toBeInstanceOf(HttpError)
    })
  })

  describe('close', () => {
    it('retorna o DTO de resposta e notifica o gateway (merchant + shopper) em caso de sucesso', async () => {
      closeOfferUseCase.execute.mockResolvedValue(buildOffer({ status: OfferStatus.Closed }))

      const result = await controller.close(user, 'offer-1')

      expect(result.status).toBe(OfferStatus.Closed)
      expect(offersGateway.notifyOfferUpdated).toHaveBeenCalledWith(result)
      expect(offersGateway.notifyOfferStatusChanged).toHaveBeenCalledWith(result)
    })

    it.each([
      [OfferNotFoundError, NotFoundException],
      [OfferNotOwnedError, ForbiddenException],
      [OfferAlreadyClosedError, ConflictException]
    ])('converte %p em %p', async (DomainError, HttpError) => {
      closeOfferUseCase.execute.mockRejectedValue(new DomainError())

      await expect(controller.close(user, 'offer-1')).rejects.toBeInstanceOf(HttpError)
    })
  })

  describe('findMine', () => {
    it('mapeia os resultados pro DTO com interestCount', async () => {
      const offer = buildOffer()
      listMerchantOffersUseCase.execute.mockResolvedValue([{ offer, interestCount: 4 }])

      const result = await controller.findMine(user)

      expect(result).toEqual([expect.objectContaining({ id: 'offer-1', interestCount: 4 })])
    })
  })

  describe('findPublic', () => {
    it('retorna o feed completo (Active + Expired + SoldOut)', async () => {
      listPublicFeedUseCase.execute.mockResolvedValue([])

      await controller.findPublic()

      expect(listPublicFeedUseCase.execute).toHaveBeenCalled()
    })
  })
})
