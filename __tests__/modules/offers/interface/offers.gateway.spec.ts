/**
 * Testes unitários para OffersGateway
 *
 * Cenários testados:
 * - notifyOfferCreated emite 'offer:created' com o payload da offer pro namespace inteiro
 * - handleMerchantSubscribe: coloca o socket na sala do merchant informado
 * - handleMerchantSubscribe: não faz nada quando o payload não traz merchantId
 * - notifyOfferUpdated emite 'offer:updated' só pra sala do merchant dono da offer
 * - notifyOfferStatusChanged emite 'offer:status-changed' com o payload da offer pro namespace inteiro
 * - onModuleInit: ao receber 'interest:changed', emite 'offer:interest-changed' pra sala do merchant com a contagem atualizada
 * - onModuleInit: ao receber 'interest:changed' de uma offer inexistente, não emite nada
 */

import { Server, Socket } from 'socket.io'
import { IInterestCountPort, IOfferRepository } from '@offers/application/types'
import { Offer } from '@offers/domain/offer.entity'
import { OfferStatus } from '@offers/domain/types'
import { OfferResponseDto } from '@offers/interface/offer-response.dto'
import { OffersGateway } from '@offers/interface/offers.gateway'
import { DomainEventsService } from '@shared/realtime/domain-events.service'

function buildOffer(): Offer {
  return new Offer({
    id: 'offer-1',
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

describe('OffersGateway', () => {
  let domainEvents: DomainEventsService
  let offerRepository: jest.Mocked<IOfferRepository>
  let interestCountPort: jest.Mocked<IInterestCountPort>
  let gateway: OffersGateway
  let emit: jest.Mock
  let to: jest.Mock

  beforeEach(() => {
    domainEvents = new DomainEventsService()
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
    gateway = new OffersGateway(domainEvents, offerRepository, interestCountPort)

    emit = jest.fn()
    to = jest.fn().mockReturnValue({ emit })
    Object.assign(gateway, { server: { emit, to } as unknown as Server })
  })

  it("notifyOfferCreated emite 'offer:created' com o payload da offer", () => {
    const dto = new OfferResponseDto()
    dto.id = 'offer-1'

    gateway.notifyOfferCreated(dto)

    expect(emit).toHaveBeenCalledWith('offer:created', dto)
  })

  describe('handleMerchantSubscribe', () => {
    it('coloca o socket na sala do merchant informado', () => {
      const join = jest.fn()

      gateway.handleMerchantSubscribe({ merchantId: 'merchant-1' }, { join } as unknown as Socket)

      expect(join).toHaveBeenCalledWith('merchant:merchant-1')
    })

    it('não faz nada quando o payload não traz merchantId', () => {
      const join = jest.fn()

      gateway.handleMerchantSubscribe({}, { join } as unknown as Socket)

      expect(join).not.toHaveBeenCalled()
    })
  })

  it("notifyOfferUpdated emite 'offer:updated' só pra sala do merchant dono da offer", () => {
    const dto = new OfferResponseDto()
    dto.id = 'offer-1'
    dto.merchantId = 'merchant-1'

    gateway.notifyOfferUpdated(dto)

    expect(to).toHaveBeenCalledWith('merchant:merchant-1')
    expect(emit).toHaveBeenCalledWith('offer:updated', dto)
  })

  it("notifyOfferStatusChanged emite 'offer:status-changed' com o payload da offer", () => {
    const dto = new OfferResponseDto()
    dto.id = 'offer-1'

    gateway.notifyOfferStatusChanged(dto)

    expect(emit).toHaveBeenCalledWith('offer:status-changed', dto)
  })

  describe('onModuleInit', () => {
    it("ao receber 'interest:changed', emite 'offer:interest-changed' pra sala do merchant com a contagem atualizada", async () => {
      offerRepository.findById.mockResolvedValue(buildOffer())
      interestCountPort.countByOffers.mockResolvedValue({ 'offer-1': 3 })

      gateway.onModuleInit()
      domainEvents.emit('interest:changed', { offerId: 'offer-1' })
      await new Promise((resolve) => setImmediate(resolve))

      expect(to).toHaveBeenCalledWith('merchant:merchant-1')
      expect(emit).toHaveBeenCalledWith('offer:interest-changed', { offerId: 'offer-1', interestCount: 3 })
    })

    it("ao receber 'interest:changed' de uma offer inexistente, não emite nada", async () => {
      offerRepository.findById.mockResolvedValue(null)

      gateway.onModuleInit()
      domainEvents.emit('interest:changed', { offerId: 'offer-inexistente' })
      await Promise.resolve()
      await Promise.resolve()

      expect(to).not.toHaveBeenCalled()
      expect(interestCountPort.countByOffers).not.toHaveBeenCalled()
    })
  })
})
