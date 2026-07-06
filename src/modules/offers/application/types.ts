import { Offer } from '@offers/domain/offer.entity'
import { OfferStatus } from '@offers/domain/types'

/** Dados necessários pra criar uma offer */
export interface ICreateOfferData {
  merchantId: string
  title: string
  description: string
  discountPercent: number
  stock: number
  validUntil: Date
}

/** Campos editáveis de uma offer existente — todos opcionais, o use case decide o que realmente mudou */
export interface IUpdateOfferData {
  title?: string
  description?: string
  discountPercent?: number
  stock?: number
  validUntil?: Date
}

/** Porta que a camada de aplicação depende para acessar offers — implementada em infrastructure/ */
export interface IOfferRepository {
  create(data: ICreateOfferData): Promise<Offer>
  findById(id: string): Promise<Offer | null>
  findByMerchant(merchantId: string): Promise<Offer[]>
  findPublic(status: OfferStatus): Promise<Offer[]>
  /** Feed público completo: Active → Expired → SoldOut, cada grupo por createdAt desc. Não retorna Closed. */
  findPublicFeed(): Promise<Offer[]>
  update(id: string, data: IUpdateOfferData): Promise<Offer | null>
  updateStatus(id: string, status: OfferStatus): Promise<Offer | null>
  /** Muda pra `Expired` toda offer `Active`/`SoldOut` com `validUntil` no passado — usada só pelo scheduler */
  expireOverdue(now: Date): Promise<Offer[]>
}

/** Token de injeção DI para IOfferRepository */
export const OFFER_REPOSITORY = Symbol('OFFER_REPOSITORY')

/**
 * Porta que `offers/` depende pra saber quantos interests cada offer tem — implementada em
 * infrastructure/ lendo (só schema, nunca use case) a collection do bounded context `interest`
 */
export interface IInterestCountPort {
  countByOffers(offerIds: string[]): Promise<Record<string, number>>
}

/** Token de injeção DI para IInterestCountPort */
export const INTEREST_COUNT_PORT = Symbol('INTEREST_COUNT_PORT')

/** Entrada do caso de uso de criação de offer */
export interface ICreateOfferInput {
  merchantId: string
  title: string
  description: string
  discountPercent: number
  stock: number
  validUntil: Date
}

/** Entrada do caso de uso de edição de offer */
export interface IUpdateOfferInput {
  id: string
  merchantId: string
  data: IUpdateOfferData
}

/** Entrada do caso de uso de encerramento de offer */
export interface ICloseOfferInput {
  id: string
  merchantId: string
}

/** Uma offer do dashboard do merchant, já com a contagem de interest anexada */
export interface IMerchantOfferResult {
  offer: Offer
  interestCount: number
}
