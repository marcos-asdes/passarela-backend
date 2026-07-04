import { Global, Module } from '@nestjs/common'
import { ConfigModule as NestConfigModule } from '@nestjs/config'
import { validateEnv } from '@config/env.validation'

/** Módulo global de configuração: carrega e valida as variáveis de ambiente uma única vez */
@Global()
@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv
    })
  ]
})
export class ConfigModule {}
