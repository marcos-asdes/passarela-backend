import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { ICreateOfferData, IOfferRepository, IUpdateOfferData } from '@offers/application/types'
import { Offer } from '@offers/domain/offer.entity'
import { OfferStatus } from '@offers/domain/types'
import { OfferSchemaClass } from '@offers/infrastructure/offer.schema'
import { OfferDocument } from '@offers/infrastructure/types'
import { Model } from 'mongoose'

/** Implementação do repositório de offers — traduz documentos do Mongo em entidades de domínio */
@Injectable()
export class OfferRepository implements IOfferRepository {
  constructor(@InjectModel(OfferSchemaClass.name) private readonly offerModel: Model<OfferDocument>) {}

  async create(data: ICreateOfferData): Promise<Offer> {
    const document = await this.offerModel.create({
      merchantId: data.merchantId,
      title: data.title,
      description: data.description,
      discountPercent: data.discountPercent,
      stock: data.stock,
      validUntil: data.validUntil,
      status: OfferStatus.Active
    })
    return this.toDomainEntity(document)
  }

  async findById(id: string): Promise<Offer | null> {
    try {
      const document = await this.offerModel.findById(id).exec()
      return document ? this.toDomainEntity(document) : null
    } catch (error) {
      if (error instanceof Error && error.name === 'CastError') {
        return null
      }
      throw error
    }
  }

  async findByMerchant(merchantId: string): Promise<Offer[]> {
    const documents = await this.offerModel.find({ merchantId }).sort({ createdAt: -1 }).exec()
    return documents.map((document) => this.toDomainEntity(document))
  }

  async findPublic(status: OfferStatus): Promise<Offer[]> {
    const documents = await this.offerModel.find({ status }).sort({ createdAt: -1 }).exec()
    return documents.map((document) => this.toDomainEntity(document))
  }

  async findPublicFeed(): Promise<Offer[]> {
    const [active, expired, soldOut] = await Promise.all([
      this.offerModel.find({ status: OfferStatus.Active }).sort({ createdAt: -1 }).lean().exec(),
      this.offerModel.find({ status: OfferStatus.Expired }).sort({ createdAt: -1 }).lean().exec(),
      this.offerModel.find({ status: OfferStatus.SoldOut }).sort({ createdAt: -1 }).lean().exec()
    ])
    return [...active, ...expired, ...soldOut].map((document) => this.toDomainEntity(document as OfferDocument))
  }

  async update(id: string, data: IUpdateOfferData): Promise<Offer | null> {
    const document = await this.offerModel.findByIdAndUpdate(id, { $set: data }, { new: true }).exec()
    return document ? this.toDomainEntity(document) : null
  }

  async updateStatus(id: string, status: OfferStatus): Promise<Offer | null> {
    const document = await this.offerModel.findByIdAndUpdate(id, { $set: { status } }, { new: true }).exec()
    return document ? this.toDomainEntity(document) : null
  }

  async expireOverdue(now: Date): Promise<number> {
    const result = await this.offerModel
      .updateMany(
        { status: { $in: [OfferStatus.Active, OfferStatus.SoldOut] }, validUntil: { $lt: now } },
        { $set: { status: OfferStatus.Expired } }
      )
      .exec()
    return result.modifiedCount
  }

  private toDomainEntity(document: OfferDocument): Offer {
    return new Offer({
      id: document._id.toString(),
      merchantId: document.merchantId,
      title: document.title,
      description: document.description,
      discountPercent: document.discountPercent,
      stock: document.stock,
      validUntil: document.validUntil,
      status: document.status,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt
    })
  }
}
