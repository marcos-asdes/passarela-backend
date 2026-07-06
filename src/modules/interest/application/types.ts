import { Interest } from '@interest/domain/interest.entity'

/** Dados necessários pra criar um registro de interest */
export interface ICreateInterestData {
  offerId: string
  shopperId: string
}

/** Porta que a camada de aplicação depende para acessar interests — implementada em infrastructure/ */
export interface IInterestRepository {
  create(data: ICreateInterestData): Promise<Interest>
  /** Compensação do passo 1 quando o decremento de estoque (passo 2) falha — ver register-interest.use-case */
  deleteById(id: string): Promise<void>
  /** Todos os interests de um shopper — usado no endpoint GET /interest/mine */
  findByShopperId(shopperId: string): Promise<Interest[]>
  /** Busca o interest de um shopper numa offer específica — `null` se não existir */
  findByOfferAndShopper(offerId: string, shopperId: string): Promise<Interest | null>
}

/** Token de injeção DI para IInterestRepository */
export const INTEREST_REPOSITORY = Symbol('INTEREST_REPOSITORY')

/**
 * Porta que `interest/` depende pra decrementar/incrementar o estoque da Offer atomicamente —
 * implementada em infrastructure/ operando direto na collection do bounded context `offers`
 * (única exceção de fronteira nessa direção, ver nota de arquitetura no CLAUDE.md).
 * `decrement`: `true` = decrementou; `false` = offer não existe, não está `Active`, ou já está sem estoque.
 * `increment`: `true` = incrementou; `false` = offer não encontrada.
 */
export interface IOfferStockPort {
  decrement(offerId: string): Promise<boolean>
  increment(offerId: string): Promise<boolean>
}

/** Token de injeção DI para IOfferStockPort */
export const OFFER_STOCK_PORT = Symbol('OFFER_STOCK_PORT')

/** Entrada do caso de uso de registro de interest */
export interface IRegisterInterestInput {
  offerId: string
  shopperId: string
}

/** Entrada do caso de uso de remoção de interest */
export interface IRemoveInterestInput {
  offerId: string
  shopperId: string
}
