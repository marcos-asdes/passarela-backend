import { ICreateInterestData, IInterestRepository } from '@interest/application/types'
import { AlreadyInterestedError } from '@interest/domain/already-interested.error'
import { Interest } from '@interest/domain/interest.entity'
import { InterestSchemaClass } from '@interest/infrastructure/interest.schema'
import { InterestDocument } from '@interest/infrastructure/types'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { isDuplicateKeyError } from '@shared/mongo-errors'
import { Model } from 'mongoose'

/** Implementação do repositório de interests — traduz documentos do Mongo em entidades de domínio */
@Injectable()
export class InterestRepository implements IInterestRepository {
  constructor(@InjectModel(InterestSchemaClass.name) private readonly interestModel: Model<InterestDocument>) {}

  async create(data: ICreateInterestData): Promise<Interest> {
    try {
      const document = await this.interestModel.create({ offerId: data.offerId, shopperId: data.shopperId })
      return this.toDomainEntity(document)
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        throw new AlreadyInterestedError()
      }
      throw error
    }
  }

  async deleteById(id: string): Promise<void> {
    await this.interestModel.deleteOne({ _id: id }).exec()
  }

  async findByShopperId(shopperId: string): Promise<Interest[]> {
    const documents = await this.interestModel.find({ shopperId }).lean().exec()
    return documents.map((doc) => this.toDomainEntity(doc as InterestDocument))
  }

  async findByOfferAndShopper(offerId: string, shopperId: string): Promise<Interest | null> {
    const document = await this.interestModel.findOne({ offerId, shopperId }).exec()
    return document ? this.toDomainEntity(document) : null
  }

  private toDomainEntity(document: InterestDocument): Interest {
    return new Interest({
      id: document._id.toString(),
      offerId: document.offerId,
      shopperId: document.shopperId,
      createdAt: document.createdAt
    })
  }
}
