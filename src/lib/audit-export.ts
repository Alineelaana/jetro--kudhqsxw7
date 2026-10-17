import type { AuditLog } from '@/services/audit-logs'

function escapeHtml(str: string): string {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function formatBrDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR')
}

function formatBrTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

export function exportAuditExcel(
  logs: AuditLog[],
  userName: string,
  filterLabels: string[] = [],
): void {
  const genDateTime = new Date().toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
  const filterStr = filterLabels.length > 0 ? escapeHtml(filterLabels.join(' | ')) : 'Nenhum'
  const rows = logs
    .map(
      (r) => `<tr>
<td>${escapeHtml(formatBrDate(r.created))}</td>
<td>${escapeHtml(formatBrTime(r.created))}</td>
<td>${escapeHtml(r.user_name || '—')}</td>
<td>${escapeHtml(r.user_role || '—')}</td>
<td>${escapeHtml(r.action)}</td>
<td>${escapeHtml(r.module)}</td>
<td>${escapeHtml(r.criticidade || '—')}</td>
<td>${escapeHtml(r.target_summary || '—')}</td>
<td>${escapeHtml(r.origem || '—')}</td>
<td>${escapeHtml(r.ip_address || '—')}</td>
</tr>`,
    )
    .join('')
  const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="UTF-8"></head><body>
<table border="1">
<tr><td colspan="10"><strong>Relatório de Auditoria — Jetro</strong></td></tr>
<tr><td colspan="10">Gerado em: ${escapeHtml(genDateTime)}</td></tr>
<tr><td colspan="10">Gerado por: ${escapeHtml(userName)}</td></tr>
<tr><td colspan="10">Total de registros: ${logs.length}</td></tr>
<tr><td colspan="10">Filtros aplicados: ${filterStr}</td></tr>
<tr><td colspan="10"></td></tr>
<tr style="background:#005B2E;color:#fff;font-weight:bold">
<th>Data</th><th>Hora</th><th>Usuário</th><th>Perfil</th><th>Ação</th><th>Módulo</th><th>Criticidade</th><th>Registro</th><th>Origem</th><th>IP</th>
</tr>
${rows}
</table></body></html>`
  const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `auditoria_${new Date().toISOString().split('T')[0]}.xls`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function exportAuditPdf(
  logs: AuditLog[],
  userName: string,
  filterLabels: string[] = [],
): void {
  const genDateTime = new Date().toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
  const filterStr = filterLabels.length > 0 ? escapeHtml(filterLabels.join(' | ')) : 'Nenhum'
  const rows = logs
    .map(
      (r, i) => `<tr class="${i % 2 === 0 ? 'even' : 'odd'}">
<td>${escapeHtml(formatBrDate(r.created))}</td>
<td>${escapeHtml(formatBrTime(r.created))}</td>
<td>${escapeHtml(r.user_name || '—')}</td>
<td>${escapeHtml(r.user_role || '—')}</td>
<td>${escapeHtml(r.action)}</td>
<td>${escapeHtml(r.module)}</td>
<td>${escapeHtml(r.criticidade || '—')}</td>
<td>${escapeHtml(r.target_summary || '—')}</td>
</tr>`,
    )
    .join('')
  const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8">
<title>Relatório de Auditoria</title><style>
@page{size:A4;margin:0}
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',Arial,sans-serif;color:#1a1a1a}
.stripe-top{background:linear-gradient(135deg,#005B2E 0%,#01361D 100%);height:10mm}
.content{padding:8mm 15mm 28mm}
.header{display:flex;justify-content:space-between;align-items:center;margin-bottom:3mm}
.header h1{flex:1;text-align:center;color:#005B2E;font-size:22px;letter-spacing:1px}
.header .meta{font-size:10px;color:#666;text-align:right;min-width:120px}
.filter-info{font-size:9px;color:#555;margin-bottom:3mm;padding:2mm 3mm;background:#f7f7f5;border-radius:4px}
.gold-divider{height:2px;background:linear-gradient(90deg,#C89B3C,transparent);margin:0 0 5mm}
table{width:100%;border-collapse:collapse;font-size:10px}
thead{display:table-header-group}
th{background:#005B2E;color:#fff;padding:6px;text-align:left;font-weight:bold}
td{padding:5px 6px;border-bottom:1px solid #e0e0e0}
tr.even{background:#f7f7f5}
tr{page-break-inside:avoid}
.footer{position:fixed;bottom:0;left:0;right:0;display:flex;justify-content:space-between;padding:4mm 15mm;font-size:9px;color:#666;border-top:1px solid #ddd;background:#fff}
</style></head><body>
<div class="stripe-top"></div>
<div class="content">
<div class="header">
<h1>Relatório de Auditoria</h1>
<div class="meta">Total: ${logs.length} registro(s)<br>Gerado em: ${escapeHtml(genDateTime)}<br>Por: ${escapeHtml(userName)}</div>
</div>
<div class="filter-info"><strong>Filtros aplicados:</strong> ${filterStr}</div>
<div class="gold-divider"></div>
<table><thead><tr>
<th>Data</th><th>Hora</th><th>Usuário</th><th>Perfil</th><th>Ação</th><th>Módulo</th><th>Criticidade</th><th>Registro</th>
</tr></thead><tbody>${rows}</tbody></table>
</div>
<div class="footer">
<span>Gerado em: ${escapeHtml(genDateTime)}</span>
<span>Gerado por: ${escapeHtml(userName)}</span>
</div>
<script>window.onload=function(){setTimeout(function(){window.print()},500)}</script>
</body></html>`
  const win = window.open('', '_blank')
  if (!win) throw new Error('Pop-up bloqueado. Permita pop-ups para gerar o relatório.')
  win.document.write(html)
  win.document.close()
}
