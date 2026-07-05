/**
 * Testes unitários para createPinoInstance
 *
 * Cenários testados:
 * - Nível trace em development
 * - Nível trace em production
 * - Nível silent em test (mantém a saída do Jest limpa)
 * - Expõe os métodos de log padrão do pino em qualquer ambiente
 */

import { Environment } from '@config/types'
import { createPinoInstance } from '@shared/logger/pino-instance'

describe('createPinoInstance', () => {
  it('nível trace em development', () => {
    expect(createPinoInstance(Environment.Development).level).toBe('trace')
  })

  it('nível trace em production', () => {
    expect(createPinoInstance(Environment.Production).level).toBe('trace')
  })

  it('nível silent em test', () => {
    expect(createPinoInstance(Environment.Test).level).toBe('silent')
  })

  it('expõe os métodos de log padrão do pino', () => {
    const logger = createPinoInstance(Environment.Test)

    expect(typeof logger.info).toBe('function')
    expect(typeof logger.error).toBe('function')
    expect(typeof logger.warn).toBe('function')
    expect(typeof logger.debug).toBe('function')
    expect(typeof logger.trace).toBe('function')
  })
})
