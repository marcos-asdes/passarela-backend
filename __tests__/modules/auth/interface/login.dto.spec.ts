/**
 * Testes unitários para LoginDto
 *
 * Cenários testados:
 * - Aceita um payload válido
 * - Normaliza e-mail (trim + lowercase)
 * - Rejeita e-mail com formato inválido
 * - Rejeita senha vazia
 * - Rejeita role fora do enum UserRole
 */

import { plainToInstance } from 'class-transformer'
import { validateSync } from 'class-validator'
import { UserRole } from '@auth/domain/types'
import { LoginDto } from '@auth/interface/login.dto'

function validate(payload: Record<string, unknown>) {
  const instance = plainToInstance(LoginDto, payload)
  return { instance, errors: validateSync(instance) }
}

describe('LoginDto', () => {
  it('aceita um payload válido', () => {
    const { errors } = validate({ email: 'fulano@example.com', password: 'qualquer-senha', role: UserRole.Shopper })

    expect(errors).toHaveLength(0)
  })

  it('normaliza e-mail (trim + lowercase)', () => {
    const { instance } = validate({
      email: '  Fulano@Example.COM  ',
      password: 'qualquer-senha',
      role: UserRole.Shopper
    })

    expect(instance.email).toBe('fulano@example.com')
  })

  it('rejeita e-mail com formato inválido', () => {
    const { errors } = validate({ email: 'não-é-email', password: 'qualquer-senha', role: UserRole.Shopper })

    expect(errors.some((error) => error.property === 'email')).toBe(true)
  })

  it('rejeita senha vazia', () => {
    const { errors } = validate({ email: 'fulano@example.com', password: '', role: UserRole.Shopper })

    expect(errors.some((error) => error.property === 'password')).toBe(true)
  })

  it('rejeita role fora do enum UserRole', () => {
    const { errors } = validate({ email: 'fulano@example.com', password: 'qualquer-senha', role: 'admin' })

    expect(errors.some((error) => error.property === 'role')).toBe(true)
  })
})
