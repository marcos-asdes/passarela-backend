/**
 * Testes unitários para InterestController
 *
 * Cenários testados:
 * - register: em caso de sucesso, retorna o id do interest criado
 * - register: converte AlreadyInterestedError em ConflictException
 * - register: converte OfferUnavailableError em ConflictException
 * - register: propaga qualquer outro erro sem alterá-lo
 */

import { RegisterInterestUseCase } from '@interest/application/register-interest.use-case'
import { AlreadyInterestedError } from '@interest/domain/already-interested.error'
import { Interest } from '@interest/domain/interest.entity'
import { OfferUnavailableError } from '@interest/domain/offer-unavailable.error'
import { InterestController } from '@interest/interface/interest.controller'
import { RegisterInterestDto } from '@interest/interface/register-interest.dto'
import { ConflictException } from '@nestjs/common'

describe('InterestController', () => {
  let registerInterestUseCase: jest.Mocked<RegisterInterestUseCase>
  let controller: InterestController

  const user = { id: 'shopper-1', role: 'shopper' } as never
  const dto: RegisterInterestDto = { offerId: 'offer-1' }

  beforeEach(() => {
    registerInterestUseCase = { execute: jest.fn() } as unknown as jest.Mocked<RegisterInterestUseCase>
    controller = new InterestController(
      registerInterestUseCase,
      { execute: jest.fn() } as never,
      {
        findByShopperId: jest.fn(),
        findByOfferAndShopper: jest.fn(),
        create: jest.fn(),
        deleteById: jest.fn()
      } as never
    )
  })

  it('em caso de sucesso, retorna o id do interest criado', async () => {
    registerInterestUseCase.execute.mockResolvedValue(
      new Interest({ id: 'interest-1', offerId: 'offer-1', shopperId: 'shopper-1', createdAt: new Date() })
    )

    const result = await controller.register(user, dto)

    expect(registerInterestUseCase.execute).toHaveBeenCalledWith({ offerId: 'offer-1', shopperId: 'shopper-1' })
    expect(result).toEqual({ id: 'interest-1' })
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
})
