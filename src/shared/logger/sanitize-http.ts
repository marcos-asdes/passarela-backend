import { IncomingHttpHeaders } from 'node:http'

/** Nunca aparecem em log, em nenhuma circunstância — mesma regra usada nos DTOs de resposta (nunca CPF/telefone/senha) */
const REDACTED_FIELDS = new Set(['password', 'confirmPassword', 'cpf', 'phone'])

const MAX_STRING_LENGTH = 100
const MAX_ARRAY_LENGTH = 100
const MAX_OBJECT_KEYS = 100

const REQUEST_HEADERS_TO_LOG = [
  'content-type',
  'content-length',
  'user-agent',
  'accept',
  'accept-language',
  'origin',
  'referer',
  'host'
]

const RESPONSE_HEADERS_TO_LOG = ['content-type', 'content-length', 'cache-control', 'etag']

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** Objeto com muitas chaves numéricas sequenciais — Buffer serializado sem querer no body */
function isBufferLikeObject(value: Record<string, unknown>): boolean {
  const keys = Object.keys(value)
  return keys.length > 50 && keys.every((key) => /^\d+$/.test(key))
}

function isBase64String(value: unknown): value is string {
  return typeof value === 'string' && value.length > MAX_STRING_LENGTH && /^[A-Za-z0-9+/=]+$/.test(value)
}

function sanitizeValue(key: string, value: unknown): unknown {
  if (REDACTED_FIELDS.has(key)) return '[REDACTED]'
  if (isPlainObject(value)) return sanitizeBody(value)
  if (Array.isArray(value) && value.length > MAX_ARRAY_LENGTH) return `[ARRAY:${value.length}items]`
  if (isBase64String(value)) return `[BASE64_DATA:${value.length}bytes]`
  return value
}

/**
 * Sanitiza o body de uma requisição antes de logar: redige campos sensíveis (nunca senha/CPF/telefone,
 * mesma regra dos DTOs de resposta) e evita despejar payload binário/grande no log.
 */
export function sanitizeBody(body: unknown): unknown {
  if (!isPlainObject(body)) return body
  if (isBufferLikeObject(body) || Object.keys(body).length > MAX_OBJECT_KEYS) {
    return `[BINARY_DATA:${Object.keys(body).length}bytes]`
  }

  const sanitized: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(body)) {
    sanitized[key] = sanitizeValue(key, value)
  }
  return sanitized
}

/** Subconjunto curado de headers de requisição seguros pra log — Authorization nunca aparece, só se veio presente */
export function pickRequestHeaders(headers: IncomingHttpHeaders): Record<string, unknown> {
  const picked: Record<string, unknown> = {}
  for (const name of REQUEST_HEADERS_TO_LOG) {
    if (headers[name] !== undefined) picked[name] = headers[name]
  }
  if (headers.authorization) picked.authorization = '[REDACTED]'
  return picked
}

/** Subconjunto curado de headers de resposta seguros pra log */
export function pickResponseHeaders(getHeader: (name: string) => unknown): Record<string, unknown> {
  const picked: Record<string, unknown> = {}
  for (const name of RESPONSE_HEADERS_TO_LOG) {
    const value = getHeader(name)
    if (value !== undefined) picked[name] = value
  }
  return picked
}
