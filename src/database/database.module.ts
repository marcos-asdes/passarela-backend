import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'
import { IEnvironmentVariables } from '@config/types'
import { IDatabaseConfig } from '@database/types'

/** Único ponto de abertura da conexão real com o MongoDB — bounded contexts apenas registram schemas via forFeature */
@Module({
  imports: [
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<IEnvironmentVariables, true>): IDatabaseConfig => ({
        uri: configService.get('MONGODB_URI', { infer: true })
      })
    })
  ]
})
export class DatabaseModule {}
