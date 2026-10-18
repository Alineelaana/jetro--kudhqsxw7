import { pb } from '@/lib/pocketbase/client'

export interface UserAuditRecord {
  id: string
  name: string
  username?: string
  email: string
  role: string
  perfil_acesso?: string
  active: boolean
  attendant_status?: string
  last_login?: string
  last_ip?: string
  last_city?: string
  last_state?: string
  last_country?: string
  last_device?: string
  location_origin?: 'geolocalizacao_autorizada' | 'ip' | 'nao_disponivel'
  is_online?: boolean
  active_sessions_count?: number
}

export interface AuthEvent {
  id: string
  user_id: string
  user_name: string
  user_email: string
  user_role: string
  event_type:
    | 'login'
    | 'login_failed'
    | 'logout'
    | 'session_expired'
    | 'session_terminated'
    | 'blocked_attempt'
    | 'session_activity'
    | 'additional_auth'
  result: 'sucesso' | 'falha'
  failure_reason?: string
  session_id?: string
  auth_method?: string
  ip_address?: string
  ip_version?: string
  device_type?: string
  os_name?: string
  browser_name?: string
  user_agent?: string
  location_origin?: 'geolocalizacao_autorizada' | 'ip' | 'nao_disponivel'
  latitude?: number | null
  longitude?: number | null
  accuracy_meters?: number | null
  city?: string
  state?: string
  country?: string
  isp_network?: string
  session_ended_at?: string
  created: string
  updated: string
}

export interface AuditSession {
  id: string
  session_id: string
  user_id: string
  user_name: string
  login_time: string
  logout_time?: string
  last_activity?: string
  ip_address: string
  browser: string
  os: string
  device: string
  status: 'active' | 'closed'
  ended_by?: string
  terminated_reason?: string
  is_invalidated?: boolean
  location_origin?: string
  city?: string
  state?: string
  country?: string
  created: string
}

export interface AuditAlert {
  id: string
  alert_type: string
  severity: 'info' | 'warning' | 'critical'
  description: string
  session_id?: string
  user_id?: string
  resolved: boolean
  created: string
}

export interface RetentionPolicy {
  id?: string
  retention_days: number
  anonymize_ip_after_days?: number
  delete_precise_coords_after_days?: number
  legal_basis?: string
  auto_purge_enabled?: boolean
  last_purged_at?: string
  updated_by_name?: string
}

export interface DeviceSummary {
  deviceType: string
  osName: string
  browserName: string
  firstSeen: string
  lastSeen: string
  lastIp: string
  loginCount: number
}

/**
 * Busca consolidada de usuários do sistema enriquecida com os dados da auditoria mais recente de acessos.
 */
export async function fetchUsersAuditOverview(): Promise<UserAuditRecord[]> {
  try {
    const users = await pb.collection('users').getFullList({
      sort: '-created',
    })

    // Buscar últimos eventos de autenticação
    let events: AuthEvent[] = []
    try {
      events = (await pb.collection('auth_events').getFullList({
        sort: '-created',
      })) as unknown as AuthEvent[]
    } catch {
      /* intentionally ignored */
    }

    // Buscar sessões de auditoria
    let sessions: AuditSession[] = []
    try {
      sessions = (await pb.collection('audit_sessions').getFullList({
        sort: '-created',
      })) as unknown as AuditSession[]
    } catch {
      /* intentionally ignored */
    }

    // Buscar também audit_logs legado para preencher campos ausentes
    let legacyLogs: any[] = []
    try {
      legacyLogs = await pb.collection('audit_logs').getFullList({
        filter: 'module = "auth"',
        sort: '-created',
      })
    } catch {
      /* intentionally ignored */
    }

    const now = Date.now()

    return users.map((u) => {
      const userEvents = events.filter(
        (e) => e.user_id === u.id || (e.user_email && e.user_email === u.email),
      )
      const userSessions = sessions.filter((s) => s.user_id === u.id)
      const userLegacyLogs = legacyLogs.filter((l) => l.user_id === u.id || l.user_name === u.name)

      // Sessão ativa recente (online = sessão ativa não invalidada com login/atividade nos últimos 30min)
      const activeSessions = userSessions.filter((s) => {
        if (s.is_invalidated || s.status === 'closed') return false
        const timeRef = s.last_activity || s.login_time || s.created
        if (!timeRef) return false
        const parsedTime = new Date(timeRef.replace(' ', 'T')).getTime()
        // Online se teve atividade nas últimas 2 horas ou hoje
        return !isNaN(parsedTime) && now - parsedTime < 2 * 60 * 60 * 1000
      })

      const isOnline = activeSessions.length > 0

      // Último evento confiável
      const lastEv = userEvents[0]
      const lastSess = userSessions[0]
      const lastLegacy = userLegacyLogs[0]

      const lastLoginTime =
        lastEv?.created || lastSess?.login_time || lastLegacy?.created || undefined
      const lastIp =
        lastEv?.ip_address || lastSess?.ip_address || lastLegacy?.ip_address || undefined
      const lastCity = lastEv?.city || lastSess?.city || undefined
      const lastState = lastEv?.state || lastSess?.state || undefined
      const lastCountry = lastEv?.country || lastSess?.country || undefined
      const lastDevice = lastEv?.device_type || lastSess?.device || lastLegacy?.device || undefined
      const locationOrigin =
        lastEv?.location_origin || (lastSess?.location_origin as any) || undefined

      return {
        id: u.id,
        name: (u.name as string) || (u.email as string)?.split('@')[0] || 'Usuário',
        username: (u.username as string) || (u.email as string)?.split('@')[0],
        email: (u.email as string) || '',
        role: (u.role as string) || 'PADRAO',
        perfil_acesso: (u.perfil_acesso as string) || (u.role as string),
        active: u.active !== false,
        attendant_status: (u.attendant_status as string) || (isOnline ? 'Online' : 'Offline'),
        last_login: lastLoginTime,
        last_ip: lastIp,
        last_city: lastCity,
        last_state: lastState,
        last_country: lastCountry,
        last_device: lastDevice,
        location_origin: locationOrigin,
        is_online: isOnline,
        active_sessions_count: activeSessions.length,
      }
    })
  } catch (err) {
    console.error('fetchUsersAuditOverview error:', err)
    return []
  }
}

/**
 * Busca o histórico completo de eventos de autenticação de um usuário.
 */
export async function fetchUserAuthHistory(userId: string, email?: string): Promise<AuthEvent[]> {
  try {
    let filter = `user_id = "${userId}"`
    if (email) {
      filter += ` || user_email = "${email}"`
    }
    const list = await pb.collection('auth_events').getFullList({
      filter,
      sort: '-created',
    })
    return list as unknown as AuthEvent[]
  } catch (err) {
    console.error('fetchUserAuthHistory error:', err)
    return []
  }
}

/**
 * Busca todas as sessões registradas de um usuário.
 */
export async function fetchUserSessions(userId: string): Promise<AuditSession[]> {
  try {
    const list = await pb.collection('audit_sessions').getFullList({
      filter: `user_id = "${userId}"`,
      sort: '-login_time',
    })
    return list as unknown as AuditSession[]
  } catch (err) {
    console.error('fetchUserSessions error:', err)
    return []
  }
}

/**
 * Busca alertas de segurança vinculados a um usuário.
 */
export async function fetchUserAlerts(userId: string): Promise<AuditAlert[]> {
  try {
    const list = await pb.collection('audit_alerts').getFullList({
      filter: `user_id = "${userId}"`,
      sort: '-created',
    })
    return list as unknown as AuditAlert[]
  } catch (err) {
    console.error('fetchUserAlerts error:', err)
    return []
  }
}

/**
 * Encerra remotamente uma sessão ou todas as sessões de um usuário no backend.
 */
export async function terminateUserSession(params: {
  userId?: string
  sessionId?: string
  terminateAll?: boolean
  reason?: string
}): Promise<{ ok: boolean; terminated_count?: number; error?: string }> {
  try {
    const res = await pb.send('/backend/v1/sessions/terminate', {
      method: 'POST',
      body: JSON.stringify({
        user_id: params.userId,
        session_id: params.sessionId,
        terminate_all: params.terminateAll,
        reason: params.reason || 'Encerramento administrativo via painel',
      }),
      headers: { 'Content-Type': 'application/json' },
    })
    return res
  } catch (err: any) {
    console.error('terminateUserSession error:', err)
    return { ok: false, error: err?.message || 'Falha ao encerrar sessão' }
  }
}

/**
 * Registra consulta a informações restritas/sensíveis (LGPD).
 */
export async function logSensitiveAccessConsultation(params: {
  targetUserId: string
  targetUserName?: string
  actionConsulted:
    | 'visualizar_coordenadas_precisas'
    | 'consultar_historico_acessos'
    | 'exportar_relatorio_acessos'
    | 'encerrar_sessao_remota'
  justification?: string
}): Promise<void> {
  try {
    await pb.send('/backend/v1/audit/log-consultation', {
      method: 'POST',
      body: JSON.stringify(params),
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.warn('logSensitiveAccessConsultation warning:', err)
  }
}

/**
 * Busca a política de retenção configurada.
 */
export async function fetchRetentionPolicy(): Promise<RetentionPolicy | null> {
  try {
    const list = await pb.collection('auth_retention_policies').getList(1, 1, {
      sort: '-created',
    })
    if (list.items.length > 0) {
      const item = list.items[0]
      return {
        id: item.id,
        retention_days: Number(item.retention_days) || 365,
        anonymize_ip_after_days: Number(item.anonymize_ip_after_days) || 180,
        delete_precise_coords_after_days: Number(item.delete_precise_coords_after_days) || 90,
        legal_basis: (item.legal_basis as string) || 'LGPD Art. 7º IX - Legítimo Interesse',
        auto_purge_enabled: item.auto_purge_enabled !== false,
        last_purged_at: (item.last_purged_at as string) || undefined,
        updated_by_name: (item.updated_by_name as string) || undefined,
      }
    }
  } catch {
    /* intentionally ignored */
  }
  return null
}

/**
 * Salva a política de retenção.
 */
export async function saveRetentionPolicy(policy: RetentionPolicy): Promise<RetentionPolicy> {
  if (policy.id) {
    const updated = await pb.collection('auth_retention_policies').update(policy.id, policy as any)
    return updated as unknown as RetentionPolicy
  } else {
    const created = await pb.collection('auth_retention_policies').create(policy as any)
    return created as unknown as RetentionPolicy
  }
}

/**
 * Agrupa eventos em histórico consolidado de dispositivos (tipo, SO, navegador, IPs, primeiro/último uso).
 */
export function aggregateUserDevices(events: AuthEvent[]): DeviceSummary[] {
  const map = new Map<string, DeviceSummary>()

  for (const ev of events) {
    const key = `${ev.device_type || 'Desktop'}-${ev.os_name || 'Desconhecido'}-${ev.browser_name || 'Desconhecido'}`
    const existing = map.get(key)
    if (!existing) {
      map.set(key, {
        deviceType: ev.device_type || 'Desktop',
        osName: ev.os_name || 'Desconhecido',
        browserName: ev.browser_name || 'Desconhecido',
        firstSeen: ev.created,
        lastSeen: ev.created,
        lastIp: ev.ip_address || '—',
        loginCount: 1,
      })
    } else {
      existing.loginCount++
      if (new Date(ev.created) > new Date(existing.lastSeen)) {
        existing.lastSeen = ev.created
        existing.lastIp = ev.ip_address || existing.lastIp
      }
      if (new Date(ev.created) < new Date(existing.firstSeen)) {
        existing.firstSeen = ev.created
      }
    }
  }

  return Array.from(map.values()).sort(
    (a, b) => new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime(),
  )
}
