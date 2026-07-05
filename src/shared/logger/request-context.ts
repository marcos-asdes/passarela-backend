import { AsyncLocalStorage } from 'node:async_hooks'

interface IRequestContext {
  requestId: string
}

/** Propaga o requestId da requisição atual por toda a cadeia de chamadas assíncronas, sem passar parâmetro explícito */
export const requestContext = new AsyncLocalStorage<IRequestContext>()

/** Retorna o requestId da requisição em andamento, ou undefined fora de uma requisição (ex.: log de bootstrap) */
export function getRequestId(): string | undefined {
  return requestContext.getStore()?.requestId
}
