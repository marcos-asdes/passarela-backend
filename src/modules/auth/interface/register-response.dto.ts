import { UserRole } from '@auth/domain/types'
import { IRegisterResponse } from '@auth/interface/types'

/** DTO de resposta do register — mapeado manualmente pelo controller, nunca inclui CPF/telefone/senha */
export class RegisterResponseDto implements IRegisterResponse {
  id!: string
  name!: string
  email!: string
  role!: UserRole
  createdAt!: string
}
