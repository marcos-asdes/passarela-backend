/** Lançado quando já existe uma conta cadastrada com o CPF informado */
export class CpfAlreadyRegisteredError extends Error {
  constructor() {
    super('CPF já cadastrado')
    this.name = 'CpfAlreadyRegisteredError'
  }
}
