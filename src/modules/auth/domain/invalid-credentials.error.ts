/**
 * Lançado quando e-mail e senha não correspondem a uma conta válida — mesma mensagem pros dois motivos
 * possíveis (e-mail inexistente ou senha errada), pra não vazar se uma conta existe (anti-enumeração)
 */
export class InvalidCredentialsError extends Error {
  constructor() {
    super('Credenciais inválidas')
    this.name = 'InvalidCredentialsError'
  }
}
