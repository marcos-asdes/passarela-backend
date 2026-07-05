/**
 * Testes unitários para requestContext / getRequestId
 *
 * Cenários testados:
 * - Propaga requestId através de chamadas assíncronas dentro de run()
 * - Retorna undefined fora de um contexto de requisição
 * - Isola contextos concorrentes (aninhados)
 */

import { getRequestId, requestContext } from '@shared/logger/request-context'

describe('requestContext / getRequestId', () => {
  it('propaga requestId através de chamadas assíncronas dentro de run()', async () => {
    await requestContext.run({ requestId: 'req-1' }, async () => {
      await Promise.resolve()
      expect(getRequestId()).toBe('req-1')
    })
  })

  it('retorna undefined fora de um contexto de requisição', () => {
    expect(getRequestId()).toBeUndefined()
  })

  it('isola contextos concorrentes (aninhados)', () => {
    requestContext.run({ requestId: 'a' }, () => {
      requestContext.run({ requestId: 'b' }, () => {
        expect(getRequestId()).toBe('b')
      })
      expect(getRequestId()).toBe('a')
    })
  })
})
