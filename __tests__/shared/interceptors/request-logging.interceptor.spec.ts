/**
 * Testes unitários para RequestLoggingInterceptor
 *
 * Cenários testados:
 * - Loga a requisição recebida (trace) com método, rota, headers permitidos e ip
 * - Loga o body sanitizado na requisição recebida quando o body não é vazio
 * - Não loga campo body na requisição recebida quando o body é vazio
 * - Loga a resposta enviada (trace) no evento `finish` da resposta, com status/headers/duração —
 *   não no retorno do handler (status/headers só existem de fato depois do `finish`)
 * - Não escreve a resposta antes do `finish` disparar
 * - Loga um warn extra quando a duração excede o threshold de performance (1000ms)
 * - Não loga o warn de performance quando a duração está dentro do threshold
 * - Retorna o observable do próximo handler sem alterá-lo (nunca engole o valor/erro)
 */

import { CallHandler, ExecutionContext } from '@nestjs/common'
import { of } from 'rxjs'
import { RequestLoggingInterceptor } from '@shared/interceptors/request-logging.interceptor'
import { AppLoggerService } from '@shared/logger/app-logger.service'

function buildResponse(overrides: Record<string, unknown> = {}) {
  const headers: Record<string, unknown> = { 'content-type': 'application/json', ...overrides }
  const listeners: Record<string, () => void> = {}

  return {
    statusCode: 200,
    statusMessage: 'OK',
    getHeader: (name: string) => headers[name],
    once: (event: string, cb: () => void) => {
      listeners[event] = cb
    },
    emitFinish: () => listeners.finish?.()
  }
}

function buildLoginRequest() {
  return { method: 'GET', originalUrl: '/auth/login', path: '/auth/login', query: {}, headers: {} }
}

function buildContext(request: object, response: ReturnType<typeof buildResponse>): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => request,
      getResponse: () => response
    })
  } as unknown as ExecutionContext
}

describe('RequestLoggingInterceptor', () => {
  let logger: jest.Mocked<AppLoggerService>
  let interceptor: RequestLoggingInterceptor

  beforeEach(() => {
    logger = { event: jest.fn() } as unknown as jest.Mocked<AppLoggerService>
    interceptor = new RequestLoggingInterceptor(logger)
  })

  describe('requisição recebida', () => {
    it('loga método, rota, headers permitidos e ip', () => {
      const request = {
        method: 'GET',
        originalUrl: '/auth/login',
        path: '/auth/login',
        query: {},
        headers: { 'content-type': 'application/json', 'x-internal': 'nunca-aparece' },
        body: {},
        ip: '127.0.0.1'
      }
      const context = buildContext(request, buildResponse())
      const next: CallHandler = { handle: () => of({ ok: true }) }

      interceptor.intercept(context, next).subscribe()

      expect(logger.event).toHaveBeenCalledWith(
        'trace',
        'Requisição HTTP recebida',
        'RequestLoggingInterceptor',
        expect.objectContaining({
          method: 'GET',
          url: '/auth/login',
          path: '/auth/login',
          headers: { 'content-type': 'application/json' },
          ip: '127.0.0.1',
          body: undefined,
          query: undefined
        })
      )
    })

    it('loga o body sanitizado quando o body não é vazio', () => {
      const request = {
        method: 'POST',
        originalUrl: '/auth/login',
        path: '/auth/login',
        query: {},
        headers: {},
        body: { email: 'fulano@example.com', password: 'segredo' },
        ip: '127.0.0.1'
      }
      const context = buildContext(request, buildResponse())
      const next: CallHandler = { handle: () => of({ ok: true }) }

      interceptor.intercept(context, next).subscribe()

      const [, , , data] = logger.event.mock.calls[0]
      expect(data.body).toEqual({ email: 'fulano@example.com', password: '[REDACTED]' })
    })
  })

  describe('resposta enviada', () => {
    it('não loga a resposta antes do finish disparar', () => {
      const response = buildResponse()
      const context = buildContext(buildLoginRequest(), response)
      const next: CallHandler = { handle: () => of({ ok: true }) }

      interceptor.intercept(context, next).subscribe()

      expect(logger.event).not.toHaveBeenCalledWith(
        'trace',
        expect.stringContaining('200'),
        expect.anything(),
        expect.anything()
      )
    })

    it('loga status, headers de resposta e duração no finish', () => {
      const response = buildResponse()
      const context = buildContext(buildLoginRequest(), response)
      const next: CallHandler = { handle: () => of({ ok: true }) }

      interceptor.intercept(context, next).subscribe()
      response.emitFinish()

      expect(logger.event).toHaveBeenCalledWith(
        'trace',
        expect.stringMatching(/^Resposta HTTP enviada: GET \/auth\/login 200 \d+ms$/),
        'RequestLoggingInterceptor',
        expect.objectContaining({
          statusCode: 200,
          statusMessage: 'OK',
          isError: false,
          responseHeaders: { 'content-type': 'application/json' }
        })
      )
    })

    it('loga status 4xx/5xx com isError true, lido do statusCode final da resposta', () => {
      const response = buildResponse()
      response.statusCode = 409
      const context = buildContext(buildLoginRequest(), response)
      const next: CallHandler = { handle: () => of({ ok: true }) }

      interceptor.intercept(context, next).subscribe()
      response.emitFinish()

      expect(logger.event).toHaveBeenCalledWith(
        'trace',
        expect.stringMatching(/409/),
        'RequestLoggingInterceptor',
        expect.objectContaining({ statusCode: 409, isError: true })
      )
    })

    it('retorna o observable do próximo handler sem alterá-lo', () => {
      const response = buildResponse()
      const context = buildContext(buildLoginRequest(), response)
      const next: CallHandler = { handle: () => of({ ok: true }) }
      let emitted: unknown

      interceptor.intercept(context, next).subscribe((value) => (emitted = value))

      expect(emitted).toEqual({ ok: true })
    })
  })

  describe('threshold de performance', () => {
    it('loga um warn extra quando a duração excede 1000ms', () => {
      const response = buildResponse()
      const context = buildContext(buildLoginRequest(), response)
      const next: CallHandler = { handle: () => of({ ok: true }) }

      const nowSpy = jest.spyOn(Date, 'now').mockReturnValueOnce(0).mockReturnValueOnce(1500)

      interceptor.intercept(context, next).subscribe()
      response.emitFinish()
      nowSpy.mockRestore()

      expect(logger.event).toHaveBeenCalledWith(
        'warn',
        'Requisição HTTP excedeu o threshold de performance',
        'RequestLoggingInterceptor',
        expect.objectContaining({ durationMs: 1500, thresholdMs: 1000, exceededByMs: 500 })
      )
    })

    it('não loga o warn de performance quando a duração está dentro do threshold', () => {
      const response = buildResponse()
      const context = buildContext(buildLoginRequest(), response)
      const next: CallHandler = { handle: () => of({ ok: true }) }

      interceptor.intercept(context, next).subscribe()
      response.emitFinish()

      expect(logger.event).not.toHaveBeenCalledWith(
        'warn',
        'Requisição HTTP excedeu o threshold de performance',
        expect.anything(),
        expect.anything()
      )
    })
  })
})
