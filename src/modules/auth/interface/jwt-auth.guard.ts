import { IAuthenticatedUser } from '@auth/application/types'
import { Injectable, UnauthorizedException } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

/**
 * Guard de autenticação — qualquer falha (token ausente, expirado, assinatura inválida, sessão revogada
 * via JwtStrategy.validate()) vira o mesmo 401 genérico, sem detalhe do motivo real pro cliente
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser = IAuthenticatedUser>(err: unknown, user: TUser | false): TUser {
    if (err || !user) {
      throw new UnauthorizedException()
    }
    return user
  }
}
