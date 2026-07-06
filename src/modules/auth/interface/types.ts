import { UserRole } from '@auth/domain/types'

/** Corpo de resposta de POST /auth/register — só confirmação; frontend redireciona pro login pelo statusCode */
export interface IRegisterResponse {
  message: string
}

/** Corpo de resposta de POST /auth/login — nunca nome, e-mail ou CPF, só o que já está assinado no JWT */
export interface ILoginResponse {
  accessToken: string
  user: {
    id: string
    role: UserRole
  }
}

/** Corpo de resposta de GET /auth/me — nome/e-mail do próprio usuário autenticado, pro header da UI */
export interface IProfileResponse {
  name: string
  email: string
}
