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

/** Resultado do registro — nunca inclui senha */
export interface IRegisterResult {
  id: string
  name: string
  email: string
  role: UserRole
  createdAt: Date
}

/** Entrada do caso de uso de login */
export interface ILoginInput {
  email: string
  password: string
}

/** Resultado do login — token + dados mínimos do usuário */
export interface ILoginResult {
  accessToken: string
  user: {
    id: string
    name: string
    email: string
    role: UserRole
  }
}
