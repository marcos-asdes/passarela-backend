import { IInterestProps } from '@interest/domain/types'

/** Entidade de domínio Interest — registro fino de que um shopper demonstrou interesse numa offer */
export class Interest {
  private readonly props: IInterestProps

  constructor(props: IInterestProps) {
    this.props = props
  }

  get id(): string {
    return this.props.id
  }

  get offerId(): string {
    return this.props.offerId
  }

  get shopperId(): string {
    return this.props.shopperId
  }

  get createdAt(): Date {
    return this.props.createdAt
  }
}
