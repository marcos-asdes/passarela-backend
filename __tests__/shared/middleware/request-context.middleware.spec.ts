/**
 * Testes unitários para RequestContextMiddleware
 *
 * Cenários testados:
 * - Gera um requestId quando o header x-request-id não vem na requisição
 * - Reaproveita o x-request-id recebido na requisição
 * - Seta o header X-Request-Id na resposta
 * - O requestId fica acessível via getRequestId() dentro do next()
 * - Chama next()
 */

import { getRequestId } from '@shared/logger/request-context'
import { RequestContextMiddleware } from '@shared/middleware/request-context.middleware'

describe('RequestContextMiddleware', () => {
  let middleware: RequestContextMiddleware
  let req: { header: jest.Mock }
  let res: { setHeader: jest.Mock }
  let next: jest.Mock

  beforeEach(() => {
    middleware = new RequestContextMiddleware()
    req = { header: jest.fn().mockReturnValue(undefined) }
    res = { setHeader: jest.fn() }
    next = jest.fn()
  })

  it('gera um requestId quando o header x-request-id não vem na requisição', () => {
    middleware.use(req as never, res as never, next)

    expect(res.setHeader).toHaveBeenCalledWith('X-Request-Id', expect.any(String))
  })

  it('reaproveita o x-request-id recebido na requisição', () => {
    req.header.mockReturnValue('id-recebido')

    middleware.use(req as never, res as never, next)

    expect(res.setHeader).toHaveBeenCalledWith('X-Request-Id', 'id-recebido')
  })

  it('o requestId fica acessível via getRequestId() dentro do next()', () => {
    req.header.mockReturnValue('id-recebido')
    let requestIdInsideNext: string | undefined

    next.mockImplementation(() => {
      requestIdInsideNext = getRequestId()
    })

    middleware.use(req as never, res as never, next)

    expect(requestIdInsideNext).toBe('id-recebido')
  })

  it('chama next()', () => {
    middleware.use(req as never, res as never, next)

    expect(next).toHaveBeenCalledTimes(1)
  })
})
