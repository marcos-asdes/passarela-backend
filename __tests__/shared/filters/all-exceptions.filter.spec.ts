/**
 * Testes unitários para AllExceptionsFilter
 *
 * Cenários testados:
 * - Retorna { statusCode, message } genérico ao cliente para uma HttpException conhecida (ex.: 404)
 * - Retorna { statusCode: 409, message } genérico ao cliente para um conflito (ex.: e-mail/CPF duplicado)
 * - Retorna { statusCode: 500, message } genérico ao cliente para um erro não-HTTP (Error cru)
 * - Nunca inclui a mensagem interna do erro na resposta ao cliente
 * - Loga mensagem e stack via AppLoggerService.error(), com contexto "AllExceptionsFilter", para toda
 *   exceção capturada
 * - Loga mensagem genérica (sem stack) quando a exceção capturada não é uma instância de Error
 */

import { ArgumentsHost, ConflictException, NotFoundException } from '@nestjs/common'
import { AllExceptionsFilter } from '@shared/filters/all-exceptions.filter'
import { AppLoggerService } from '@shared/logger/app-logger.service'

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter
  let logger: jest.Mocked<AppLoggerService>
  let response: { status: jest.Mock; json: jest.Mock }
  let host: ArgumentsHost

  beforeEach(() => {
    logger = { error: jest.fn() } as unknown as jest.Mocked<AppLoggerService>
    filter = new AllExceptionsFilter(logger)

    response = { status: jest.fn().mockReturnThis(), json: jest.fn() }
    host = {
      switchToHttp: () => ({ getResponse: () => response })
    } as unknown as ArgumentsHost
  })

  describe('exceções HTTP conhecidas', () => {
    it('retorna statusCode e mensagem genérica para NotFoundException', () => {
      filter.catch(new NotFoundException(), host)

      expect(response.status).toHaveBeenCalledWith(404)
      expect(response.json).toHaveBeenCalledWith({ statusCode: 404, message: 'Recurso não encontrado' })
    })

    it('retorna statusCode e mensagem genérica para ConflictException', () => {
      filter.catch(new ConflictException(), host)

      expect(response.status).toHaveBeenCalledWith(409)
      expect(response.json).toHaveBeenCalledWith({ statusCode: 409, message: 'Recurso já existe' })
    })
  })

  describe('erros genéricos não-HTTP', () => {
    it('retorna 500 e mensagem genérica para um Error cru', () => {
      filter.catch(new Error('falha interna sensível'), host)

      expect(response.status).toHaveBeenCalledWith(500)
      expect(response.json).toHaveBeenCalledWith({ statusCode: 500, message: 'Erro interno do servidor' })
    })

    it('não vaza a mensagem interna do erro na resposta ao cliente', () => {
      filter.catch(new Error('falha interna sensível'), host)

      const body = response.json.mock.calls[0][0]
      expect(JSON.stringify(body)).not.toContain('falha interna sensível')
    })
  })

  describe('logging do lado do servidor', () => {
    it('loga mensagem e stack via error(), com contexto AllExceptionsFilter', () => {
      const error = new Error('falha interna sensível')

      filter.catch(error, host)

      expect(logger.error).toHaveBeenCalledWith('falha interna sensível', error.stack, 'AllExceptionsFilter')
    })

    it('loga mensagem genérica sem stack quando a exceção não é uma instância de Error', () => {
      filter.catch({ code: 11000 }, host)

      expect(logger.error).toHaveBeenCalledWith(
        'Exceção não tratada capturada pelo filtro global',
        undefined,
        'AllExceptionsFilter'
      )
    })
  })
})
