import { ClientResponseError } from 'pocketbase'

export type FieldErrors = Record<string, string>

// Tradução de mensagens de validação do PocketBase (inglês) para português.
// Restaurada na v0.0.705 e re-restaurada na v0.0.707: este export é dependência
// crítica de src/services/users.ts (createUser/updateUser) — NUNCA remover.
// Retorna string vazia quando não há mensagem ou nenhuma tradução conhecida,
// para que o chamador possa usar o texto original como fallback.
const PB_MESSAGE_TRANSLATIONS: Array<[RegExp, string]> = [
  // Validação de confirmação (passwordConfirm, verified etc.)
  [/values (don't|do not) match/i, 'Os valores informados não coincidem'],
  [/passwords (don't|do not) match/i, 'As senhas informadas não coincidem'],
  // Campos obrigatórios / em branco
  [/cannot be blank/i, 'não pode ficar em branco'],
  [/missing required value/i, 'valor obrigatório não informado'],
  [/must not be empty/i, 'não pode ficar vazio'],
  [/is required/i, 'é obrigatório'],
  // Unicidade
  [/value (already )?exists/i, 'valor já cadastrado'],
  [/already exists/i, 'já cadastrado'],
  [/unique constraint/i, 'registro duplicado (valor já utilizado)'],
  [/failed unique constraint/i, 'valor já utilizado por outro registro'],
  // Formatos
  [/must be a valid email/i, 'deve ser um e-mail válido'],
  [/must be a valid( email address)?/i, 'deve ser um valor válido'],
  [/invalid (email|url|date|number)/i, '$1 inválido'],
  [/must be a valid url/i, 'deve ser uma URL válida'],
  [/must be a valid date/i, 'deve ser uma data válida'],
  [/must be an? (integer|number)/i, 'deve ser um número válido'],
  // Comprimento
  [/must be at least (\d+) character\(s\)/i, 'deve ter no mínimo $1 caractere(s)'],
  [/must be at most (\d+) character\(s\)/i, 'deve ter no máximo $1 caractere(s)'],
  [/the minimum required length is (\d+)/i, 'o comprimento mínimo exigido é $1'],
  [/the maximum required length is (\d+)/i, 'o comprimento máximo exigido é $1'],
  [/minimum (required )?length/i, 'comprimento mínimo exigido não atendido'],
  [/maximum (required )?length/i, 'comprimento máximo exigido excedido'],
  // Senha
  [/password.*too weak|too common/i, 'senha muito fraca — escolha uma senha mais forte'],
  [/validate password/i, 'senha inválida'],
  // Registro / coleção
  [/record not found/i, 'registro não encontrado'],
  [/collection not found/i, 'coleção não encontrada'],
  [/not allowed/i, 'não permitido'],
  [/you are not allowed to/i, 'você não tem permissão para'],
  [/validation failed/i, 'falha de validação'],
  [/validation validation error/i, 'falha de validação'],
  [/validation rules/i, 'regras de validação'],
  [/something went wrong/i, 'algo deu errado'],
  [/failed to create record/i, 'falha ao criar o registro'],
  [/failed to update record/i, 'falha ao atualizar o registro'],
  [/failed to delete record/i, 'falha ao excluir o registro'],
  [/the request is not valid/i, 'a requisição não é válida'],
  [/invalid request/i, 'requisição inválida'],
  [/unsupported file type/i, 'tipo de arquivo não suportado'],
  [/file.*too large/i, 'arquivo muito grande'],
]

// Traduções diretas de campos citados dentro das mensagens (ex.: "verified: ...")
const PB_FIELD_TRANSLATIONS: Array<[RegExp, string]> = [
  [/\bverified\b/i, 'verificação de e-mail'],
  [/\bpasswordConfirm\b/, 'confirmação de senha'],
  [/\bpassword\b/i, 'senha'],
  [/\bemail\b/i, 'e-mail'],
  [/\bname\b/i, 'nome'],
  [/\blogin\b/i, 'login'],
  [/\bcpf\b/i, 'CPF'],
  [/\bcnpj\b/i, 'CNPJ'],
  [/\bphone\b/i, 'telefone'],
  [/\bavatar\b/i, 'foto'],
]

export function translatePbMessage(message: string | null | undefined): string {
  if (!message || typeof message !== 'string') return ''

  const raw = message.trim()
  if (!raw) return ''

  // Mensagens já em português seguem sem alteração
  if (!/[a-zA-Z]/.test(raw) || /[\u00C0-\u024F]/.test(raw)) {
    return raw
  }

  let translated = raw
  for (const [pattern, replacement] of PB_MESSAGE_TRANSLATIONS) {
    if (pattern.test(translated)) {
      translated = translated.replace(pattern, replacement)
      break
    }
  }

  for (const [pattern, replacement] of PB_FIELD_TRANSLATIONS) {
    translated = translated.replace(pattern, replacement)
  }

  // Capitaliza a primeira letra para apresentação
  return translated.charAt(0).toUpperCase() + translated.slice(1)
}

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
