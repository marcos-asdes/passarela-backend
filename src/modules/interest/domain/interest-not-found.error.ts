/** Lançado quando se tenta remover um interest que não existe para o shopper/offer informados */
export class InterestNotFoundError extends Error {
  constructor() {
    super('Interest não encontrado para este shopper e offer.')
    this.name = 'InterestNotFoundError'
  }
}
