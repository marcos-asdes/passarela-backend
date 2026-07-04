/** Resposta de erro genérica devolvida ao cliente — nunca expõe detalhe interno */
export interface IGenericErrorResponse {
  statusCode: number
  message: string
}

/** Payload de log detalhado, usado apenas no lado do servidor */
export interface IErrorLogPayload {
  message: string
  error: unknown
}
