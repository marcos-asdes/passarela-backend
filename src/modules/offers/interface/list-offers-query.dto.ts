import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsEnum, IsOptional } from 'class-validator'
import { OfferStatus } from '@offers/domain/types'

/** Query string de GET /offers — sem filtro, o endpoint devolve só offers `Active` */
export class ListOffersQueryDto {
  @ApiPropertyOptional({ enum: OfferStatus, default: OfferStatus.Active })
  @IsOptional()
  @IsEnum(OfferStatus)
  status?: OfferStatus
}
