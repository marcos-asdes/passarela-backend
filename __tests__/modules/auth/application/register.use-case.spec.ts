/**
 * Testes unitários para RegisterUseCase
 *
 * Cenários testados:
 * - Capitaliza o nome antes de persistir
 * - Normaliza e-mail, CPF e telefone antes de persistir
 * - Faz hash da senha antes de enviar ao repositório (nunca persiste texto puro)
 * - Retorna só id e role (nunca nome/e-mail/senha)
 * - Propaga EmailAlreadyRegisteredError lançado pelo repositório, sem mascará-lo
 * - Propaga CpfAlreadyRegisteredError lançado pelo repositório, sem mascará-lo
 */

import { EmailAlreadyRegisteredError } from '@auth/domain/email-already-registered.error'
import { CpfAlreadyRegisteredError } from '@auth/domain/cpf-already-registered.error'
import { User } from '@auth/domain/user.entity'
import { UserRole } from '@auth/domain/types'
import { RegisterUseCase } from '@auth/application/register.use-case'
import { IPasswordHasher, IRegisterInput, IUserRepository } from '@auth/application/types'

describe('RegisterUseCase', () => {
  let userRepository: jest.Mocked<IUserRepository>
  let passwordHasher: jest.Mocked<IPasswordHasher>
  let useCase: RegisterUseCase

  const input: IRegisterInput = {
    name: '  Fulano de Tal  ',
    email: '  Fulano@Example.COM  ',
    password: 'Senha@Forte123',
    cpf: '529.982.247-25',
    phone: '(11) 91234-5678',
    birthDate: new Date('1990-05-10'),
    role: UserRole.Seller
  }

  beforeEach(() => {
    userRepository = {
      create: jest.fn(),
      findByEmail: jest.fn(),
      findById: jest.fn()
    }
    passwordHasher = {
      hash: jest.fn().mockResolvedValue('hashed-password'),
      compare: jest.fn()
    }
    useCase = new RegisterUseCase(userRepository, passwordHasher)
  })

  it('capitaliza o nome antes de persistir', async () => {
    userRepository.create.mockResolvedValue(
      new User({
        id: 'user-1',
        name: 'Maria da Silva',
        email: 'fulano@example.com',
        passwordHash: 'hashed-password',
        cpf: '52998224725',
        phone: '11912345678',
        birthDate: input.birthDate,
        authProviders: [],
        role: UserRole.Seller,
        createdAt: new Date()
      })
    )

    await useCase.execute({ ...input, name: '  MARIA da SILVA  ' })

    expect(userRepository.create).toHaveBeenCalledWith(expect.objectContaining({ name: 'Maria da Silva' }))
  })

  it('normaliza e-mail, CPF e telefone antes de persistir', async () => {
    userRepository.create.mockResolvedValue(
      new User({
        id: 'user-1',
        name: input.name.trim(),
        email: 'fulano@example.com',
        passwordHash: 'hashed-password',
        cpf: '52998224725',
        phone: '11912345678',
        birthDate: input.birthDate,
        authProviders: [],
        role: UserRole.Seller,
        createdAt: new Date()
      })
    )

    await useCase.execute(input)

    expect(userRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'fulano@example.com',
        cpf: '52998224725',
        phone: '11912345678'
      })
    )
  })

  it('faz hash da senha antes de enviar ao repositório', async () => {
    userRepository.create.mockResolvedValue(
      new User({
        id: 'user-1',
        name: 'Fulano',
        email: 'fulano@example.com',
        passwordHash: 'hashed-password',
        cpf: '52998224725',
        phone: '11912345678',
        birthDate: input.birthDate,
        authProviders: [],
        role: UserRole.Seller,
        createdAt: new Date()
      })
    )

    await useCase.execute(input)

    expect(passwordHasher.hash).toHaveBeenCalledWith(input.password)
    expect(userRepository.create).toHaveBeenCalledWith(expect.objectContaining({ passwordHash: 'hashed-password' }))
  })

  it('retorna só id e role (nunca nome/e-mail/senha)', async () => {
    userRepository.create.mockResolvedValue(
      new User({
        id: 'user-1',
        name: 'Fulano',
        email: 'fulano@example.com',
        passwordHash: 'hashed-password',
        cpf: '52998224725',
        phone: '11912345678',
        birthDate: input.birthDate,
        authProviders: [],
        role: UserRole.Seller,
        createdAt: new Date()
      })
    )

    const result = await useCase.execute(input)

    expect(result).toEqual({ id: 'user-1', role: UserRole.Seller })
  })

  it('propaga EmailAlreadyRegisteredError lançado pelo repositório', async () => {
    userRepository.create.mockRejectedValue(new EmailAlreadyRegisteredError())

    await expect(useCase.execute(input)).rejects.toBeInstanceOf(EmailAlreadyRegisteredError)
  })

  it('propaga CpfAlreadyRegisteredError lançado pelo repositório', async () => {
    userRepository.create.mockRejectedValue(new CpfAlreadyRegisteredError())

    await expect(useCase.execute(input)).rejects.toBeInstanceOf(CpfAlreadyRegisteredError)
  })
})
