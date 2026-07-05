import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { AppLoggerService } from '@shared/logger/app-logger.service'
import { pickRequestHeaders, pickResponseHeaders, sanitizeBody } from '@shared/logger/sanitize-http'
import { Request, Response } from 'express'
import { Observable } from 'rxjs'

const SLOW_REQUEST_THRESHOLD_MS = 1000
const INTERCEPTOR_CONTEXT = 'RequestLoggingInterceptor'

/**
 * Loga entrada (método, rota, query, headers, body sanitizado, ip) e saída (status, headers de
 * resposta, duração) de toda requisição HTTP — saída lida no evento `finish` da resposta, não no
 * retorno do handler (status/headers só existem de fato depois do `finish`).
 */
@Injectable()
export class RequestLoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: AppLoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>()
    const response = context.switchToHttp().getResponse<Response>()
    const startedAt = Date.now()

    this.logRequestReceived(request)
    response.once('finish', () => this.logResponseSent(request, response, startedAt))

    return next.handle()
  }

  /** Monta o log da requisição recebida */
  private logRequestReceived(request: Request): void {
    const hasBody = isNonEmptyObject(request.body)
    const hasQuery = isNonEmptyObject(request.query)

    this.logger.event('trace', 'Requisição HTTP recebida', INTERCEPTOR_CONTEXT, {
      method: request.method,
      url: request.originalUrl,
      path: request.path,
      query: hasQuery ? request.query : undefined,
      headers: pickRequestHeaders(request.headers),
      body: hasBody ? sanitizeBody(request.body) : undefined,
      ip: request.ip
    })
  }

  /** Monta o log da resposta enviada */
  private logResponseSent(request: Request, response: Response, startedAt: number): void {
    const durationMs = Date.now() - startedAt
    const statusCode = response.statusCode

    this.logger.event(
      'trace',
      `Resposta HTTP enviada: ${request.method} ${request.originalUrl} ${statusCode} ${durationMs}ms`,
      INTERCEPTOR_CONTEXT,
      {
        method: request.method,
        url: request.originalUrl,
        statusCode,
        statusMessage: response.statusMessage,
        isError: statusCode >= 400,
        responseHeaders: pickResponseHeaders((name) => response.getHeader(name)),
        durationMs
      }
    )

    if (durationMs > SLOW_REQUEST_THRESHOLD_MS) {
      this.logger.event('warn', 'Requisição HTTP excedeu o threshold de performance', INTERCEPTOR_CONTEXT, {
        method: request.method,
        url: request.originalUrl,
        statusCode,
        durationMs,
        thresholdMs: SLOW_REQUEST_THRESHOLD_MS,
        exceededByMs: durationMs - SLOW_REQUEST_THRESHOLD_MS
      })
    }
  }
}

function isNonEmptyObject(value: unknown): boolean {
  return typeof value === 'object' && value !== null && Object.keys(value).length > 0
}
