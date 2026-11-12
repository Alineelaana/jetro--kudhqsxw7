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

export function translatePbMessage(message: string | undefined | null): string {
  if (!message) return ''
  const clean = String(message).trim()

  // Mensagens de validação do PocketBase em inglês -> português (pt-BR)
  const known: Record<string, string> = {
    validation_values_mismatch: 'Os valores informados não coincidem.',
    "Values don't match.": 'Os valores informados não coincidem.',
    validation_required: 'Campo obrigatório.',
    'Cannot be blank.': 'Campo obrigatório.',
    validation_not_unique: 'Valor já em uso. Informe um valor diferente.',
    'Value must be unique.': 'Valor já em uso. Informe um valor diferente.',
    validation_is_email: 'Informe um e-mail válido.',
    validation_invalid_credentials: 'Credenciais inválidas. Verifique usuário e senha.',
    'Invalid login credentials.': 'Credenciais inválidas. Verifique usuário e senha.',
    validation_min_text_length: 'Valor abaixo do tamanho mínimo exigido.',
    validation_length_out_of_range: 'Valor fora do tamanho permitido.',
    validation_not_in: 'Valor fora das opções permitidas.',
    validation_between: 'Valor fora do intervalo permitido.',
    'Failed to create record.':
      'Não foi possível criar o registro. Verifique os campos e tente novamente.',
    'Failed to update record.':
      'Não foi possível atualizar o registro. Verifique os campos e tente novamente.',
  }

  if (known[clean]) return known[clean]

  // Verifica por códigos contidos na mensagem (ex.: "validation_required failed.")
  const code = Object.keys(known).find((k) => clean.includes(k))
  if (code) return known[code]

  return clean
}

export function getErrorMessage(error: unknown): string {
  if (!(error instanceof ClientResponseError)) {
    return error instanceof Error ? error.message : 'An unexpected error occurred.'
  }
  const msgs = Object.values(extractFieldErrors(error))
  return msgs.length > 0 ? msgs.join(' ') : error.message || 'An unexpected error occurred.'
}
