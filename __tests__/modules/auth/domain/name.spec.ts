/**
 * Testes unitários para capitalizeName
 *
 * Cenários testados:
 * - Capitaliza cada palavra, com o resto em minúsculas
 * - Mantém preposições (de/do/da/dos/das/e) em minúsculas, exceto na primeira posição
 * - Capitaliza cada parte de uma palavra com apóstrofo separadamente (ex.: d'Ávila)
 * - Normaliza acento grave/agudo usado como apóstrofo (´/`) para o apóstrofo padrão (')
 * - Remove espaços nas extremidades
 * - Preserva espaços duplos no meio do nome sem lançar erro
 */

import { capitalizeName } from '@auth/domain/name'

describe('capitalizeName', () => {
  it('capitaliza cada palavra, com o resto em minúsculas', () => {
    expect(capitalizeName('MARIA SILVA')).toBe('Maria Silva')
  })

  it('mantém preposições em minúsculas, exceto na primeira posição', () => {
    expect(capitalizeName('maria DA silva DE tal E souza')).toBe('Maria da Silva de Tal e Souza')
  })

  it('capitaliza a primeira posição normalmente, mesmo sendo uma preposição', () => {
    expect(capitalizeName('do NASCIMENTO')).toBe('Do Nascimento')
  })

  it('capitaliza cada parte de uma palavra com apóstrofo separadamente', () => {
    expect(capitalizeName("MARIA d'avila")).toBe("Maria D'Avila")
  })

  it('normaliza acento grave/agudo usado como apóstrofo para o apóstrofo padrão', () => {
    expect(capitalizeName('maria d´avila')).toBe("Maria D'Avila")
    expect(capitalizeName('maria d`avila')).toBe("Maria D'Avila")
  })

  it('remove espaços nas extremidades', () => {
    expect(capitalizeName('  maria silva  ')).toBe('Maria Silva')
  })

  it('preserva espaços duplos no meio do nome sem lançar erro', () => {
    expect(capitalizeName('maria  silva')).toBe('Maria  Silva')
  })
})
