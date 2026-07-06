import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { OfferStatus } from '@offers/domain/types'

/** Modelo de persistência do Mongoose — forma como a offer é gravada no MongoDB */
@Schema({ timestamps: true, collection: 'offers' })
export class OfferSchemaClass {
  @Prop({ required: true, index: true })
  merchantId!: string

  @Prop({ required: true, trim: true })
  title!: string

  @Prop({ required: true, trim: true })
  description!: string

  @Prop({ required: true, min: 0, max: 100 })
  discountPercent!: number

  @Prop({ required: true, min: 0 })
  stock!: number

  @Prop({ required: true })
  validUntil!: Date

  @Prop({ required: true, type: String, enum: Object.values(OfferStatus), default: OfferStatus.Active })
  status!: OfferStatus

  /** Preenchido automaticamente pelo Mongoose (timestamps: true) — declarado aqui só para tipagem */
  createdAt!: Date

  /** Preenchido automaticamente pelo Mongoose (timestamps: true) — declarado aqui só para tipagem */
  updatedAt!: Date
}

export const OfferSchema = SchemaFactory.createForClass(OfferSchemaClass)

// Índice composto pro scheduler de expiração: só varre offers Active/SoldOut com validUntil no passado.
OfferSchema.index({ status: 1, validUntil: 1 })
