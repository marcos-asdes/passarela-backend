import { IPasswordHasher } from '@auth/application/types'
import { Injectable } from '@nestjs/common'
import * as argon2 from 'argon2'

/**
 * Custo fixo no código, não em env var — não deve variar por ambiente (ver plano de segurança do módulo).
 * Valores são o piso documentado pela OWASP pra argon2id.
 */
const ARGON2_OPTIONS = {
  type: argon2.argon2id,
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1
}

/**
 * Implementação de IPasswordHasher usando argon2id — memory-hard, sem truncamento silencioso (diferente
 * do bcrypt, que trunca senhas acima de 72 bytes)
 */
@Injectable()
export class Argon2PasswordHasherService implements IPasswordHasher {
  async hash(plain: string): Promise<string> {
    return argon2.hash(plain, ARGON2_OPTIONS)
  }

  async compare(plain: string, hash: string): Promise<boolean> {
    return argon2.verify(hash, plain)
  }
}
