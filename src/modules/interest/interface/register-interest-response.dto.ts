import { ApiProperty } from '@nestjs/swagger'
import { IRegisterInterestResponse } from '@interest/interface/types'

/** DTO de resposta de POST /interest */
export class RegisterInterestResponseDto implements IRegisterInterestResponse {
  @ApiProperty()
  id!: string
}
