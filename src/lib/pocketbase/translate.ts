/**
 * Tradução pt-BR das mensagens padrão de validação do PocketBase.
 * Módulo isolado de propósito: src/services/users.ts importa daqui (e NÃO de
 * errors.ts) porque o export translatePbMessage desapareceu repetidamente de
 * errors.ts em rodadas anteriores, quebrando o build.
 */
const PB_MESSAGES_PT_BR: Record<string, string> = {
  'Validation failed.': 'Falha na validação dos dados.',
  'The request is invalid.': 'A requisição é inválida.',
  'Failed to create record.': 'Falha ao criar o registro.',
  'Failed to update record.': 'Falha ao atualizar o registro.',
  'Failed to delete record.': 'Falha ao excluir o registro.',
  "Values don't match.": 'Os valores não coincidem.',
  'Missing value.': 'Valor obrigatório não informado.',
  'Must be a valid email address.': 'Informe um endereço de e-mail válido.',
  'Must be at least 8 character(s) long.': 'Deve ter pelo menos 8 caracteres.',
  'The user is not authenticated.': 'Sessão expirada ou usuário não autenticado.',
}

export function translatePbMessage(message: string | undefined | null): string {
  if (!message) return ''
  return PB_MESSAGES_PT_BR[message] || message
}
