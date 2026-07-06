/** Ciclo de vida de uma offer — `Active` é o único status em que edição/interest são permitidos */
export enum OfferStatus {
  Active = 'active',
  Closed = 'closed',
  SoldOut = 'sold_out',
  Expired = 'expired'
}

/** Propriedades que compõem a entidade de domínio Offer */
export interface IOfferProps {
  id: string
  merchantId: string
  title: string
  description: string
  discountPercent: number
  stock: number
  validUntil: Date
  status: OfferStatus
  createdAt: Date
  updatedAt: Date
}
