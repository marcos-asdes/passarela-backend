import { ApiProperty } from '@nestjs/swagger'
import { IsMongoId } from 'class-validator'

/** Corpo de POST /interest */
export class RegisterInterestDto {
  @ApiProperty({ description: 'Id da offer' })
  @IsMongoId()
  offerId!: string
}
