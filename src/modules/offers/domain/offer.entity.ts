import { OfferAlreadyClosedError } from '@offers/domain/offer-already-closed.error'
import { IOfferProps, OfferStatus } from '@offers/domain/types'

/** Entidade de domínio Offer — zero dependência de infraestrutura (sem Mongoose, sem NestJS) */
export class Offer {
  private readonly props: IOfferProps

  constructor(props: IOfferProps) {
    this.props = props
  }

  get id(): string {
    return this.props.id
  }

  get merchantId(): string {
    return this.props.merchantId
  }

  get title(): string {
    return this.props.title
  }

  get description(): string {
    return this.props.description
  }

  get discountPercent(): number {
    return this.props.discountPercent
  }

  get stock(): number {
    return this.props.stock
  }

  get validUntil(): Date {
    return this.props.validUntil
  }

  get status(): OfferStatus {
    return this.props.status
  }

  get createdAt(): Date {
    return this.props.createdAt
  }

  get updatedAt(): Date {
    return this.props.updatedAt
  }

  isOwnedBy(merchantId: string): boolean {
    return this.props.merchantId === merchantId
  }

  /** Só pode ser editada enquanto `Active` — evita alterar título/estoque de uma offer já encerrada/expirada */
  isEditable(): boolean {
    return this.props.status === OfferStatus.Active
  }

  /** Encerramento manual do merchant — só a partir de `Active`/`SoldOut`, nunca de `Closed`/`Expired` */
  close(): OfferStatus {
    if (this.props.status !== OfferStatus.Active && this.props.status !== OfferStatus.SoldOut) {
      throw new OfferAlreadyClosedError()
    }
    return OfferStatus.Closed
  }
}
