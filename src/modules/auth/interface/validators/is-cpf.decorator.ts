import { registerDecorator, ValidationOptions } from 'class-validator'
import { isValidCPF } from '@auth/domain/cpf'

/** Valida CPF pelo dígito verificador (domain/cpf.ts) — assume que o valor já chegou normalizado (só dígitos) */
export function IsCPF(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string): void {
    registerDecorator({
      name: 'isCPF',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown): boolean {
          return typeof value === 'string' && isValidCPF(value)
        },
        defaultMessage(): string {
          return 'cpf must be a valid CPF'
        }
      }
    })
  }
}
