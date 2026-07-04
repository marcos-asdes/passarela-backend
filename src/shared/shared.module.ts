import { Global, Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { APP_FILTER, APP_GUARD } from '@nestjs/core'
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler'
import { IEnvironmentVariables } from '@config/types'
import { AllExceptionsFilter } from '@shared/filters/all-exceptions.filter'
import { AppLoggerService } from '@shared/logger/app-logger.service'

/** Kernel compartilhado global: rate limiting e filtro de exceções registrados via token (permite DI no filtro) */
@Global()
@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<IEnvironmentVariables, true>) => [
        {
          ttl: configService.get('THROTTLE_TTL', { infer: true }),
          limit: configService.get('THROTTLE_LIMIT', { infer: true })
        }
      ]
    })
  ],
  providers: [
    AppLoggerService,
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_GUARD, useClass: ThrottlerGuard }
  ],
  exports: [AppLoggerService]
})
export class SharedModule {}
