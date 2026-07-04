import { Body, ConflictException, Controller, HttpCode, HttpStatus, Post, UnauthorizedException } from '@nestjs/common'
import { Throttle } from '@nestjs/throttler'
import { CpfAlreadyRegisteredError } from '@auth/domain/cpf-already-registered.error'
import { EmailAlreadyRegisteredError } from '@auth/domain/email-already-registered.error'
import { InvalidCredentialsError } from '@auth/domain/invalid-credentials.error'
import { LoginUseCase } from '@auth/application/login.use-case'
import { RegisterUseCase } from '@auth/application/register.use-case'
import { ILoginResult, IRegisterResult } from '@auth/application/types'
import { LoginDto } from '@auth/interface/login.dto'
import { LoginResponseDto } from '@auth/interface/login-response.dto'
import { RegisterDto } from '@auth/interface/register.dto'
import { RegisterResponseDto } from '@auth/interface/register-response.dto'

/** Rate limit mais restritivo que o default global do kernel — mitiga brute-force/credential stuffing */
const AUTH_THROTTLE = { default: { limit: 5, ttl: 60_000 } }

/** Endpoints de registro e login — fluxos separados, registro não emite token */
@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase
  ) {}

  @Throttle(AUTH_THROTTLE)
  @Post('register')
  async register(@Body() dto: RegisterDto): Promise<RegisterResponseDto> {
    try {
      const result = await this.registerUseCase.execute({
        name: dto.name,
        email: dto.email,
        password: dto.password,
        cpf: dto.cpf,
        phone: dto.phone,
        birthDate: dto.birthDate,
        role: dto.role
      })
      return this.toRegisterResponseDto(result)
    } catch (error) {
      if (error instanceof EmailAlreadyRegisteredError || error instanceof CpfAlreadyRegisteredError) {
        throw new ConflictException()
      }
      throw error
    }
  }

  @Throttle(AUTH_THROTTLE)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto): Promise<LoginResponseDto> {
    try {
      const result = await this.loginUseCase.execute({ email: dto.email, password: dto.password })
      return this.toLoginResponseDto(result)
    } catch (error) {
      if (error instanceof InvalidCredentialsError) {
        throw new UnauthorizedException()
      }
      throw error
    }
  }

  private toRegisterResponseDto(result: IRegisterResult): RegisterResponseDto {
    const dto = new RegisterResponseDto()
    dto.id = result.id
    dto.name = result.name
    dto.email = result.email
    dto.role = result.role
    dto.createdAt = result.createdAt.toISOString()
    return dto
  }

  private toLoginResponseDto(result: ILoginResult): LoginResponseDto {
    const dto = new LoginResponseDto()
    dto.accessToken = result.accessToken
    dto.user = result.user
    return dto
  }
}
