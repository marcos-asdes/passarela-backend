import { Inject, Injectable } from '@nestjs/common'
import { normalizeCPF } from '@auth/domain/cpf'
import { User } from '@auth/domain/user.entity'
import {
  ICreateUserData,
  IPasswordHasher,
  IRegisterInput,
  IRegisterResult,
  IUserRepository,
  PASSWORD_HASHER,
  USER_REPOSITORY
} from '@auth/application/types'

/** Caso de uso: registra uma nova conta local (seller ou customer) — não emite token, login é chamada separada */
@Injectable()
export class RegisterUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    @Inject(PASSWORD_HASHER) private readonly passwordHasher: IPasswordHasher
  ) {}

  async execute(input: IRegisterInput): Promise<IRegisterResult> {
    const email = User.normalizeEmail(input.email)
    const cpf = normalizeCPF(input.cpf)
    const phone = User.normalizePhone(input.phone)
    const passwordHash = await this.passwordHasher.hash(input.password)

    const data: ICreateUserData = {
      name: input.name,
      email,
      passwordHash,
      cpf,
      phone,
      birthDate: input.birthDate,
      role: input.role
    }

    const user = await this.userRepository.create(data)

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      birthDate: user.birthDate,
      role: user.role,
      createdAt: user.createdAt
    }
  }
}
