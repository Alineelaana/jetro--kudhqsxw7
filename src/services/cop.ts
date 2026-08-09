import pb from '@/lib/pocketbase/client'
import type { CopHealthResult, CopMigration, CopErrorItem, TriageUpdate } from '@/lib/cop-types'

export async function getHealthCheck(): Promise<CopHealthResult> {
  return pb.send('/backend/v1/cop/health', { method: 'GET' })
}

export async function getMigrationsAudit(): Promise<{
  items: CopMigration[]
  total: number
  table_found: boolean
}> {
  return pb.send('/backend/v1/cop/migrations', { method: 'GET' })
}

export async function updateTriage(
  collection: 'audit_logs' | 'audit_alerts',
  id: string,
  data: TriageUpdate,
): Promise<void> {
  await pb.send(`/backend/v1/cop/triage/${collection}/${id}`, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
  })
}

export async function getErrorList(): Promise<{ items: CopErrorItem[]; total: number }> {
  return pb.send('/backend/v1/cop/errors', { method: 'GET' })
}

export async function getSecurityData(): Promise<{
  sessions: Record<string, unknown>[]
  alerts: Record<string, unknown>[]
  failedLogins: number
}> {
  return pb.send('/backend/v1/cop/security', { method: 'GET' })
}
