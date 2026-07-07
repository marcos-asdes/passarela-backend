import {
  ILoginInput,
  ILoginResult,
  IPasswordHasher,
  ISessionRepository,
  ITokenService,
  IUserRepository,
  PASSWORD_HASHER,
  SESSION_REPOSITORY,
  TOKEN_SERVICE,
  USER_REPOSITORY
} from '@auth/application/types'
import { InvalidCredentialsError } from '@auth/domain/invalid-credentials.error'
import { User } from '@auth/domain/user.entity'
import { Inject, Injectable } from '@nestjs/common'

/**
 * Hash argon2id fixo (mesmos custos usados em produção) contra o qual comparamos quando o e-mail não
 * existe ou a conta não tem senha local — sem isso, a ausência de comparação seria instantânea e um
 * atacante poderia inferir se um e-mail existe só pelo tempo de resposta (timing side-channel).
 * Exportado só pra ser referenciado diretamente no teste da equalização de tempo.
 */
export const DUMMY_PASSWORD_HASH =
  '$argon2id$v=19$m=19456,t=2,p=1$EO8YfocPaoKkQyZukM7YkA$0zMmPmLcCYbCRUThLrVJJeoXQY9YbeWPgPnZa2sIQTs'

/** Caso de uso: autentica com email/senha, cria uma sessão no banco e assina o JWT correspondente */
@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    @Inject(PASSWORD_HASHER) private readonly passwordHasher: IPasswordHasher,
    @Inject(TOKEN_SERVICE) private readonly tokenService: ITokenService,
    @Inject(SESSION_REPOSITORY) private readonly sessionRepository: ISessionRepository
  ) {}

  async execute(input: ILoginInput): Promise<ILoginResult> {
    const email = User.normalizeEmail(input.email)
    const user = await this.userRepository.findByEmailAndRole(email, input.role)

    // user?.passwordHash cobre tanto "usuário não encontrado" quanto "conta OAuth-only sem senha local" —
    // os dois casos comparam contra o hash-dummy e caem no mesmo erro genérico abaixo.
    const hashToCompare = user?.passwordHash ?? DUMMY_PASSWORD_HASH
    const passwordMatches = await this.passwordHasher.compare(input.password, hashToCompare)

    if (!user || !passwordMatches) {
      throw new InvalidCredentialsError()
    }

    const expiresAt = this.tokenService.computeExpiresAt()
    const session = await this.sessionRepository.create({ userId: user.id, expiresAt })
    const accessToken = this.tokenService.sign({ sub: user.id, role: user.role, jti: session.id })

    return { accessToken, user: { id: user.id, role: user.role } }
  }
}
