import pb from '@/lib/pocketbase/client'

export async function listConfig(collection: string, sort = '-created') {
  return pb.collection(collection).getFullList({ sort })
}

export async function listConfigPaged(
  collection: string,
  page: number,
  perPage: number,
  filter?: string,
) {
  return pb
    .collection(collection)
    .getList(page, perPage, { sort: '-created', filter: filter || undefined })
}

export async function createConfig(collection: string, data: Record<string, unknown>) {
  return pb.collection(collection).create(data)
}

export async function updateConfig(collection: string, id: string, data: Record<string, unknown>) {
  return pb.collection(collection).update(id, data)
}

export async function deleteConfig(collection: string, id: string) {
  return pb.collection(collection).delete(id)
}

export async function listApiCredentials() {
  return pb.collection('api_credentials').getFullList({
    sort: '-created',
    fields:
      'id,app_name,api_key,company,branch,permissions,expires_at,rate_limit,status,last_used_at,request_count,created,updated,active',
  })
}

export async function listApiRequestLogs(appName?: string) {
  const filter = appName ? `app_name = "${appName}"` : undefined
  return pb.collection('api_request_logs').getList(1, 50, { sort: '-created', filter })
}

export function generateApiKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let key = 'sk_'
  for (let i = 0; i < 32; i++) key += chars[Math.floor(Math.random() * chars.length)]
  return key
}

export function generateApiSecret(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let secret = ''
  for (let i = 0; i < 48; i++) secret += chars[Math.floor(Math.random() * chars.length)]
  return secret
}

export function maskKey(key: string): string {
  if (!key || key.length < 10) return key
  return key.slice(0, 8) + '••••••••••••••••'
}

export async function updateDocTemplateWithVersion(
  id: string,
  data: Record<string, unknown>,
  userName: string,
) {
  const existing = await pb.collection('document_templates').getOne(id)
  await pb.collection('document_template_versions').create({
    template_id: id,
    template_name: existing.name,
    version_data: JSON.stringify(existing),
    version_number: existing.version_number || 1,
    created_by: userName,
  })
  return pb.collection('document_templates').update(id, {
    ...data,
    version_number: (existing.version_number || 1) + 1,
  })
}

export async function getDocTemplateVersions(templateId: string) {
  return pb.collection('document_template_versions').getFullList({
    sort: '-version_number',
    filter: `template_id = "${templateId}"`,
  })
}

export async function logImportExport(data: Record<string, unknown>) {
  return pb.collection('import_export_history').create(data)
}

export async function getImportExportHistory() {
  return pb.collection('import_export_history').getFullList({ sort: '-created' })
}

export async function getActiveSessions() {
  return pb.collection('audit_sessions').getList(1, 20, {
    sort: '-created',
    filter: `status = 'active'`,
  })
}

export async function getLoginAttempts() {
  return pb.collection('audit_logs').getList(1, 10, {
    sort: '-created',
    filter: `action = 'login' || action = 'login_failed'`,
  })
}

export function exportToCsv(records: Record<string, unknown>[], filename: string) {
  if (!records.length) return
  const headers = Object.keys(records[0])
  const lines = [headers.join(',')]
  for (const r of records) {
    lines.push(headers.map((h) => `"${String(r[h] ?? '').replace(/"/g, '""')}"`).join(','))
  }
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
