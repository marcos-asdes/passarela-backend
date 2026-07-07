import { ICreateUserData, IUserRepository } from '@auth/application/types'
import { CpfAlreadyRegisteredError } from '@auth/domain/cpf-already-registered.error'
import { User } from '@auth/domain/user.entity'
import { UserRole } from '@auth/domain/types'
import { UserDocument } from '@auth/infrastructure/types'
import { UserSchemaClass } from '@auth/infrastructure/user.schema'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { isDuplicateKeyError } from '@shared/mongo-errors'
import { Model } from 'mongoose'

/** Implementação do repositório de usuários — traduz documentos do Mongo em entidades de domínio */
@Injectable()
export class UserRepository implements IUserRepository {
  constructor(@InjectModel(UserSchemaClass.name) private readonly userModel: Model<UserDocument>) {}

  async create(data: ICreateUserData): Promise<User> {
    try {
      const document = await this.userModel.create({
        name: data.name,
        email: data.email,
        passwordHash: data.passwordHash,
        cpf: data.cpf,
        phone: data.phone,
        birthDate: data.birthDate,
        role: data.role
      })
      return this.toDomainEntity(document)
    } catch (error) {
      // Único índice único restante é o composto (cpf, role) — RegisterUseCase já faz o pre-check
      // de negócio antes de chamar create(), isso aqui é só rede de segurança pra corrida entre
      // requests concorrentes com o mesmo cpf+role.
      if (isDuplicateKeyError(error)) {
        throw new CpfAlreadyRegisteredError()
      }
      throw error
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    const document = await this.userModel.findOne({ email }).exec()
    return document ? this.toDomainEntity(document) : null
  }

  async findByEmailAndRole(email: string, role: UserRole): Promise<User | null> {
    const document = await this.userModel.findOne({ email, role }).exec()
    return document ? this.toDomainEntity(document) : null
  }

  async findByCpfAndRole(cpf: string, role: UserRole): Promise<User | null> {
    const document = await this.userModel.findOne({ cpf, role }).exec()
    return document ? this.toDomainEntity(document) : null
  }

  async findById(id: string): Promise<User | null> {
    try {
      const document = await this.userModel.findById(id).exec()
      return document ? this.toDomainEntity(document) : null
    } catch (error) {
      if (error instanceof Error && error.name === 'CastError') {
        return null
      }
      throw error
    }
  }

  private toDomainEntity(document: UserDocument): User {
    return new User({
      id: document._id.toString(),
      name: document.name,
      email: document.email,
      passwordHash: document.passwordHash,
      cpf: document.cpf,
      phone: document.phone,
      birthDate: document.birthDate,
      authProviders: document.authProviders,
      role: document.role,
      createdAt: document.createdAt
    })
  }
}
