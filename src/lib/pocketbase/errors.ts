import { ClientResponseError } from 'pocketbase'

export type FieldErrors = Record<string, string>

/**
 * Tradução/humanização de mensagens de validação do PocketBase (pt-BR).
 * Garante que nenhuma mensagem cru ("Values don't match.", "validation_values_mismatch",
 * "invalid or expired", etc.) chegue ao usuário.
 */
const PB_ERROR_TRANSLATIONS: Array<{ test: RegExp; message: string }> = [
  {
    test: /values\s+don'?t\s+match/i,
    message: 'Os valores informados não coincidem. Verifique o preenchimento do campo.',
  },
  {
    test: /validation_values_mismatch/i,
    message: 'Os valores informados não coincidem. Verifique o preenchimento do campo.',
  },
  {
    test: /missing required|validation_required/i,
    message: 'Campo obrigatório não informado.',
  },
  {
    test: /validation_is_email|must be a valid email/i,
    message: 'Informe um endereço de e-mail válido.',
  },
  {
    test: /validation_not_unique|already exists|já está em uso/i,
    message: 'Valor já cadastrado para outro registro. Informe um valor diferente.',
  },
  {
    test: /validation_length_out_of_range|length must be/i,
    message: 'O tamanho do valor informado está fora do intervalo permitido.',
  },
  {
    test: /validation_greater_than_required|must be greater/i,
    message: 'O valor informado é menor que o mínimo permitido.',
  },
  {
    test: /validation_less_than_required|must be less/i,
    message: 'O valor informado é maior que o máximo permitido.',
  },
  {
    test: /validation_invalid_credentials|invalid login credentials/i,
    message: 'Credenciais inválidas. Verifique login e senha.',
  },
  {
    test: /failed to create records/i,
    message: 'Não foi possível salvar o registro. Verifique os dados e tente novamente.',
  },
  {
    test: /invalid or expired/i,
    message: 'Registro inválido ou expirado.',
  },
]

export function translatePbMessage(message: string): string {
  const raw = String(message || '')
  for (const rule of PB_ERROR_TRANSLATIONS) {
    if (rule.test.test(raw)) return rule.message
  }
  // Mensagens já em português ou sem padrão conhecido: devolve como veio.
  return raw
}

/** Rótulos amigáveis (pt-BR) para campos de usuário no PB. */
export const FIELD_LABELS: Record<string, string> = {
  verified: 'Verificação de e-mail',
  email: 'E-mail',
  password: 'Senha',
  passwordConfirm: 'Confirmação de senha',
  oldPassword: 'Senha atual',
  name: 'Nome',
  login: 'Login',
  cpf: 'CPF',
  avatar: 'Foto de Perfil',
  role: 'Papel de acesso',
  perfil_id: 'Perfil de acesso',
  perfil_acesso: 'Perfil de acesso',
  empresa_id: 'Empresa',
  empresas_ids: 'Empresas Vinculadas',
  filial_id: 'Filial Padrão',
  codigo: 'Código',
  active: 'Situação',
  inactivity_timeout_minutes: 'Tempo de inatividade para deslogar',
  force_password_change: 'Criar nova senha no próximo login',
  must_change_password: 'Criar nova senha no próximo login',
  cargo: 'Cargo',
  departamento: 'Departamento',
}

/** Normaliza nomes de campo alternativos usados pelo PocketBase. */
function normalizeFieldName(field: string): string {
  const key = String(field || '')
  if (key === 'password_confirm' || key === 'passwordConfirm') return 'passwordConfirm'
  if (key === 'old_password' || key === 'oldPassword') return 'oldPassword'
  return key
}

export function extractFieldErrors(error: unknown): FieldErrors {
  if (!(error instanceof ClientResponseError)) return {}
  const data = error.response?.data
  if (!data || typeof data !== 'object') return {}
  const errors: FieldErrors = {}
  for (const [field, detail] of Object.entries(data)) {
    const key = normalizeFieldName(field)
    if (
      detail &&
      typeof detail === 'object' &&
      'message' in detail &&
      typeof (detail as { message: unknown }).message === 'string'
    ) {
      errors[key] = translatePbMessage((detail as { message: string }).message)
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

/** Mensagem por campo com rótulo amigável: { campo: 'Rótulo: mensagem traduzida' }. */
export function getLabeledFieldErrors(error: unknown): FieldErrors {
  if (!(error instanceof ClientResponseError)) return {}
  const data = error.response?.data
  if (!data || typeof data !== 'object') return {}
  const errors: FieldErrors = {}
  for (const [field, detail] of Object.entries(data)) {
    const key = normalizeFieldName(field)
    if (
      detail &&
      typeof detail === 'object' &&
      'message' in detail &&
      typeof (detail as { message: unknown }).message === 'string'
    ) {
      const label = FIELD_LABELS[key] || key
      errors[key] = `${label}: ${translatePbMessage((detail as { message: string }).message)}`
    }
  }
  return errors
}
