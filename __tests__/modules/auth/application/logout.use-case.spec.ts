/**
 * Testes unitários para LogoutUseCase
 *
 * Cenários testados:
 * - Revoga a sessão pelo id recebido, delegando pro repositório
 */

import { LogoutUseCase } from '@auth/application/logout.use-case'
import { ISessionRepository } from '@auth/application/types'

describe('LogoutUseCase', () => {
  let sessionRepository: jest.Mocked<ISessionRepository>
  let useCase: LogoutUseCase

  beforeEach(() => {
    sessionRepository = { create: jest.fn(), findActiveById: jest.fn(), revoke: jest.fn() }
    useCase = new LogoutUseCase(sessionRepository)
  })

  it('revoga a sessão pelo id recebido, delegando pro repositório', async () => {
    await useCase.execute('session-1')

    expect(sessionRepository.revoke).toHaveBeenCalledWith('session-1')
  })
})
