/**
 * Testes unitários para OfferStockAdapter
 *
 * Cenários testados:
 * - decrementa o estoque atomicamente e retorna true quando a offer está Active e com estoque
 * - retorna false quando a offer não existe/não está Active/já está sem estoque (findOneAndUpdate retorna null)
 * - retorna false (sem deixar o erro vazar) quando o offerId tem formato de ObjectId inválido
 * - flipa o status pra SoldOut quando o estoque chega a 0 após o decremento
 * - não tenta flipar o status quando o estoque ainda é maior que 0 após o decremento
 */

import { Model } from 'mongoose'
import { OfferStatus } from '@offers/domain/types'
import { OfferDocument } from '@offers/infrastructure/types'
import { OfferStockAdapter } from '@interest/infrastructure/offer-stock.adapter'

describe('OfferStockAdapter', () => {
  let offerModel: jest.Mocked<Model<OfferDocument>>
  let adapter: OfferStockAdapter

  beforeEach(() => {
    offerModel = {
      findOneAndUpdate: jest.fn(),
      updateOne: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue({}) })
    } as unknown as jest.Mocked<Model<OfferDocument>>
    adapter = new OfferStockAdapter(offerModel)
  })

  it('decrementa o estoque atomicamente e retorna true quando a offer está Active e com estoque', async () => {
    offerModel.findOneAndUpdate.mockReturnValue({
      exec: jest.fn().mockResolvedValue({ stock: 4 } as unknown as OfferDocument)
    } as never)

    const result = await adapter.decrement('offer-1')

    expect(offerModel.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: 'offer-1', status: OfferStatus.Active, stock: { $gt: 0 } },
      { $inc: { stock: -1 } },
      { new: true }
    )
    expect(result).toBe(true)
    expect(offerModel.updateOne).not.toHaveBeenCalled()
  })

  it('retorna false quando a offer não existe/não está Active/já está sem estoque', async () => {
    offerModel.findOneAndUpdate.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) } as never)

    const result = await adapter.decrement('offer-1')

    expect(result).toBe(false)
  })

  it('retorna false quando o offerId tem formato de ObjectId inválido, sem deixar o erro vazar', async () => {
    const castError = Object.assign(new Error('Cast to ObjectId failed'), { name: 'CastError' })
    offerModel.findOneAndUpdate.mockReturnValue({ exec: jest.fn().mockRejectedValue(castError) } as never)

    const result = await adapter.decrement('id-invalido')

    expect(result).toBe(false)
  })

  it('flipa o status pra SoldOut quando o estoque chega a 0 após o decremento', async () => {
    offerModel.findOneAndUpdate.mockReturnValue({
      exec: jest.fn().mockResolvedValue({ stock: 0 } as unknown as OfferDocument)
    } as never)

    const result = await adapter.decrement('offer-1')

    expect(result).toBe(true)
    expect(offerModel.updateOne).toHaveBeenCalledWith(
      { _id: 'offer-1', stock: 0, status: OfferStatus.Active },
      { $set: { status: OfferStatus.SoldOut } }
    )
  })

  it('não tenta flipar o status quando o estoque ainda é maior que 0 após o decremento', async () => {
    offerModel.findOneAndUpdate.mockReturnValue({
      exec: jest.fn().mockResolvedValue({ stock: 1 } as unknown as OfferDocument)
    } as never)

    await adapter.decrement('offer-1')

    expect(offerModel.updateOne).not.toHaveBeenCalled()
  })
})
