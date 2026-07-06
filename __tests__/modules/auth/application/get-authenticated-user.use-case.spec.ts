/**
 * Testes unitários para GetAuthenticatedUserUseCase
 *
 * Cenários testados:
 * - Retorna { id, role } quando a sessão está ativa e o usuário existe
 * - Retorna null quando a sessão não existe/foi revogada/expirou (findActiveById retorna null)
 * - Retorna null quando o usuário do token não existe mais, mesmo com sessão válida
 * - Retorna null quando o userId da sessão não bate com o sub do payload
 */

import { GetAuthenticatedUserUseCase } from '@auth/application/get-authenticated-user.use-case'
import { IJwtPayload, ISessionRepository, IUserRepository } from '@auth/application/types'
import { Session } from '@auth/domain/session.entity'
import { User } from '@auth/domain/user.entity'
import { UserRole } from '@auth/domain/types'

describe('GetAuthenticatedUserUseCase', () => {
  let userRepository: jest.Mocked<IUserRepository>
  let sessionRepository: jest.Mocked<ISessionRepository>
  let useCase: GetAuthenticatedUserUseCase

  const payload: IJwtPayload = { sub: 'user-1', role: UserRole.Merchant, jti: 'session-1' }

  const activeSession = new Session({
    id: 'session-1',
    userId: 'user-1',
    expiresAt: new Date(Date.now() + 60_000),
    revokedAt: null,
    createdAt: new Date()
  })

  const user = new User({
    id: 'user-1',
    name: 'Fulano',
    email: 'fulano@example.com',
    passwordHash: 'hash',
    cpf: '52998224725',
    phone: '11912345678',
    birthDate: new Date('1990-05-10'),
    authProviders: [],
    role: UserRole.Merchant,
    createdAt: new Date()
  })

  beforeEach(() => {
    userRepository = { create: jest.fn(), findByEmail: jest.fn(), findById: jest.fn() }
    sessionRepository = { create: jest.fn(), findActiveById: jest.fn(), revoke: jest.fn() }
    useCase = new GetAuthenticatedUserUseCase(userRepository, sessionRepository)
  })

  it('retorna { id, role } quando a sessão está ativa e o usuário existe', async () => {
    sessionRepository.findActiveById.mockResolvedValue(activeSession)
    userRepository.findById.mockResolvedValue(user)

    const result = await useCase.execute(payload)

    expect(result).toEqual({ id: 'user-1', role: UserRole.Merchant })
  })

  it('retorna null quando a sessão não existe/foi revogada/expirou', async () => {
    sessionRepository.findActiveById.mockResolvedValue(null)

    const result = await useCase.execute(payload)

    expect(result).toBeNull()
    expect(userRepository.findById).not.toHaveBeenCalled()
  })

  it('retorna null quando o usuário do token não existe mais', async () => {
    sessionRepository.findActiveById.mockResolvedValue(activeSession)
    userRepository.findById.mockResolvedValue(null)

    const result = await useCase.execute(payload)

    expect(result).toBeNull()
  })

  it('retorna null quando o userId da sessão não bate com o sub do payload', async () => {
    sessionRepository.findActiveById.mockResolvedValue(
      new Session({
        id: 'session-1',
        userId: 'outro-usuario',
        expiresAt: new Date(Date.now() + 60_000),
        revokedAt: null,
        createdAt: new Date()
      })
    )

    const result = await useCase.execute(payload)

    expect(result).toBeNull()
    expect(userRepository.findById).not.toHaveBeenCalled()
  })
})
