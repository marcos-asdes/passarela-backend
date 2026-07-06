/**
 * Testes unitários para UserSchema
 *
 * Cenários testados:
 * - Rejeita quando faltam name, email, cpf, phone, birthDate ou role
 * - Aceita quando passwordHash está ausente (contas OAuth-only)
 * - Normaliza email para lowercase e aplica trim em name/email
 * - authProviders assume default [] quando não informado
 * - role rejeita valor fora do enum UserRole
 * - Índices únicos configurados para email, cpf e authProviders (provider+providerId, sparse)
 * - timestamps automáticos (createdAt/updatedAt) habilitados
 * - Instancia UserSchemaClass diretamente (SchemaFactory.createForClass só lê metadata via reflection,
 *   nunca chama `new`, e sem isso as atribuições dos campos decorados nunca rodam do ponto de vista do
 *   V8 — cobertura zerada mesmo com o schema 100% validado acima)
 */

import { UserRole } from '@auth/domain/types'
import { UserSchema, UserSchemaClass } from '@auth/infrastructure/user.schema'
import mongoose from 'mongoose'

const UserModel = mongoose.model('UserSchemaSpecModel', UserSchema)

function buildValidData(overrides: Record<string, unknown> = {}) {
  return {
    name: 'Fulano',
    email: 'fulano@example.com',
    cpf: '52998224725',
    phone: '11912345678',
    birthDate: new Date('1990-05-10'),
    role: UserRole.Merchant,
    ...overrides
  }
}

describe('UserSchema', () => {
  it('rejeita quando faltam campos obrigatórios', async () => {
    const doc = new UserModel({})

    await expect(doc.validate()).rejects.toMatchObject({
      errors: expect.objectContaining({
        name: expect.anything(),
        email: expect.anything(),
        cpf: expect.anything(),
        phone: expect.anything(),
        birthDate: expect.anything(),
        role: expect.anything()
      })
    })
  })

  it('aceita quando passwordHash está ausente', async () => {
    const doc = new UserModel(buildValidData())

    await expect(doc.validate()).resolves.toBeUndefined()
  })

  it('normaliza email para lowercase e aplica trim em name/email', () => {
    const doc = new UserModel(buildValidData({ name: '  Fulano  ', email: '  Fulano@Example.COM  ' }))

    expect(doc.name).toBe('Fulano')
    expect(doc.email).toBe('fulano@example.com')
  })

  it('authProviders assume default [] quando não informado', () => {
    const doc = new UserModel(buildValidData())

    expect(doc.authProviders).toEqual([])
  })

  it('role rejeita valor fora do enum UserRole', async () => {
    const doc = new UserModel(buildValidData({ role: 'admin' }))

    await expect(doc.validate()).rejects.toMatchObject({ errors: expect.objectContaining({ role: expect.anything() }) })
  })

  it('configura índices únicos para email, cpf e authProviders (provider+providerId, sparse)', () => {
    const indexes = UserSchema.indexes()

    expect(indexes).toEqual(
      expect.arrayContaining([
        [{ email: 1 }, expect.objectContaining({ unique: true })],
        [{ cpf: 1 }, expect.objectContaining({ unique: true })],
        [
          { 'authProviders.provider': 1, 'authProviders.providerId': 1 },
          expect.objectContaining({ unique: true, sparse: true })
        ]
      ])
    )
  })

  it('habilita timestamps automáticos (createdAt/updatedAt)', () => {
    expect(UserSchema.get('timestamps')).toBe(true)
  })

  it('instancia UserSchemaClass diretamente', () => {
    expect(new UserSchemaClass()).toBeInstanceOf(UserSchemaClass)
  })
})
