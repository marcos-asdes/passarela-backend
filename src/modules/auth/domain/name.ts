const LOWERCASE_PREPOSITIONS = new Set(['de', 'do', 'da', 'dos', 'das', 'e'])
/** U+00B4 (acento agudo, dead-key) — digitado via glyph literal aqui é visualmente confundivel com crase, por isso via code point */
const ACUTE_ACCENT = String.fromCodePoint(180)
const ACCENT_AS_APOSTROPHE = new RegExp(`[${ACUTE_ACCENT}\`]`, 'g')

/** Capitaliza a primeira letra de uma palavra, minúsculas no resto */
function capitalize(word: string): string {
  if (!word) return word
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
}

/** Capitaliza uma palavra com apóstrofo (ex.: d'Ávila), capitalizando cada parte separadamente */
function capitalizeWithApostrophe(word: string): string {
  return word.split("'").map(capitalize).join("'")
}

/**
 * Padroniza a capitalização de um nome completo: primeira letra de cada palavra maiúscula, resto
 * minúsculo — exceto preposições (de/do/da/dos/das/e) fora da primeira posição, que ficam minúsculas.
 * Normaliza acento agudo (dead-key) ou grave usado como apóstrofo para o apóstrofo padrão (').
 */
export function capitalizeName(name: string): string {
  return name
    .trim()
    .replace(ACCENT_AS_APOSTROPHE, "'")
    .split(' ')
    .map((word, index) => {
      if (LOWERCASE_PREPOSITIONS.has(word.toLowerCase()) && index !== 0) return word.toLowerCase()
      if (word.includes("'")) return capitalizeWithApostrophe(word)
      return capitalize(word)
    })
    .join(' ')
}
