import { Controller, Get } from '@nestjs/common'
import { IApiInfoResponse } from '@app/types'

/** Rota raiz — confirma que a API está no ar */
@Controller()
export class AppController {
  @Get()
  getInfo(): IApiInfoResponse {
    return {
      message: 'Servidor Passarela em execução',
      service: 'passarela-backend',
      timestamp: new Date().toISOString()
    }
  }
}
