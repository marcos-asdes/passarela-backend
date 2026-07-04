const CPF_LENGTH = 11

/** Remove todos os caracteres não numéricos de um CPF (ou outro input) */
function onlyDigits(raw: string): string {
  return raw.replace(/\D/g, '')
}

/**
 * CPFs com todos os dígitos iguais (ex.: 111.111.111-11) passam na fórmula do dígito verificador,
 * mas são sabidamente inválidos/placeholder — validador real rejeita esse caso explicitamente.
 */
function isRepeatedDigitsSequence(digits: string): boolean {
  return /^(\d)\1*$/.test(digits)
}

/** Calcula o dígito verificador de um CPF a partir dos 9 ou 10 primeiros dígitos */
function calculateCheckDigit(digits: string, weightStart: number): number {
  let sum = 0
  for (let i = 0; i < digits.length; i++) {
    sum += Number(digits[i]) * (weightStart - i)
  }
  const remainder = (sum * 10) % 11
  return remainder === 10 || remainder === 11 ? 0 : remainder
}

/** Valida um CPF (com ou sem máscara) pelo algoritmo padrão de dígito verificador */
export function isValidCPF(raw: string): boolean {
  const digits = onlyDigits(raw)
  if (digits.length !== CPF_LENGTH) return false
  if (isRepeatedDigitsSequence(digits)) return false

  const firstCheckDigit = calculateCheckDigit(digits.slice(0, 9), 10)
  const secondCheckDigit = calculateCheckDigit(digits.slice(0, 9) + firstCheckDigit, 11)

  return digits === digits.slice(0, 9) + firstCheckDigit.toString() + secondCheckDigit.toString()
}

/** Remove máscara do CPF, mantendo só os dígitos — usado antes de persistir/comparar */
export function normalizeCPF(raw: string): string {
  return onlyDigits(raw)
}
