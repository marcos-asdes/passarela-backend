import 'reflect-metadata'
import { NestFactory } from '@nestjs/core'
import { AppModule } from '@app/app.module'

/** Bootstrap mínimo — segurança, config e versionamento entram junto com os módulos que precisarem deles */
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule)
  await app.listen(process.env.PORT ?? 3000)
}

void bootstrap()
