import { Module } from '@nestjs/common'
import { ConfigModule } from '@config'
import { DatabaseModule } from '@database'
import { SharedModule } from '@shared'
import { AuthModule } from '@auth/auth.module'
import { AppController } from '@app/app.controller'

/** Módulo raiz: composição de configuração, banco, kernel compartilhado e bounded contexts */
@Module({
  imports: [ConfigModule, DatabaseModule, SharedModule, AuthModule],
  controllers: [AppController]
})
export class AppModule {}
