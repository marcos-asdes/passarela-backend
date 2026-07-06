/** Lançado quando o shopper já registrou interest nessa offer antes — regra é 1 por shopper/offer */
export class AlreadyInterestedError extends Error {
  constructor() {
    super('Você já demonstrou interesse nessa offer')
    this.name = 'AlreadyInterestedError'
  }
}
