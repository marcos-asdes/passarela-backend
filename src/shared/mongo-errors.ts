import { IMongoDuplicateKeyError } from '@shared/types'

/** Detecta erro de chave duplicada (índice único violado) do driver do Mongo — reusado por qualquer
 * repository que precise traduzir isso num erro de domínio específico (ex.: EmailAlreadyRegisteredError) */
export function isDuplicateKeyError(error: unknown): error is IMongoDuplicateKeyError {
  return typeof error === 'object' && error !== null && (error as { code?: unknown }).code === 11000
}
