/** Mensagens genéricas em pt-BR devolvidas ao cliente, por família de status HTTP — nunca o detalhe interno do erro */
export const GENERIC_ERROR_MESSAGES: Record<number, string> = {
  400: 'Requisição inválida',
  401: 'Não autorizado',
  403: 'Acesso negado',
  404: 'Recurso não encontrado',
  429: 'Muitas requisições, tente novamente mais tarde',
  500: 'Erro interno do servidor'
}

/** Mensagem de fallback quando o status não está mapeado em GENERIC_ERROR_MESSAGES */
export const DEFAULT_ERROR_MESSAGE = 'Erro interno do servidor'
