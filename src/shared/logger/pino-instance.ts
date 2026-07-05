import Pino, { Logger as PinoLogger, stdSerializers } from 'pino'
import pinoPretty from 'pino-pretty'
import { Environment } from '@config/types'

/**
 * Cria a instância do Pino usada por AppLoggerService — pretty print colorido/multi-line em
 * development (DX local), single-line em production (mais compacto pra qualquer coletor de log),
 * silenciado em test (mantém a saída do Jest limpa). Nível trace/silent controla volume, não formato:
 * o pino-pretty roda em todos os ambientes não-test.
 */
export function createPinoInstance(environment: Environment): PinoLogger {
  const isLocal = environment === Environment.Development

  const prettyStream = pinoPretty({
    colorize: isLocal,
    translateTime: 'SYS:standard',
    ignore: 'pid,hostname',
    singleLine: !isLocal,
    hideObject: false,
    messageFormat: '{msg}',
    destination: process.stdout,
    sync: true
  })

  return Pino(
    {
      level: environment === Environment.Test ? 'silent' : 'trace',
      formatters: { level: (label: string) => ({ level: label }) },
      // Serializer padrão do pino pro binding `err` — dá ao pino-pretty o formato que ele reconhece
      // como error-like (mensagem + stack), permitindo a formatação multi-line do stack trace
      serializers: { err: stdSerializers.err }
    },
    prettyStream
  )
}
