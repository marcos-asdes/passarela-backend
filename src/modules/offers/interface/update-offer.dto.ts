import { ApiPropertyOptional } from '@nestjs/swagger'
import { Transform, Type } from 'class-transformer'
import { IsInt, IsNumber, IsOptional, IsString, Max, MaxLength, Min, MinLength } from 'class-validator'
import { IsFutureDate } from '@offers/interface/validators/is-future-date.decorator'

/** Corpo de PATCH /offers/:id — todos os campos opcionais, só o que for enviado é alterado */
export class UpdateOfferDto {
  @ApiPropertyOptional({ minLength: 2, maxLength: 120 })
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  title?: string

  @ApiPropertyOptional({ minLength: 2, maxLength: 1000 })
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(2)
  @MaxLength(1000)
  description?: string

  @ApiPropertyOptional({ minimum: 0, maximum: 100 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  discountPercent?: number

  @ApiPropertyOptional({ minimum: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  stock?: number

  @ApiPropertyOptional({ description: 'Precisa ser uma data futura' })
  @IsOptional()
  @Type(() => Date)
  @IsFutureDate()
  validUntil?: Date
}
