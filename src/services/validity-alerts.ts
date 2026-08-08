import pb from '@/lib/pocketbase/client'
import type { ValidityAlert } from '@/lib/validity-types'

export async function getValidityAlerts(filters?: {
  status?: string
  criticidade?: string
  module?: string
  company?: string
  branch?: string
  search?: string
}): Promise<ValidityAlert[]> {
  const parts: string[] = []
  if (filters?.status) parts.push(`status = "${filters.status}"`)
  if (filters?.criticidade) parts.push(`criticidade = "${filters.criticidade}"`)
  if (filters?.module) parts.push(`module = "${filters.module}"`)
  if (filters?.company) parts.push(`company = "${filters.company}"`)
  if (filters?.branch) parts.push(`branch = "${filters.branch}"`)
  if (filters?.search) {
    parts.push(`(entity_name ~ "${filters.search}" || entity_type ~ "${filters.search}")`)
  }
  const filter = parts.length > 0 ? parts.join(' && ') : undefined
  return pb.collection('validity_alerts').getFullList({
    sort: '-created',
    filter,
    expand: 'rule_id',
  }) as Promise<ValidityAlert[]>
}

export async function getValidityAlert(id: string): Promise<ValidityAlert> {
  return pb
    .collection('validity_alerts')
    .getOne(id, { expand: 'rule_id' }) as Promise<ValidityAlert>
}

export async function validityAlertAction(
  alertId: string,
  action: string,
  justification?: string,
  snoozeDate?: string,
): Promise<{ success: boolean; status: string }> {
  return pb.send('/backend/v1/validity-alerts/action', {
    method: 'POST',
    body: JSON.stringify({ alert_id: alertId, action, justification, snooze_date: snoozeDate }),
    headers: { 'Content-Type': 'application/json' },
  })
}

export async function getValidityDashboardStats(): Promise<Record<string, number>> {
  const alerts = await pb.collection('validity_alerts').getFullList({
    filter: 'status != "Resolvido" && status != "Ignorado"',
  })
  const stats: Record<string, number> = {
    expired: 0,
    today: 0,
    days7: 0,
    days15: 0,
    days30: 0,
    days60: 0,
    days90: 0,
    total: alerts.length,
  }
  for (const a of alerts) {
    const days = (a as Record<string, unknown>).days_remaining as number
    if (days < 0) stats.expired++
    else if (days === 0) stats.today++
    else if (days <= 7) stats.days7++
    else if (days <= 15) stats.days15++
    else if (days <= 30) stats.days30++
    else if (days <= 60) stats.days60++
    else if (days <= 90) stats.days90++
  }
  return stats
}

export async function validityChat(message: string): Promise<{ content: string }> {
  return pb.send('/backend/v1/validity-alerts/chat', {
    method: 'POST',
    body: JSON.stringify({ message }),
    headers: { 'Content-Type': 'application/json' },
  })
}
