import { RegisterInterestUseCase } from '@interest/application/register-interest.use-case'
import { RemoveInterestUseCase } from '@interest/application/remove-interest.use-case'
import { INTEREST_REPOSITORY, OFFER_STOCK_PORT } from '@interest/application/types'
import { InterestRepository } from '@interest/infrastructure/interest.repository'
import { InterestSchema, InterestSchemaClass } from '@interest/infrastructure/interest.schema'
import { OfferStockAdapter } from '@interest/infrastructure/offer-stock.adapter'
import { InterestController } from '@interest/interface/interest.controller'
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { OfferSchema, OfferSchemaClass } from '@offers/infrastructure/offer.schema'

/** Único arquivo que conhece as 4 camadas — registra os schemas (o próprio + o de `offers`, só pra
 * decrementar/incrementar estoque atomicamente via OfferStockAdapter, ver nota de fronteira no CLAUDE.md) e DI */
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: InterestSchemaClass.name, schema: InterestSchema },
      { name: OfferSchemaClass.name, schema: OfferSchema }
    ])
  ],
  controllers: [InterestController],
  providers: [
    RegisterInterestUseCase,
    RemoveInterestUseCase,
    { provide: INTEREST_REPOSITORY, useClass: InterestRepository },
    { provide: OFFER_STOCK_PORT, useClass: OfferStockAdapter }
  ]
})
export class InterestModule {}
