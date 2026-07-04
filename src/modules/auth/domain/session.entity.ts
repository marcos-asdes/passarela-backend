import { ISessionProps } from '@auth/domain/types'

/** Entidade de domínio Session — controla se um token JWT ainda corresponde a uma sessão válida no banco */
export class Session {
  private readonly props: ISessionProps

  constructor(props: ISessionProps) {
    this.props = props
  }

  get id(): string {
    return this.props.id
  }

  get userId(): string {
    return this.props.userId
  }

  get expiresAt(): Date {
    return this.props.expiresAt
  }

  get revokedAt(): Date | null {
    return this.props.revokedAt
  }

  get createdAt(): Date {
    return this.props.createdAt
  }

  /** Sessão vale enquanto não foi revogada e não passou da data de expiração */
  get isActive(): boolean {
    return this.props.revokedAt === null && this.props.expiresAt.getTime() > Date.now()
  }
}
