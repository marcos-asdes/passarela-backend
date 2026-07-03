import type { Options } from '@swc/core'
import type { Config } from 'jest'

/** Espelha .swcrc (decorators/decoratorMetadata) — @swc/jest não faz auto-discovery do .swcrc, precisa receber igual */
const swcJestOptions: Options = {
  jsc: {
    parser: { syntax: 'typescript', decorators: true, dynamicImport: true },
    transform: { legacyDecorator: true, decoratorMetadata: true },
    target: 'es2023',
    keepClassNames: true
  },
  module: { type: 'commonjs' }
}

/** Configuração do Jest: raiz do projeto, testes espelhados em __tests__/, transform via @swc/jest */
const config: Config = {
  rootDir: '.',
  testEnvironment: 'node',
  testRegex: String.raw`__tests__/.*\.spec\.ts$`,
  transform: {
    '^.+\\.(t|j)s$': ['@swc/jest', swcJestOptions]
  },
  moduleFileExtensions: ['js', 'json', 'ts'],
  moduleNameMapper: {
    '^@app/(.*)$': '<rootDir>/src/$1'
  },
  collectCoverageFrom: ['src/**/*.ts', '!src/main.ts', '!src/**/types.ts', '!src/**/*.module.ts'],
  coverageDirectory: './coverage',
  coverageProvider: 'v8'
}

export default config
