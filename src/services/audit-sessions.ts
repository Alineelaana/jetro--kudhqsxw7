import pb from '@/lib/pocketbase/client'

export interface AuditSession {
  id: string
  session_id: string
  user_id: string
  user_name: string
  login_time: string
  logout_time: string
  ip_address: string
  browser: string
  os: string
  device: string
  origin: string
  status: string
  created: string
  updated: string
}

export async function getAuditSessions(filters?: { userId?: string; status?: string }) {
  const parts: string[] = []
  if (filters?.userId) parts.push(`user_id = "${filters.userId}"`)
  if (filters?.status) parts.push(`status = "${filters.status}"`)
  return pb.collection('audit_sessions').getFullList({
    sort: '-created',
    filter: parts.join(' && ') || undefined,
  })
}

export async function getSessionBySessionId(sessionId: string) {
  try {
    return await pb.collection('audit_sessions').getFirstListItem(`session_id = "${sessionId}"`)
  } catch {
    return null
  }
}
