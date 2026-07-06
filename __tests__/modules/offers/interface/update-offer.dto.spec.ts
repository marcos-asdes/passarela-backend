/**
 * Testes unitários para UpdateOfferDto
 *
 * Cenários testados:
 * - aceita um payload vazio (todos os campos são opcionais)
 * - normaliza título/descrição (trim) antes de validar, quando informados
 * - rejeita título fora do intervalo de 2-120 caracteres
 * - rejeita descrição fora do intervalo de 2-1000 caracteres
 * - rejeita discountPercent fora do intervalo 0-100
 * - rejeita stock negativo
 * - rejeita stock não inteiro
 * - rejeita validUntil no passado
 */

import { UpdateOfferDto } from '@offers/interface/update-offer.dto'
import { plainToInstance } from 'class-transformer'
import { validateSync } from 'class-validator'

function validate(payload: Record<string, unknown>) {
  const instance = plainToInstance(UpdateOfferDto, payload)
  return { instance, errors: validateSync(instance) }
}

describe('UpdateOfferDto', () => {
  it('aceita um payload vazio, já que todos os campos são opcionais', () => {
    const { errors } = validate({})

    expect(errors).toHaveLength(0)
  })

  it('normaliza título/descrição (trim) antes de validar', () => {
    const { instance } = validate({ title: '  Novo título  ', description: '  Nova descrição  ' })

    expect(instance.title).toBe('Novo título')
    expect(instance.description).toBe('Nova descrição')
  })

  it('rejeita título fora do intervalo de 2-120 caracteres', () => {
    const { errors } = validate({ title: 'a' })

    expect(errors.some((error) => error.property === 'title')).toBe(true)
  })

  it('rejeita descrição fora do intervalo de 2-1000 caracteres', () => {
    const { errors } = validate({ description: 'a' })

    expect(errors.some((error) => error.property === 'description')).toBe(true)
  })

  it('rejeita discountPercent fora do intervalo 0-100', () => {
    const { errors } = validate({ discountPercent: 150 })

    expect(errors.some((error) => error.property === 'discountPercent')).toBe(true)
  })

  it('rejeita stock negativo', () => {
    const { errors } = validate({ stock: -1 })

    expect(errors.some((error) => error.property === 'stock')).toBe(true)
  })

  it('rejeita stock não inteiro', () => {
    const { errors } = validate({ stock: 1.5 })

    expect(errors.some((error) => error.property === 'stock')).toBe(true)
  })

  it('rejeita validUntil no passado', () => {
    const { errors } = validate({ validUntil: new Date(Date.now() - 60_000).toISOString() })

    expect(errors.some((error) => error.property === 'validUntil')).toBe(true)
  })
})
