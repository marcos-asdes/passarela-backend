import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'

/** Modelo de persistência do Mongoose — forma como o interest é gravado no MongoDB */
@Schema({ timestamps: true, collection: 'interests' })
export class InterestSchemaClass {
  @Prop({ required: true, index: true })
  offerId!: string

  @Prop({ required: true, index: true })
  shopperId!: string

  /** Preenchido automaticamente pelo Mongoose (timestamps: true) — declarado aqui só para tipagem */
  createdAt!: Date

  /** Preenchido automaticamente pelo Mongoose (timestamps: true) — declarado aqui só para tipagem */
  updatedAt!: Date
}

export const InterestSchema = SchemaFactory.createForClass(InterestSchemaClass)

// Índice único composto — garante "1 interest por shopper por offer" mesmo sob concorrência,
// sem depender de uma checagem prévia (que teria race condition).
InterestSchema.index({ offerId: 1, shopperId: 1 }, { unique: true, name: 'offer_shopper_unique' })
