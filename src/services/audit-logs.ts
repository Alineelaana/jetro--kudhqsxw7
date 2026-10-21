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
  empresa: string
  filial: string
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
  empresa?: string
  filial?: string
}

function escapeFilter(val: string): string {
  return val.replace(/"/g, '\\"')
}

export async function getAuditLogs(filters: AuditLogFilters = {}) {
  const parts: string[] = []
  if (filters.user) parts.push(`user_name ~ "${escapeFilter(filters.user)}"`)
  if (filters.startDate) parts.push(`created >= "${filters.startDate} 00:00:00"`)
  if (filters.endDate) parts.push(`created <= "${filters.endDate} 23:59:59"`)
  if (filters.module) parts.push(`module = "${filters.module}"`)
  if (filters.action) parts.push(`action = "${filters.action}"`)
  if (filters.role) parts.push(`user_role = "${filters.role}"`)
  if (filters.criticidade) parts.push(`criticidade = "${filters.criticidade}"`)
  if (filters.origem) parts.push(`origem = "${filters.origem}"`)
  if (filters.ipAddress) parts.push(`ip_address ~ "${escapeFilter(filters.ipAddress)}"`)
  if (filters.browser) parts.push(`browser = "${filters.browser}"`)
  if (filters.os) parts.push(`os = "${filters.os}"`)
  if (filters.device) parts.push(`device = "${filters.device}"`)
  if (filters.sessionId) parts.push(`session_id ~ "${escapeFilter(filters.sessionId)}"`)
  if (filters.empresa) parts.push(`empresa ~ "${escapeFilter(filters.empresa)}"`)
  if (filters.filial) parts.push(`filial ~ "${escapeFilter(filters.filial)}"`)
  if (filters.keyword) {
    const kw = escapeFilter(filters.keyword)
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

export async function getAuditLog(id: string): Promise<AuditLog> {
  return pb.collection('audit_logs').getOne(id) as Promise<AuditLog>
}

export async function getSessionLogs(sessionId: string): Promise<AuditLog[]> {
  return pb.collection('audit_logs').getFullList({
    sort: 'created',
    filter: `session_id = "${sessionId}" && archived = false`,
  }) as Promise<AuditLog[]>
}

export async function getAuditStats(): Promise<Record<string, number>> {
  const dateStr = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    .toISOString()
    .replace('T', ' ')
    .substring(0, 19)
  const base = `created >= "${dateStr}" && archived = false`
  const queries: Array<[string, string]> = [
    ['total', base],
    ['critical', `${base} && criticidade = "Crítica"`],
    ['logins', `${base} && action = "login"`],
    ['loginFailed', `${base} && action = "login_failed"`],
    ['priceChanges', `${base} && module = "pricing"`],
    [
      'fiscalChanges',
      `${base} && (module ~ "fiscal" || target_collection ~ "nfe" || target_collection ~ "nfce")`,
    ],
    ['financialChanges', `${base} && (module ~ "finance" || module ~ "financial")`],
    ['permissionChanges', `${base} && action = "permission_change"`],
    ['exports', `${base} && origem = "Exportação"`],
    ['imports', `${base} && origem = "Importação"`],
    ['aiActions', `${base} && origem = "Inteligência Artificial"`],
    ['apiActions', `${base} && origem = "API"`],
    ['integrationActions', `${base} && origem = "Integração"`],
    ['suspicious', `${base} && is_suspicious = true`],
  ]
  try {
    const results = await Promise.all(
      queries.map(([, filter]) => pb.collection('audit_logs').getList(1, 1, { filter })),
    )
    const stats: Record<string, number> = {}
    queries.forEach(([key], i) => {
      stats[key] = results[i].totalItems
    })
    return stats
  } catch {
    return {}
  }
}

export async function searchAuditByEntity(
  entityType: string,
  searchTerm: string,
): Promise<AuditLog[]> {
  const ENTITY_MAP: Record<string, string> = {
    usuario: 'users',
    agenda: 'jetro_agenda_appointments',
    tarefa: 'jetro_agenda_appointments',
    convite: 'jetro_agenda_invitations',
    cliente: 'partners',
    fornecedor: 'partners',
    produto: 'products',
    pedido: 'sales_orders',
    nota_fiscal: 'nfe_records',
    titulo_financeiro: 'contas_bancarias',
    chamado: 'chat_conversations',
    contrato: 'contracts_operations',
    empresa: 'empresas',
    filial: 'filiais',
  }
  const parts: string[] = []
  if (entityType && ENTITY_MAP[entityType]) {
    parts.push(`target_collection = "${ENTITY_MAP[entityType]}"`)
  }
  if (searchTerm) {
    const kw = escapeFilter(searchTerm)
    parts.push(`(target_id = "${kw}" || target_summary ~ "${kw}" || user_name ~ "${kw}")`)
  }
  parts.push(`archived = false`)
  return pb.collection('audit_logs').getFullList({
    sort: 'created',
    filter: parts.join(' && '),
  }) as Promise<AuditLog[]>
}

export async function archiveAuditLog(id: string) {
  await pb.send(`/backend/v1/audit/archive/${id}`, { method: 'POST' })
}

export interface RegisterAuditLogInput {
  action: string
  module?: string
  target_collection?: string
  target_id?: string
  target_summary?: string
  previous_value?: Record<string, unknown> | null
  new_value?: Record<string, unknown> | null
  criticidade?: 'Baixa' | 'Média' | 'Alta' | 'Crítica'
  justification?: string
}

export async function registerAuditLog(input: RegisterAuditLogInput): Promise<void> {
  try {
    const authRecord = pb.authStore.record as {
      id?: string
      name?: string
      email?: string
      role?: string
      perfil_acesso?: string
      empresa_id?: string
      filial_id?: string
    } | null

    const userName = authRecord?.name || authRecord?.email || 'Sistema'
    const userRole = authRecord?.role || authRecord?.perfil_acesso || 'PADRAO'

    await pb.collection('audit_logs').create({
      user_id: authRecord?.id || '',
      user_name: userName,
      user_role: userRole,
      action: input.action,
      module: input.module || 'agenda',
      target_collection: input.target_collection || 'jetro_agenda_appointments',
      target_id: input.target_id || '',
      target_summary: input.target_summary || '',
      previous_value: input.previous_value || null,
      new_value: input.new_value || null,
      criticidade: input.criticidade || 'Baixa',
      origem: 'Área da Empresa',
      empresa: authRecord?.empresa_id || '',
      filial: authRecord?.filial_id || '',
      justification: input.justification || '',
      archived: false,
      is_suspicious: false,
    })
  } catch (err) {
    console.warn('Erro ao registrar log de auditoria:', err)
  }
}
