import pb from '@/lib/pocketbase/client'

export interface BackupRecord {
  id: string
  version_name: string
  backup_type: 'full' | 'database' | 'files' | 'config'
  file: string
  file_size: number
  observations: string
  status: string
  created_by_name: string
  created_by_role: string
  auto_generated: boolean
  created: string
}

export interface BackupSettings {
  daily: boolean
  weekly: boolean
  type: string
  last_run: string
}

export async function createBackup(params: {
  backup_type: string
  version_name: string
  observations?: string
}) {
  return pb.send('/backend/v1/backup/create', {
    method: 'POST',
    body: JSON.stringify(params),
    headers: { 'Content-Type': 'application/json' },
  })
}

export async function listBackups(): Promise<{ items: BackupRecord[] }> {
  return pb.send('/backend/v1/backup/list', { method: 'GET' })
}

export async function downloadBackup(
  id: string,
): Promise<{ download_url: string; file_name: string }> {
  return pb.send(`/backend/v1/backup/${id}/download`, { method: 'POST' })
}

export async function restoreBackup(id: string) {
  return pb.send(`/backend/v1/backup/${id}/restore`, { method: 'POST' })
}

export async function deleteBackup(id: string) {
  return pb.send(`/backend/v1/backup/${id}/delete`, { method: 'POST' })
}

export async function getBackupSettings(): Promise<BackupSettings> {
  return pb.send('/backend/v1/backup/settings', { method: 'GET' })
}

export async function updateBackupSettings(params: Partial<BackupSettings>) {
  return pb.send('/backend/v1/backup/settings', {
    method: 'POST',
    body: JSON.stringify(params),
    headers: { 'Content-Type': 'application/json' },
  })
}

export async function checkAutoBackup() {
  return pb.send('/backend/v1/backup/auto-check', { method: 'POST' })
}

export function formatFileSize(bytes: number): string {
  if (!bytes || bytes === 0) return '—'
  const units = ['B', 'KB', 'MB', 'GB']
  let size = bytes
  let unitIdx = 0
  while (size >= 1024 && unitIdx < units.length - 1) {
    size /= 1024
    unitIdx++
  }
  return `${size.toFixed(1)} ${units[unitIdx]}`
}

export async function downloadBackupFile(id: string, fileName: string) {
  const url = `${import.meta.env.VITE_POCKETBASE_URL}/api/files/backups/${id}/${fileName}`
  const res = await fetch(url, {
    headers: { Authorization: pb.authStore.token || '' },
  })
  if (!res.ok) throw new Error('Falha ao baixar backup')
  const blob = await res.blob()
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(a.href)
}
