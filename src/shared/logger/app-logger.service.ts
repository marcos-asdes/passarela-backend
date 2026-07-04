import { Injectable, Logger } from '@nestjs/common'
import { IErrorLogPayload } from '@shared/types'

/** Logger fino da aplicação — centraliza o formato de log detalhado usado pelo filtro de exceções global */
@Injectable()
export class AppLoggerService {
  private readonly logger = new Logger(AppLoggerService.name)

  /** Loga um erro capturado com mensagem curta e o objeto de erro original completo */
  logError(payload: IErrorLogPayload): void {
    this.logger.error(payload.message, payload.error instanceof Error ? payload.error.stack : payload.error)
  }
}
