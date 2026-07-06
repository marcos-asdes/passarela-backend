/**
 * Testes unitários para InterestCountAdapter
 *
 * Cenários testados:
 * - retorna {} sem consultar o banco quando a lista de offerIds está vazia
 * - agrega a contagem de interest por offerId
 */

import { Model } from 'mongoose'
import { InterestDocument } from '@interest/infrastructure/types'
import { InterestCountAdapter } from '@offers/infrastructure/interest-count.adapter'

describe('InterestCountAdapter', () => {
  let interestModel: jest.Mocked<Model<InterestDocument>>
  let adapter: InterestCountAdapter

  beforeEach(() => {
    interestModel = { aggregate: jest.fn() } as unknown as jest.Mocked<Model<InterestDocument>>
    adapter = new InterestCountAdapter(interestModel)
  })

  it('retorna {} sem consultar o banco quando a lista de offerIds está vazia', async () => {
    const result = await adapter.countByOffers([])

    expect(result).toEqual({})
    expect(interestModel.aggregate).not.toHaveBeenCalled()
  })

  it('agrega a contagem de interest por offerId', async () => {
    interestModel.aggregate.mockResolvedValue([
      { _id: 'offer-a', count: 2 },
      { _id: 'offer-b', count: 5 }
    ] as never)

    const result = await adapter.countByOffers(['offer-a', 'offer-b'])

    expect(interestModel.aggregate).toHaveBeenCalledWith([
      { $match: { offerId: { $in: ['offer-a', 'offer-b'] } } },
      { $group: { _id: '$offerId', count: { $sum: 1 } } }
    ])
    expect(result).toEqual({ 'offer-a': 2, 'offer-b': 5 })
  })
})
