import { Global, Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core'
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler'
import { IEnvironmentVariables } from '@config/types'
import { AllExceptionsFilter } from '@shared/filters/all-exceptions.filter'
import { RequestLoggingInterceptor } from '@shared/interceptors/request-logging.interceptor'
import { AppLoggerService } from '@shared/logger/app-logger.service'
import { createPinoInstance } from '@shared/logger/pino-instance'
import { DomainEventsService } from '@shared/realtime/domain-events.service'
import { PINO_LOGGER } from '@shared/types'

/** Kernel compartilhado global: logging, rate limiting e filtro de exceções registrados via token (permite DI) */
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
    {
      provide: PINO_LOGGER,
      inject: [ConfigService],
      useFactory: (configService: ConfigService<IEnvironmentVariables, true>) =>
        createPinoInstance(configService.get('NODE_ENV', { infer: true }))
    },
    AppLoggerService,
    DomainEventsService,
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_INTERCEPTOR, useClass: RequestLoggingInterceptor }
  ],
  exports: [AppLoggerService, DomainEventsService]
})
export class SharedModule {}
