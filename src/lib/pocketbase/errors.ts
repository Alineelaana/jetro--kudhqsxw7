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

const PB_MESSAGE_TRANSLATIONS: Array<{ test: RegExp; message: string }> = [
  { test: /values don't match/i, message: 'Os valores informados não coincidem.' },
  { test: /validation_values_mismatch/i, message: 'Os valores informados não coincidem.' },
  { test: /cannot be blank/i, message: 'Não pode ficar em branco.' },
  { test: /validation_required/i, message: 'Campo obrigatório.' },
  { test: /must be a valid email/i, message: 'Informe um e-mail válido.' },
  { test: /validation_is_email/i, message: 'Informe um e-mail válido.' },
  { test: /value must be unique/i, message: 'Este valor já está em uso.' },
  { test: /validation_not_unique/i, message: 'Este valor já está em uso.' },
  { test: /failed to create record/i, message: 'Falha ao criar o registro.' },
  { test: /invalid or expired/i, message: 'Valor inválido ou expirado.' },
  { test: /must be at least/i, message: 'Valor abaixo do tamanho mínimo exigido.' },
  {
    test: /validation_length_out_of_range/i,
    message: 'Tamanho do valor fora do intervalo permitido.',
  },
  { test: /missing value/i, message: 'Valor ausente.' },
  { test: /invalid value/i, message: 'Valor inválido.' },
]

/**
 * Traduz mensagens de validação do PocketBase (inglês) para pt-BR.
 * Retorna '' quando não reconhece a mensagem (o chamador decide o fallback).
 */
export function translatePbMessage(message: unknown): string {
  const raw = String(message || '').trim()
  if (!raw) return ''
  for (const t of PB_MESSAGE_TRANSLATIONS) {
    if (t.test.test(raw)) return t.message
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
