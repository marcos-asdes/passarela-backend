import { UserRole } from '@auth/domain/types'

/** Corpo de resposta de POST /auth/register — nunca CPF, telefone ou senha */
export interface IRegisterResponse {
  id: string
  name: string
  email: string
  /** Formatada como DD-MM-YYYY — o valor no banco continua Date (sort/range query corretos) */
  birthDate: string
  role: UserRole
  createdAt: string
}

/** Corpo de resposta de POST /auth/login */
export interface ILoginResponse {
  accessToken: string
  user: {
    id: string
    name: string
    email: string
    role: UserRole
  }
}
