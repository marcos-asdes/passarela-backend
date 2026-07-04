import { INestApplication } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

/** Configura e expõe a documentação Swagger/OpenAPI, gerada automaticamente a partir dos tipos, em /docs */
export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('Passarela API')
    .setDescription('Documentação da API do Passarela — plataforma de ofertas relâmpago de shopping')
    .setVersion('0.1.0')
    .addBearerAuth()
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('docs', app, document)
}
