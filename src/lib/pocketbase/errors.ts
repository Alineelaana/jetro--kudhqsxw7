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
 * Rótulos amigáveis (pt-BR) para os campos de usuário que aparecem nas mensagens
 * de validação do PocketBase. Consumido junto com translatePbMessage para exibir
 * erros campo a campo, com rótulo legível (ex.: "Verificação de e-mail: Os valores
 * informados não coincidem.") em vez de texto cru ("verified: Values don't match.").
 */
export const FIELD_LABELS: Record<string, string> = {
  verified: 'Verificação de e-mail',
  email: 'E-mail',
  password: 'Senha',
  passwordConfirm: 'Confirmação de senha',
  password_confirm: 'Confirmação de senha',
  oldPassword: 'Senha atual',
  old_password: 'Senha atual',
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

const PB_MESSAGES: Record<string, string> = {
  "values don't match": 'Os valores informados não coincidem.',
  'values dont match': 'Os valores informados não coincidem.',
  'cannot be blank': 'Não pode ficar em branco.',
  'cannot be empty': 'Não pode ficar vazio.',
  required: 'Campo obrigatório.',
  'must be a valid email address': 'Deve ser um endereço de e-mail válido.',
  'value must be unique': 'Este valor já está em uso — informe um diferente.',
  validation_not_unique: 'Este valor já está em uso — informe um diferente.',
  'must be a valid email': 'Deve ser um e-mail válido.',
  'missing required value': 'Falta um valor obrigatório.',
  'must be at least': 'Deve ter no mínimo',
  'must be at most': 'Deve ter no máximo',
  'must be a valid url': 'Deve ser uma URL válida.',
  'must be a valid date string': 'Deve ser uma data válida.',
  'must be a boolean': 'Deve ser verdadeiro ou falso.',
  'must be a number': 'Deve ser um número.',
  'must be an integer': 'Deve ser um número inteiro.',
  'value must be greater than': 'O valor deve ser maior que',
  'value must be less than': 'O valor deve ser menor que',
  'failed to create record': 'Falha ao criar o registro.',
  'failed to update record': 'Falha ao atualizar o registro.',
  'something went wrong': 'Ocorreu um erro inesperado. Tente novamente.',
  'invalid or expired': 'Inválido ou expirado.',
  'invalid login credentials': 'Credenciais de acesso inválidas.',
}

/**
 * Traduz (pt-BR) mensagens de validação do PocketBase para exibição ao usuário.
 * Recebe qualquer texto de erro e devolve a versão traduzida — se nada casar,
 * devolve string vazia para o chamador decidir o fallback (texto original).
 */
export function translatePbMessage(message: string | undefined | null): string {
  if (!message || typeof message !== 'string') return ''
  const raw = message
  const lower = raw.toLowerCase().trim()

  for (const [needle, translated] of Object.entries(PB_MESSAGES)) {
    if (lower.includes(needle)) {
      // Frases que continuam com número ("must be at least 8 character(s)")
      // mantêm o restante numérico da mensagem original.
      const rest = raw.slice(raw.toLowerCase().indexOf(needle) + needle.length).trim()
      return translated + (rest ? ' ' + rest : '')
    }
  }

  // Catches "verified: Values don't match." style field-prefixed raw output:
  // devolve o texto traduzido sem o rótulo cru do campo quando possível.
  if (lower.includes("don't match") || lower.includes('dont match') || lower.includes('mismatch')) {
    return 'Os valores informados não coincidem.'
  }
  if (lower.includes('unique') || lower.includes('duplicate')) {
    return 'Este valor já está em uso — informe um diferente.'
  }

  return ''
}

/**
 * Combina os erros de campo do PocketBase com os rótulos pt-BR:
 * retorna lista de strings "Rótulo: mensagem traduzida" para exibição em bloco
 * de erro geral ou inline nos diálogos de usuário.
 */
export function getLabeledFieldErrors(error: unknown): string[] {
  if (!(error instanceof ClientResponseError)) return []
  const details: string[] = []
  const data = error.response?.data
  if (data && typeof data === 'object') {
    for (const [field, detail] of Object.entries(data)) {
      if (
        detail &&
        typeof detail === 'object' &&
        'message' in detail &&
        typeof (detail as { message: unknown }).message === 'string'
      ) {
        const label = FIELD_LABELS[field] || field
        const translated =
          translatePbMessage((detail as { message: string }).message) ||
          (detail as { message: string }).message
        details.push(`${label}: ${translated}`)
      }
    }
  }
  return details
}
