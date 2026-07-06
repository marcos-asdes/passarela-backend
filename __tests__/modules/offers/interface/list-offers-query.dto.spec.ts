/**
 * Testes unitários para ListOffersQueryDto
 *
 * Cenários testados:
 * - aceita ausência de status (query opcional)
 * - aceita um status válido do enum OfferStatus
 * - rejeita status fora do enum OfferStatus
 */

import { plainToInstance } from 'class-transformer'
import { validateSync } from 'class-validator'
import { OfferStatus } from '@offers/domain/types'
import { ListOffersQueryDto } from '@offers/interface/list-offers-query.dto'

function validate(payload: Record<string, unknown>) {
  return validateSync(plainToInstance(ListOffersQueryDto, payload))
}

describe('ListOffersQueryDto', () => {
  it('aceita ausência de status', () => {
    expect(validate({})).toHaveLength(0)
  })

  it('aceita um status válido do enum OfferStatus', () => {
    expect(validate({ status: OfferStatus.Closed })).toHaveLength(0)
  })

  it('rejeita status fora do enum OfferStatus', () => {
    const errors = validate({ status: 'inexistente' })

    expect(errors.some((error) => error.property === 'status')).toBe(true)
  })
})
