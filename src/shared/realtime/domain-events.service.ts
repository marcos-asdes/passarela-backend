import { Injectable } from '@nestjs/common'
import { EventEmitter } from 'node:events'

/**
 * Barramento de eventos de domínio entre bounded contexts — kernel compartilhado, não pertence a
 * nenhum bounded context específico. Existe pra `interest` avisar `offers` (e vice-versa, se preciso)
 * sem importar classe de use case/gateway do outro contexto — só o kernel é importado por todos.
 */
@Injectable()
export class DomainEventsService extends EventEmitter {}
