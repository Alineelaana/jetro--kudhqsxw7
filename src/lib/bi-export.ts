import { exportCsv } from '@/lib/csv-export'
import { logBIExport } from '@/services/bi'
import { generateDocument } from '@/lib/corporate-document-engine'
import { buildStamp } from '@/lib/corporate-document-engine/stamp'
import type { DocumentSection, ExportFormat } from '@/lib/corporate-document-engine/types'
import { useAuth } from '@/hooks/use-auth'
import { useOrgFilter } from '@/hooks/use-org-filter'

function getStamp(userName: string) {
  return buildStamp({
    user: { name: userName },
    empresaId: '',
    filialId: '',
    module: 'bi',
    documentType: 'report',
  })
}

export function exportBICsv(
  title: string,
  headers: string[],
  rows: (string | number)[][],
  userName: string,
) {
  exportCsv(title, headers, rows)
  logBIExport('CSV', `${title} por ${userName}`)
}

export async function exportBIPdf(
  title: string,
  userName: string,
  sections: Array<{ title: string; rows: string[][] }>,
) {
  const docSections: DocumentSection[] = sections.map((s) => ({
    title: s.title,
    headers: s.rows[0]?.map((_, i) => `Col ${i + 1}`) || [],
    rows: s.rows,
  }))
  await generateDocument({
    title,
    module: 'bi',
    documentType: 'report',
    format: 'pdf' as ExportFormat,
    sections: docSections,
    stamp: getStamp(userName),
    recordCount: sections.reduce((acc, s) => acc + s.rows.length, 0),
  })
  logBIExport('PDF', `${title} por ${userName}`)
}

export async function exportBIImage(title: string, userName: string) {
  await generateDocument({
    title,
    module: 'bi',
    documentType: 'chart',
    format: 'png' as ExportFormat,
    sections: [],
    stamp: getStamp(userName),
  })
  logBIExport('PNG', `${title} por ${userName}`)
}

export function exportBIPrint(title: string, userName: string) {
  logBIExport('Print', `${title} por ${userName}`)
  window.print()
}
