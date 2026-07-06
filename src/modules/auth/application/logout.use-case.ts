import { ISessionRepository, SESSION_REPOSITORY } from '@auth/application/types'
import { Inject, Injectable } from '@nestjs/common'

/** Caso de uso: revoga a sessão do usuário autenticado — a próxima request com o mesmo token cai em 401 na hora, não só na expiração natural */
@Injectable()
export class LogoutUseCase {
  constructor(@Inject(SESSION_REPOSITORY) private readonly sessionRepository: ISessionRepository) {}

  async execute(sessionId: string): Promise<void> {
    await this.sessionRepository.revoke(sessionId)
  }
}
