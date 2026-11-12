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

export function translatePbMessage(message: string): string {
  if (!message) return 'Erro desconhecido.'
  const lower = message.toLowerCase().trim()

  if (lower.includes("values don't match") || lower.includes('values dont match')) {
    return 'Os valores informados não coincidem ou não foram aceitos pelo servidor.'
  }
  if (
    lower.includes('must be unique') ||
    lower.includes('already exists') ||
    lower.includes('unique constraint')
  ) {
    return 'Já existe um registro cadastrado com este valor (duplicidade detectada).'
  }
  if (lower.includes('failed to create record') || lower.includes('failed to authenticate')) {
    return 'Falha ao autenticar ou gravar o registro. Verifique os dados informados.'
  }
  if (lower.includes('something went wrong while processing your request')) {
    return 'Ocorreu um erro interno no servidor ao processar a requisição.'
  }
  if (lower.includes('invalid email') || lower.includes('must be a valid email')) {
    return 'O endereço de e-mail informado é inválido.'
  }
  if (lower.includes('cannot be blank') || lower.includes('is required')) {
    return 'Campo obrigatório não preenchido.'
  }
  if (lower.includes('unauthorized') || lower.includes('forbidden')) {
    return 'Você não tem permissão para realizar esta operação.'
  }

  return message
}

export function getErrorMessage(error: unknown): string {
  if (!(error instanceof ClientResponseError)) {
    return error instanceof Error ? error.message : 'Ocorreu um erro inesperado.'
  }
  const msgs = Object.values(extractFieldErrors(error)).map((m) => translatePbMessage(m))
  return msgs.length > 0
    ? msgs.join(' ')
    : translatePbMessage(error.message || 'Ocorreu um erro inesperado.')
}
