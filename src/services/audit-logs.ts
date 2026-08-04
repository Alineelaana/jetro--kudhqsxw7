import pb from '@/lib/pocketbase/client'

export interface AuditLog {
  id: string
  created: string
  updated: string
  user_id: string
  user_name: string
  user_role: string
  action: string
  module: string
  target_collection: string
  target_id: string
  target_summary: string
  previous_value: Record<string, unknown> | null
  new_value: Record<string, unknown> | null
  ip_address: string
  user_agent: string
  criticidade: string
  origem: string
  session_id: string
  browser: string
  os: string
  device: string
  approval_responsible: string
  justification: string
  is_suspicious: boolean
  archived: boolean
}

export interface AuditLogFilters {
  page?: number
  perPage?: number
  user?: string
  startDate?: string
  endDate?: string
  module?: string
  action?: string
  role?: string
  keyword?: string
  criticidade?: string
  origem?: string
  ipAddress?: string
  browser?: string
  os?: string
  device?: string
  sessionId?: string
}

export async function getAuditLogs(filters: AuditLogFilters = {}) {
  const parts: string[] = []
  if (filters.user) parts.push(`user_name ~ "${filters.user.replace(/"/g, '\\"')}"`)
  if (filters.startDate) parts.push(`created >= "${filters.startDate} 00:00:00"`)
  if (filters.endDate) parts.push(`created <= "${filters.endDate} 23:59:59"`)
  if (filters.module) parts.push(`module = "${filters.module}"`)
  if (filters.action) parts.push(`action = "${filters.action}"`)
  if (filters.role) parts.push(`user_role = "${filters.role}"`)
  if (filters.criticidade) parts.push(`criticidade = "${filters.criticidade}"`)
  if (filters.origem) parts.push(`origem = "${filters.origem}"`)
  if (filters.ipAddress) parts.push(`ip_address ~ "${filters.ipAddress.replace(/"/g, '\\"')}"`)
  if (filters.browser) parts.push(`browser = "${filters.browser}"`)
  if (filters.os) parts.push(`os = "${filters.os}"`)
  if (filters.device) parts.push(`device = "${filters.device}"`)
  if (filters.sessionId) parts.push(`session_id ~ "${filters.sessionId.replace(/"/g, '\\"')}"`)
  if (filters.keyword) {
    const kw = filters.keyword.replace(/"/g, '\\"')
    parts.push(
      `(action ~ "${kw}" || module ~ "${kw}" || target_summary ~ "${kw}" || user_name ~ "${kw}" || target_id ~ "${kw}")`,
    )
  }
  parts.push(`archived = false`)
  const filterStr = parts.join(' && ')
  return pb.collection('audit_logs').getList(filters.page || 1, filters.perPage || 25, {
    sort: '-created',
    filter: filterStr || undefined,
  })
}

export async function getSessionLogs(sessionId: string) {
  return pb.collection('audit_logs').getFullList({
    sort: 'created',
    filter: `session_id = "${sessionId}"`,
  })
}

export async function getAuditStats(): Promise<Record<string, number>> {
  const dateStr = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    .toISOString()
    .replace('T', ' ')
    .substring(0, 19)
  const base = `created >= "${dateStr}" && archived = false`
  try {
    const [total, critical, logins, loginFailed, priceChanges, permissionChanges, suspicious] =
      await Promise.all([
        pb.collection('audit_logs').getList(1, 1, { filter: base }),
        pb.collection('audit_logs').getList(1, 1, { filter: `${base} && criticidade = "Crítica"` }),
        pb.collection('audit_logs').getList(1, 1, { filter: `${base} && action = "login"` }),
        pb.collection('audit_logs').getList(1, 1, { filter: `${base} && action = "login_failed"` }),
        pb.collection('audit_logs').getList(1, 1, { filter: `${base} && module = "pricing"` }),
        pb
          .collection('audit_logs')
          .getList(1, 1, { filter: `${base} && action = "permission_change"` }),
        pb.collection('audit_logs').getList(1, 1, { filter: `${base} && is_suspicious = true` }),
      ])
    return {
      total: total.totalItems,
      critical: critical.totalItems,
      logins: logins.totalItems,
      loginFailed: loginFailed.totalItems,
      priceChanges: priceChanges.totalItems,
      permissionChanges: permissionChanges.totalItems,
      suspicious: suspicious.totalItems,
    }
  } catch {
    return {}
  }
}

export async function archiveAuditLog(id: string) {
  await pb.send(`/backend/v1/audit/archive/${id}`, { method: 'POST' })
}

export const AUDIT_MODULE_OPTIONS = [
  { value: 'auth', label: 'Autenticação' },
  { value: 'users', label: 'Usuários' },
  { value: 'partners', label: 'Parceiros' },
  { value: 'services_offered', label: 'Serviços' },
  { value: 'budgets', label: 'Orçamentos' },
  { value: 'site_management', label: 'Gestão do Site' },
  { value: 'vitrine', label: 'Vitrine' },
  { value: 'files', label: 'Arquivos' },
  { value: 'settings', label: 'Configurações' },
  { value: 'pricing', label: 'Precificação' },
  { value: 'stock', label: 'Estoque' },
]

export const AUDIT_ACTION_OPTIONS = [
  { value: 'login', label: 'Login' },
  { value: 'logout', label: 'Logout' },
  { value: 'login_failed', label: 'Login Falhou' },
  { value: 'create', label: 'Criação' },
  { value: 'update', label: 'Edição' },
  { value: 'delete', label: 'Exclusão' },
  { value: 'activate', label: 'Ativação' },
  { value: 'deactivate', label: 'Desativação' },
  { value: 'upload', label: 'Upload' },
  { value: 'delete_file', label: 'Excluir Arquivo' },
  { value: 'permission_change', label: 'Alt. Permissão' },
  { value: 'settings_change', label: 'Alt. Configuração' },
  { value: 'publish', label: 'Publicação' },
]

export const AUDIT_ROLE_OPTIONS = [
  { value: 'SUP', label: 'SUP' },
  { value: 'PADRAO', label: 'PADRÃO' },
  { value: 'SDR', label: 'SDR' },
  { value: 'Vendedor', label: 'Vendedor' },
  { value: 'FINANCEIRO', label: 'Financeiro' },
  { value: 'COMERCIAL', label: 'Comercial' },
]

export const CRITICIDADE_OPTIONS = [
  { value: 'Baixa', label: 'Baixa' },
  { value: 'Média', label: 'Média' },
  { value: 'Alta', label: 'Alta' },
  { value: 'Crítica', label: 'Crítica' },
]

export const ORIGEM_OPTIONS = [
  { value: 'Área da Empresa', label: 'Área da Empresa' },
  { value: 'Portal do Cliente', label: 'Portal do Cliente' },
  { value: 'Portal do Fornecedor', label: 'Portal do Fornecedor' },
  { value: 'Aplicativo', label: 'Aplicativo' },
  { value: 'API', label: 'API' },
  { value: 'Integração', label: 'Integração' },
  { value: 'Importação', label: 'Importação' },
  { value: 'Exportação', label: 'Exportação' },
  { value: 'Inteligência Artificial', label: 'Inteligência Artificial' },
  { value: 'Automação', label: 'Automação' },
  { value: 'Fluxo Inteligente', label: 'Fluxo Inteligente' },
]
