/**
 * Testes unitários para sanitizeBody / pickRequestHeaders / pickResponseHeaders
 *
 * Cenários testados:
 * - sanitizeBody redige password, confirmPassword, cpf e phone
 * - sanitizeBody preserva campos não sensíveis
 * - sanitizeBody sanitiza recursivamente objetos aninhados
 * - sanitizeBody substitui string base64 longa por um marcador com o tamanho
 * - sanitizeBody substitui array grande (> 100 itens) por um marcador com o tamanho
 * - sanitizeBody substitui objeto binary-like (muitas chaves numéricas sequenciais) por um marcador
 * - sanitizeBody substitui objeto com mais de 100 chaves por um marcador
 * - sanitizeBody retorna o valor original quando não é um objeto plano
 * - pickRequestHeaders inclui só os headers da lista permitida presentes na requisição
 * - pickRequestHeaders redige Authorization quando presente, sem nunca logar o valor
 * - pickResponseHeaders inclui só os headers da lista permitida presentes na resposta
 */

import { pickRequestHeaders, pickResponseHeaders, sanitizeBody } from '@shared/logger/sanitize-http'

describe('sanitizeBody', () => {
  it('redige password, confirmPassword, cpf e phone', () => {
    const sanitized = sanitizeBody({
      email: 'fulano@example.com',
      password: 'Senha@Forte123',
      confirmPassword: 'Senha@Forte123',
      cpf: '52998224725',
      phone: '11912345678'
    })

    expect(sanitized).toEqual({
      email: 'fulano@example.com',
      password: '[REDACTED]',
      confirmPassword: '[REDACTED]',
      cpf: '[REDACTED]',
      phone: '[REDACTED]'
    })
  })

  it('preserva campos não sensíveis', () => {
    expect(sanitizeBody({ name: 'Fulano', role: 'seller' })).toEqual({ name: 'Fulano', role: 'seller' })
  })

  it('sanitiza recursivamente objetos aninhados', () => {
    const sanitized = sanitizeBody({ user: { name: 'Fulano', password: 'segredo' } })

    expect(sanitized).toEqual({ user: { name: 'Fulano', password: '[REDACTED]' } })
  })

  it('substitui string base64 longa por um marcador com o tamanho', () => {
    const longBase64 = 'A'.repeat(150)

    const sanitized = sanitizeBody({ file: longBase64 }) as Record<string, unknown>

    expect(sanitized.file).toBe(`[BASE64_DATA:${longBase64.length}bytes]`)
  })

  it('substitui array grande (> 100 itens) por um marcador com o tamanho', () => {
    const bigArray = Array.from({ length: 101 }, (_, i) => i)

    const sanitized = sanitizeBody({ items: bigArray }) as Record<string, unknown>

    expect(sanitized.items).toBe('[ARRAY:101items]')
  })

  it('substitui objeto binary-like (muitas chaves numéricas sequenciais) por um marcador', () => {
    const bufferLike: Record<string, number> = {}
    for (let i = 0; i < 60; i++) bufferLike[i] = i

    expect(sanitizeBody(bufferLike)).toBe('[BINARY_DATA:60bytes]')
  })

  it('substitui objeto com mais de 100 chaves por um marcador', () => {
    const bigObject: Record<string, number> = {}
    for (let i = 0; i < 101; i++) bigObject[`key${i}`] = i

    expect(sanitizeBody(bigObject)).toBe('[BINARY_DATA:101bytes]')
  })

  it('retorna o valor original quando não é um objeto plano', () => {
    expect(sanitizeBody('texto')).toBe('texto')
    expect(sanitizeBody(null)).toBeNull()
    expect(sanitizeBody(undefined)).toBeUndefined()
  })
})

describe('pickRequestHeaders', () => {
  it('inclui só os headers da lista permitida presentes na requisição', () => {
    const picked = pickRequestHeaders({
      'content-type': 'application/json',
      'x-internal-secret': 'nao-deveria-aparecer'
    })

    expect(picked).toEqual({ 'content-type': 'application/json' })
  })

  it('redige Authorization quando presente, sem nunca logar o valor', () => {
    const picked = pickRequestHeaders({ authorization: 'Bearer token-secreto' })

    expect(picked.authorization).toBe('[REDACTED]')
    expect(JSON.stringify(picked)).not.toContain('token-secreto')
  })
})

describe('pickResponseHeaders', () => {
  it('inclui só os headers da lista permitida presentes na resposta', () => {
    const headers: Record<string, string> = { 'content-type': 'application/json', 'x-powered-by': 'Express' }
    const getHeader = (name: string) => headers[name]

    expect(pickResponseHeaders(getHeader)).toEqual({ 'content-type': 'application/json' })
  })
})
