import { IProfileResult, IUserRepository, USER_REPOSITORY } from '@auth/application/types'
import { Inject, Injectable } from '@nestjs/common'

/** Caso de uso: nome/e-mail do usuário autenticado, pro header da UI — endpoint dedicado, nunca junto da resposta de login */
@Injectable()
export class GetProfileUseCase {
  constructor(@Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository) {}

  async execute(userId: string): Promise<IProfileResult | null> {
    const user = await this.userRepository.findById(userId)
    if (!user) {
      return null
    }

    return { name: user.name, email: user.email }
  }
}
