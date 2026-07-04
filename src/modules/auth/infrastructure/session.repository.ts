import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Session } from '@auth/domain/session.entity'
import { ICreateSessionData, ISessionRepository } from '@auth/application/types'
import { SessionDocument } from '@auth/infrastructure/types'
import { SessionSchemaClass } from '@auth/infrastructure/session.schema'

/** Implementação do repositório de sessões — cada login cria uma, o JWT carrega o id dela como jti */
@Injectable()
export class SessionRepository implements ISessionRepository {
  constructor(@InjectModel(SessionSchemaClass.name) private readonly sessionModel: Model<SessionDocument>) {}

  async create(data: ICreateSessionData): Promise<Session> {
    const document = await this.sessionModel.create({
      userId: data.userId,
      expiresAt: data.expiresAt,
      revokedAt: null
    })
    return this.toDomainEntity(document)
  }

  async findActiveById(id: string): Promise<Session | null> {
    try {
      const document = await this.sessionModel
        .findOne({ _id: id, revokedAt: null, expiresAt: { $gt: new Date() } })
        .exec()
      return document ? this.toDomainEntity(document) : null
    } catch (error) {
      if (error instanceof Error && error.name === 'CastError') {
        return null
      }
      throw error
    }
  }

  /** Escrita direta usada hoje sem endpoint HTTP — pronta pra quando um endpoint de revogação existir */
  async revoke(id: string): Promise<void> {
    await this.sessionModel.updateOne({ _id: id }, { $set: { revokedAt: new Date() } }).exec()
  }

  private toDomainEntity(document: SessionDocument): Session {
    return new Session({
      id: document._id.toString(),
      userId: document.userId,
      expiresAt: document.expiresAt,
      revokedAt: document.revokedAt,
      createdAt: document.createdAt
    })
  }
}
