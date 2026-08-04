import pb from '@/lib/pocketbase/client'

export interface AuditAlertConfig {
  allowed_hours_start: string
  allowed_hours_end: string
  max_failed_logins: number
  max_failed_logins_window_min: number
  max_logins_per_hour: number
  max_changes_per_15min: number
  max_exports_per_hour: number
  max_imports_per_hour: number
  price_change_threshold_pct: number
  margin_change_threshold_pct: number
  cost_change_threshold_pct: number
  tax_change_threshold_pct: number
  multi_device_login_alert: boolean
  email_notifications_enabled: boolean
  notification_email: string
  auto_archive_enabled: boolean
  auto_archive_days: number
  scheduled_report_enabled: boolean
  scheduled_report_frequency: 'daily' | 'weekly' | 'monthly'
  scheduled_report_email: string
  scheduled_report_format: 'pdf' | 'excel'
}

export const DEFAULT_AUDIT_CONFIG: AuditAlertConfig = {
  allowed_hours_start: '06:00',
  allowed_hours_end: '22:00',
  max_failed_logins: 5,
  max_failed_logins_window_min: 5,
  max_logins_per_hour: 3,
  max_changes_per_15min: 20,
  max_exports_per_hour: 10,
  max_imports_per_hour: 10,
  price_change_threshold_pct: 20,
  margin_change_threshold_pct: 15,
  cost_change_threshold_pct: 15,
  tax_change_threshold_pct: 10,
  multi_device_login_alert: true,
  email_notifications_enabled: false,
  notification_email: '',
  auto_archive_enabled: false,
  auto_archive_days: 90,
  scheduled_report_enabled: false,
  scheduled_report_frequency: 'weekly',
  scheduled_report_email: '',
  scheduled_report_format: 'pdf',
}

export async function getAuditConfig(): Promise<AuditAlertConfig> {
  try {
    const res = await pb.send('/backend/v1/audit/settings', { method: 'GET' })
    return { ...DEFAULT_AUDIT_CONFIG, ...res }
  } catch {
    return DEFAULT_AUDIT_CONFIG
  }
}

export async function updateAuditConfig(config: AuditAlertConfig): Promise<void> {
  await pb.send('/backend/v1/audit/settings', {
    method: 'POST',
    body: JSON.stringify(config),
    headers: { 'Content-Type': 'application/json' },
  })
}

export async function triggerAutoArchive(): Promise<{ archived: number; cutoff: string }> {
  return pb.send('/backend/v1/audit/auto-archive', { method: 'POST' })
}

export async function triggerScheduledReport(): Promise<{
  success: boolean
  stats: { total: number; critical: number; logins: number; failedLogins: number }
}> {
  return pb.send('/backend/v1/audit/scheduled-report', { method: 'POST' })
}
