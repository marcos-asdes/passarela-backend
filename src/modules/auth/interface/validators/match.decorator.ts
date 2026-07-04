import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator'

/** Decorator genérico: valida que o campo é igual a outro campo do mesmo objeto (ex.: confirmPassword) */
export function Match(property: string, validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string): void {
    registerDecorator({
      name: 'match',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [property],
      validator: {
        validate(value: unknown, args: ValidationArguments): boolean {
          const [relatedPropertyName] = args.constraints as [string]
          const relatedValue = (args.object as Record<string, unknown>)[relatedPropertyName]
          return value === relatedValue
        },
        defaultMessage(args: ValidationArguments): string {
          const [relatedPropertyName] = args.constraints as [string]
          return `${args.property} must match ${relatedPropertyName}`
        }
      }
    })
  }
}
