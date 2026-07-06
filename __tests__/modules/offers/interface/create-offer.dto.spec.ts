/**
 * Testes unitários para CreateOfferDto
 *
 * Cenários testados:
 * - aceita um payload completo válido (sem erros de validação)
 * - normaliza título/descrição (trim) antes de validar
 * - rejeita título fora do intervalo de 2-120 caracteres
 * - rejeita discountPercent fora do intervalo 0-100
 * - rejeita stock negativo
 * - rejeita stock não inteiro
 * - rejeita validUntil no passado
 */

import { plainToInstance } from 'class-transformer'
import { validateSync } from 'class-validator'
import { CreateOfferDto } from '@offers/interface/create-offer.dto'

const validPayload: Record<string, unknown> = {
  title: '  50% OFF em todos os tênis  ',
  description: '  Promoção relâmpago  ',
  discountPercent: 50,
  stock: 10,
  validUntil: new Date(Date.now() + 60_000).toISOString()
}

function validate(payload: Record<string, unknown>) {
  const instance = plainToInstance(CreateOfferDto, payload)
  return { instance, errors: validateSync(instance) }
}

describe('CreateOfferDto', () => {
  it('aceita um payload completo válido', () => {
    const { errors } = validate(validPayload)

    expect(errors).toHaveLength(0)
  })

  it('normaliza título/descrição (trim) antes de validar', () => {
    const { instance } = validate(validPayload)

    expect(instance.title).toBe('50% OFF em todos os tênis')
    expect(instance.description).toBe('Promoção relâmpago')
  })

  it('rejeita título fora do intervalo de 2-120 caracteres', () => {
    const { errors } = validate({ ...validPayload, title: 'a' })

    expect(errors.some((error) => error.property === 'title')).toBe(true)
  })

  it('rejeita discountPercent fora do intervalo 0-100', () => {
    const { errors } = validate({ ...validPayload, discountPercent: 150 })

    expect(errors.some((error) => error.property === 'discountPercent')).toBe(true)
  })

  it('rejeita stock negativo', () => {
    const { errors } = validate({ ...validPayload, stock: -1 })

    expect(errors.some((error) => error.property === 'stock')).toBe(true)
  })

  it('rejeita stock não inteiro', () => {
    const { errors } = validate({ ...validPayload, stock: 1.5 })

    expect(errors.some((error) => error.property === 'stock')).toBe(true)
  })

  it('rejeita validUntil no passado', () => {
    const { errors } = validate({ ...validPayload, validUntil: new Date(Date.now() - 60_000).toISOString() })

    expect(errors.some((error) => error.property === 'validUntil')).toBe(true)
  })
})
