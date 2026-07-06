/**
 * Testes unitários para AuthController
 *
 * Cenários testados:
 * - register: em caso de sucesso, retorna só uma mensagem informativa (nunca dados do usuário)
 * - register: converte EmailAlreadyRegisteredError em ConflictException
 * - register: converte CpfAlreadyRegisteredError em ConflictException
 * - login: em caso de sucesso, retorna accessToken + id/role (nunca nome/e-mail/CPF)
 * - login: converte InvalidCredentialsError em UnauthorizedException
 * - register: loga sucesso (info) com id+role
 * - register: loga tentativa de e-mail já cadastrado (warn) com o e-mail, nunca o CPF
 * - register: loga tentativa de CPF já cadastrado (warn) sem expor o CPF
 * - login: loga sucesso (info) com id+role
 * - login: loga tentativa de credenciais inválidas (warn) com o e-mail, nunca a senha
 */

import { ConflictException, UnauthorizedException } from '@nestjs/common'
import { CpfAlreadyRegisteredError } from '@auth/domain/cpf-already-registered.error'
import { EmailAlreadyRegisteredError } from '@auth/domain/email-already-registered.error'
import { InvalidCredentialsError } from '@auth/domain/invalid-credentials.error'
import { UserRole } from '@auth/domain/types'
import { LoginUseCase } from '@auth/application/login.use-case'
import { RegisterUseCase } from '@auth/application/register.use-case'
import { AuthController } from '@auth/interface/auth.controller'
import { LoginDto } from '@auth/interface/login.dto'
import { RegisterDto } from '@auth/interface/register.dto'
import { AppLoggerService } from '@shared/logger/app-logger.service'

describe('AuthController', () => {
  let registerUseCase: jest.Mocked<RegisterUseCase>
  let loginUseCase: jest.Mocked<LoginUseCase>
  let logger: jest.Mocked<AppLoggerService>
  let controller: AuthController

  const registerDto: RegisterDto = {
    name: 'Fulano',
    email: 'fulano@example.com',
    cpf: '52998224725',
    phone: '11912345678',
    birthDate: new Date('1990-05-10'),
    password: 'Senha@Forte123',
    confirmPassword: 'Senha@Forte123',
    role: UserRole.Merchant
  }

  const loginDto: LoginDto = { email: 'fulano@example.com', password: 'Senha@Forte123' }

  beforeEach(() => {
    registerUseCase = { execute: jest.fn() } as unknown as jest.Mocked<RegisterUseCase>
    loginUseCase = { execute: jest.fn() } as unknown as jest.Mocked<LoginUseCase>
    logger = { log: jest.fn(), warn: jest.fn() } as unknown as jest.Mocked<AppLoggerService>
    controller = new AuthController(registerUseCase, loginUseCase, logger)
  })

  describe('register', () => {
    it('em caso de sucesso, retorna só uma mensagem informativa (nunca dados do usuário)', async () => {
      registerUseCase.execute.mockResolvedValue({ id: 'user-1', role: UserRole.Merchant })

      const result = await controller.register(registerDto)

      expect(result).toEqual({ message: expect.any(String) })
      expect(result).not.toHaveProperty('id')
      expect(result).not.toHaveProperty('name')
      expect(result).not.toHaveProperty('email')
      expect(result).not.toHaveProperty('cpf')
      expect(result).not.toHaveProperty('accessToken')
    })

    it('converte EmailAlreadyRegisteredError em ConflictException', async () => {
      registerUseCase.execute.mockRejectedValue(new EmailAlreadyRegisteredError())

      await expect(controller.register(registerDto)).rejects.toBeInstanceOf(ConflictException)
    })

    it('converte CpfAlreadyRegisteredError em ConflictException', async () => {
      registerUseCase.execute.mockRejectedValue(new CpfAlreadyRegisteredError())

      await expect(controller.register(registerDto)).rejects.toBeInstanceOf(ConflictException)
    })

    it('loga sucesso com id+role', async () => {
      registerUseCase.execute.mockResolvedValue({ id: 'user-1', role: UserRole.Merchant })

      await controller.register(registerDto)

      expect(logger.log).toHaveBeenCalledWith('Usuário registrado (id: user-1, role: merchant)', 'AuthController')
    })

    it('loga tentativa de e-mail já cadastrado com o e-mail, nunca o CPF', async () => {
      registerUseCase.execute.mockRejectedValue(new EmailAlreadyRegisteredError())

      await expect(controller.register(registerDto)).rejects.toBeInstanceOf(ConflictException)

      expect(logger.warn).toHaveBeenCalledWith(
        `Tentativa de registro com e-mail já cadastrado: ${registerDto.email}`,
        'AuthController'
      )
      expect(logger.warn.mock.calls[0][0]).not.toContain(registerDto.cpf)
    })

    it('loga tentativa de CPF já cadastrado sem expor o CPF', async () => {
      registerUseCase.execute.mockRejectedValue(new CpfAlreadyRegisteredError())

      await expect(controller.register(registerDto)).rejects.toBeInstanceOf(ConflictException)

      expect(logger.warn).toHaveBeenCalledWith('Tentativa de registro com CPF já cadastrado', 'AuthController')
      expect(logger.warn.mock.calls[0][0]).not.toContain(registerDto.cpf)
    })
  })

  describe('login', () => {
    it('em caso de sucesso, retorna accessToken + id/role (nunca nome/e-mail/CPF)', async () => {
      loginUseCase.execute.mockResolvedValue({
        accessToken: 'signed-token',
        user: { id: 'user-1', role: UserRole.Merchant }
      })

      const result = await controller.login(loginDto)

      expect(result).toEqual({
        accessToken: 'signed-token',
        user: { id: 'user-1', role: UserRole.Merchant }
      })
      expect(result.user).not.toHaveProperty('name')
      expect(result.user).not.toHaveProperty('email')
      expect(result.user).not.toHaveProperty('cpf')
    })

    it('converte InvalidCredentialsError em UnauthorizedException', async () => {
      loginUseCase.execute.mockRejectedValue(new InvalidCredentialsError())

      await expect(controller.login(loginDto)).rejects.toBeInstanceOf(UnauthorizedException)
    })

    it('loga sucesso com id+role', async () => {
      loginUseCase.execute.mockResolvedValue({
        accessToken: 'signed-token',
        user: { id: 'user-1', role: UserRole.Merchant }
      })

      await controller.login(loginDto)

      expect(logger.log).toHaveBeenCalledWith('Login realizado (id: user-1, role: merchant)', 'AuthController')
    })

    it('loga tentativa de credenciais inválidas com o e-mail, nunca a senha', async () => {
      loginUseCase.execute.mockRejectedValue(new InvalidCredentialsError())

      await expect(controller.login(loginDto)).rejects.toBeInstanceOf(UnauthorizedException)

      expect(logger.warn).toHaveBeenCalledWith(
        `Tentativa de login com credenciais inválidas: ${loginDto.email}`,
        'AuthController'
      )
      expect(logger.warn.mock.calls[0][0]).not.toContain(loginDto.password)
    })
  })
})
