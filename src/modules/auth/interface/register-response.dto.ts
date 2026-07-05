import { IRegisterResponse } from '@auth/interface/types'
import { ApiProperty } from '@nestjs/swagger'

/** DTO de resposta do register — só confirmação; dados do usuário nunca voltam aqui, login é chamada separada */
export class RegisterResponseDto implements IRegisterResponse {
  @ApiProperty({ example: 'Conta criada com sucesso. Faça login para continuar.' })
  message!: string
}
