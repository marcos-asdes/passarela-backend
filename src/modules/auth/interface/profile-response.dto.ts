import { IProfileResponse } from '@auth/interface/types'
import { ApiProperty } from '@nestjs/swagger'

/** DTO de resposta de GET /auth/me — nome/e-mail do próprio usuário autenticado */
export class ProfileResponseDto implements IProfileResponse {
  @ApiProperty()
  name!: string

  @ApiProperty()
  email!: string
}
