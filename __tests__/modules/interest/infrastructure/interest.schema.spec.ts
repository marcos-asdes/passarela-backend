/**
 * Testes unitários para InterestSchema
 *
 * Cenários testados:
 * - Rejeita quando faltam offerId ou shopperId
 * - Índice único composto (offerId, shopperId) configurado
 * - timestamps automáticos (createdAt/updatedAt) habilitados
 * - Instancia InterestSchemaClass diretamente (SchemaFactory.createForClass só lê metadata via reflection,
 *   nunca chama `new`, e sem isso as atribuições dos campos decorados nunca rodam do ponto de vista do
 *   V8 — cobertura zerada mesmo com o schema 100% validado acima)
 */

import { InterestSchema, InterestSchemaClass } from '@interest/infrastructure/interest.schema'
import mongoose from 'mongoose'

const InterestModel = mongoose.model('InterestSchemaSpecModel', InterestSchema)

describe('InterestSchema', () => {
  it('rejeita quando faltam campos obrigatórios', async () => {
    const doc = new InterestModel({})

    await expect(doc.validate()).rejects.toMatchObject({
      errors: expect.objectContaining({ offerId: expect.anything(), shopperId: expect.anything() })
    })
  })

  it('configura índice único composto (offerId, shopperId)', () => {
    const indexes = InterestSchema.indexes()

    expect(indexes).toEqual(
      expect.arrayContaining([[{ offerId: 1, shopperId: 1 }, expect.objectContaining({ unique: true })]])
    )
  })

  it('habilita timestamps automáticos (createdAt/updatedAt)', () => {
    expect(InterestSchema.get('timestamps')).toBe(true)
  })

  it('instancia InterestSchemaClass diretamente', () => {
    expect(new InterestSchemaClass()).toBeInstanceOf(InterestSchemaClass)
  })
})
