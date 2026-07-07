/**
 * Testes unitários para UserRepository
 *
 * Cenários testados:
 * - create() traduz o documento criado em User
 * - create() traduz erro de chave duplicada (code 11000, índice composto cpf+role) → CpfAlreadyRegisteredError
 * - create() propaga qualquer outro erro do Mongo sem alterá-lo
 * - findByEmail() retorna null quando não encontra
 * - findByEmail() traduz o documento encontrado em User
 * - findByEmailAndRole() busca por email + role e traduz o documento encontrado em User
 * - findByEmailAndRole() retorna null quando não encontra
 * - findByCpfAndRole() busca por cpf + role e traduz o documento encontrado em User
 * - findByCpfAndRole() retorna null quando não encontra
 * - findById() retorna null quando não encontra
 * - findById() retorna null (não deixa vazar) quando o id tem formato de ObjectId inválido
 * - findById() traduz o documento encontrado em User
 */

import { Model } from 'mongoose'
import { CpfAlreadyRegisteredError } from '@auth/domain/cpf-already-registered.error'
import { UserRole } from '@auth/domain/types'
import { ICreateUserData } from '@auth/application/types'
import { UserDocument } from '@auth/infrastructure/types'
import { UserRepository } from '@auth/infrastructure/user.repository'

function buildDocument(overrides: Partial<UserDocument> = {}): UserDocument {
  return {
    _id: { toString: () => 'user-1' },
    name: 'Fulano',
    email: 'fulano@example.com',
    passwordHash: 'hash',
    cpf: '52998224725',
    phone: '11912345678',
    birthDate: new Date('1990-05-10'),
    authProviders: [],
    role: UserRole.Merchant,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    ...overrides
  } as unknown as UserDocument
}

describe('UserRepository', () => {
  let userModel: jest.Mocked<Model<UserDocument>>
  let repository: UserRepository

  const createData: ICreateUserData = {
    name: 'Fulano',
    email: 'fulano@example.com',
    passwordHash: 'hash',
    cpf: '52998224725',
    phone: '11912345678',
    birthDate: new Date('1990-05-10'),
    role: UserRole.Merchant
  }

  beforeEach(() => {
    userModel = {
      create: jest.fn(),
      findOne: jest.fn(),
      findById: jest.fn()
    } as unknown as jest.Mocked<Model<UserDocument>>
    repository = new UserRepository(userModel)
  })

  describe('create', () => {
    it('traduz o documento criado em User', async () => {
      userModel.create.mockResolvedValue(buildDocument() as never)

      const user = await repository.create(createData)

      expect(user.id).toBe('user-1')
      expect(user.email).toBe('fulano@example.com')
    })

    it('traduz erro de chave duplicada (índice composto cpf+role) para CpfAlreadyRegisteredError', async () => {
      userModel.create.mockRejectedValue({ code: 11000, keyPattern: { cpf: 1, role: 1 } })

      await expect(repository.create(createData)).rejects.toBeInstanceOf(CpfAlreadyRegisteredError)
    })

    it('propaga qualquer outro erro do Mongo sem alterá-lo', async () => {
      const otherError = new Error('falha de conexão')
      userModel.create.mockRejectedValue(otherError)

      await expect(repository.create(createData)).rejects.toBe(otherError)
    })
  })

  describe('findByEmail', () => {
    it('retorna null quando não encontra', async () => {
      userModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) } as never)

      const user = await repository.findByEmail('inexistente@example.com')

      expect(user).toBeNull()
    })

    it('traduz o documento encontrado em User', async () => {
      userModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(buildDocument()) } as never)

      const user = await repository.findByEmail('fulano@example.com')

      expect(user?.email).toBe('fulano@example.com')
    })
  })

  describe('findByEmailAndRole', () => {
    it('busca por email + role e traduz o documento encontrado em User', async () => {
      const exec = jest.fn().mockResolvedValue(buildDocument())
      userModel.findOne.mockReturnValue({ exec } as never)

      const user = await repository.findByEmailAndRole('fulano@example.com', UserRole.Merchant)

      expect(userModel.findOne).toHaveBeenCalledWith({ email: 'fulano@example.com', role: UserRole.Merchant })
      expect(user?.email).toBe('fulano@example.com')
    })

    it('retorna null quando não encontra', async () => {
      userModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) } as never)

      const user = await repository.findByEmailAndRole('inexistente@example.com', UserRole.Shopper)

      expect(user).toBeNull()
    })
  })

  describe('findByCpfAndRole', () => {
    it('busca por cpf + role e traduz o documento encontrado em User', async () => {
      const exec = jest.fn().mockResolvedValue(buildDocument())
      userModel.findOne.mockReturnValue({ exec } as never)

      const user = await repository.findByCpfAndRole('52998224725', UserRole.Merchant)

      expect(userModel.findOne).toHaveBeenCalledWith({ cpf: '52998224725', role: UserRole.Merchant })
      expect(user?.id).toBe('user-1')
    })

    it('retorna null quando não encontra', async () => {
      userModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) } as never)

      const user = await repository.findByCpfAndRole('00000000000', UserRole.Shopper)

      expect(user).toBeNull()
    })
  })

  describe('findById', () => {
    it('retorna null quando não encontra', async () => {
      userModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) } as never)

      const user = await repository.findById('507f1f77bcf86cd799439011')

      expect(user).toBeNull()
    })

    it('retorna null quando o id tem formato de ObjectId inválido, sem deixar o erro vazar', async () => {
      const castError = Object.assign(new Error('Cast to ObjectId failed'), { name: 'CastError' })
      userModel.findById.mockReturnValue({ exec: jest.fn().mockRejectedValue(castError) } as never)

      const user = await repository.findById('id-invalido')

      expect(user).toBeNull()
    })

    it('traduz o documento encontrado em User', async () => {
      userModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(buildDocument()) } as never)

      const user = await repository.findById('user-1')

      expect(user?.id).toBe('user-1')
    })
  })
})
