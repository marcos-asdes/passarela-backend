/**
 * Testes unitários para OfferSchema
 *
 * Cenários testados:
 * - Rejeita quando faltam campos obrigatórios
 * - status assume default Active quando não informado
 * - Índice composto (status, validUntil) configurado
 * - timestamps automáticos (createdAt/updatedAt) habilitados
 * - Instancia OfferSchemaClass diretamente (SchemaFactory.createForClass só lê metadata via reflection,
 *   nunca chama `new`, e sem isso as atribuições dos campos decorados nunca rodam do ponto de vista do
 *   V8 — cobertura zerada mesmo com o schema 100% validado acima)
 */

import { OfferStatus } from '@offers/domain/types'
import { OfferSchema, OfferSchemaClass } from '@offers/infrastructure/offer.schema'
import mongoose from 'mongoose'

const OfferModel = mongoose.model('OfferSchemaSpecModel', OfferSchema)

describe('OfferSchema', () => {
  it('rejeita quando faltam campos obrigatórios', async () => {
    const doc = new OfferModel({})

    await expect(doc.validate()).rejects.toMatchObject({
      errors: expect.objectContaining({
        merchantId: expect.anything(),
        title: expect.anything(),
        description: expect.anything(),
        discountPercent: expect.anything(),
        stock: expect.anything(),
        validUntil: expect.anything()
      })
    })
  })

  it('status assume default Active quando não informado', () => {
    const doc = new OfferModel({
      merchantId: 'merchant-1',
      title: 'Título',
      description: 'Descrição',
      discountPercent: 10,
      stock: 5,
      validUntil: new Date()
    })

    expect(doc.status).toBe(OfferStatus.Active)
  })

  it('configura índice composto (status, validUntil)', () => {
    const indexes = OfferSchema.indexes()

    expect(indexes).toEqual(expect.arrayContaining([[{ status: 1, validUntil: 1 }, expect.objectContaining({})]]))
  })

  it('habilita timestamps automáticos (createdAt/updatedAt)', () => {
    expect(OfferSchema.get('timestamps')).toBe(true)
  })

  it('instancia OfferSchemaClass diretamente', () => {
    expect(new OfferSchemaClass()).toBeInstanceOf(OfferSchemaClass)
  })
})
