import {
  IAuthenticatedUser,
  IJwtPayload,
  ISessionRepository,
  IUserRepository,
  SESSION_REPOSITORY,
  USER_REPOSITORY
} from '@auth/application/types'
import { Inject, Injectable } from '@nestjs/common'

/**
 * Caso de uso chamado a cada request autenticada (via JwtStrategy.validate()): confere sessão ativa
 * E usuário ainda existente — dá revogação real (deletar usuário/revogar sessão derruba o token na hora
 * seguinte, não só na expiração natural). Retorna null quando qualquer uma das checagens falha.
 */
@Injectable()
export class GetAuthenticatedUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    @Inject(SESSION_REPOSITORY) private readonly sessionRepository: ISessionRepository
  ) {}

  async execute(payload: IJwtPayload): Promise<IAuthenticatedUser | null> {
    const session = await this.sessionRepository.findActiveById(payload.jti)
    if (!session || session.userId !== payload.sub) {
      return null
    }

    const user = await this.userRepository.findById(payload.sub)
    if (!user) {
      return null
    }

    return { id: user.id, role: user.role, sessionId: session.id }
  }
}
