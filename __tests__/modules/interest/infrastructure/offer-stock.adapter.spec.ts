/**
 * Testes unitários para OfferStockAdapter
 *
 * Cenários testados:
 * - decrementa o estoque atomicamente e retorna true quando a offer está Active e com estoque
 * - retorna false quando a offer não existe/não está Active/já está sem estoque (findOneAndUpdate retorna null)
 * - retorna false (sem deixar o erro vazar) quando o offerId tem formato de ObjectId inválido
 * - flipa o status pra SoldOut quando o estoque chega a 0 após o decremento
 * - não tenta flipar o status quando o estoque ainda é maior que 0 após o decremento
 * - incrementa o estoque atomicamente e retorna true
 * - retorna false quando a offer não existe (findOneAndUpdate retorna null)
 * - retorna false (sem deixar o erro vazar) quando o offerId tem formato de ObjectId inválido
 * - reativa a offer (SoldOut -> Active) quando o estoque volta a ser positivo após o incremento
 * - não tenta reativar quando a offer não estava SoldOut
 */

import { OfferStockAdapter } from '@interest/infrastructure/offer-stock.adapter'
import { OfferStatus } from '@offers/domain/types'
import { OfferDocument } from '@offers/infrastructure/types'
import { Model } from 'mongoose'

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
      exec: jest.fn().mockResolvedValue({ stock: 4 })
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
      exec: jest.fn().mockResolvedValue({ stock: 0 })
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
      exec: jest.fn().mockResolvedValue({ stock: 1 })
    } as never)

    await adapter.decrement('offer-1')

    expect(offerModel.updateOne).not.toHaveBeenCalled()
  })

  it('incrementa o estoque atomicamente e retorna true', async () => {
    offerModel.findOneAndUpdate.mockReturnValue({
      exec: jest.fn().mockResolvedValue({ status: OfferStatus.Active, stock: 5 })
    } as never)

    const result = await adapter.increment('offer-1')

    expect(offerModel.findOneAndUpdate).toHaveBeenCalledWith({ _id: 'offer-1' }, { $inc: { stock: 1 } }, { new: true })
    expect(result).toBe(true)
    expect(offerModel.updateOne).not.toHaveBeenCalled()
  })

  it('retorna false quando a offer não existe', async () => {
    offerModel.findOneAndUpdate.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) } as never)

    const result = await adapter.increment('offer-1')

    expect(result).toBe(false)
  })

  it('retorna false quando o offerId tem formato de ObjectId inválido, sem deixar o erro vazar (increment)', async () => {
    const castError = Object.assign(new Error('Cast to ObjectId failed'), { name: 'CastError' })
    offerModel.findOneAndUpdate.mockReturnValue({ exec: jest.fn().mockRejectedValue(castError) } as never)

    const result = await adapter.increment('id-invalido')

    expect(result).toBe(false)
  })

  it('reativa a offer (SoldOut -> Active) quando o estoque volta a ser positivo após o incremento', async () => {
    offerModel.findOneAndUpdate.mockReturnValue({
      exec: jest.fn().mockResolvedValue({ status: OfferStatus.SoldOut, stock: 1 })
    } as never)

    const result = await adapter.increment('offer-1')

    expect(result).toBe(true)
    expect(offerModel.updateOne).toHaveBeenCalledWith(
      { _id: 'offer-1', status: OfferStatus.SoldOut, stock: { $gt: 0 } },
      { $set: { status: OfferStatus.Active } }
    )
  })

  it('não tenta reativar quando a offer não estava SoldOut', async () => {
    offerModel.findOneAndUpdate.mockReturnValue({
      exec: jest.fn().mockResolvedValue({ status: OfferStatus.Active, stock: 5 })
    } as never)

    await adapter.increment('offer-1')

    expect(offerModel.updateOne).not.toHaveBeenCalled()
  })
})
