import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { IInterestCountPort } from '@offers/application/types'
import { InterestDocument } from '@interest/infrastructure/types'
import { InterestSchemaClass } from '@interest/infrastructure/interest.schema'

/**
 * Única exceção deliberada de fronteira entre `offers` e `interest` nessa direção: o dashboard do
 * merchant precisa contar interests por offer. Importa só o schema (forma de dado), nunca um use
 * case ou repository do outro contexto — ver nota de arquitetura no CLAUDE.md do backend.
 */
@Injectable()
export class InterestCountAdapter implements IInterestCountPort {
  constructor(@InjectModel(InterestSchemaClass.name) private readonly interestModel: Model<InterestDocument>) {}

  async countByOffers(offerIds: string[]): Promise<Record<string, number>> {
    if (offerIds.length === 0) {
      return {}
    }

    const rows = await this.interestModel.aggregate<{ _id: string; count: number }>([
      { $match: { offerId: { $in: offerIds } } },
      { $group: { _id: '$offerId', count: { $sum: 1 } } }
    ])

    return rows.reduce<Record<string, number>>((acc, row) => {
      acc[row._id] = row.count
      return acc
    }, {})
  }
}
