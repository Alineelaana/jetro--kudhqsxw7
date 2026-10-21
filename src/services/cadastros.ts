import pb from '@/lib/pocketbase/client'
import { mergeCollectionTenantFilter, withTenantData, TENANT_COLLECTIONS } from '@/lib/multitenancy'
import type { CadastroRecord } from '@/lib/cadastros-types'

export async function listCadastros(
  collection: string,
  filter?: string,
): Promise<CadastroRecord[]> {
  const merged = mergeCollectionTenantFilter(collection, filter)
  return pb.collection(collection).getFullList({
    sort: '-created',
    filter: merged || undefined,
  }) as Promise<CadastroRecord[]>
}

export async function createCadastro(
  collection: string,
  data: Record<string, unknown>,
): Promise<CadastroRecord> {
  const fieldName = TENANT_COLLECTIONS[collection]
  const tenantData = fieldName ? withTenantData(data, fieldName) : data
  return pb.collection(collection).create(tenantData) as Promise<CadastroRecord>
}

export async function createCadastroFormData(
  collection: string,
  formData: FormData,
): Promise<CadastroRecord> {
  return pb.collection(collection).create(formData) as Promise<CadastroRecord>
}

export async function updateCadastro(
  collection: string,
  id: string,
  data: Record<string, unknown>,
): Promise<CadastroRecord> {
  return pb.collection(collection).update(id, data) as Promise<CadastroRecord>
}

export async function updateCadastroFormData(
  collection: string,
  id: string,
  formData: FormData,
): Promise<CadastroRecord> {
  return pb.collection(collection).update(id, formData) as Promise<CadastroRecord>
}

export async function deleteCadastro(collection: string, id: string): Promise<void> {
  await pb.collection(collection).delete(id)
}

function escapeHtml(str: string): string {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function exportCadastrosXls(collection: string, records: CadastroRecord[]): void {
  const safe = Array.isArray(records) ? records.filter(Boolean) : []
  const dt = new Date().toLocaleString('pt-BR')
  const rows = safe
    .map(
      (r) =>
        `<tr><td>${escapeHtml(r.code || '—')}</td><td>${escapeHtml(r.name || '—')}</td><td>${r.active !== false ? 'Ativo' : 'Inativo'}</td><td>${escapeHtml(r.responsible_user || '—')}</td><td>${escapeHtml(r.created || '—')}</td></tr>`,
    )
    .join('')
  const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="UTF-8"></head><body><table border="1"><tr><td colspan="5"><strong>${collection} — Jetro</strong></td></tr><tr><td colspan="5">Gerado em: ${escapeHtml(dt)}</td></tr><tr style="background:#005B2E;color:#fff;font-weight:bold"><th>Código</th><th>Nome</th><th>Situação</th><th>Responsável</th><th>Data Cadastro</th></tr>${rows}</table></body></html>`
  const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${collection}_${new Date().toISOString().split('T')[0]}.xls`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export async function importCsv(
  collection: string,
  text: string,
  userName: string,
): Promise<number> {
  const lines = text.trim().split('\n')
  if (lines.length < 2) return 0
  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase())
  let count = 0
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',')
    const row: Record<string, unknown> = { active: true, responsible_user: userName }
    headers.forEach((h, idx) => {
      row[h] = (values[idx] || '').trim()
    })
    if (!row.name) continue
    try {
      await pb.collection(collection).create(row)
      count++
    } catch {
      /* skip */
    }
  }
  return count
}
