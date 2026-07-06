/**
 * Testes unitários para OffersGateway
 *
 * Cenários testados:
 * - notifyOfferCreated emite 'offer:created' com o payload da offer pro namespace inteiro
 */

import { Server } from 'socket.io'
import { OfferResponseDto } from '@offers/interface/offer-response.dto'
import { OffersGateway } from '@offers/interface/offers.gateway'

describe('OffersGateway', () => {
  it("emite 'offer:created' com o payload da offer", () => {
    const gateway = new OffersGateway()
    const emit = jest.fn()
    Object.assign(gateway, { server: { emit } as unknown as Server })

    const dto = new OfferResponseDto()
    dto.id = 'offer-1'

    gateway.notifyOfferCreated(dto)

    expect(emit).toHaveBeenCalledWith('offer:created', dto)
  })
})
