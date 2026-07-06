/**
 * Testes unitários para Interest
 *
 * Cenários testados:
 * - getters refletem as props recebidas no construtor
 */

import { Interest } from '@interest/domain/interest.entity'

describe('Interest', () => {
  describe('getters', () => {
    it('refletem as props recebidas no construtor', () => {
      const props = {
        id: 'interest-1',
        offerId: 'offer-1',
        shopperId: 'shopper-1',
        createdAt: new Date('2026-01-01T00:00:00.000Z')
      }

      const interest = new Interest(props)

      expect(interest.id).toBe(props.id)
      expect(interest.offerId).toBe(props.offerId)
      expect(interest.shopperId).toBe(props.shopperId)
      expect(interest.createdAt).toBe(props.createdAt)
    })
  })
})
