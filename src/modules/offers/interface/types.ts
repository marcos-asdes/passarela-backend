import { OfferStatus } from '@offers/domain/types'

/** Corpo de resposta de uma offer — usado por POST/PATCH/GET /offers */
export interface IOfferResponse {
  id: string
  merchantId: string
  title: string
  description: string
  discountPercent: number
  stock: number
  validUntil: Date
  status: OfferStatus
  createdAt: Date
}

/** Corpo de resposta de uma offer no dashboard do merchant — inclui a contagem de interest */
export interface IMerchantOfferResponse extends IOfferResponse {
  interestCount: number
}
