import 'reflect-metadata'
import { NestFactory } from '@nestjs/core'
import { ConfigService } from '@nestjs/config'
import helmet from 'helmet'
import { AppModule } from '@app/app.module'
import { IEnvironmentVariables } from '@config/types'

/** Bootstrap: segurança (helmet/CORS) — prefixo/versionamento/Swagger entram junto com o primeiro bounded context */
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule)
  const configService = app.get(ConfigService<IEnvironmentVariables, true>)

  app.use(helmet())
  app.enableCors({ origin: configService.get('CORS_ORIGIN', { infer: true }) })

  const port = configService.get('PORT', { infer: true })
  await app.listen(port)
}

void bootstrap()
