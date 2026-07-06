import { registerDecorator, ValidationOptions } from 'class-validator'

/**
 * Valida que a data ainda não passou — calcula "agora" a cada validação (evita o footgun de
 * decorators como @MinDate(new Date()), que congelam o instante no carregamento do módulo, não na
 * hora da request)
 */
export function IsFutureDate(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string): void {
    registerDecorator({
      name: 'isFutureDate',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown): boolean {
          return value instanceof Date && value.getTime() > Date.now()
        },
        defaultMessage(): string {
          return 'date must be in the future'
        }
      }
    })
  }
}
