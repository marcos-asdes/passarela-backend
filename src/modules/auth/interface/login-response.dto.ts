import { UserRole } from '@auth/domain/types'
import { ILoginResponse } from '@auth/interface/types'

/** DTO de resposta do login — mapeado manualmente pelo controller */
export class LoginResponseDto implements ILoginResponse {
  accessToken!: string
  user!: {
    id: string
    name: string
    email: string
    role: UserRole
  }
}
