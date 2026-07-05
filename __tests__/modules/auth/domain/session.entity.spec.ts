/**
 * Testes unitários para Session
 *
 * Cenários testados:
 * - getters (id, userId, expiresAt, revokedAt, createdAt) refletem as props recebidas no construtor
 * - isActive é true quando não revogada e não expirada
 * - isActive é false quando revogada
 * - isActive é false quando expirada, mesmo sem revokedAt
 */

import { Session } from '@auth/domain/session.entity'

describe('Session', () => {
  describe('getters', () => {
    it('refletem as props recebidas no construtor', () => {
      const props = {
        id: 'session-1',
        userId: 'user-1',
        expiresAt: new Date(Date.now() + 60_000),
        revokedAt: null,
        createdAt: new Date('2026-01-01T00:00:00.000Z')
      }

      const session = new Session(props)

      expect(session.id).toBe(props.id)
      expect(session.userId).toBe(props.userId)
      expect(session.expiresAt).toBe(props.expiresAt)
      expect(session.revokedAt).toBe(props.revokedAt)
      expect(session.createdAt).toBe(props.createdAt)
    })
  })

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
