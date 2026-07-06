/**
 * Testes unitários para InterestController
 *
 * Cenários testados:
 * - register: em caso de sucesso, retorna o id do interest criado e emite 'interest:changed'
 * - register: converte AlreadyInterestedError em ConflictException
 * - register: converte OfferUnavailableError em ConflictException
 * - register: propaga qualquer outro erro sem alterá-lo
 * - register: não emite 'interest:changed' quando o use case falha
 * - remove: em caso de sucesso, emite 'interest:changed'
 * - remove: converte InterestNotFoundError em NotFoundException e não emite 'interest:changed'
 */

import { RegisterInterestUseCase } from '@interest/application/register-interest.use-case'
import { RemoveInterestUseCase } from '@interest/application/remove-interest.use-case'
import { AlreadyInterestedError } from '@interest/domain/already-interested.error'
import { InterestNotFoundError } from '@interest/domain/interest-not-found.error'
import { Interest } from '@interest/domain/interest.entity'
import { OfferUnavailableError } from '@interest/domain/offer-unavailable.error'
import { InterestController } from '@interest/interface/interest.controller'
import { RegisterInterestDto } from '@interest/interface/register-interest.dto'
import { ConflictException, NotFoundException } from '@nestjs/common'
import { DomainEventsService } from '@shared/realtime/domain-events.service'

describe('InterestController', () => {
  let registerInterestUseCase: jest.Mocked<RegisterInterestUseCase>
  let removeInterestUseCase: jest.Mocked<RemoveInterestUseCase>
  let domainEvents: jest.Mocked<DomainEventsService>
  let controller: InterestController

  const user = { id: 'shopper-1', role: 'shopper' } as never
  const dto: RegisterInterestDto = { offerId: 'offer-1' }

  beforeEach(() => {
    registerInterestUseCase = { execute: jest.fn() } as unknown as jest.Mocked<RegisterInterestUseCase>
    removeInterestUseCase = { execute: jest.fn() } as unknown as jest.Mocked<RemoveInterestUseCase>
    domainEvents = { emit: jest.fn() } as unknown as jest.Mocked<DomainEventsService>
    controller = new InterestController(
      registerInterestUseCase,
      removeInterestUseCase,
      {
        findByShopperId: jest.fn(),
        findByOfferAndShopper: jest.fn(),
        create: jest.fn(),
        deleteById: jest.fn()
      },
      domainEvents
    )
  })

  describe('register', () => {
    it("em caso de sucesso, retorna o id do interest criado e emite 'interest:changed'", async () => {
      registerInterestUseCase.execute.mockResolvedValue(
        new Interest({ id: 'interest-1', offerId: 'offer-1', shopperId: 'shopper-1', createdAt: new Date() })
      )

      const result = await controller.register(user, dto)

      expect(registerInterestUseCase.execute).toHaveBeenCalledWith({ offerId: 'offer-1', shopperId: 'shopper-1' })
      expect(result).toEqual({ id: 'interest-1' })
      expect(domainEvents.emit).toHaveBeenCalledWith('interest:changed', { offerId: 'offer-1' })
    })

    it('converte AlreadyInterestedError em ConflictException', async () => {
      registerInterestUseCase.execute.mockRejectedValue(new AlreadyInterestedError())

      await expect(controller.register(user, dto)).rejects.toBeInstanceOf(ConflictException)
    })

    it('converte OfferUnavailableError em ConflictException', async () => {
      registerInterestUseCase.execute.mockRejectedValue(new OfferUnavailableError())

      await expect(controller.register(user, dto)).rejects.toBeInstanceOf(ConflictException)
    })

    it('propaga qualquer outro erro sem alterá-lo', async () => {
      const otherError = new Error('falha inesperada')
      registerInterestUseCase.execute.mockRejectedValue(otherError)

      await expect(controller.register(user, dto)).rejects.toBe(otherError)
    })

    it("não emite 'interest:changed' quando o use case falha", async () => {
      registerInterestUseCase.execute.mockRejectedValue(new AlreadyInterestedError())

      await expect(controller.register(user, dto)).rejects.toBeInstanceOf(ConflictException)

      expect(domainEvents.emit).not.toHaveBeenCalled()
    })
  })

  describe('remove', () => {
    it("em caso de sucesso, emite 'interest:changed'", async () => {
      removeInterestUseCase.execute.mockResolvedValue(undefined)

      await controller.remove(user, 'offer-1')

      expect(removeInterestUseCase.execute).toHaveBeenCalledWith({ offerId: 'offer-1', shopperId: 'shopper-1' })
      expect(domainEvents.emit).toHaveBeenCalledWith('interest:changed', { offerId: 'offer-1' })
    })

    it("converte InterestNotFoundError em NotFoundException e não emite 'interest:changed'", async () => {
      removeInterestUseCase.execute.mockRejectedValue(new InterestNotFoundError())

      await expect(controller.remove(user, 'offer-1')).rejects.toBeInstanceOf(NotFoundException)

      expect(domainEvents.emit).not.toHaveBeenCalled()
    })
  })
})
