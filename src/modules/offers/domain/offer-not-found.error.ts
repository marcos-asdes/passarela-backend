/** Lançado quando a offer referenciada não existe */
export class OfferNotFoundError extends Error {
  constructor() {
    super('Offer não encontrada')
    this.name = 'OfferNotFoundError'
  }
}
