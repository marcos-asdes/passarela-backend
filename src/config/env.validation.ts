import { Environment, IEnvironmentVariables } from '@config/types'
import { plainToInstance } from 'class-transformer'
import { IsEnum, IsInt, IsNotEmpty, IsString, IsUrl, Max, Min, validateSync } from 'class-validator'

/** Classe validada a partir das variáveis de ambiente brutas (process.env) */
class EnvironmentVariables implements IEnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment = Environment.Development

  @IsInt()
  @Min(1)
  @Max(65535)
  PORT: number = 3000

  @IsString()
  @IsNotEmpty()
  MONGODB_URI!: string

  @IsUrl({ require_tld: false })
  CORS_ORIGIN!: string

  @IsInt()
  @Min(1)
  THROTTLE_TTL!: number

  @IsInt()
  @Min(1)
  THROTTLE_LIMIT!: number
}

/** Valida process.env no bootstrap, lançando erro descritivo se alguma variável estiver ausente ou inválida */
export function validateEnv(config: Record<string, unknown>): EnvironmentVariables {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, { enableImplicitConversion: true })
  const errors = validateSync(validatedConfig, { skipMissingProperties: false })

  if (errors.length > 0) {
    throw new Error(`Configuração de ambiente inválida: ${errors.toString()}`)
  }

  return validatedConfig
}
