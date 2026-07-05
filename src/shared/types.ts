/** Resposta de erro genérica devolvida ao cliente — nunca expõe detalhe interno */
export interface IGenericErrorResponse {
  statusCode: number
  message: string
}

/** Token de injeção DI para a instância singleton do Pino (ver shared/logger/pino-instance.ts) */
export const PINO_LOGGER = Symbol('PINO_LOGGER')

/** Shape mínimo de um erro de chave duplicada do driver do Mongo (code 11000) */
export interface IMongoDuplicateKeyError {
  code: number
  keyPattern?: Record<string, unknown>
}
