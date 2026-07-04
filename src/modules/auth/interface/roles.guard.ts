import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { IAuthenticatedUser } from '@auth/application/types'
import { UserRole } from '@auth/domain/types'
import { ROLES_KEY } from '@auth/interface/roles.decorator'

/** Autoriza por papel — permite acesso quando a rota não declara @Roles() (uso sempre combinado, nunca sozinho) */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[] | undefined>(ROLES_KEY, [
      context.getHandler(),
      context.getClass()
    ])

    if (!requiredRoles || requiredRoles.length === 0) {
      return true
    }

    const request = context.switchToHttp().getRequest<{ user?: IAuthenticatedUser }>()
    const user = request.user

    if (!user || !requiredRoles.includes(user.role)) {
      throw new ForbiddenException()
    }

    return true
  }
}
