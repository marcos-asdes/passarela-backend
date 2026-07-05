import { Inject, Injectable, LoggerService } from '@nestjs/common'
import type { Level, Logger as PinoLogger } from 'pino'
import { getRequestId } from '@shared/logger/request-context'
import { PINO_LOGGER } from '@shared/types'

/**
 * Logger da aplicação — implementa o LoggerService do Nest (permite `app.useLogger()`, substituindo
 * também os logs internos do framework) e estrutura toda linha com requestId (via AsyncLocalStorage,
 * ver request-context.ts) e context, backed por uma instância singleton do Pino injetada via DI.
 */
@Injectable()
export class AppLoggerService implements LoggerService {
  constructor(@Inject(PINO_LOGGER) private readonly pino: PinoLogger) {}

  log(message: unknown, ...optionalParams: unknown[]): void {
    this.write('info', message, this.extractContext(optionalParams))
  }

  warn(message: unknown, ...optionalParams: unknown[]): void {
    this.write('warn', message, this.extractContext(optionalParams))
  }

  debug(message: unknown, ...optionalParams: unknown[]): void {
    this.write('debug', message, this.extractContext(optionalParams))
  }

  verbose(message: unknown, ...optionalParams: unknown[]): void {
    this.write('trace', message, this.extractContext(optionalParams))
  }

  /** Nest chama como error(message), error(message, context) ou error(message, trace, context) */
  error(message: unknown, ...optionalParams: unknown[]): void {
    const [trace, context] = optionalParams.length >= 2 ? optionalParams : [undefined, optionalParams[0]]
    const err = this.buildErrorBinding(message, trace)

    this.write('error', message, typeof context === 'string' ? context : undefined, err ? { err } : undefined)
  }

  /**
   * Loga um evento estruturado (nível pino + mensagem + dados arbitrários) — fora do contrato
   * LoggerService do Nest, usado por logging de requisição/resposta HTTP (ver RequestLoggingInterceptor)
   */
  event(level: Level, message: string, context: string, data: Record<string, unknown>): void {
    this.write(level, message, context, data)
  }

  private extractContext(optionalParams: unknown[]): string | undefined {
    const last = optionalParams.at(-1)
    return typeof last === 'string' ? last : undefined
  }

  /**
   * pino-pretty só formata o stack em múltiplas linhas quando o binding é reconhecido como
   * error-like (chave `err`, ver errorLikeObjectKeys) — string solta sob outra chave vira JSON
   * de uma linha só, com \n escapado. `trace` aqui normalmente é a string `error.stack`.
   */
  private buildErrorBinding(message: unknown, trace: unknown): { message: string; stack: string } | undefined {
    if (typeof trace !== 'string') return undefined
    return { message: String(message), stack: trace }
  }

  private write(level: Level, message: unknown, context?: string, extra?: Record<string, unknown>): void {
    const requestId = getRequestId()
    const bindings: Record<string, unknown> = { ...extra }
    if (context) bindings.context = context
    if (requestId) bindings.requestId = requestId

    this.pino[level](bindings, String(message))
  }
}
