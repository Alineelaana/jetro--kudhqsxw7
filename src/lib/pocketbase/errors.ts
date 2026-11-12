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

export function getErrorMessage(error: unknown): string {
  if (!(error instanceof ClientResponseError)) {
    return error instanceof Error ? error.message : 'An unexpected error occurred.'
  }
  const msgs = Object.values(extractFieldErrors(error))
  return msgs.length > 0 ? msgs.join(' ') : error.message || 'An unexpected error occurred.'
}

/**
 * Traduz mensagens cruas de validação do PocketBase para português claro (pt-BR).
 * Usada nos cadastros para nunca exibir texto técnico ao usuário.
 */
export function translatePbMessage(message?: string | null): string {
  const raw = String(message || '').trim()
  if (!raw) return ''

  const table: Array<[RegExp, string]> = [
    [
      /validation_not_unique/i,
      'Valor já utilizado por outro registro. Informe um valor diferente.',
    ],
    [/values don'?t match/i, 'Os valores informados não coincidem. Verifique e tente novamente.'],
    [/validation_required/i, 'Campo obrigatório não preenchido.'],
    [/validation_min_length/i, 'Valor menor que o tamanho mínimo permitido.'],
    [/validation_max_length/i, 'Valor maior que o tamanho máximo permitido.'],
    [/validation_length_out_of_range/i, 'Tamanho do valor fora do intervalo permitido.'],
    [/validation_is_human_readable/i, 'Informe um texto válido (sem caracteres especiais).'],
    [/validation_is_email/i, 'E-mail inválido.'],
    [/validation_is_url/i, 'URL inválida.'],
    [/validation_is_date/i, 'Data inválida.'],
    [/validation_is_number/i, 'Informe um número válido.'],
    [/validation_number_out_of_range/i, 'Número fora do intervalo permitido.'],
    [/validation_invalid_value|validation_in/i, 'Valor fora das opções permitidas.'],
    [/validation_missing_value/i, 'Valor ausente ou inválido para o campo.'],
    [
      /failed to create record/i,
      'Falha ao gravar o registro. Verifique os dados e tente novamente.',
    ],
    [
      /failed to update record/i,
      'Falha ao atualizar o registro. Verifique os dados e tente novamente.',
    ],
    [/something went wrong/i, 'Ocorreu um erro inesperado. Tente novamente em instantes.'],
    [/unauthorized/i, 'Sessão expirada ou sem permissão. Faça login novamente.'],
    [/forbidden/i, 'Você não tem permissão para esta operação.'],
    [/not found/i, 'Registro não encontrado.'],
  ]

  for (const [pattern, translated] of table) {
    if (pattern.test(raw)) return translated
  }
  return raw
}
