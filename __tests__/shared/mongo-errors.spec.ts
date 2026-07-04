/**
 * Testes unitários para isDuplicateKeyError
 *
 * Cenários testados:
 * - Retorna true para um objeto com code 11000
 * - Retorna false para um Error comum (sem code 11000)
 * - Retorna false para null/undefined
 * - Retorna false para um valor que não é objeto
 */

import { isDuplicateKeyError } from '@shared/mongo-errors'

describe('isDuplicateKeyError', () => {
  it('retorna true para um objeto com code 11000', () => {
    expect(isDuplicateKeyError({ code: 11000, keyPattern: { email: 1 } })).toBe(true)
  })

  it('retorna false para um Error comum', () => {
    expect(isDuplicateKeyError(new Error('falha genérica'))).toBe(false)
  })

  it('retorna false para null', () => {
    expect(isDuplicateKeyError(null)).toBe(false)
  })

  it('retorna false para undefined', () => {
    expect(isDuplicateKeyError(undefined)).toBe(false)
  })

  it('retorna false para um valor que não é objeto', () => {
    expect(isDuplicateKeyError('erro qualquer')).toBe(false)
  })
})
