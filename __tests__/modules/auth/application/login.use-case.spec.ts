/**
 * Testes unitários para LoginUseCase
 *
 * Cenários testados:
 * - Normaliza o e-mail antes de buscar o usuário
 * - Em caso de credenciais corretas, cria uma sessão e retorna accessToken + dados do usuário
 * - O jti assinado no token corresponde ao id da sessão criada
 * - Lança InvalidCredentialsError quando o e-mail não existe
 * - Lança InvalidCredentialsError quando a senha está incorreta
 * - Lança InvalidCredentialsError quando a conta não tem senha local (OAuth-only)
 * - Compara contra o hash-dummy fixo nos três casos de falha (equalização de tempo, anti-enumeração)
 */

import { InvalidCredentialsError } from '@auth/domain/invalid-credentials.error'
import { User } from '@auth/domain/user.entity'
import { UserRole } from '@auth/domain/types'
import { DUMMY_PASSWORD_HASH, LoginUseCase } from '@auth/application/login.use-case'
import {
  ILoginInput,
  IPasswordHasher,
  ISessionRepository,
  ITokenService,
  IUserRepository
} from '@auth/application/types'
import { Session } from '@auth/domain/session.entity'

describe('LoginUseCase', () => {
  let userRepository: jest.Mocked<IUserRepository>
  let passwordHasher: jest.Mocked<IPasswordHasher>
  let tokenService: jest.Mocked<ITokenService>
  let sessionRepository: jest.Mocked<ISessionRepository>
  let useCase: LoginUseCase

  const input: ILoginInput = { email: '  Fulano@Example.COM  ', password: 'Senha@Forte123' }

  const buildUser = (overrides: Partial<{ passwordHash?: string }> = {}) =>
    new User({
      id: 'user-1',
      name: 'Fulano',
      email: 'fulano@example.com',
      passwordHash: 'real-hash',
      cpf: '52998224725',
      phone: '11912345678',
      birthDate: new Date('1990-05-10'),
      authProviders: [],
      role: UserRole.Customer,
      createdAt: new Date(),
      ...overrides
    })

  beforeEach(() => {
    userRepository = { create: jest.fn(), findByEmail: jest.fn(), findById: jest.fn() }
    passwordHasher = { hash: jest.fn(), compare: jest.fn() }
    tokenService = { sign: jest.fn().mockReturnValue('signed-token'), computeExpiresAt: jest.fn() }
    sessionRepository = { create: jest.fn(), findActiveById: jest.fn(), revoke: jest.fn() }
    useCase = new LoginUseCase(userRepository, passwordHasher, tokenService, sessionRepository)
  })

  it('normaliza o e-mail antes de buscar o usuário', async () => {
    userRepository.findByEmail.mockResolvedValue(buildUser())
    passwordHasher.compare.mockResolvedValue(true)
    tokenService.computeExpiresAt.mockReturnValue(new Date())
    sessionRepository.create.mockResolvedValue(
      new Session({ id: 'session-1', userId: 'user-1', expiresAt: new Date(), revokedAt: null, createdAt: new Date() })
    )

    await useCase.execute(input)

    expect(userRepository.findByEmail).toHaveBeenCalledWith('fulano@example.com')
  })

  it('em caso de sucesso, cria uma sessão e retorna accessToken + dados do usuário', async () => {
    const user = buildUser()
    userRepository.findByEmail.mockResolvedValue(user)
    passwordHasher.compare.mockResolvedValue(true)
    tokenService.computeExpiresAt.mockReturnValue(new Date())
    sessionRepository.create.mockResolvedValue(
      new Session({ id: 'session-1', userId: 'user-1', expiresAt: new Date(), revokedAt: null, createdAt: new Date() })
    )

    const result = await useCase.execute(input)

    expect(sessionRepository.create).toHaveBeenCalledWith({ userId: 'user-1', expiresAt: expect.any(Date) })
    expect(result).toEqual({
      accessToken: 'signed-token',
      user: { id: 'user-1', name: 'Fulano', email: 'fulano@example.com', role: UserRole.Customer }
    })
  })

  it('o jti assinado no token corresponde ao id da sessão criada', async () => {
    userRepository.findByEmail.mockResolvedValue(buildUser())
    passwordHasher.compare.mockResolvedValue(true)
    tokenService.computeExpiresAt.mockReturnValue(new Date())
    sessionRepository.create.mockResolvedValue(
      new Session({
        id: 'session-abc',
        userId: 'user-1',
        expiresAt: new Date(),
        revokedAt: null,
        createdAt: new Date()
      })
    )

    await useCase.execute(input)

    expect(tokenService.sign).toHaveBeenCalledWith({ sub: 'user-1', role: UserRole.Customer, jti: 'session-abc' })
  })

  it('lança InvalidCredentialsError quando o e-mail não existe', async () => {
    userRepository.findByEmail.mockResolvedValue(null)
    passwordHasher.compare.mockResolvedValue(false)

    await expect(useCase.execute(input)).rejects.toBeInstanceOf(InvalidCredentialsError)
    expect(passwordHasher.compare).toHaveBeenCalledWith(input.password, DUMMY_PASSWORD_HASH)
  })

  it('lança InvalidCredentialsError quando a senha está incorreta', async () => {
    userRepository.findByEmail.mockResolvedValue(buildUser())
    passwordHasher.compare.mockResolvedValue(false)

    await expect(useCase.execute(input)).rejects.toBeInstanceOf(InvalidCredentialsError)
    expect(passwordHasher.compare).toHaveBeenCalledWith(input.password, 'real-hash')
  })

  it('lança InvalidCredentialsError quando a conta não tem senha local (OAuth-only)', async () => {
    userRepository.findByEmail.mockResolvedValue(buildUser({ passwordHash: undefined }))
    passwordHasher.compare.mockResolvedValue(false)

    await expect(useCase.execute(input)).rejects.toBeInstanceOf(InvalidCredentialsError)
    expect(passwordHasher.compare).toHaveBeenCalledWith(input.password, DUMMY_PASSWORD_HASH)
  })
})
