/** Lançado quando a offer não existe, não está `Active` ou já está sem estoque */
export class OfferUnavailableError extends Error {
  constructor() {
    super('Offer indisponível para registrar interesse')
    this.name = 'OfferUnavailableError'
  }
}
