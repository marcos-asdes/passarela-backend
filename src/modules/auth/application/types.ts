import { Session } from '@auth/domain/session.entity'
import { User } from '@auth/domain/user.entity'
import { UserRole } from '@auth/domain/types'

/** Dados necessários pra criar um usuário local (registro via email/senha) */
export interface ICreateUserData {
  name: string
  email: string
  passwordHash: string
  cpf: string
  phone: string
  birthDate: Date
  role: UserRole
}

/** Porta que a camada de aplicação depende para acessar usuários — implementada em infrastructure/ */
export interface IUserRepository {
  create(data: ICreateUserData): Promise<User>
  findByEmail(email: string): Promise<User | null>
  /** Usada pelo login — um e-mail pode ter conta em mais de um papel, login sempre escopado a um só. */
  findByEmailAndRole(email: string, role: UserRole): Promise<User | null>
  /** Usada pelo registro — um CPF pode ter no máximo uma conta por papel. */
  findByCpfAndRole(cpf: string, role: UserRole): Promise<User | null>
  findById(id: string): Promise<User | null>
}

/** Token de injeção DI para IUserRepository */
export const USER_REPOSITORY = Symbol('USER_REPOSITORY')

/** Dados necessários pra criar um registro de sessão */
export interface ICreateSessionData {
  userId: string
  expiresAt: Date
}

/** Porta que a camada de aplicação depende para controlar sessões — implementada em infrastructure/ */
export interface ISessionRepository {
  create(data: ICreateSessionData): Promise<Session>
  findActiveById(id: string): Promise<Session | null>
  revoke(id: string): Promise<void>
}

/** Token de injeção DI para ISessionRepository */
export const SESSION_REPOSITORY = Symbol('SESSION_REPOSITORY')

/** Porta pra hash/verificação de senha — implementada em infrastructure/ (argon2id) */
export interface IPasswordHasher {
  hash(plain: string): Promise<string>
  compare(plain: string, hash: string): Promise<boolean>
}

/** Token de injeção DI para IPasswordHasher */
export const PASSWORD_HASHER = Symbol('PASSWORD_HASHER')

/** Claims assinados no JWT — mínimo necessário, nunca dado sensível */
export interface IJwtPayload {
  sub: string
  role: UserRole
  jti: string
}

/** Porta pra assinatura de token — implementada em infrastructure/ (encapsula @nestjs/jwt) */
export interface ITokenService {
  sign(payload: IJwtPayload): string
  /** Data de expiração equivalente à configurada pra assinatura (JWT_EXPIRES_IN) — usada pra alinhar a
   * expiração da sessão no banco com a expiração do próprio token, sem duplicar a leitura de env aqui */
  computeExpiresAt(): Date
}

/** Token de injeção DI para ITokenService */
export const TOKEN_SERVICE = Symbol('TOKEN_SERVICE')

/** Usuário autenticado anexado à request após o JwtStrategy validar sessão + usuário */
export interface IAuthenticatedUser {
  id: string
  role: UserRole
  /** Id da sessão validada (= jti do JWT) — usado pelo logout pra revogar exatamente essa sessão */
  sessionId: string
}

/** Resultado do perfil do usuário autenticado — nome/e-mail, só devolvido no endpoint dedicado GET /auth/me */
export interface IProfileResult {
  name: string
  email: string
}

/** Entrada do caso de uso de registro — sem confirmPassword (validado só no DTO) */
export interface IRegisterInput {
  name: string
  email: string
  password: string
  cpf: string
  phone: string
  birthDate: Date
  role: UserRole
}

/** Resultado do registro — a resposta ao cliente é só uma mensagem informativa, esse resultado existe pra log/uso interno */
export interface IRegisterResult {
  id: string
  role: UserRole
}

/** Entrada do caso de uso de login */
export interface ILoginInput {
  email: string
  password: string
  role: UserRole
}

/** Resultado do login — token + id/role do usuário (mesmos dados assinados no JWT, nunca nome/e-mail/CPF) */
export interface ILoginResult {
  accessToken: string
  user: {
    id: string
    role: UserRole
  }
}
