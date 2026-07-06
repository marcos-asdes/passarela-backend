/**
 * Testes unitários para OfferRepository
 *
 * Cenários testados:
 * - create() traduz o documento criado em Offer, sempre com status Active
 * - findById() retorna null quando não encontra
 * - findById() retorna null (não deixa vazar) quando o id tem formato de ObjectId inválido
 * - findById() traduz o documento encontrado em Offer
 * - findByMerchant() traduz a lista de documentos em Offer[]
 * - findPublic() filtra por status e traduz a lista de documentos em Offer[]
 * - update() traduz o documento atualizado em Offer
 * - update() retorna null quando não encontra
 * - updateStatus() traduz o documento atualizado em Offer
 * - expireOverdue() atualiza e devolve as offers vencidas traduzidas em Offer[]
 * - expireOverdue() não chama updateMany quando não há offers vencidas
 */

import { ICreateOfferData } from '@offers/application/types'
import { OfferStatus } from '@offers/domain/types'
import { OfferRepository } from '@offers/infrastructure/offer.repository'
import { OfferDocument } from '@offers/infrastructure/types'
import { Model } from 'mongoose'

function buildDocument(overrides: Partial<OfferDocument> = {}): OfferDocument {
  return {
    _id: { toString: () => 'offer-1' },
    merchantId: 'merchant-1',
    title: '50% OFF',
    description: 'Promoção relâmpago',
    discountPercent: 50,
    stock: 10,
    validUntil: new Date('2026-12-31T00:00:00.000Z'),
    status: OfferStatus.Active,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    ...overrides
  } as unknown as OfferDocument
}

describe('OfferRepository', () => {
  let offerModel: jest.Mocked<Model<OfferDocument>>
  let repository: OfferRepository

  const createData: ICreateOfferData = {
    merchantId: 'merchant-1',
    title: '50% OFF',
    description: 'Promoção relâmpago',
    discountPercent: 50,
    stock: 10,
    validUntil: new Date('2026-12-31T00:00:00.000Z')
  }

  beforeEach(() => {
    offerModel = {
      create: jest.fn(),
      findById: jest.fn(),
      find: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      updateMany: jest.fn()
    } as unknown as jest.Mocked<Model<OfferDocument>>
    repository = new OfferRepository(offerModel)
  })

  describe('create', () => {
    it('traduz o documento criado em Offer, sempre com status Active', async () => {
      offerModel.create.mockResolvedValue(buildDocument() as never)

      const offer = await repository.create(createData)

      expect(offerModel.create).toHaveBeenCalledWith(expect.objectContaining({ status: OfferStatus.Active }))
      expect(offer.id).toBe('offer-1')
      expect(offer.status).toBe(OfferStatus.Active)
    })
  })

  describe('findById', () => {
    it('retorna null quando não encontra', async () => {
      offerModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) } as never)

      const offer = await repository.findById('507f1f77bcf86cd799439011')

      expect(offer).toBeNull()
    })

    it('retorna null quando o id tem formato de ObjectId inválido, sem deixar o erro vazar', async () => {
      const castError = Object.assign(new Error('Cast to ObjectId failed'), { name: 'CastError' })
      offerModel.findById.mockReturnValue({ exec: jest.fn().mockRejectedValue(castError) } as never)

      const offer = await repository.findById('id-invalido')

      expect(offer).toBeNull()
    })

    it('traduz o documento encontrado em Offer', async () => {
      offerModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(buildDocument()) } as never)

      const offer = await repository.findById('offer-1')

      expect(offer?.id).toBe('offer-1')
    })
  })

  describe('findByMerchant', () => {
    it('traduz a lista de documentos em Offer[]', async () => {
      const sortMock = jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([buildDocument()]) })
      offerModel.find.mockReturnValue({ sort: sortMock } as never)

      const offers = await repository.findByMerchant('merchant-1')

      expect(offerModel.find).toHaveBeenCalledWith({ merchantId: 'merchant-1' })
      expect(offers).toHaveLength(1)
      expect(offers[0].id).toBe('offer-1')
    })
  })

  describe('findPublic', () => {
    it('filtra por status e traduz a lista de documentos em Offer[]', async () => {
      const sortMock = jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([buildDocument()]) })
      offerModel.find.mockReturnValue({ sort: sortMock } as never)

      const offers = await repository.findPublic(OfferStatus.Active)

      expect(offerModel.find).toHaveBeenCalledWith({ status: OfferStatus.Active })
      expect(offers).toHaveLength(1)
    })
  })

  describe('update', () => {
    it('traduz o documento atualizado em Offer', async () => {
      offerModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(buildDocument({ title: 'Novo título' }))
      } as never)

      const offer = await repository.update('offer-1', { title: 'Novo título' })

      expect(offerModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'offer-1',
        { $set: { title: 'Novo título' } },
        { new: true }
      )
      expect(offer?.title).toBe('Novo título')
    })

    it('retorna null quando não encontra', async () => {
      offerModel.findByIdAndUpdate.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) } as never)

      const offer = await repository.update('offer-1', {})

      expect(offer).toBeNull()
    })
  })

  describe('updateStatus', () => {
    it('traduz o documento atualizado em Offer', async () => {
      offerModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(buildDocument({ status: OfferStatus.Closed }))
      } as never)

      const offer = await repository.updateStatus('offer-1', OfferStatus.Closed)

      expect(offerModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'offer-1',
        { $set: { status: OfferStatus.Closed } },
        { new: true }
      )
      expect(offer?.status).toBe(OfferStatus.Closed)
    })
  })

  describe('expireOverdue', () => {
    it('atualiza e devolve as offers vencidas traduzidas em Offer[]', async () => {
      const overdueDocument = buildDocument({ status: OfferStatus.Active })
      offerModel.find.mockReturnValue({ exec: jest.fn().mockResolvedValue([overdueDocument]) } as never)
      offerModel.updateMany.mockReturnValue({ exec: jest.fn().mockResolvedValue({ modifiedCount: 1 }) } as never)
      const now = new Date()

      const result = await repository.expireOverdue(now)

      expect(offerModel.find).toHaveBeenCalledWith({
        status: { $in: [OfferStatus.Active, OfferStatus.SoldOut] },
        validUntil: { $lt: now }
      })
      expect(offerModel.updateMany).toHaveBeenCalledWith(
        { _id: { $in: [overdueDocument._id] } },
        { $set: { status: OfferStatus.Expired } }
      )
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('offer-1')
      expect(result[0].status).toBe(OfferStatus.Expired)
    })

    it('não chama updateMany quando não há offers vencidas', async () => {
      offerModel.find.mockReturnValue({ exec: jest.fn().mockResolvedValue([]) } as never)
      const now = new Date()

      const result = await repository.expireOverdue(now)

      expect(offerModel.updateMany).not.toHaveBeenCalled()
      expect(result).toEqual([])
    })
  })
})
