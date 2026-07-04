import { IAuthProviderLink, IUserProps, UserRole } from '@auth/domain/types'

/** Entidade de domínio User — zero dependência de infraestrutura (sem Mongoose, sem NestJS) */
export class User {
  private readonly props: IUserProps

  constructor(props: IUserProps) {
    this.props = props
  }

  get id(): string {
    return this.props.id
  }

  get name(): string {
    return this.props.name
  }

  get email(): string {
    return this.props.email
  }

  /** Ausente em contas OAuth-only (sem senha local) — quem verifica isso é LoginUseCase, não a entidade */
  get passwordHash(): string | undefined {
    return this.props.passwordHash
  }

  get cpf(): string {
    return this.props.cpf
  }

  get phone(): string {
    return this.props.phone
  }

  get birthDate(): Date {
    return this.props.birthDate
  }

  get authProviders(): IAuthProviderLink[] {
    return this.props.authProviders
  }

  get role(): UserRole {
    return this.props.role
  }

  get createdAt(): Date {
    return this.props.createdAt
  }

  /** Remove espaços nas extremidades e converte pra minúsculas — mesma normalização usada antes de persistir/comparar */
  static normalizeEmail(raw: string): string {
    return raw.trim().toLowerCase()
  }

  /** Remove tudo que não for dígito — usado antes de persistir/comparar telefone */
  static normalizePhone(raw: string): string {
    return raw.replace(/\D/g, '')
  }
}
