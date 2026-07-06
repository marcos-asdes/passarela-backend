import { InterestSchema, InterestSchemaClass } from '@interest/infrastructure/interest.schema'
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { CloseOfferUseCase } from '@offers/application/close-offer.use-case'
import { CreateOfferUseCase } from '@offers/application/create-offer.use-case'
import { ExpireOffersUseCase } from '@offers/application/expire-offers.use-case'
import { ListMerchantOffersUseCase } from '@offers/application/list-merchant-offers.use-case'
import { ListPublicFeedUseCase } from '@offers/application/list-public-feed.use-case'
import { INTEREST_COUNT_PORT, OFFER_REPOSITORY } from '@offers/application/types'
import { UpdateOfferUseCase } from '@offers/application/update-offer.use-case'
import { InterestCountAdapter } from '@offers/infrastructure/interest-count.adapter'
import { OfferRepository } from '@offers/infrastructure/offer.repository'
import { OfferSchema, OfferSchemaClass } from '@offers/infrastructure/offer.schema'
import { OfferExpirationScheduler } from '@offers/interface/offer-expiration.scheduler'
import { OffersController } from '@offers/interface/offers.controller'
import { OffersGateway } from '@offers/interface/offers.gateway'

/** Único arquivo que conhece as 4 camadas — registra os schemas (o próprio + o de `interest`, só
 * pra leitura via InterestCountAdapter, ver nota de fronteira no CLAUDE.md), gateway/scheduler e DI */
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: OfferSchemaClass.name, schema: OfferSchema },
      { name: InterestSchemaClass.name, schema: InterestSchema }
    ])
  ],
  controllers: [OffersController],
  providers: [
    CreateOfferUseCase,
    UpdateOfferUseCase,
    CloseOfferUseCase,
    ListMerchantOffersUseCase,
    ListPublicFeedUseCase,
    ExpireOffersUseCase,
    OffersGateway,
    OfferExpirationScheduler,
    { provide: OFFER_REPOSITORY, useClass: OfferRepository },
    { provide: INTEREST_COUNT_PORT, useClass: InterestCountAdapter }
  ]
})
export class OffersModule {}
