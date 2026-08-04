import pb from '@/lib/pocketbase/client'

export interface AuditAlert {
  id: string
  alert_type: string
  severity: string
  description: string
  audit_log_id: string
  session_id: string
  user_id: string
  resolved: boolean
  resolved_by: string
  resolved_at: string
  created: string
  updated: string
}

export async function getAuditAlerts(resolved?: boolean): Promise<AuditAlert[]> {
  const filter = resolved !== undefined ? `resolved = ${resolved}` : undefined
  return pb.collection('audit_alerts').getFullList({
    sort: '-created',
    filter,
  }) as Promise<AuditAlert[]>
}

export async function resolveAuditAlert(id: string): Promise<void> {
  await pb.send('/backend/v1/audit-alerts/resolve', {
    method: 'POST',
    body: JSON.stringify({ alert_id: id }),
    headers: { 'Content-Type': 'application/json' },
  })
}
