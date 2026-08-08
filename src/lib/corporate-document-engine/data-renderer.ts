import type { DocumentConfig } from './types'
import { CORPORATE_IDENTITY } from './identity'
import { formatStampHtml } from './stamp'

function escapeHtml(str: string): string {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function slugify(t: string): string {
  return t.toLowerCase().replace(/\s+/g, '_')
}

export function renderCsvDocument(config: DocumentConfig): string {
  const BOM = '\uFEFF'
  const escapeValue = (val: string | number): string => {
    const s = String(val ?? '')
    if (s.includes(';') || s.includes('"') || s.includes('\n') || s.includes('\r')) {
      return `"${s.replace(/"/g, '""')}"`
    }
    return s
  }

  const lines: string[] = []
  for (const section of config.sections) {
    if (section.headers?.length && section.rows?.length) {
      lines.push(section.headers.map(escapeValue).join(';'))
      for (const row of section.rows) {
        lines.push(row.map(escapeValue).join(';'))
      }
      lines.push('')
    }
  }

  const csvContent = BOM + lines.join('\r\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${slugify(config.title)}_${new Date().toISOString().split('T')[0]}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  return `${slugify(config.title)}.csv`
}

export function renderExcelDocument(config: DocumentConfig): string {
  const genDate = new Date().toLocaleString('pt-BR')
  const stampText = formatStampHtml(config.stamp)
  const c = CORPORATE_IDENTITY

  let tablesHtml = ''
  for (const section of config.sections) {
    if (section.headers?.length && section.rows?.length) {
      const headerHtml = section.headers.map((h) => `<th>${escapeHtml(h)}</th>`).join('')
      const rowsHtml = section.rows
        .map(
          (row) =>
            `<tr>${row.map((cell) => `<td>${escapeHtml(String(cell ?? '—'))}</td>`).join('')}</tr>`,
        )
        .join('')
      tablesHtml += `<tr><td colspan="${section.headers.length}" style="font-weight:bold;background:${c.primaryColor};color:#fff">${escapeHtml(section.title)}</td></tr>`
      tablesHtml += `<tr style="background:${c.primaryColor};color:#fff;font-weight:bold">${headerHtml}</tr>`
      tablesHtml += rowsHtml
      tablesHtml += '<tr><td colspan="' + section.headers.length + '"></td></tr>'
    }
  }

  const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="UTF-8"></head><body>
<table border="1">
<tr><td colspan="10" style="background:${c.primaryColor};color:#fff;font-weight:bold;font-size:14px">${c.systemName} — ${escapeHtml(config.title)}</td></tr>
<tr><td colspan="10">Módulo: ${escapeHtml(config.module)} | Gerado em: ${escapeHtml(genDate)} | Por: ${escapeHtml(config.stamp.userName)}</td></tr>
<tr><td colspan="10">${escapeHtml(stampText)}</td></tr>
<tr><td colspan="10"></td></tr>
${tablesHtml}
</table></body></html>`

  const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${slugify(config.title)}_${new Date().toISOString().split('T')[0]}.xls`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  return `${slugify(config.title)}.xls`
}
