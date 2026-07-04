import { HydratedDocument } from 'mongoose'
import { SessionSchemaClass } from '@auth/infrastructure/session.schema'
import { UserSchemaClass } from '@auth/infrastructure/user.schema'

/** Documento hidratado do Mongoose para UserSchemaClass */
export type UserDocument = HydratedDocument<UserSchemaClass>

/** Documento hidratado do Mongoose para SessionSchemaClass */
export type SessionDocument = HydratedDocument<SessionSchemaClass>
