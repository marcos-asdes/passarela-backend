/**
 * Testes unitários para GetProfileUseCase
 *
 * Cenários testados:
 * - Retorna { name, email } quando o usuário existe
 * - Retorna null quando o usuário não existe
 */

import { GetProfileUseCase } from '@auth/application/get-profile.use-case'
import { IUserRepository } from '@auth/application/types'
import { UserRole } from '@auth/domain/types'
import { User } from '@auth/domain/user.entity'

describe('GetProfileUseCase', () => {
  let userRepository: jest.Mocked<IUserRepository>
  let useCase: GetProfileUseCase

  const user = new User({
    id: 'user-1',
    name: 'Fulano',
    email: 'fulano@example.com',
    passwordHash: 'hash',
    cpf: '52998224725',
    phone: '11912345678',
    birthDate: new Date('1990-05-10'),
    authProviders: [],
    role: UserRole.Shopper,
    createdAt: new Date()
  })

  beforeEach(() => {
    userRepository = { create: jest.fn(), findByEmail: jest.fn(), findById: jest.fn() }
    useCase = new GetProfileUseCase(userRepository)
  })

  it('retorna { name, email } quando o usuário existe', async () => {
    userRepository.findById.mockResolvedValue(user)

    const result = await useCase.execute('user-1')

    expect(result).toEqual({ name: 'Fulano', email: 'fulano@example.com' })
  })

  it('retorna null quando o usuário não existe', async () => {
    userRepository.findById.mockResolvedValue(null)

    const result = await useCase.execute('user-1')

    expect(result).toBeNull()
  })
})
