import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'

/** Modelo de persistência do Mongoose — uma sessão por login, referenciada pelo JWT via jti (= _id) */
@Schema({ timestamps: true })
export class SessionSchemaClass {
  @Prop({ required: true, index: true })
  userId!: string

  /** Índice TTL — Mongo remove o documento sozinho assim que expiresAt passa, sem cron/job manual */
  @Prop({ required: true, index: { expireAfterSeconds: 0 } })
  expiresAt!: Date

  @Prop({ type: Date, required: false, default: null })
  revokedAt!: Date | null

  /** Preenchido automaticamente pelo Mongoose (timestamps: true) — declarado aqui só para tipagem */
  createdAt!: Date

  /** Preenchido automaticamente pelo Mongoose (timestamps: true) — declarado aqui só para tipagem */
  updatedAt!: Date
}

export const SessionSchema = SchemaFactory.createForClass(SessionSchemaClass)
