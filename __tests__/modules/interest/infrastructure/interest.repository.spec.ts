/**
 * Testes unitários para InterestRepository
 *
 * Cenários testados:
 * - create() traduz o documento criado em Interest
 * - create() traduz erro de chave duplicada (code 11000) em AlreadyInterestedError
 * - create() propaga qualquer outro erro do Mongo sem alterá-lo
 * - deleteById() remove o documento pelo id
 * - findByShopperId() traduz os documentos encontrados em Interest[]
 * - findByOfferAndShopper() traduz o documento encontrado em Interest
 * - findByOfferAndShopper() retorna null quando não encontrado
 */

import { Model } from 'mongoose'
import { AlreadyInterestedError } from '@interest/domain/already-interested.error'
import { ICreateInterestData } from '@interest/application/types'
import { InterestDocument } from '@interest/infrastructure/types'
import { InterestRepository } from '@interest/infrastructure/interest.repository'

function buildDocument(overrides: Partial<InterestDocument> = {}): InterestDocument {
  return {
    _id: { toString: () => 'interest-1' },
    offerId: 'offer-1',
    shopperId: 'shopper-1',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    ...overrides
  } as unknown as InterestDocument
}

describe('InterestRepository', () => {
  let interestModel: jest.Mocked<Model<InterestDocument>>
  let repository: InterestRepository

  const createData: ICreateInterestData = { offerId: 'offer-1', shopperId: 'shopper-1' }

  beforeEach(() => {
    interestModel = {
      create: jest.fn(),
      deleteOne: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue({}) }),
      find: jest.fn(),
      findOne: jest.fn()
    } as unknown as jest.Mocked<Model<InterestDocument>>
    repository = new InterestRepository(interestModel)
  })

  describe('create', () => {
    it('traduz o documento criado em Interest', async () => {
      interestModel.create.mockResolvedValue(buildDocument() as never)

      const interest = await repository.create(createData)

      expect(interest.id).toBe('interest-1')
      expect(interest.offerId).toBe('offer-1')
      expect(interest.shopperId).toBe('shopper-1')
    })

    it('traduz erro de chave duplicada em AlreadyInterestedError', async () => {
      interestModel.create.mockRejectedValue({ code: 11000 })

      await expect(repository.create(createData)).rejects.toBeInstanceOf(AlreadyInterestedError)
    })

    it('propaga qualquer outro erro do Mongo sem alterá-lo', async () => {
      const otherError = new Error('falha de conexão')
      interestModel.create.mockRejectedValue(otherError)

      await expect(repository.create(createData)).rejects.toBe(otherError)
    })
  })

  describe('deleteById', () => {
    it('remove o documento pelo id', async () => {
      await repository.deleteById('interest-1')

      expect(interestModel.deleteOne).toHaveBeenCalledWith({ _id: 'interest-1' })
    })
  })

  describe('findByShopperId', () => {
    it('traduz os documentos encontrados em Interest[]', async () => {
      interestModel.find.mockReturnValue({
        lean: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([buildDocument()]) })
      } as never)

      const result = await repository.findByShopperId('shopper-1')

      expect(interestModel.find).toHaveBeenCalledWith({ shopperId: 'shopper-1' })
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('interest-1')
    })
  })

  describe('findByOfferAndShopper', () => {
    it('traduz o documento encontrado em Interest', async () => {
      interestModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(buildDocument()) } as never)

      const result = await repository.findByOfferAndShopper('offer-1', 'shopper-1')

      expect(interestModel.findOne).toHaveBeenCalledWith({ offerId: 'offer-1', shopperId: 'shopper-1' })
      expect(result?.id).toBe('interest-1')
    })

    it('retorna null quando não encontrado', async () => {
      interestModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) } as never)

      const result = await repository.findByOfferAndShopper('offer-1', 'shopper-1')

      expect(result).toBeNull()
    })
  })
})
