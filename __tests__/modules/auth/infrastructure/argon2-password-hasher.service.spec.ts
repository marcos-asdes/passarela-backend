/**
 * Testes unitários para Argon2PasswordHasherService
 *
 * Cenários testados:
 * - hash() produz uma string diferente da senha em texto puro
 * - hash() produz hashes diferentes para a mesma senha em chamadas distintas (salt aleatório)
 * - compare() retorna true para a senha correta
 * - compare() retorna false para a senha incorreta
 */

import { Argon2PasswordHasherService } from '@auth/infrastructure/argon2-password-hasher.service'

describe('Argon2PasswordHasherService', () => {
  const service = new Argon2PasswordHasherService()

  it('produz uma string diferente da senha em texto puro', async () => {
    const hash = await service.hash('Senha@Forte123')

    expect(hash).not.toBe('Senha@Forte123')
  })

  it('produz hashes diferentes para a mesma senha em chamadas distintas', async () => {
    const [first, second] = await Promise.all([service.hash('Senha@Forte123'), service.hash('Senha@Forte123')])

    expect(first).not.toBe(second)
  })

  it('compare() retorna true para a senha correta', async () => {
    const hash = await service.hash('Senha@Forte123')

    await expect(service.compare('Senha@Forte123', hash)).resolves.toBe(true)
  })

  it('compare() retorna false para a senha incorreta', async () => {
    const hash = await service.hash('Senha@Forte123')

    await expect(service.compare('SenhaErrada123', hash)).resolves.toBe(false)
  })
})
