import { UserRole } from '@auth/domain/types'
import { ILoginResponse } from '@auth/interface/types'
import { ApiProperty } from '@nestjs/swagger'

/** Recorte de usuário devolvido no login — só id/role (mesmos dados assinados no JWT), nunca nome/e-mail/CPF/telefone */
export class LoginResponseUserDto {
  @ApiProperty()
  id!: string

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
