import logoUrl from '@/assets/chatgpt-image-1-de-ago.de-2026-103549-f6f46.png'
import { exportToCsv } from '@/services/configuracoes'

function escapeHtml(str: string): string {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function printWmsReport(
  title: string,
  headers: string[],
  rows: string[][],
  userName: string,
): void {
  const fullLogoUrl = new URL(logoUrl, window.location.href).href
  const genDate = new Date().toLocaleString('pt-BR')
  const headerHtml = headers.map((h) => `<th>${escapeHtml(h)}</th>`).join('')
  const rowsHtml = rows
    .map(
      (r, i) =>
        `<tr class="${i % 2 === 0 ? '' : 'alt'}">${r.map((c) => `<td>${escapeHtml(c)}</td>`).join('')}</tr>`,
    )
    .join('')
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${escapeHtml(title)}</title>
<style>@page{size:A4;margin:0}*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Segoe UI',Arial,sans-serif}
.stripe{background:linear-gradient(135deg,#005B2E,#01361D);height:8mm}.content{padding:8mm 15mm}
.header{display:flex;justify-content:space-between;align-items:center;margin-bottom:5mm}
.header img{height:40px}.header h1{color:#005B2E;font-size:20px}.header .meta{font-size:10px;color:#666;text-align:right}
table{width:100%;border-collapse:collapse;font-size:10px;margin-top:3mm}
th{background:#005B2E;color:#fff;padding:6px;text-align:left}td{padding:5px;border-bottom:1px solid #e0e0e0}
tr.alt{background:#f7f7f5}.footer{margin-top:5mm;font-size:9px;color:#666;border-top:1px solid #ddd;padding-top:3mm}
</style></head><body><div class="stripe"></div><div class="content">
<div class="header"><img src="${fullLogoUrl}" alt="Jetro" /><h1>${escapeHtml(title)}</h1>
<div class="meta">Gerado em: ${genDate}<br>Por: ${escapeHtml(userName)}<br>Registros: ${rows.length}</div></div>
<table><thead><tr>${headerHtml}</tr></thead><tbody>${rowsHtml}</tbody></table>
<div class="footer">Jetro — Operações Logísticas de Excelência</div></div>
<script>window.onload=function(){setTimeout(function(){window.print()},500)}</script></body></html>`
  const win = window.open('', '_blank')
  if (!win) return
  win.document.write(html)
  win.document.close()
}

export function exportWmsXls(
  title: string,
  headers: string[],
  rows: string[][],
  userName: string,
): void {
  const genDate = new Date().toLocaleString('pt-BR')
  const headerHtml = headers.map((h) => `<th>${escapeHtml(h)}</th>`).join('')
  const rowsHtml = rows
    .map((r) => `<tr>${r.map((c) => `<td>${escapeHtml(c)}</td>`).join('')}</tr>`)
    .join('')
  const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="UTF-8"></head><body>
<table border="1"><tr><td colspan="${headers.length}" style="background:#005B2E;color:#fff;font-weight:bold">${escapeHtml(title)} — Jetro</td></tr>
<tr><td colspan="${headers.length}">Gerado em: ${escapeHtml(genDate)} | Por: ${escapeHtml(userName)}</td></tr>
<tr style="background:#005B2E;color:#fff;font-weight:bold">${headerHtml}</tr>${rowsHtml}</table></body></html>`
  const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${title.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xls`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function exportWmsCsv(
  title: string,
  headers: string[],
  rows: (string | number)[][],
  userName: string,
): void {
  const rowObjects: Record<string, unknown>[] = rows.map((row) => {
    const obj: Record<string, unknown> = {}
    headers.forEach((h, idx) => {
      obj[h] = row[idx] ?? ''
    })
    return obj
  })
  exportToCsv(rowObjects, `${title.toLowerCase().replace(/\s+/g, '_')}.csv`, {
    module: `WMS > ${title}`,
    format: 'csv',
    filters: {},
  })
}
