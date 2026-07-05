import { Injectable, NestMiddleware } from '@nestjs/common'
import { NextFunction, Request, Response } from 'express'
import { randomUUID } from 'node:crypto'
import { requestContext } from '@shared/logger/request-context'

const REQUEST_ID_HEADER = 'x-request-id'
const RESPONSE_REQUEST_ID_HEADER = 'X-Request-Id'

/** Gera (ou reaproveita) um requestId por requisição e o propaga via AsyncLocalStorage — correlaciona todas as linhas de log da mesma requisição */
@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const requestId = req.header(REQUEST_ID_HEADER) ?? randomUUID()
    res.setHeader(RESPONSE_REQUEST_ID_HEADER, requestId)

    requestContext.run({ requestId }, next)
  }
}
