import { SetMetadata } from '@nestjs/common'
import { UserRole } from '@auth/domain/types'

export const ROLES_KEY = 'roles'

/** Declara quais papéis podem acessar a rota — sempre combinado com RolesGuard no mesmo handler */
export const Roles = (...roles: UserRole[]): MethodDecorator & ClassDecorator => SetMetadata(ROLES_KEY, roles)
