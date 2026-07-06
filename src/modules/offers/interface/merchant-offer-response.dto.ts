import { ApiProperty } from '@nestjs/swagger'
import { IMerchantOfferResult } from '@offers/application/types'
import { OfferResponseDto } from '@offers/interface/offer-response.dto'
import { IMerchantOfferResponse } from '@offers/interface/types'

/** DTO de resposta de uma offer no dashboard do merchant — offer + contagem de interest */
export class MerchantOfferResponseDto extends OfferResponseDto implements IMerchantOfferResponse {
  @ApiProperty({ description: 'Quantos shoppers registraram interest nessa offer' })
  interestCount!: number

  static fromResult(result: IMerchantOfferResult): MerchantOfferResponseDto {
    const dto = OfferResponseDto.fromEntity(result.offer) as MerchantOfferResponseDto
    dto.interestCount = result.interestCount
    return dto
  }
}
