/**
 * Testes unitários para SessionRepository
 *
 * Cenários testados:
 * - create() traduz o documento criado em Session
 * - findActiveById() retorna null quando a query não encontra sessão ativa (inexistente/revogada/expirada
 *   — o filtro fica na própria query do Mongo)
 * - findActiveById() retorna null (não deixa vazar) quando o id tem formato de ObjectId inválido
 * - findActiveById() traduz o documento encontrado em Session
 * - revoke() seta revokedAt via updateOne
 */

import { Model } from 'mongoose'
import { SessionDocument } from '@auth/infrastructure/types'
import { SessionRepository } from '@auth/infrastructure/session.repository'

function buildDocument(overrides: Partial<SessionDocument> = {}): SessionDocument {
  return {
    _id: { toString: () => 'session-1' },
    userId: 'user-1',
    expiresAt: new Date(Date.now() + 60_000),
    revokedAt: null,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    ...overrides
  } as unknown as SessionDocument
}

describe('SessionRepository', () => {
  let sessionModel: jest.Mocked<Model<SessionDocument>>
  let repository: SessionRepository

  beforeEach(() => {
    sessionModel = {
      create: jest.fn(),
      findOne: jest.fn(),
      updateOne: jest.fn()
    } as unknown as jest.Mocked<Model<SessionDocument>>
    repository = new SessionRepository(sessionModel)
  })

  describe('create', () => {
    it('traduz o documento criado em Session', async () => {
      sessionModel.create.mockResolvedValue(buildDocument() as never)

      const session = await repository.create({ userId: 'user-1', expiresAt: new Date() })

      expect(session.id).toBe('session-1')
      expect(session.userId).toBe('user-1')
    })
  })

  describe('findActiveById', () => {
    it('retorna null quando a query não encontra sessão ativa', async () => {
      sessionModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) } as never)

      const session = await repository.findActiveById('session-1')

      expect(session).toBeNull()
    })

    it('retorna null quando o id tem formato de ObjectId inválido, sem deixar o erro vazar', async () => {
      const castError = Object.assign(new Error('Cast to ObjectId failed'), { name: 'CastError' })
      sessionModel.findOne.mockReturnValue({ exec: jest.fn().mockRejectedValue(castError) } as never)

      const session = await repository.findActiveById('id-invalido')

      expect(session).toBeNull()
    })

    it('traduz o documento encontrado em Session', async () => {
      sessionModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(buildDocument()) } as never)

      const session = await repository.findActiveById('session-1')

      expect(session?.id).toBe('session-1')
    })
  })

  describe('revoke', () => {
    it('seta revokedAt via updateOne', async () => {
      sessionModel.updateOne.mockReturnValue({ exec: jest.fn().mockResolvedValue({}) } as never)

      await repository.revoke('session-1')

      expect(sessionModel.updateOne).toHaveBeenCalledWith(
        { _id: 'session-1' },
        { $set: { revokedAt: expect.any(Date) } }
      )
    })
  })
})
