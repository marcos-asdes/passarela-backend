import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common'
import { Response } from 'express'
import { DEFAULT_ERROR_MESSAGE, GENERIC_ERROR_MESSAGES } from '@shared/constants'
import { AppLoggerService } from '@shared/logger/app-logger.service'
import { IGenericErrorResponse } from '@shared/types'

/** Filtro global: responde ao cliente com status/mensagem genéricos e loga o erro original em detalhe */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: AppLoggerService) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>()
    const statusCode = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR
    const message = GENERIC_ERROR_MESSAGES[statusCode] ?? DEFAULT_ERROR_MESSAGE

    const logMessage =
      exception instanceof Error ? exception.message : 'Exceção não tratada capturada pelo filtro global'
    const stack = exception instanceof Error ? exception.stack : undefined
    this.logger.error(logMessage, stack, 'AllExceptionsFilter')

    const body: IGenericErrorResponse = { statusCode, message }
    response.status(statusCode).json(body)
  }
}
