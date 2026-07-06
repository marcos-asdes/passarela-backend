/** Lançado ao tentar encerrar ou editar uma offer que não está mais `Active`/`SoldOut` */
export class OfferAlreadyClosedError extends Error {
  constructor() {
    super('Offer já está encerrada, esgotada ou expirada')
    this.name = 'OfferAlreadyClosedError'
  }
}
