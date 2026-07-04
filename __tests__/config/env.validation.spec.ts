/**
 * Testes unitários para validateEnv
 *
 * Cenários testados:
 * - Config válida completa retorna instância com os valores corretos
 * - Conversão implícita: strings numéricas viram number (PORT, THROTTLE_TTL, THROTTLE_LIMIT)
 * - NODE_ENV ausente assume o default 'development'
 * - PORT ausente assume o default 3000
 * - NODE_ENV com valor fora do enum lança erro
 * - PORT fora do range (< 1 ou > 65535) lança erro
 * - MONGODB_URI ausente ou vazia lança erro
 * - CORS_ORIGIN que não é uma URL válida lança erro
 * - THROTTLE_TTL / THROTTLE_LIMIT ausentes ou não inteiros lançam erro
 * - JWT_SECRET ausente ou com menos de 32 caracteres lança erro
 * - JWT_EXPIRES_IN ausente ou vazio lança erro
 * - Mensagem de erro sempre inclui o prefixo "Configuração de ambiente inválida"
 */

import { validateEnv } from '@config/env.validation'
import { Environment } from '@config/types'

const validConfig: Record<string, unknown> = {
  NODE_ENV: 'production',
  PORT: '3000',
  MONGODB_URI: 'mongodb://user:pass@mongo:27017/passarela?authSource=admin',
  CORS_ORIGIN: 'http://localhost:3000',
  THROTTLE_TTL: '60000',
  THROTTLE_LIMIT: '100',
  JWT_SECRET: 'segredo-de-teste-com-32-caracteres-ou-mais',
  JWT_EXPIRES_IN: '1h'
}

/** Copia validConfig sem a chave informada, pra testar o comportamento de uma variável ausente */
function withoutKey(key: string): Record<string, unknown> {
  const config = { ...validConfig }
  delete config[key]
  return config
}

describe('validateEnv', () => {
  describe('config válida', () => {
    it('retorna instância com os valores corretos', () => {
      const result = validateEnv(validConfig)

      expect(result).toMatchObject({
        NODE_ENV: Environment.Production,
        PORT: 3000,
        MONGODB_URI: validConfig.MONGODB_URI,
        CORS_ORIGIN: validConfig.CORS_ORIGIN,
        THROTTLE_TTL: 60000,
        THROTTLE_LIMIT: 100
      })
    })

    it('converte strings numéricas de env em number', () => {
      const result = validateEnv(validConfig)

      expect(typeof result.PORT).toBe('number')
      expect(typeof result.THROTTLE_TTL).toBe('number')
      expect(typeof result.THROTTLE_LIMIT).toBe('number')
    })
  })

  describe('defaults', () => {
    it('assume NODE_ENV=development quando ausente', () => {
      const result = validateEnv(withoutKey('NODE_ENV'))

      expect(result.NODE_ENV).toBe(Environment.Development)
    })

    it('assume PORT=3000 quando ausente', () => {
      const result = validateEnv(withoutKey('PORT'))

      expect(result.PORT).toBe(3000)
    })
  })

  describe('NODE_ENV inválido', () => {
    it('lança erro para valor fora do enum', () => {
      expect(() => validateEnv({ ...validConfig, NODE_ENV: 'staging' })).toThrow('Configuração de ambiente inválida')
    })
  })

  describe('PORT fora do range', () => {
    it('lança erro para PORT menor que 1', () => {
      expect(() => validateEnv({ ...validConfig, PORT: '0' })).toThrow('Configuração de ambiente inválida')
    })

    it('lança erro para PORT maior que 65535', () => {
      expect(() => validateEnv({ ...validConfig, PORT: '70000' })).toThrow('Configuração de ambiente inválida')
    })
  })

  describe('MONGODB_URI ausente ou vazia', () => {
    it('lança erro quando ausente', () => {
      expect(() => validateEnv(withoutKey('MONGODB_URI'))).toThrow('Configuração de ambiente inválida')
    })

    it('lança erro quando string vazia', () => {
      expect(() => validateEnv({ ...validConfig, MONGODB_URI: '' })).toThrow('Configuração de ambiente inválida')
    })
  })

  describe('CORS_ORIGIN inválido', () => {
    it('lança erro quando não é uma URL', () => {
      expect(() => validateEnv({ ...validConfig, CORS_ORIGIN: 'não é uma url válida' })).toThrow(
        'Configuração de ambiente inválida'
      )
    })
  })

  describe('THROTTLE_TTL / THROTTLE_LIMIT inválidos', () => {
    it('lança erro quando THROTTLE_TTL está ausente', () => {
      expect(() => validateEnv(withoutKey('THROTTLE_TTL'))).toThrow('Configuração de ambiente inválida')
    })

    it('lança erro quando THROTTLE_LIMIT não é inteiro', () => {
      expect(() => validateEnv({ ...validConfig, THROTTLE_LIMIT: '1.5' })).toThrow('Configuração de ambiente inválida')
    })
  })

  describe('JWT_SECRET inválido', () => {
    it('lança erro quando ausente', () => {
      expect(() => validateEnv(withoutKey('JWT_SECRET'))).toThrow('Configuração de ambiente inválida')
    })

    it('lança erro quando tem menos de 32 caracteres', () => {
      expect(() => validateEnv({ ...validConfig, JWT_SECRET: 'curto-demais' })).toThrow(
        'Configuração de ambiente inválida'
      )
    })
  })

  describe('JWT_EXPIRES_IN inválido', () => {
    it('lança erro quando ausente', () => {
      expect(() => validateEnv(withoutKey('JWT_EXPIRES_IN'))).toThrow('Configuração de ambiente inválida')
    })

    it('lança erro quando vazio', () => {
      expect(() => validateEnv({ ...validConfig, JWT_EXPIRES_IN: '' })).toThrow('Configuração de ambiente inválida')
    })
  })
})
