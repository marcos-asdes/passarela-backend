import { ApiProperty } from '@nestjs/swagger'
import { Offer } from '@offers/domain/offer.entity'
import { OfferStatus } from '@offers/domain/types'
import { IOfferResponse } from '@offers/interface/types'

/** DTO de resposta de uma offer — mapeado manualmente pelo controller a partir da entidade de domínio */
export class OfferResponseDto implements IOfferResponse {
  @ApiProperty()
  id!: string

  @ApiProperty()
  merchantId!: string

  @ApiProperty()
  title!: string

  @ApiProperty()
  description!: string

  @ApiProperty()
  discountPercent!: number

  @ApiProperty()
  stock!: number

  @ApiProperty()
  validUntil!: Date

  @ApiProperty({ enum: OfferStatus })
  status!: OfferStatus

  @ApiProperty()
  createdAt!: Date

  static fromEntity(offer: Offer): OfferResponseDto {
    const dto = new OfferResponseDto()
    dto.id = offer.id
    dto.merchantId = offer.merchantId
    dto.title = offer.title
    dto.description = offer.description
    dto.discountPercent = offer.discountPercent
    dto.stock = offer.stock
    dto.validUntil = offer.validUntil
    dto.status = offer.status
    dto.createdAt = offer.createdAt
    return dto
  }
}
