/**
 * Testes unitários para AuthController
 *
 * Cenários testados:
 * - register: em caso de sucesso, retorna os dados criados sem accessToken/senha/CPF
 * - register: converte EmailAlreadyRegisteredError em ConflictException
 * - register: converte CpfAlreadyRegisteredError em ConflictException
 * - login: em caso de sucesso, retorna accessToken + dados do usuário
 * - login: converte InvalidCredentialsError em UnauthorizedException
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

describe('AuthController', () => {
  let registerUseCase: jest.Mocked<RegisterUseCase>
  let loginUseCase: jest.Mocked<LoginUseCase>
  let controller: AuthController

  const registerDto: RegisterDto = {
    name: 'Fulano',
    email: 'fulano@example.com',
    cpf: '52998224725',
    phone: '11912345678',
    birthDate: new Date('1990-05-10'),
    password: 'Senha@Forte123',
    confirmPassword: 'Senha@Forte123',
    role: UserRole.Seller
  }

  const loginDto: LoginDto = { email: 'fulano@example.com', password: 'Senha@Forte123' }

  beforeEach(() => {
    registerUseCase = { execute: jest.fn() } as unknown as jest.Mocked<RegisterUseCase>
    loginUseCase = { execute: jest.fn() } as unknown as jest.Mocked<LoginUseCase>
    controller = new AuthController(registerUseCase, loginUseCase)
  })

  describe('register', () => {
    it('em caso de sucesso, retorna os dados criados sem accessToken/senha/CPF', async () => {
      registerUseCase.execute.mockResolvedValue({
        id: 'user-1',
        name: 'Fulano',
        email: 'fulano@example.com',
        role: UserRole.Seller,
        createdAt: new Date('2026-01-01T00:00:00.000Z')
      })

      const result = await controller.register(registerDto)

      expect(result).toEqual({
        id: 'user-1',
        name: 'Fulano',
        email: 'fulano@example.com',
        role: UserRole.Seller,
        createdAt: '2026-01-01T00:00:00.000Z'
      })
      expect(result).not.toHaveProperty('accessToken')
      expect(result).not.toHaveProperty('passwordHash')
      expect(result).not.toHaveProperty('cpf')
    })

    it('converte EmailAlreadyRegisteredError em ConflictException', async () => {
      registerUseCase.execute.mockRejectedValue(new EmailAlreadyRegisteredError())

      await expect(controller.register(registerDto)).rejects.toBeInstanceOf(ConflictException)
    })

    it('converte CpfAlreadyRegisteredError em ConflictException', async () => {
      registerUseCase.execute.mockRejectedValue(new CpfAlreadyRegisteredError())

      await expect(controller.register(registerDto)).rejects.toBeInstanceOf(ConflictException)
    })
  })

  describe('login', () => {
    it('em caso de sucesso, retorna accessToken + dados do usuário', async () => {
      loginUseCase.execute.mockResolvedValue({
        accessToken: 'signed-token',
        user: { id: 'user-1', name: 'Fulano', email: 'fulano@example.com', role: UserRole.Seller }
      })

      const result = await controller.login(loginDto)

      expect(result).toEqual({
        accessToken: 'signed-token',
        user: { id: 'user-1', name: 'Fulano', email: 'fulano@example.com', role: UserRole.Seller }
      })
    })

    it('converte InvalidCredentialsError em UnauthorizedException', async () => {
      loginUseCase.execute.mockRejectedValue(new InvalidCredentialsError())

      await expect(controller.login(loginDto)).rejects.toBeInstanceOf(UnauthorizedException)
    })
  })
})
