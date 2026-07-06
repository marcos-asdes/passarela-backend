import { HydratedDocument } from 'mongoose'
import { InterestSchemaClass } from '@interest/infrastructure/interest.schema'

/** Documento hidratado do Mongoose para InterestSchemaClass */
export type InterestDocument = HydratedDocument<InterestSchemaClass>
