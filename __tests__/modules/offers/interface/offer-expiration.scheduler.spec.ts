/**
 * Testes unitários para OfferExpirationScheduler
 *
 * Cenários testados:
 * - chama ExpireOffersUseCase.execute()
 * - loga e notifica (merchant + shopper) cada offer expirada
 * - não loga nem notifica quando nenhuma offer expirou
 */

import { ExpireOffersUseCase } from '@offers/application/expire-offers.use-case'
import { Offer } from '@offers/domain/offer.entity'
import { OfferStatus } from '@offers/domain/types'
import { OfferExpirationScheduler } from '@offers/interface/offer-expiration.scheduler'
import { OffersGateway } from '@offers/interface/offers.gateway'
import { AppLoggerService } from '@shared/logger/app-logger.service'

describe('OfferExpirationScheduler', () => {
  let expireOffersUseCase: jest.Mocked<ExpireOffersUseCase>
  let offersGateway: jest.Mocked<OffersGateway>
  let logger: jest.Mocked<AppLoggerService>
  let scheduler: OfferExpirationScheduler

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
    expireOffersUseCase = { execute: jest.fn() } as unknown as jest.Mocked<ExpireOffersUseCase>
    offersGateway = {
      notifyOfferUpdated: jest.fn(),
      notifyOfferStatusChanged: jest.fn()
    } as unknown as jest.Mocked<OffersGateway>
    logger = { log: jest.fn() } as unknown as jest.Mocked<AppLoggerService>
    scheduler = new OfferExpirationScheduler(expireOffersUseCase, offersGateway, logger)
  })

  it('chama ExpireOffersUseCase.execute()', async () => {
    expireOffersUseCase.execute.mockResolvedValue([])

    await scheduler.handleExpiration()

    expect(expireOffersUseCase.execute).toHaveBeenCalled()
  })

  it('loga e notifica (merchant + shopper) cada offer expirada', async () => {
    expireOffersUseCase.execute.mockResolvedValue([expiredOffer])

    await scheduler.handleExpiration()

    expect(logger.log).toHaveBeenCalledWith('1 offer(s) expirada(s)', 'OfferExpirationScheduler')
    expect(offersGateway.notifyOfferUpdated).toHaveBeenCalledWith(expect.objectContaining({ id: 'offer-1' }))
    expect(offersGateway.notifyOfferStatusChanged).toHaveBeenCalledWith(expect.objectContaining({ id: 'offer-1' }))
  })

  it('não loga nem notifica quando nenhuma offer expirou', async () => {
    expireOffersUseCase.execute.mockResolvedValue([])

    await scheduler.handleExpiration()

    expect(logger.log).not.toHaveBeenCalled()
    expect(offersGateway.notifyOfferUpdated).not.toHaveBeenCalled()
    expect(offersGateway.notifyOfferStatusChanged).not.toHaveBeenCalled()
  })
})
