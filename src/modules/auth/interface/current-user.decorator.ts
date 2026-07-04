import { IAuthenticatedUser } from '@auth/application/types'
import { createParamDecorator, ExecutionContext } from '@nestjs/common'

/**
 * Extrai o usuário autenticado da request — função própria exportada pra ser testável sem precisar
 * montar o decorator do Nest inteiro no teste
 */
export function getCurrentUserFromContext(context: ExecutionContext): IAuthenticatedUser {
  const request = context.switchToHttp().getRequest<{ user: IAuthenticatedUser }>()
  return request.user
}

export const CurrentUser = createParamDecorator((_data: unknown, context: ExecutionContext) =>
  getCurrentUserFromContext(context)
)
