import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { IEnvironmentVariables } from '@config/types'
import { GetAuthenticatedUserUseCase } from '@auth/application/get-authenticated-user.use-case'
import { IAuthenticatedUser, IJwtPayload } from '@auth/application/types'

/** Estrategia passport-jwt — algoritmo fixado em HS256 (evita ataque de confusão de algoritmo) */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    configService: ConfigService<IEnvironmentVariables, true>,
    private readonly getAuthenticatedUserUseCase: GetAuthenticatedUserUseCase
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET', { infer: true }),
      algorithms: ['HS256']
    })
  }

  async validate(payload: IJwtPayload): Promise<IAuthenticatedUser> {
    const user = await this.getAuthenticatedUserUseCase.execute(payload)
    if (!user) {
      throw new UnauthorizedException()
    }
    return user
  }
}
