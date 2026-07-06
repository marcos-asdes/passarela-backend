/**
 * Testes unitários para RegisterDto
 *
 * Cenários testados:
 * - Aceita um payload completo válido (sem erros de validação)
 * - Normaliza e-mail (trim + lowercase), CPF e telefone (só dígitos) antes de validar
 * - Rejeita e-mail com formato inválido
 * - Rejeita CPF inválido (dígito verificador errado)
 * - Rejeita telefone fora do padrão de 10-11 dígitos
 * - Rejeita data de nascimento no futuro
 * - Rejeita senha sem maiúscula/minúscula/número/caractere especial
 * - Rejeita senha com menos de 10 ou mais de 128 caracteres
 * - Rejeita quando confirmPassword é diferente de password
 * - Rejeita role fora do enum merchant/shopper
 */

import { plainToInstance } from 'class-transformer'
import { validateSync } from 'class-validator'
import { UserRole } from '@auth/domain/types'
import { RegisterDto } from '@auth/interface/register.dto'

const validPayload: Record<string, unknown> = {
  name: 'Fulano de Tal',
  email: '  Fulano@Example.COM  ',
  cpf: '529.982.247-25',
  phone: '(11) 91234-5678',
  birthDate: '1990-05-10',
  password: 'Senha@Forte123',
  confirmPassword: 'Senha@Forte123',
  role: UserRole.Merchant
}

function validate(payload: Record<string, unknown>) {
  const instance = plainToInstance(RegisterDto, payload)
  return { instance, errors: validateSync(instance) }
}

describe('RegisterDto', () => {
  it('aceita um payload completo válido', () => {
    const { errors } = validate(validPayload)

    expect(errors).toHaveLength(0)
  })

  describe('normalização', () => {
    it('normaliza e-mail (trim + lowercase)', () => {
      const { instance } = validate(validPayload)

      expect(instance.email).toBe('fulano@example.com')
    })

    it('normaliza CPF (só dígitos)', () => {
      const { instance } = validate(validPayload)

      expect(instance.cpf).toBe('52998224725')
    })

    it('normaliza telefone (só dígitos)', () => {
      const { instance } = validate(validPayload)

      expect(instance.phone).toBe('11912345678')
    })
  })

  describe('rejeições', () => {
    it('rejeita e-mail com formato inválido', () => {
      const { errors } = validate({ ...validPayload, email: 'não-é-email' })

      expect(errors.some((error) => error.property === 'email')).toBe(true)
    })

    it('rejeita CPF inválido', () => {
      const { errors } = validate({ ...validPayload, cpf: '123.456.789-00' })

      expect(errors.some((error) => error.property === 'cpf')).toBe(true)
    })

    it('rejeita telefone fora do padrão de 10-11 dígitos', () => {
      const { errors } = validate({ ...validPayload, phone: '123' })

      expect(errors.some((error) => error.property === 'phone')).toBe(true)
    })

    it('rejeita data de nascimento no futuro', () => {
      const { errors } = validate({ ...validPayload, birthDate: '2999-01-01' })

      expect(errors.some((error) => error.property === 'birthDate')).toBe(true)
    })

    it('rejeita senha sem maiúscula', () => {
      const { errors } = validate({
        ...validPayload,
        password: 'senha@forte123',
        confirmPassword: 'senha@forte123'
      })

      expect(errors.some((error) => error.property === 'password')).toBe(true)
    })

    it('rejeita senha sem minúscula', () => {
      const { errors } = validate({
        ...validPayload,
        password: 'SENHA@FORTE123',
        confirmPassword: 'SENHA@FORTE123'
      })

      expect(errors.some((error) => error.property === 'password')).toBe(true)
    })

    it('rejeita senha sem número', () => {
      const { errors } = validate({
        ...validPayload,
        password: 'Senha@Forte',
        confirmPassword: 'Senha@Forte'
      })

      expect(errors.some((error) => error.property === 'password')).toBe(true)
    })

    it('rejeita senha sem caractere especial', () => {
      const { errors } = validate({
        ...validPayload,
        password: 'SenhaForte123',
        confirmPassword: 'SenhaForte123'
      })

      expect(errors.some((error) => error.property === 'password')).toBe(true)
    })

    it('rejeita senha com menos de 10 caracteres', () => {
      const { errors } = validate({ ...validPayload, password: 'Sf@1', confirmPassword: 'Sf@1' })

      expect(errors.some((error) => error.property === 'password')).toBe(true)
    })

    it('rejeita senha com mais de 128 caracteres', () => {
      const longPassword = `Senha@Forte123${'a'.repeat(120)}`
      const { errors } = validate({ ...validPayload, password: longPassword, confirmPassword: longPassword })

      expect(errors.some((error) => error.property === 'password')).toBe(true)
    })

    it('rejeita quando confirmPassword é diferente de password', () => {
      const { errors } = validate({ ...validPayload, confirmPassword: 'Outra@Senha123' })

      expect(errors.some((error) => error.property === 'confirmPassword')).toBe(true)
    })

    it('rejeita role fora do enum merchant/shopper', () => {
      const { errors } = validate({ ...validPayload, role: 'admin' })

      expect(errors.some((error) => error.property === 'role')).toBe(true)
    })
  })
})
