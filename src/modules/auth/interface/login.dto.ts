import { ApiProperty } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator'

/** Corpo de POST /auth/login — sem policy de tamanho na senha (só confere o que já foi cadastrado) */
export class LoginDto {
  @ApiProperty({ example: 'fulano@example.com' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsEmail()
  email!: string

  @ApiProperty({ example: 'Senha@Forte123' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  password!: string
}
