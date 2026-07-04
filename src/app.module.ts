import { Module } from '@nestjs/common'
import { ConfigModule } from '@config'
import { DatabaseModule } from '@database'
import { SharedModule } from '@shared'
import { AppController } from '@app/app.controller'

/** Módulo raiz: composição de configuração, banco e kernel compartilhado — bounded contexts entram nos próximos commits */
@Module({
  imports: [ConfigModule, DatabaseModule, SharedModule],
  controllers: [AppController]
})
export class AppModule {}
