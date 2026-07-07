import { UserRole } from '@auth/domain/types'
import { ApiProperty } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsEmail, IsEnum, IsNotEmpty, IsString, MaxLength } from 'class-validator'

/**
 * Corpo de POST /auth/login — sem policy de tamanho na senha (só confere o que já foi cadastrado).
 * `role` é obrigatório: um mesmo e-mail pode ter conta merchant e conta shopper, login sempre
 * escopado a uma delas.
 */
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

  @ApiProperty({ description: 'Papel da conta', enum: UserRole, example: UserRole.Shopper })
  @IsEnum(UserRole)
  role!: UserRole
}
