import { HydratedDocument } from 'mongoose'
import { OfferSchemaClass } from '@offers/infrastructure/offer.schema'

/** Documento hidratado do Mongoose para OfferSchemaClass */
export type OfferDocument = HydratedDocument<OfferSchemaClass>
