import { ClientResponseError } from 'pocketbase'

export type FieldErrors = Record<string, string>

export function extractFieldErrors(error: unknown): FieldErrors {
  if (!(error instanceof ClientResponseError)) return {}
  const data = error.response?.data
  if (!data || typeof data !== 'object') return {}
  const errors: FieldErrors = {}
  for (const [field, detail] of Object.entries(data)) {
    if (
      detail &&
      typeof detail === 'object' &&
      'message' in detail &&
      typeof (detail as { message: unknown }).message === 'string'
    ) {
      errors[field] = (detail as { message: string }).message
    }
  }
  return errors
}

/**
 * Traduz mensagens de validação padrão do PocketBase para pt-BR.
 * Usada principalmente pelo serviço de usuários (src/services/users.ts) para
 * exibir erros campo a campo em linguagem amigável, nunca texto cru em inglês.
 * Retorna string vazia quando não há tradução conhecida (o chamador decide o
 * fallback), garantindo compatibilidade com `translatePbMessage(msg) || msg`.
 */
const PB_MESSAGE_TRANSLATIONS: Record<string, string> = {
  'Value is required': 'Preenchimento obrigatório.',
  'Cannot be blank.': 'Não pode ficar em branco.',
  'Cannot be empty.': 'Não pode ficar vazio.',
  'Must be a valid email address.': 'Informe um e-mail válido.',
  'Value must be a valid email address.': 'Informe um e-mail válido.',
  "Values don't match.": 'Os valores não coincidem.',
  'Value must be at least 8 character(s) long.': 'O valor deve ter no mínimo 8 caracteres.',
  'Value must be at most 72 character(s) long.': 'O valor deve ter no máximo 72 caracteres.',
  'Value must be more than 8 character(s) long.': 'O valor deve ter mais de 8 caracteres.',
  'Value must be a number.': 'O valor deve ser numérico.',
  'Value must be an integer.': 'O valor deve ser um número inteiro.',
  'Value must be greater than or equal to 0.': 'O valor deve ser maior ou igual a zero.',
  'Value must be non-zero.': 'O valor não pode ser zero.',
  'Value must be unique.': 'Este valor já está em uso por outro registro.',
  'Value already exists.': 'Este valor já existe no sistema.',
  "Validation failed for field 'email'.": 'E-mail inválido.',
  'Invalid or expired token.': 'Token inválido ou expirado.',
  'The request requires valid record authorization token to be set.':
    'Sessão expirada. Faça login novamente.',
  'You are not allowed to perform this request.':
    'Você não tem permissão para executar esta operação.',
  'Failed to create record.': 'Falha ao gravar o registro.',
  'Failed to update record.': 'Falha ao atualizar o registro.',
  'Failed to delete record.': 'Falha ao excluir o registro.',
}

const PB_MESSAGE_PARTIAL_RULES: Array<{ test: RegExp; translate: (m: string) => string }> = [
  {
    test: /Value must be at least (\d+) character(?:s)? long/i,
    translate: (m) =>
      `O valor deve ter no mínimo ${/at least (\d+)/i.exec(m)?.[1] ?? '?'} caracteres.`,
  },
  {
    test: /Value must be at most (\d+) character(?:s)? long/i,
    translate: (m) =>
      `O valor deve ter no máximo ${/at most (\d+)/i.exec(m)?.[1] ?? '?'} caracteres.`,
  },
  {
    test: /must be a valid (\w+(?:\s\w+)?)/i,
    translate: (m) =>
      `Informe um valor válido para ${/valid ([\w\s]+)/i.exec(m)?.[1] ?? 'o campo'}.`,
  },
  {
    test: /Missing required (?:context|record|value)/i,
    translate: () => 'Dados obrigatórios ausentes na solicitação.',
  },
]

export function translatePbMessage(message: string): string {
  if (!message) return ''
  const trimmed = message.trim()
  const exact = PB_MESSAGE_TRANSLATIONS[trimmed]
  if (exact) return exact
  for (const rule of PB_MESSAGE_PARTIAL_RULES) {
    if (rule.test.test(trimmed)) return rule.translate(trimmed)
  }
  return ''
}

export function getErrorMessage(error: unknown): string {
  if (!(error instanceof ClientResponseError)) {
    return error instanceof Error ? error.message : 'An unexpected error occurred.'
  }
  const msgs = Object.values(extractFieldErrors(error))
  return msgs.length > 0 ? msgs.join(' ') : error.message || 'An unexpected error occurred.'
}
