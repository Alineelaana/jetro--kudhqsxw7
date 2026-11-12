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
 * Traduz mensagens de erro padrão do PocketBase (inglês) para pt-BR.
 * Retorna '' quando a mensagem não é reconhecida (o chamador aplica fallback).
 */
export function translatePbMessage(message: string | undefined | null): string {
  if (!message) return ''
  const msg = String(message).trim()

  // Unicidade de campo (validation_not_unique)
  if (msg.includes('validation_not_unique') || msg.includes('unique')) {
    return 'Este valor já está cadastrado.'
  }
  if (msg.includes('validation_required') || msg.includes('required')) {
    return 'Preencha todos os campos obrigatórios.'
  }
  if (msg.includes('validation_min_length') || msg.includes('at least')) {
    return 'O valor informado é muito curto.'
  }
  if (msg.includes('validation_max_length') || msg.includes('at most')) {
    return 'O valor informado é muito longo.'
  }
  if (msg.includes('validation_values_mismatch') || msg.includes("don't match")) {
    return 'Os valores não coincidem.'
  }
  if (msg.includes('validation_invalid_credentials') || msg.includes('invalid credentials')) {
    return 'Credenciais inválidas. Verifique login e senha.'
  }
  if (msg.includes('validation_too_many_requests') || msg.includes('too many requests')) {
    return 'Muitas tentativas. Aguarde alguns instantes e tente novamente.'
  }
  if (msg.includes('token') && msg.includes('invalid')) {
    return 'Sessão expirada ou inválida. Faça login novamente.'
  }
  if (msg.includes('failed to authenticate') || msg.includes('authtoken')) {
    return 'Falha de autenticação. Faça login novamente.'
  }
  if (msg.includes('something went wrong') || msg.includes('internal')) {
    return 'Erro interno. Tente novamente em instantes.'
  }
  if (msg.includes('not allowed') || msg.includes('forbidden')) {
    return 'Você não tem permissão para esta ação.'
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
