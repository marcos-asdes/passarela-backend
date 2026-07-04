/**
 * Testes unitários para User
 *
 * Cenários testados:
 * - Expõe todas as props recebidas no construtor via getters
 * - normalizeEmail remove espaços nas extremidades e converte para minúsculas
 * - normalizeEmail é idempotente para um e-mail já normalizado
 * - normalizePhone remove tudo que não for dígito
 */

import { User } from '@auth/domain/user.entity'
import { UserRole } from '@auth/domain/types'

describe('User', () => {
  describe('getters', () => {
    it('expõe as props recebidas no construtor', () => {
      const createdAt = new Date('2026-01-01T00:00:00.000Z')
      const birthDate = new Date('1990-05-10T00:00:00.000Z')

      const user = new User({
        id: 'user-1',
        name: 'Fulano de Tal',
        email: 'fulano@example.com',
        passwordHash: 'hash',
        cpf: '52998224725',
        phone: '11912345678',
        birthDate,
        authProviders: [],
        role: UserRole.Seller,
        createdAt
      })

      expect(user.id).toBe('user-1')
      expect(user.name).toBe('Fulano de Tal')
      expect(user.email).toBe('fulano@example.com')
      expect(user.passwordHash).toBe('hash')
      expect(user.cpf).toBe('52998224725')
      expect(user.phone).toBe('11912345678')
      expect(user.birthDate).toBe(birthDate)
      expect(user.authProviders).toEqual([])
      expect(user.role).toBe(UserRole.Seller)
      expect(user.createdAt).toBe(createdAt)
    })

    it('passwordHash fica undefined pra conta sem senha local (preparação de schema OAuth)', () => {
      const user = new User({
        id: 'user-1',
        name: 'Fulano',
        email: 'fulano@example.com',
        cpf: '52998224725',
        phone: '11912345678',
        birthDate: new Date(),
        authProviders: [{ provider: 'github', providerId: 'gh-1' }],
        role: UserRole.Customer,
        createdAt: new Date()
      })

      expect(user.passwordHash).toBeUndefined()
    })
  })

  describe('normalizeEmail', () => {
    it('remove espaços nas extremidades e converte para minúsculas', () => {
      expect(User.normalizeEmail('  Fulano@Example.COM  ')).toBe('fulano@example.com')
    })

    it('é idempotente para um e-mail já normalizado', () => {
      expect(User.normalizeEmail('fulano@example.com')).toBe('fulano@example.com')
    })
  })

  describe('normalizePhone', () => {
    it('remove tudo que não for dígito', () => {
      expect(User.normalizePhone('(11) 91234-5678')).toBe('11912345678')
    })
  })
})
