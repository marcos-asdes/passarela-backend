import { UserRole } from '@auth/domain/types'
import { IsCPF } from '@auth/interface/validators/is-cpf.decorator'
import { IsPastDate } from '@auth/interface/validators/is-past-date.decorator'
import { Match } from '@auth/interface/validators/match.decorator'
import { Transform, Type } from 'class-transformer'
import { IsEmail, IsEnum, IsString, Matches, MaxLength, MinLength } from 'class-validator'

/**
 * Conjunto explícito de caracteres especiais aceitos — evita depender de \W (que inclui unicode
 * imprevisível) pra decidir o que conta como "caractere especial"
 */
const PASSWORD_COMPOSITION_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).+$/

/** Corpo de POST /auth/register — pros dois papéis (seller/customer) */
export class RegisterDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name!: string

  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsEmail()
  email!: string

  @Transform(({ value }) => (typeof value === 'string' ? value.replace(/\D/g, '') : value))
  @IsCPF()
  cpf!: string

  @Transform(({ value }) => (typeof value === 'string' ? value.replace(/\D/g, '') : value))
  @Matches(/^\d{10,11}$/, { message: 'phone must have 10 or 11 digits' })
  phone!: string

  @Type(() => Date)
  @IsPastDate()
  birthDate!: Date

  @IsString()
  @MinLength(10)
  @MaxLength(128)
  @Matches(PASSWORD_COMPOSITION_REGEX, {
    message: 'password must contain uppercase, lowercase, number and special character'
  })
  password!: string

  @IsString()
  @Match('password')
  confirmPassword!: string

  @IsEnum(UserRole)
  role!: UserRole
}
