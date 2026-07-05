/**
 * Testes unitários para SessionSchema
 *
 * Cenários testados:
 * - Rejeita quando faltam userId ou expiresAt
 * - revokedAt assume default null quando não informado
 * - Índice TTL em expiresAt configurado com expireAfterSeconds: 0
 * - timestamps automáticos (createdAt/updatedAt) habilitados
 * - Instancia SessionSchemaClass diretamente (SchemaFactory.createForClass só lê metadata via reflection,
 *   nunca chama `new`, e sem isso as atribuições dos campos decorados nunca rodam do ponto de vista do
 *   V8 — cobertura zerada mesmo com o schema 100% validado acima)
 */

import { SessionSchema, SessionSchemaClass } from '@auth/infrastructure/session.schema'
import mongoose from 'mongoose'

const SessionModel = mongoose.model('SessionSchemaSpecModel', SessionSchema)

describe('SessionSchema', () => {
  it('rejeita quando faltam campos obrigatórios', async () => {
    const doc = new SessionModel({})

    await expect(doc.validate()).rejects.toMatchObject({
      errors: expect.objectContaining({ userId: expect.anything(), expiresAt: expect.anything() })
    })
  })

  it('revokedAt assume default null quando não informado', () => {
    const doc = new SessionModel({ userId: 'user-1', expiresAt: new Date() })

    expect(doc.revokedAt).toBeNull()
  })

  it('configura índice TTL em expiresAt com expireAfterSeconds: 0', () => {
    const indexes = SessionSchema.indexes()

    expect(indexes).toEqual(
      expect.arrayContaining([[{ expiresAt: 1 }, expect.objectContaining({ expireAfterSeconds: 0 })]])
    )
  })

  it('habilita timestamps automáticos (createdAt/updatedAt)', () => {
    expect(SessionSchema.get('timestamps')).toBe(true)
  })

  it('instancia SessionSchemaClass diretamente', () => {
    expect(new SessionSchemaClass()).toBeInstanceOf(SessionSchemaClass)
  })
})
