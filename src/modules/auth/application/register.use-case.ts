import { Inject, Injectable } from '@nestjs/common'
import { normalizeCPF } from '@auth/domain/cpf'
import { capitalizeName } from '@auth/domain/name'
import { CpfAlreadyRegisteredError } from '@auth/domain/cpf-already-registered.error'
import { EmailAlreadyRegisteredError } from '@auth/domain/email-already-registered.error'
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

/** Caso de uso: registra uma nova conta local (merchant ou shopper) — não emite token, login é chamada separada */
@Injectable()
export class RegisterUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    @Inject(PASSWORD_HASHER) private readonly passwordHasher: IPasswordHasher
  ) {}

  async execute(input: IRegisterInput): Promise<IRegisterResult> {
    const name = capitalizeName(input.name)
    const email = User.normalizeEmail(input.email)
    const cpf = normalizeCPF(input.cpf)
    const phone = User.normalizePhone(input.phone)

    // Um CPF pode ter uma conta merchant e uma conta shopper, nunca duas do mesmo papel.
    const existingCpfRole = await this.userRepository.findByCpfAndRole(cpf, input.role)
    if (existingCpfRole) {
      throw new CpfAlreadyRegisteredError()
    }

    // E-mail pode repetir entre as duas contas do MESMO cpf, mas nunca pertencer a um cpf diferente.
    const existingEmail = await this.userRepository.findByEmail(email)
    if (existingEmail && existingEmail.cpf !== cpf) {
      throw new EmailAlreadyRegisteredError()
    }

    const passwordHash = await this.passwordHasher.hash(input.password)

    const data: ICreateUserData = {
      name,
      email,
      passwordHash,
      cpf,
      phone,
      birthDate: input.birthDate,
      role: input.role
    }

    const user = await this.userRepository.create(data)

    return { id: user.id, role: user.role }
  }
}
