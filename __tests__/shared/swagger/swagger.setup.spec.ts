/**
 * Testes unitários para setupSwagger
 *
 * Cenários testados:
 * - Configura o documento com título, descrição, versão 0.1.0 e Bearer auth
 * - Gera o documento via SwaggerModule.createDocument passando a app recebida
 * - Expõe a documentação em /docs via SwaggerModule.setup, com o documento gerado
 */

import { INestApplication } from '@nestjs/common'
import { OpenAPIObject, SwaggerModule } from '@nestjs/swagger'
import { setupSwagger } from '@shared/swagger/swagger.setup'

jest.mock('@nestjs/swagger', () => {
  const actual = jest.requireActual('@nestjs/swagger')
  return {
    ...actual,
    SwaggerModule: { createDocument: jest.fn(), setup: jest.fn() }
  }
})

describe('setupSwagger', () => {
  const app = {} as INestApplication
  const fakeDocument = { openapi: '3.0.0' } as OpenAPIObject

  beforeEach(() => {
    jest.clearAllMocks()
    ;(SwaggerModule.createDocument as jest.Mock).mockReturnValue(fakeDocument)
  })

  it('configura título, descrição, versão e Bearer auth no documento gerado', () => {
    setupSwagger(app)

    const config = (SwaggerModule.createDocument as jest.Mock).mock.calls[0][1]
    expect(config.info).toMatchObject({ title: 'Passarela API', version: '0.1.0' })
    expect(config.info.description).toContain('Passarela')
    expect(config.components.securitySchemes.bearer).toMatchObject({ type: 'http', scheme: 'bearer' })
  })

  it('gera o documento via SwaggerModule.createDocument passando a app recebida', () => {
    setupSwagger(app)

    expect(SwaggerModule.createDocument).toHaveBeenCalledWith(app, expect.anything())
  })

  it('expõe a documentação em /docs com o documento gerado', () => {
    setupSwagger(app)

    expect(SwaggerModule.setup).toHaveBeenCalledWith('docs', app, fakeDocument)
  })
})
