/**
 * Testes unitários para JwtStrategy
 *
 * Cenários testados:
 * - validate() retorna o usuário autenticado quando o use case encontra sessão ativa + usuário
 * - validate() lança UnauthorizedException quando o use case nega (sessão inválida ou usuário inexistente)
 */

import { ConfigService } from '@nestjs/config'
import { UnauthorizedException } from '@nestjs/common'
import { UserRole } from '@auth/domain/types'
import { GetAuthenticatedUserUseCase } from '@auth/application/get-authenticated-user.use-case'
import { JwtStrategy } from '@auth/infrastructure/jwt.strategy'

describe('JwtStrategy', () => {
  let getAuthenticatedUserUseCase: jest.Mocked<GetAuthenticatedUserUseCase>
  let strategy: JwtStrategy

  beforeEach(() => {
    const configService = {
      get: jest.fn().mockReturnValue('test-secret-com-32-caracteres-ok')
    } as unknown as ConfigService
    getAuthenticatedUserUseCase = { execute: jest.fn() } as unknown as jest.Mocked<GetAuthenticatedUserUseCase>
    strategy = new JwtStrategy(configService as never, getAuthenticatedUserUseCase)
  })

  it('retorna o usuário autenticado quando o use case encontra sessão ativa + usuário', async () => {
    getAuthenticatedUserUseCase.execute.mockResolvedValue({ id: 'user-1', role: UserRole.Merchant })

    const result = await strategy.validate({ sub: 'user-1', role: UserRole.Merchant, jti: 'session-1' })

    expect(result).toEqual({ id: 'user-1', role: UserRole.Merchant })
  })

  it('lança UnauthorizedException quando o use case nega', async () => {
    getAuthenticatedUserUseCase.execute.mockResolvedValue(null)

    await expect(
      strategy.validate({ sub: 'user-1', role: UserRole.Merchant, jti: 'session-1' })
    ).rejects.toBeInstanceOf(UnauthorizedException)
  })
})
