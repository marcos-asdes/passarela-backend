import { UserRole } from '@auth/domain/types'
import { IRegisterResponse } from '@auth/interface/types'
import { ApiProperty } from '@nestjs/swagger'

/** DTO de resposta do register — mapeado manualmente pelo controller, nunca inclui CPF/telefone/senha */
export class RegisterResponseDto implements IRegisterResponse {
  @ApiProperty()
  id!: string

  @ApiProperty()
  name!: string

  @ApiProperty()
  email!: string

  @ApiProperty({ description: 'Data de nascimento, formato DD-MM-YYYY', example: '10-05-1990' })
  birthDate!: string

  @ApiProperty({ enum: UserRole })
  role!: UserRole

  @ApiProperty({ description: 'Data de criação, em ISO 8601' })
  createdAt!: string
}
