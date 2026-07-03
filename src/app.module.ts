import { Module } from '@nestjs/common'
import { AppController } from '@app/app.controller'

/** Módulo raiz — só o hello world por enquanto; config/banco/segurança entram nos próximos commits */
@Module({
  controllers: [AppController]
})
export class AppModule {}
