import { UserRole } from '@auth/domain/types'
import { ILoginResponse } from '@auth/interface/types'
import { ApiProperty } from '@nestjs/swagger'

/** Recorte de usuário devolvido no login — nunca CPF/telefone/senha */
export class LoginResponseUserDto {
  @ApiProperty()
  id!: string

  @ApiProperty()
  name!: string

  @ApiProperty()
  email!: string

  @ApiProperty({ enum: UserRole })
  role!: UserRole
}

/** DTO de resposta do login — mapeado manualmente pelo controller */
export class LoginResponseDto implements ILoginResponse {
  @ApiProperty({ description: 'JWT — enviar como Authorization: Bearer <token> nas próximas requisições' })
  accessToken!: string

  @ApiProperty({ type: LoginResponseUserDto })
  user!: LoginResponseUserDto
}
