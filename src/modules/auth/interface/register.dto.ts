import { UserRole } from '@auth/domain/types'
import { IsCPF } from '@auth/interface/validators/is-cpf.decorator'
import { IsPastDate } from '@auth/interface/validators/is-past-date.decorator'
import { Match } from '@auth/interface/validators/match.decorator'
import { ApiProperty } from '@nestjs/swagger'
import { Transform, Type } from 'class-transformer'
import { IsEmail, IsEnum, IsString, Matches, MaxLength, MinLength } from 'class-validator'

/**
 * Conjunto explícito de caracteres especiais aceitos — evita depender de \W (que inclui unicode
 * imprevisível) pra decidir o que conta como "caractere especial"
 */
const PASSWORD_COMPOSITION_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).+$/

/** Corpo de POST /auth/register — pros dois papéis (merchant/shopper) */
export class RegisterDto {
  @ApiProperty({ description: 'Nome completo', example: 'Fulano de Tal', minLength: 2, maxLength: 120 })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name!: string

  @ApiProperty({ description: 'E-mail — usado como identificador de login', example: 'fulano@example.com' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsEmail()
  email!: string

  @ApiProperty({ description: 'CPF (com ou sem máscara)', example: '529.982.247-25' })
  @Transform(({ value }) => (typeof value === 'string' ? value.replace(/\D/g, '') : value))
  @IsCPF()
  cpf!: string

  @ApiProperty({ description: 'Telefone com DDD (com ou sem máscara)', example: '(11) 91234-5678' })
  @Transform(({ value }) => (typeof value === 'string' ? value.replace(/\D/g, '') : value))
  @Matches(/^\d{10,11}$/, { message: 'phone must have 10 or 11 digits' })
  phone!: string

  @ApiProperty({ description: 'Data de nascimento (precisa ser uma data passada)', example: '1990-05-10' })
  @Type(() => Date)
  @IsPastDate()
  birthDate!: Date

  @ApiProperty({
    description: 'Mínimo 10 caracteres, com maiúscula, minúscula, número e caractere especial',
    example: 'Senha@Forte123',
    minLength: 10,
    maxLength: 128
  })
  @IsString()
  @MinLength(10)
  @MaxLength(128)
  @Matches(PASSWORD_COMPOSITION_REGEX, {
    message: 'password must contain uppercase, lowercase, number and special character'
  })
  password!: string

  @ApiProperty({ description: 'Precisa ser igual a password', example: 'Senha@Forte123' })
  @IsString()
  @Match('password')
  confirmPassword!: string

  @ApiProperty({ description: 'Papel da conta', enum: UserRole, example: UserRole.Merchant })
  @IsEnum(UserRole)
  role!: UserRole
}
