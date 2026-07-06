import { ApiProperty } from '@nestjs/swagger'
import { Transform, Type } from 'class-transformer'
import { IsInt, IsNumber, IsString, Max, MaxLength, Min, MinLength } from 'class-validator'
import { IsFutureDate } from '@offers/interface/validators/is-future-date.decorator'

/** Corpo de POST /offers */
export class CreateOfferDto {
  @ApiProperty({ description: 'Título da offer', example: '50% OFF em todos os tênis', minLength: 2, maxLength: 120 })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  title!: string

  @ApiProperty({ description: 'Descrição da offer', minLength: 2, maxLength: 1000 })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(2)
  @MaxLength(1000)
  description!: string

  @ApiProperty({ description: 'Desconto em porcentagem (0-100)', example: 50, minimum: 0, maximum: 100 })
  @IsNumber()
  @Min(0)
  @Max(100)
  discountPercent!: number

  @ApiProperty({ description: 'Quantidade em estoque', example: 20, minimum: 0 })
  @IsInt()
  @Min(0)
  stock!: number

  @ApiProperty({ description: 'Data/hora limite de validade (precisa ser uma data futura)' })
  @Type(() => Date)
  @IsFutureDate()
  validUntil!: Date
}
