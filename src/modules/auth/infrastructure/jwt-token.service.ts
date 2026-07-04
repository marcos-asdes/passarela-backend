import { IJwtPayload, ITokenService } from '@auth/application/types'
import { IEnvironmentVariables } from '@config/types'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import ms, { StringValue } from 'ms'

/**
 * Implementação de ITokenService — encapsula @nestjs/jwt; algoritmo/expiração já fixados em
 * JwtModule.registerAsync (auth.module.ts), aqui só assina e calcula a expiração equivalente pra sessão
 */
@Injectable()
export class JwtTokenService implements ITokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<IEnvironmentVariables, true>
  ) {}

  sign(payload: IJwtPayload): string {
    return this.jwtService.sign(payload)
  }

  computeExpiresAt(): Date {
    const expiresIn = this.configService.get('JWT_EXPIRES_IN', { infer: true })
    // JWT_EXPIRES_IN é validado como string não-vazia em env.validation.ts, mas o formato exato
    // (ex.: "1h") só é uma garantia de convenção — ms.StringValue não pode ser verificado em tempo de
    // compilação pra um valor vindo de env em runtime.
    return new Date(Date.now() + ms(expiresIn as StringValue))
  }
}
