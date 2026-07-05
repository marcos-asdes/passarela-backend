/**
 * Testes unitários para AppLoggerService
 *
 * Cenários testados:
 * - log() escreve no nível info do pino, sem context quando não informado
 * - log() inclui context quando o último argumento é uma string
 * - warn()/debug()/verbose() escrevem nos níveis warn/debug/trace do pino
 * - error() sem argumentos extras não inclui err nem context
 * - error(message, context) trata o único argumento extra como context
 * - error(message, trace, context) inclui err ({ message, stack }) e context — chave `err` é a
 *   reconhecida pelo pino-pretty como error-like (formata o stack em múltiplas linhas)
 * - event() escreve no nível pino informado, com context e dados estruturados
 * - mensagem não-string é convertida para string antes de logar
 * - inclui requestId no log quando chamado dentro de um contexto de requisição (AsyncLocalStorage)
 * - não inclui requestId quando chamado fora de um contexto de requisição
 */

import { AppLoggerService } from '@shared/logger/app-logger.service'
import { requestContext } from '@shared/logger/request-context'

describe('AppLoggerService', () => {
  let pino: { info: jest.Mock; error: jest.Mock; warn: jest.Mock; debug: jest.Mock; trace: jest.Mock }
  let service: AppLoggerService

  beforeEach(() => {
    pino = { info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn(), trace: jest.fn() }
    service = new AppLoggerService(pino as never)
  })

  describe('log', () => {
    it('escreve no nível info sem context quando não informado', () => {
      service.log('mensagem')

      expect(pino.info).toHaveBeenCalledWith({}, 'mensagem')
    })

    it('inclui context quando o último argumento é uma string', () => {
      service.log('mensagem', 'MeuContexto')

      expect(pino.info).toHaveBeenCalledWith({ context: 'MeuContexto' }, 'mensagem')
    })
  })

  describe('warn/debug/verbose', () => {
    it('warn() escreve no nível warn', () => {
      service.warn('aviso', 'Contexto')

      expect(pino.warn).toHaveBeenCalledWith({ context: 'Contexto' }, 'aviso')
    })

    it('debug() escreve no nível debug', () => {
      service.debug('detalhe', 'Contexto')

      expect(pino.debug).toHaveBeenCalledWith({ context: 'Contexto' }, 'detalhe')
    })

    it('verbose() escreve no nível trace', () => {
      service.verbose('detalhe fino', 'Contexto')

      expect(pino.trace).toHaveBeenCalledWith({ context: 'Contexto' }, 'detalhe fino')
    })
  })

  describe('error', () => {
    it('sem argumentos extras não inclui err nem context', () => {
      service.error('falhou')

      expect(pino.error).toHaveBeenCalledWith({}, 'falhou')
    })

    it('trata o único argumento extra como context', () => {
      service.error('falhou', 'MeuContexto')

      expect(pino.error).toHaveBeenCalledWith({ context: 'MeuContexto' }, 'falhou')
    })

    it('inclui err ({ message, stack }) e context quando os dois são informados', () => {
      service.error('falhou', 'stack-trace-aqui', 'MeuContexto')

      expect(pino.error).toHaveBeenCalledWith(
        { err: { message: 'falhou', stack: 'stack-trace-aqui' }, context: 'MeuContexto' },
        'falhou'
      )
    })
  })

  describe('event', () => {
    it('escreve no nível pino informado, com context e dados estruturados', () => {
      service.event('trace', 'evento estruturado', 'MeuContexto', { method: 'GET', statusCode: 200 })

      expect(pino.trace).toHaveBeenCalledWith(
        { method: 'GET', statusCode: 200, context: 'MeuContexto' },
        'evento estruturado'
      )
    })
  })

  it('converte mensagem não-string para string antes de logar', () => {
    service.log(42)

    expect(pino.info).toHaveBeenCalledWith({}, '42')
  })

  describe('correlação por requestId', () => {
    it('inclui requestId quando chamado dentro de um contexto de requisição', () => {
      requestContext.run({ requestId: 'req-1' }, () => {
        service.log('mensagem')
      })

      expect(pino.info).toHaveBeenCalledWith({ requestId: 'req-1' }, 'mensagem')
    })

    it('não inclui requestId quando chamado fora de um contexto de requisição', () => {
      service.log('mensagem')

      expect(pino.info).toHaveBeenCalledWith({}, 'mensagem')
    })
  })
})
