/** Ambientes de execução suportados pela aplicação */
export enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test'
}

/** Formato validado das variáveis de ambiente lidas pela aplicação */
export interface IEnvironmentVariables {
  /** Ambiente de execução atual */
  NODE_ENV: Environment
  /** Porta HTTP em que a API escuta */
  PORT: number
  /** String de conexão do MongoDB */
  MONGODB_URI: string
  /** Origem permitida para requisições CORS */
  CORS_ORIGIN: string
  /** Janela de rate limiting em milissegundos */
  THROTTLE_TTL: number
  /** Número máximo de requisições permitidas dentro da janela de rate limiting */
  THROTTLE_LIMIT: number
  /** Segredo usado para assinar/verificar tokens JWT */
  JWT_SECRET: string
  /** Tempo de expiração dos tokens JWT (ex.: 15m, 1h, 7d) */
  JWT_EXPIRES_IN: string
}
