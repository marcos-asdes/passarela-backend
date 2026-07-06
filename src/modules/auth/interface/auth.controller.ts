import { GetProfileUseCase } from '@auth/application/get-profile.use-case'
import { LoginUseCase } from '@auth/application/login.use-case'
import { LogoutUseCase } from '@auth/application/logout.use-case'
import { RegisterUseCase } from '@auth/application/register.use-case'
import { IAuthenticatedUser, ILoginResult } from '@auth/application/types'
import { CpfAlreadyRegisteredError } from '@auth/domain/cpf-already-registered.error'
import { EmailAlreadyRegisteredError } from '@auth/domain/email-already-registered.error'
import { InvalidCredentialsError } from '@auth/domain/invalid-credentials.error'
import { CurrentUser } from '@auth/interface/current-user.decorator'
import { JwtAuthGuard } from '@auth/interface/jwt-auth.guard'
import { LoginResponseDto } from '@auth/interface/login-response.dto'
import { LoginDto } from '@auth/interface/login.dto'
import { ProfileResponseDto } from '@auth/interface/profile-response.dto'
import { RegisterResponseDto } from '@auth/interface/register-response.dto'
import { RegisterDto } from '@auth/interface/register.dto'
import {
  Body,
  ConflictException,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Post,
  UnauthorizedException,
  UseGuards
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse
} from '@nestjs/swagger'
import { Throttle } from '@nestjs/throttler'
import { AppLoggerService } from '@shared/logger/app-logger.service'

/** Rate limit mais restritivo que o default global do kernel — mitiga brute-force/credential stuffing */
const AUTH_THROTTLE = { default: { limit: 5, ttl: 60_000 } }

/** Endpoints de registro, login, perfil e logout — registro não emite token, login é chamada separada */
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly getProfileUseCase: GetProfileUseCase,
    private readonly logoutUseCase: LogoutUseCase,
    private readonly logger: AppLoggerService
  ) {}

  @Throttle(AUTH_THROTTLE)
  @Post('register')
  @ApiOperation({ summary: 'Cria uma conta (merchant ou shopper) — não emite token, faça login em seguida' })
  @ApiCreatedResponse({ type: RegisterResponseDto })
  @ApiConflictResponse({ description: 'E-mail ou CPF já cadastrados' })
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
      this.logger.log(`Usuário registrado (id: ${result.id}, role: ${result.role})`, 'AuthController')
      const responseDto = new RegisterResponseDto()
      responseDto.message = 'Conta criada com sucesso. Faça login para continuar.'
      return responseDto
    } catch (error) {
      if (error instanceof EmailAlreadyRegisteredError) {
        this.logger.warn(`Tentativa de registro com e-mail já cadastrado: ${dto.email}`, 'AuthController')
        throw new ConflictException()
      }
      if (error instanceof CpfAlreadyRegisteredError) {
        this.logger.warn('Tentativa de registro com CPF já cadastrado', 'AuthController')
        throw new ConflictException()
      }
      throw error
    }
  }

  @Throttle(AUTH_THROTTLE)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Autentica com e-mail/senha e retorna o JWT' })
  @ApiOkResponse({ type: LoginResponseDto })
  @ApiUnauthorizedResponse({
    description: 'Credenciais inválidas — mesma resposta pra e-mail inexistente ou senha errada'
  })
  async login(@Body() dto: LoginDto): Promise<LoginResponseDto> {
    try {
      const result = await this.loginUseCase.execute({ email: dto.email, password: dto.password })
      this.logger.log(`Login realizado (id: ${result.user.id}, role: ${result.user.role})`, 'AuthController')
      return this.toLoginResponseDto(result)
    } catch (error) {
      if (error instanceof InvalidCredentialsError) {
        this.logger.warn(`Tentativa de login com credenciais inválidas: ${dto.email}`, 'AuthController')
        throw new UnauthorizedException()
      }
      throw error
    }
  }

  private toLoginResponseDto(result: ILoginResult): LoginResponseDto {
    const dto = new LoginResponseDto()
    dto.accessToken = result.accessToken
    dto.user = result.user
    return dto
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('me')
  @ApiOperation({ summary: 'Perfil do usuário autenticado — nome e e-mail, pro header da UI' })
  @ApiOkResponse({ type: ProfileResponseDto })
  @ApiNotFoundResponse({ description: 'Usuário do token não existe mais' })
  async me(@CurrentUser() user: IAuthenticatedUser): Promise<ProfileResponseDto> {
    const profile = await this.getProfileUseCase.execute(user.id)
    if (!profile) {
      throw new NotFoundException()
    }
    const dto = new ProfileResponseDto()
    dto.name = profile.name
    dto.email = profile.email
    return dto
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Revoga a sessão atual — a próxima request com o mesmo token cai em 401 na hora' })
  @ApiNoContentResponse()
  async logout(@CurrentUser() user: IAuthenticatedUser): Promise<void> {
    await this.logoutUseCase.execute(user.sessionId)
    this.logger.log(`Logout realizado (id: ${user.id})`, 'AuthController')
  }
}
