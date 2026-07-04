import { GetAuthenticatedUserUseCase } from '@auth/application/get-authenticated-user.use-case'
import { LoginUseCase } from '@auth/application/login.use-case'
import { RegisterUseCase } from '@auth/application/register.use-case'
import { PASSWORD_HASHER, SESSION_REPOSITORY, TOKEN_SERVICE, USER_REPOSITORY } from '@auth/application/types'
import { Argon2PasswordHasherService } from '@auth/infrastructure/argon2-password-hasher.service'
import { JwtTokenService } from '@auth/infrastructure/jwt-token.service'
import { JwtStrategy } from '@auth/infrastructure/jwt.strategy'
import { SessionRepository } from '@auth/infrastructure/session.repository'
import { SessionSchema, SessionSchemaClass } from '@auth/infrastructure/session.schema'
import { UserRepository } from '@auth/infrastructure/user.repository'
import { UserSchema, UserSchemaClass } from '@auth/infrastructure/user.schema'
import { AuthController } from '@auth/interface/auth.controller'
import { IEnvironmentVariables } from '@config/types'
import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { MongooseModule } from '@nestjs/mongoose'
import { PassportModule } from '@nestjs/passport'

/** Único arquivo que conhece as 4 camadas — registra os schemas, JWT/Passport e faz o bind de DI */
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserSchemaClass.name, schema: UserSchema },
      { name: SessionSchemaClass.name, schema: SessionSchema }
    ]),
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<IEnvironmentVariables, true>) => ({
        secret: configService.get('JWT_SECRET', { infer: true }),
        signOptions: {
          algorithm: 'HS256',
          expiresIn: configService.get('JWT_EXPIRES_IN', { infer: true })
        }
      })
    })
  ],
  controllers: [AuthController],
  providers: [
    RegisterUseCase,
    LoginUseCase,
    GetAuthenticatedUserUseCase,
    JwtStrategy,
    { provide: USER_REPOSITORY, useClass: UserRepository },
    { provide: SESSION_REPOSITORY, useClass: SessionRepository },
    { provide: PASSWORD_HASHER, useClass: Argon2PasswordHasherService },
    { provide: TOKEN_SERVICE, useClass: JwtTokenService }
  ]
})
export class AuthModule {}
