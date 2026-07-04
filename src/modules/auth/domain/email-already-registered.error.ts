/** Lançado quando já existe uma conta cadastrada com o e-mail informado */
export class EmailAlreadyRegisteredError extends Error {
  constructor() {
    super('E-mail já cadastrado')
    this.name = 'EmailAlreadyRegisteredError'
  }
}
