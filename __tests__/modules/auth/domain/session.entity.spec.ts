/**
 * Testes unitários para Session
 *
 * Cenários testados:
 * - isActive é true quando não revogada e não expirada
 * - isActive é false quando revogada
 * - isActive é false quando expirada, mesmo sem revokedAt
 */

import { Session } from '@auth/domain/session.entity'

describe('Session', () => {
  describe('isActive', () => {
    it('é true quando não revogada e não expirada', () => {
      const session = new Session({
        id: 'session-1',
        userId: 'user-1',
        expiresAt: new Date(Date.now() + 60_000),
        revokedAt: null,
        createdAt: new Date()
      })

      expect(session.isActive).toBe(true)
    })

    it('é false quando revogada', () => {
      const session = new Session({
        id: 'session-1',
        userId: 'user-1',
        expiresAt: new Date(Date.now() + 60_000),
        revokedAt: new Date(),
        createdAt: new Date()
      })

      expect(session.isActive).toBe(false)
    })

    it('é false quando expirada, mesmo sem revokedAt', () => {
      const session = new Session({
        id: 'session-1',
        userId: 'user-1',
        expiresAt: new Date(Date.now() - 60_000),
        revokedAt: null,
        createdAt: new Date()
      })

      expect(session.isActive).toBe(false)
    })
  })
})
