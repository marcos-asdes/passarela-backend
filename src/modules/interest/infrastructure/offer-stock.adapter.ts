import { IOfferStockPort } from '@interest/application/types'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { OfferStatus } from '@offers/domain/types'
import { OfferSchemaClass } from '@offers/infrastructure/offer.schema'
import { OfferDocument } from '@offers/infrastructure/types'
import { Model } from 'mongoose'

/**
 * Única exceção deliberada de fronteira entre `interest` e `offers` nessa direção: decrementar
 * estoque exige um update atômico na própria collection de offers (um use case leria um valor que
 * já pode estar desatualizado no momento de salvar). Importa só o schema/enum (forma de dado), nunca
 * um use case ou repository do outro contexto — ver nota de arquitetura no CLAUDE.md do backend.
 */
@Injectable()
export class OfferStockAdapter implements IOfferStockPort {
  constructor(@InjectModel(OfferSchemaClass.name) private readonly offerModel: Model<OfferDocument>) {}

  async decrement(offerId: string): Promise<boolean> {
    let updated: OfferDocument | null
    try {
      updated = await this.offerModel
        .findOneAndUpdate(
          { _id: offerId, status: OfferStatus.Active, stock: { $gt: 0 } },
          { $inc: { stock: -1 } },
          { new: true }
        )
        .exec()
    } catch (error) {
      if (error instanceof Error && error.name === 'CastError') {
        return false
      }
      throw error
    }

    if (!updated) {
      return false
    }

    if (updated.stock === 0) {
      // Idempotente: no-op se outra chamada concorrente já fez essa mesma transição.
      await this.offerModel
        .updateOne({ _id: offerId, stock: 0, status: OfferStatus.Active }, { $set: { status: OfferStatus.SoldOut } })
        .exec()
    }

    return true
  }

  async increment(offerId: string): Promise<boolean> {
    let updated: OfferDocument | null
    try {
      updated = await this.offerModel.findOneAndUpdate({ _id: offerId }, { $inc: { stock: 1 } }, { new: true }).exec()
    } catch (error) {
      if (error instanceof Error && error.name === 'CastError') {
        return false
      }
      throw error
    }

    if (!updated) return false

    // Se estava SoldOut e voltou a ter estoque, reativa a offer atomicamente.
    if (updated.status === OfferStatus.SoldOut && updated.stock > 0) {
      await this.offerModel
        .updateOne(
          { _id: offerId, status: OfferStatus.SoldOut, stock: { $gt: 0 } },
          { $set: { status: OfferStatus.Active } }
        )
        .exec()
    }

    return true
  }
}
