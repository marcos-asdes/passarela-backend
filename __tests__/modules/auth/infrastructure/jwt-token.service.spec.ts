/**
 * Testes unitários para JwtTokenService
 *
 * Cenários testados:
 * - sign() produz um token assinado com o algoritmo HS256
 * - O token decodificado contém exatamente os claims sub, role e jti informados
 * - computeExpiresAt() calcula a expiração a partir de JWT_EXPIRES_IN configurado
 */

import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { IEnvironmentVariables } from '@config/types'
import { UserRole } from '@auth/domain/types'
import { JwtTokenService } from '@auth/infrastructure/jwt-token.service'

function decodeHeader(token: string): { alg: string } {
  const [headerSegment] = token.split('.')
  return JSON.parse(Buffer.from(headerSegment, 'base64url').toString('utf8'))
}

describe('JwtTokenService', () => {
  const jwtService = new JwtService({ secret: 'test-secret-com-32-caracteres-ok', signOptions: { algorithm: 'HS256' } })

  function buildService(jwtExpiresIn: string): JwtTokenService {
    const configService = {
      get: jest.fn().mockReturnValue(jwtExpiresIn)
    } as unknown as ConfigService<IEnvironmentVariables, true>
    return new JwtTokenService(jwtService, configService)
  }

  describe('sign', () => {
    it('produz um token assinado com o algoritmo HS256', () => {
      const service = buildService('1h')

      const token = service.sign({ sub: 'user-1', role: UserRole.Seller, jti: 'session-1' })

      expect(decodeHeader(token).alg).toBe('HS256')
    })

    it('o token decodificado contém exatamente os claims sub, role e jti informados', () => {
      const service = buildService('1h')

      const token = service.sign({ sub: 'user-1', role: UserRole.Seller, jti: 'session-1' })
      const payload = jwtService.decode(token) as Record<string, unknown>

      expect(payload.sub).toBe('user-1')
      expect(payload.role).toBe(UserRole.Seller)
      expect(payload.jti).toBe('session-1')
    })
  })

  describe('computeExpiresAt', () => {
    it('calcula a expiração a partir de JWT_EXPIRES_IN configurado', () => {
      const service = buildService('1h')
      const before = Date.now()

      const expiresAt = service.computeExpiresAt()

      const oneHourInMs = 60 * 60 * 1000
      expect(expiresAt.getTime()).toBeGreaterThanOrEqual(before + oneHourInMs - 1000)
      expect(expiresAt.getTime()).toBeLessThanOrEqual(before + oneHourInMs + 1000)
    })
  })
})
