/**
 * Testes unitários para RegisterInterestDto
 *
 * Cenários testados:
 * - aceita um offerId com formato de ObjectId válido
 * - rejeita offerId ausente ou com formato inválido
 */

import { plainToInstance } from 'class-transformer'
import { validateSync } from 'class-validator'
import { RegisterInterestDto } from '@interest/interface/register-interest.dto'

function validate(payload: Record<string, unknown>) {
  return validateSync(plainToInstance(RegisterInterestDto, payload))
}

describe('RegisterInterestDto', () => {
  it('aceita um offerId com formato de ObjectId válido', () => {
    expect(validate({ offerId: '507f1f77bcf86cd799439011' })).toHaveLength(0)
  })

  it('rejeita offerId com formato inválido', () => {
    const errors = validate({ offerId: 'id-invalido' })

    expect(errors.some((error) => error.property === 'offerId')).toBe(true)
  })
})
