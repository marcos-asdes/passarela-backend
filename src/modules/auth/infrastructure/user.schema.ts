import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { IAuthProviderLink, UserRole } from '@auth/domain/types'

/** Modelo de persistência do Mongoose — forma como o usuário é gravado no MongoDB */
@Schema({ timestamps: true, collection: 'users' })
export class UserSchemaClass {
  @Prop({ required: true, trim: true })
  name!: string

  /**
   * Não é único no banco: um mesmo CPF pode ter conta merchant e conta shopper com o mesmo e-mail.
   * O que não pode (e-mail pertencer a dois CPFs diferentes) é regra de negócio, verificada em
   * `RegisterUseCase`, não em índice de schema.
   */
  @Prop({ required: true, lowercase: true, trim: true, index: true })
  email!: string

  /** Ausente em contas OAuth-only (preparação de schema — o fluxo OAuth de fato ainda não existe) */
  @Prop({ required: false })
  passwordHash?: string

  @Prop({ required: true })
  cpf!: string

  @Prop({ required: true })
  phone!: string

  @Prop({ required: true })
  birthDate!: Date

  /** Vazio nas contas locais de hoje — índice único já existe pra quando o fluxo OAuth for implementado */
  @Prop({
    type: [{ provider: { type: String, enum: ['github', 'google'] }, providerId: String }],
    default: []
  })
  authProviders!: IAuthProviderLink[]

  @Prop({ required: true, type: String, enum: Object.values(UserRole) })
  role!: UserRole

  /** Preenchido automaticamente pelo Mongoose (timestamps: true) — declarado aqui só para tipagem */
  createdAt!: Date

  /** Preenchido automaticamente pelo Mongoose (timestamps: true) — declarado aqui só para tipagem */
  updatedAt!: Date
}

export const UserSchema = SchemaFactory.createForClass(UserSchemaClass)

// Um CPF pode ter no máximo uma conta merchant e uma conta shopper — nunca duas do mesmo papel.
UserSchema.index({ cpf: 1, role: 1 }, { unique: true, name: 'cpf_role_unique' })

// Índice único+multikey — nenhum código escreve em authProviders ainda, mas o índice já existe pra
// quando o fluxo OAuth de fato for implementado (evita linkar a mesma conta GitHub/Google a dois usuários).
UserSchema.index(
  { 'authProviders.provider': 1, 'authProviders.providerId': 1 },
  { unique: true, sparse: true, name: 'authProviders_unique' }
)
