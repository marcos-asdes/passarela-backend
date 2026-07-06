/**
 * Testes unitários para OfferExpirationScheduler
 *
 * Cenários testados:
 * - chama ExpireOffersUseCase.execute()
 * - loga quando pelo menos 1 offer expirou
 * - não loga quando nenhuma offer expirou
 */

import { ExpireOffersUseCase } from '@offers/application/expire-offers.use-case'
import { OfferExpirationScheduler } from '@offers/interface/offer-expiration.scheduler'
import { AppLoggerService } from '@shared/logger/app-logger.service'

describe('OfferExpirationScheduler', () => {
  let expireOffersUseCase: jest.Mocked<ExpireOffersUseCase>
  let logger: jest.Mocked<AppLoggerService>
  let scheduler: OfferExpirationScheduler

  beforeEach(() => {
    expireOffersUseCase = { execute: jest.fn() } as unknown as jest.Mocked<ExpireOffersUseCase>
    logger = { log: jest.fn() } as unknown as jest.Mocked<AppLoggerService>
    scheduler = new OfferExpirationScheduler(expireOffersUseCase, logger)
  })

  it('chama ExpireOffersUseCase.execute()', async () => {
    expireOffersUseCase.execute.mockResolvedValue(0)

    await scheduler.handleExpiration()

    expect(expireOffersUseCase.execute).toHaveBeenCalled()
  })

  it('loga quando pelo menos 1 offer expirou', async () => {
    expireOffersUseCase.execute.mockResolvedValue(2)

    await scheduler.handleExpiration()

    expect(logger.log).toHaveBeenCalledWith('2 offer(s) expirada(s)', 'OfferExpirationScheduler')
  })

  it('não loga quando nenhuma offer expirou', async () => {
    expireOffersUseCase.execute.mockResolvedValue(0)

    await scheduler.handleExpiration()

    expect(logger.log).not.toHaveBeenCalled()
  })
})
