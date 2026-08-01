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
}

export async function getAuditLogs(filters: AuditLogFilters = {}) {
  const parts: string[] = []
  if (filters.user) {
    const u = filters.user.replace(/"/g, '\\"')
    parts.push(`user_name ~ "${u}"`)
  }
  if (filters.startDate) {
    parts.push(`created >= "${filters.startDate} 00:00:00"`)
  }
  if (filters.endDate) {
    parts.push(`created <= "${filters.endDate} 23:59:59"`)
  }
  if (filters.module) {
    parts.push(`module = "${filters.module}"`)
  }
  if (filters.action) {
    parts.push(`action = "${filters.action}"`)
  }
  if (filters.role) {
    parts.push(`user_role = "${filters.role}"`)
  }
  if (filters.keyword) {
    const kw = filters.keyword.replace(/"/g, '\\"')
    parts.push(
      `(action ~ "${kw}" || module ~ "${kw}" || target_summary ~ "${kw}" || user_name ~ "${kw}" || target_id ~ "${kw}")`,
    )
  }
  const filterStr = parts.join(' && ')
  return pb.collection('audit_logs').getList(filters.page || 1, filters.perPage || 25, {
    sort: '-created',
    filter: filterStr || undefined,
  })
}

export const AUDIT_MODULE_OPTIONS = [
  { value: 'auth', label: 'Autenticação' },
  { value: 'users', label: 'Usuários' },
  { value: 'partners', label: 'Parceiros' },
  { value: 'services_offered', label: 'Serviços Prestados' },
  { value: 'budgets', label: 'Orçamentos' },
  { value: 'site_management', label: 'Gestão do Site' },
  { value: 'vitrine', label: 'Vitrine' },
  { value: 'files', label: 'Arquivos' },
  { value: 'settings', label: 'Configurações' },
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
  { value: 'delete_file', label: 'Exclusão de Arquivo' },
  { value: 'permission_change', label: 'Alteração de Permissão' },
  { value: 'settings_change', label: 'Alteração de Configuração' },
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
