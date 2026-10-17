import pb from '@/lib/pocketbase/client'
import type {
  PlatformMonitoringEntry,
  MonitoringServiceType,
  MonitoringStatus,
} from '@/lib/platform-layer-types'

export async function getMonitoringEntries(filters?: {
  serviceType?: MonitoringServiceType
  status?: MonitoringStatus
}): Promise<PlatformMonitoringEntry[]> {
  const parts: string[] = []
  if (filters?.serviceType) parts.push(`service_type = "${filters.serviceType}"`)
  if (filters?.status) parts.push(`status = "${filters.status}"`)
  return pb.collection('platform_monitoring').getFullList({
    sort: 'service_type',
    filter: parts.length ? parts.join(' && ') : undefined,
  }) as Promise<PlatformMonitoringEntry[]>
}

export async function upsertMonitoringEntry(data: {
  service_name: string
  service_type: MonitoringServiceType
  status: MonitoringStatus
  last_run_at?: string
  next_run_at?: string
  last_result?: string
  error_count?: number
  success_count?: number
  avg_duration_ms?: number
  details?: Record<string, unknown>
  company?: string
  branch?: string
}): Promise<PlatformMonitoringEntry> {
  try {
    const existing = await pb
      .collection('platform_monitoring')
      .getFirstListItem(
        `service_name = "${data.service_name}" && service_type = "${data.service_type}"`,
      )
    return pb
      .collection('platform_monitoring')
      .update(existing.id, data) as Promise<PlatformMonitoringEntry>
  } catch {
    return pb.collection('platform_monitoring').create(data) as Promise<PlatformMonitoringEntry>
  }
}

export interface SummaryData {
  total: number
  healthy: number
  degraded: number
  down: number
  unknown: number
  byType: Record<string, number>
}

export async function getMonitoringSummary(): Promise<SummaryData> {
  const entries = await getMonitoringEntries()
  const summary = {
    total: entries.length,
    healthy: entries.filter((e) => e.status === 'healthy').length,
    degraded: entries.filter((e) => e.status === 'degraded').length,
    down: entries.filter((e) => e.status === 'down').length,
    unknown: entries.filter((e) => e.status === 'unknown').length,
    byType: {} as Record<string, number>,
  }
  for (const e of entries) {
    summary.byType[e.service_type] = (summary.byType[e.service_type] || 0) + 1
  }
  return summary
}

export async function getIntegrationStatus(): Promise<PlatformMonitoringEntry[]> {
  return getMonitoringEntries({ serviceType: 'integration' })
}

export async function getCronStatus(): Promise<PlatformMonitoringEntry[]> {
  return getMonitoringEntries({ serviceType: 'cron' })
}
