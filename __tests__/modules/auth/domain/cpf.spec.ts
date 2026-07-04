/**
 * Testes unitários para isValidCPF / normalizeCPF
 *
 * Cenários testados:
 * - Aceita um CPF válido conhecido, com ou sem máscara
 * - Rejeita CPF com dígito verificador errado
 * - Rejeita sequência de dígitos repetidos (ex.: 111.111.111-11), mesmo passando na fórmula
 * - Rejeita CPF com tamanho diferente de 11 dígitos
 * - normalizeCPF remove a máscara, mantendo só os dígitos
 */

import { isValidCPF, normalizeCPF } from '@auth/domain/cpf'

describe('isValidCPF', () => {
  it('aceita um CPF válido conhecido com máscara', () => {
    expect(isValidCPF('529.982.247-25')).toBe(true)
  })

  it('aceita o mesmo CPF válido sem máscara', () => {
    expect(isValidCPF('52998224725')).toBe(true)
  })

  it('rejeita CPF com dígito verificador errado', () => {
    expect(isValidCPF('123.456.789-00')).toBe(false)
  })

  it('rejeita sequência de dígitos repetidos', () => {
    expect(isValidCPF('111.111.111-11')).toBe(false)
  })

  it('rejeita CPF com tamanho diferente de 11 dígitos', () => {
    expect(isValidCPF('123')).toBe(false)
  })
})

describe('normalizeCPF', () => {
  it('remove a máscara, mantendo só os dígitos', () => {
    expect(normalizeCPF('529.982.247-25')).toBe('52998224725')
  })
})
