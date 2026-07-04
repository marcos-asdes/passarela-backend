import { AppModule } from '@app/app.module'
import { IEnvironmentVariables } from '@config/types'
import { ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { setupSwagger } from '@shared/swagger/swagger.setup'
import helmet from 'helmet'
import 'reflect-metadata'

/**
 * Bootstrap: segurança (helmet/CORS), validação global de DTOs, documentação Swagger em /docs —
 * prefixo/versionamento entram junto com o próximo bounded context que precisar
 */
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule)
  const configService = app.get(ConfigService<IEnvironmentVariables, true>)

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          ...helmet.contentSecurityPolicy.getDefaultDirectives(),
          'script-src': ["'self'", "'unsafe-inline'"],
          'style-src': ["'self'", "'unsafe-inline'"]
        }
      }
    })
  )
  app.enableCors({ origin: configService.get('CORS_ORIGIN', { infer: true }) })
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
  setupSwagger(app)

  const port = configService.get('PORT', { infer: true })
  await app.listen(port)
}

void bootstrap()
