/** Lançado quando um merchant tenta editar/encerrar uma offer que não é dele */
export class OfferNotOwnedError extends Error {
  constructor() {
    super('Offer pertence a outro merchant')
    this.name = 'OfferNotOwnedError'
  }
}
