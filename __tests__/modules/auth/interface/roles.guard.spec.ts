/**
 * Testes unitários para RolesGuard
 *
 * Cenários testados:
 * - Permite acesso quando a rota não declara @Roles()
 * - Permite acesso quando request.user.role está entre os papéis exigidos
 * - Nega acesso (ForbiddenException) quando request.user.role não está entre os papéis exigidos
 */

import { ExecutionContext, ForbiddenException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { UserRole } from '@auth/domain/types'
import { RolesGuard } from '@auth/interface/roles.guard'

function buildContext(user: { id: string; role: UserRole } | undefined): ExecutionContext {
  return {
    getHandler: () => jest.fn(),
    getClass: () => jest.fn(),
    switchToHttp: () => ({ getRequest: () => ({ user }) })
  } as unknown as ExecutionContext
}

describe('RolesGuard', () => {
  let reflector: jest.Mocked<Reflector>
  let guard: RolesGuard

  beforeEach(() => {
    reflector = { getAllAndOverride: jest.fn() } as unknown as jest.Mocked<Reflector>
    guard = new RolesGuard(reflector)
  })

  it('permite acesso quando a rota não declara @Roles()', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined)

    expect(guard.canActivate(buildContext({ id: 'user-1', role: UserRole.Shopper }))).toBe(true)
  })

  it('permite acesso quando request.user.role está entre os papéis exigidos', () => {
    reflector.getAllAndOverride.mockReturnValue([UserRole.Merchant])

    expect(guard.canActivate(buildContext({ id: 'user-1', role: UserRole.Merchant }))).toBe(true)
  })

  it('nega acesso quando request.user.role não está entre os papéis exigidos', () => {
    reflector.getAllAndOverride.mockReturnValue([UserRole.Merchant])

    expect(() => guard.canActivate(buildContext({ id: 'user-1', role: UserRole.Shopper }))).toThrow(ForbiddenException)
  })
})
