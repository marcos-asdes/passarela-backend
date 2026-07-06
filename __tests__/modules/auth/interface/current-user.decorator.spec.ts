/**
 * Testes unitários para getCurrentUserFromContext (função por trás de @CurrentUser())
 *
 * Cenários testados:
 * - Extrai request.user a partir do ExecutionContext
 */

import { ExecutionContext } from '@nestjs/common'
import { UserRole } from '@auth/domain/types'
import { getCurrentUserFromContext } from '@auth/interface/current-user.decorator'

describe('getCurrentUserFromContext', () => {
  it('extrai request.user a partir do ExecutionContext', () => {
    const user = { id: 'user-1', role: UserRole.Shopper }
    const context = {
      switchToHttp: () => ({ getRequest: () => ({ user }) })
    } as unknown as ExecutionContext

    expect(getCurrentUserFromContext(context)).toBe(user)
  })
})
