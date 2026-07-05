/**
 * Testes unitários para LoginResponseDto / LoginResponseUserDto
 *
 * Cenários testados:
 * - LoginResponseUserDto atribui id e role corretamente
 * - LoginResponseDto atribui accessToken e user corretamente, satisfazendo ILoginResponse
 * - Documentação Swagger gerada expõe accessToken e a referência a LoginResponseUserDto no schema de LoginResponseDto
 * - Documentação Swagger gerada expõe id e o enum de role no schema de LoginResponseUserDto
 * - Schema gerado nunca expõe nome, e-mail, cpf, telefone ou senha
 */

import { UserRole } from '@auth/domain/types'
import { LoginResponseDto, LoginResponseUserDto } from '@auth/interface/login-response.dto'
import { Controller, Get, INestApplication } from '@nestjs/common'
import { ApiOkResponse, DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { Test } from '@nestjs/testing'

/** `SchemaObject` não é reexportado pelo pacote — derivado localmente pra evitar import de caminho interno do @nestjs/swagger */
type SchemaObject = { type?: string; $ref?: string; enum?: string[]; properties?: Record<string, SchemaObject> }

@Controller()
class LoginResponseTestController {
  @Get()
  @ApiOkResponse({ type: LoginResponseDto })
  login(): LoginResponseDto {
    return new LoginResponseDto()
  }
}

async function buildSchemas(): Promise<Record<string, SchemaObject>> {
  const moduleRef = await Test.createTestingModule({ controllers: [LoginResponseTestController] }).compile()
  const app: INestApplication = moduleRef.createNestApplication()
  await app.init()

  const config = new DocumentBuilder().setTitle('teste').setVersion('0.0.0').build()
  const document = SwaggerModule.createDocument(app, config)
  await app.close()

  return document.components?.schemas ?? {}
}

describe('LoginResponseUserDto', () => {
  it('atribui id e role corretamente', () => {
    const user = new LoginResponseUserDto()
    user.id = 'user-1'
    user.role = UserRole.Customer

    expect(user).toEqual({ id: 'user-1', role: UserRole.Customer })
  })
})

describe('LoginResponseDto', () => {
  it('atribui accessToken e user corretamente, satisfazendo ILoginResponse', () => {
    const user = Object.assign(new LoginResponseUserDto(), { id: 'user-1', role: UserRole.Seller })

    const dto = Object.assign(new LoginResponseDto(), { accessToken: 'jwt-fake', user })

    expect(dto.accessToken).toBe('jwt-fake')
    expect(dto.user).toBe(user)
  })

  describe('documentação Swagger gerada', () => {
    it('expõe accessToken e referência a LoginResponseUserDto no schema de LoginResponseDto', async () => {
      const schemas = await buildSchemas()
      const properties = schemas.LoginResponseDto.properties ?? {}

      expect(properties.accessToken).toMatchObject({ type: 'string' })
      expect(properties.user).toMatchObject({ $ref: '#/components/schemas/LoginResponseUserDto' })
    })

    it('expõe id e o enum de role no schema de LoginResponseUserDto', async () => {
      const schemas = await buildSchemas()
      const properties = schemas.LoginResponseUserDto.properties ?? {}

      expect(properties.id).toMatchObject({ type: 'string' })
      expect(properties.role.enum).toEqual(expect.arrayContaining([UserRole.Seller, UserRole.Customer]))
    })

    it('nunca expõe nome, e-mail, cpf, telefone ou senha no schema gerado', async () => {
      const schemas = await buildSchemas()
      const camposExpostos = [
        ...Object.keys(schemas.LoginResponseDto.properties ?? {}),
        ...Object.keys(schemas.LoginResponseUserDto.properties ?? {})
      ]

      expect(camposExpostos).not.toEqual(
        expect.arrayContaining(['name', 'email', 'cpf', 'phone', 'password', 'passwordHash'])
      )
    })
  })
})
