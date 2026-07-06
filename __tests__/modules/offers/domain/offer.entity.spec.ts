/**
 * Testes unitários para Offer
 *
 * Cenários testados:
 * - getters refletem as props recebidas no construtor
 * - isOwnedBy é true quando o merchantId bate
 * - isOwnedBy é false quando o merchantId não bate
 * - isEditable é true só quando status é Active
 * - close() retorna Closed a partir de Active
 * - close() retorna Closed a partir de SoldOut
 * - close() lança OfferAlreadyClosedError a partir de Closed
 * - close() lança OfferAlreadyClosedError a partir de Expired
 */

import { OfferAlreadyClosedError } from '@offers/domain/offer-already-closed.error'
import { Offer } from '@offers/domain/offer.entity'
import { IOfferProps, OfferStatus } from '@offers/domain/types'

function buildProps(overrides: Partial<IOfferProps> = {}): IOfferProps {
  return {
    id: 'offer-1',
    merchantId: 'merchant-1',
    title: '50% OFF',
    description: 'Promoção relâmpago',
    discountPercent: 50,
    stock: 10,
    validUntil: new Date(Date.now() + 60_000),
    status: OfferStatus.Active,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    ...overrides
  }
}

describe('Offer', () => {
  describe('getters', () => {
    it('refletem as props recebidas no construtor', () => {
      const props = buildProps()
      const offer = new Offer(props)

      expect(offer.id).toBe(props.id)
      expect(offer.merchantId).toBe(props.merchantId)
      expect(offer.title).toBe(props.title)
      expect(offer.description).toBe(props.description)
      expect(offer.discountPercent).toBe(props.discountPercent)
      expect(offer.stock).toBe(props.stock)
      expect(offer.validUntil).toBe(props.validUntil)
      expect(offer.status).toBe(props.status)
      expect(offer.createdAt).toBe(props.createdAt)
      expect(offer.updatedAt).toBe(props.updatedAt)
    })
  })

  describe('isOwnedBy', () => {
    it('é true quando o merchantId bate', () => {
      const offer = new Offer(buildProps({ merchantId: 'merchant-1' }))
      expect(offer.isOwnedBy('merchant-1')).toBe(true)
    })

    it('é false quando o merchantId não bate', () => {
      const offer = new Offer(buildProps({ merchantId: 'merchant-1' }))
      expect(offer.isOwnedBy('merchant-2')).toBe(false)
    })
  })

  describe('isEditable', () => {
    it('é true quando status é Active', () => {
      const offer = new Offer(buildProps({ status: OfferStatus.Active }))
      expect(offer.isEditable()).toBe(true)
    })

    it.each([OfferStatus.Closed, OfferStatus.SoldOut, OfferStatus.Expired])('é false quando status é %s', (status) => {
      const offer = new Offer(buildProps({ status }))
      expect(offer.isEditable()).toBe(false)
    })
  })

  describe('close', () => {
    it('retorna Closed a partir de Active', () => {
      const offer = new Offer(buildProps({ status: OfferStatus.Active }))
      expect(offer.close()).toBe(OfferStatus.Closed)
    })

    it('retorna Closed a partir de SoldOut', () => {
      const offer = new Offer(buildProps({ status: OfferStatus.SoldOut }))
      expect(offer.close()).toBe(OfferStatus.Closed)
    })

    it('lança OfferAlreadyClosedError a partir de Closed', () => {
      const offer = new Offer(buildProps({ status: OfferStatus.Closed }))
      expect(() => offer.close()).toThrow(OfferAlreadyClosedError)
    })

    it('lança OfferAlreadyClosedError a partir de Expired', () => {
      const offer = new Offer(buildProps({ status: OfferStatus.Expired }))
      expect(() => offer.close()).toThrow(OfferAlreadyClosedError)
    })
  })
})
