/** Papéis suportados no cadastro — quem vende (merchant) e quem compra (shopper) */
export enum UserRole {
  Merchant = 'merchant',
  Shopper = 'shopper'
}

/** Provedores OAuth suportados no futuro — só o modelo de dados existe agora, o fluxo ainda não */
export type AuthProviderName = 'github' | 'google'

/** Vínculo de uma conta a um provedor OAuth externo */
export interface IAuthProviderLink {
  provider: AuthProviderName
  providerId: string
}

/** Propriedades que compõem a entidade de domínio User */
export interface IUserProps {
  id: string
  name: string
  email: string
  /** Ausente em contas criadas via OAuth (sem senha local) — preparação de schema, ainda sem fluxo OAuth real */
  passwordHash?: string
  cpf: string
  phone: string
  birthDate: Date
  authProviders: IAuthProviderLink[]
  role: UserRole
  createdAt: Date
}

/** Propriedades que compõem a entidade de domínio Session */
export interface ISessionProps {
  id: string
  userId: string
  expiresAt: Date
  revokedAt: Date | null
  createdAt: Date
}
