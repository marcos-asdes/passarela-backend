import { Transform } from 'class-transformer'
import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator'

/** Corpo de POST /auth/login — sem policy de tamanho na senha (só confere o que já foi cadastrado) */
export class LoginDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsEmail()
  email!: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  password!: string
}
