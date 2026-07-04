/**
 * Testes unitários para JwtAuthGuard
 *
 * Cenários testados:
 * - handleRequest retorna o usuário quando a estratégia valida com sucesso
 * - handleRequest lança UnauthorizedException genérica quando há erro, independentemente do motivo
 * - handleRequest lança UnauthorizedException genérica quando não há usuário (token ausente/inválido)
 */

import { UnauthorizedException } from '@nestjs/common'
import { UserRole } from '@auth/domain/types'
import { JwtAuthGuard } from '@auth/interface/jwt-auth.guard'

describe('JwtAuthGuard', () => {
  const guard = new JwtAuthGuard()

  it('retorna o usuário quando a estratégia valida com sucesso', () => {
    const user = { id: 'user-1', role: UserRole.Seller }

    expect(guard.handleRequest(null, user)).toBe(user)
  })

  it('lança UnauthorizedException genérica quando há erro, independentemente do motivo', () => {
    expect(() => guard.handleRequest(new Error('token expirado'), false)).toThrow(UnauthorizedException)
  })

  it('lança UnauthorizedException genérica quando não há usuário', () => {
    expect(() => guard.handleRequest(null, false)).toThrow(UnauthorizedException)
  })
})
