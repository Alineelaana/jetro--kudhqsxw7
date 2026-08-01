import logoUrl from '@/assets/chatgpt-image-1-de-ago.de-2026-103549-f6f46.png'
import type { BudgetRecord } from '@/lib/types'
import { getResponseTime } from '@/lib/response-time'

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function formatBrDate(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function generateSolicitationsPdf(records: BudgetRecord[], userName: string): void {
  const fullLogoUrl = new URL(logoUrl, window.location.href).href
  const genDateTime = new Date().toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  const rows = records
    .map(
      (r, i) => `<tr class="${i % 2 === 0 ? 'even' : 'odd'}">
<td>${escapeHtml(r.client_name || '—')}</td>
<td>${escapeHtml(r.client_email || '—')}</td>
<td>${escapeHtml(r.client_phone || '—')}</td>
<td>${escapeHtml(r.service || '—')}</td>
<td>${escapeHtml(r.status || 'PENDENTE')}</td>
<td>${escapeHtml(getResponseTime(r.created, r.quote_created_at).text)}</td>
<td>${escapeHtml(formatBrDate(r.created))}</td>
<td>${escapeHtml(r.budget_number || '—')}</td>
</tr>`,
    )
    .join('')

  const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8">
<title>Relatório de Solicitações</title><style>
@page{size:A4;margin:0}
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',Arial,sans-serif;color:#1a1a1a}
.stripe-top{background:linear-gradient(135deg,#005B2E 0%,#01361D 100%);height:10mm}
.content{padding:8mm 15mm 28mm}
.header{display:flex;justify-content:space-between;align-items:center;margin-bottom:5mm}
.header img{height:45px}
.header h1{flex:1;text-align:center;color:#005B2E;font-size:22px;letter-spacing:1px}
.header .meta{font-size:10px;color:#666;text-align:right;min-width:120px}
.gold-divider{height:2px;background:linear-gradient(90deg,#C89B3C,transparent);margin:0 0 5mm}
table{width:100%;border-collapse:collapse;font-size:10px}
thead{display:table-header-group}
th{background:#005B2E;color:#fff;padding:6px 6px;text-align:left;font-weight:bold}
td{padding:5px 6px;border-bottom:1px solid #e0e0e0}
tr.even{background:#f7f7f5}
tr{page-break-inside:avoid}
.footer{position:fixed;bottom:0;left:0;right:0;display:flex;justify-content:space-between;padding:4mm 15mm;font-size:9px;color:#666;border-top:1px solid #ddd;background:#fff}
</style></head><body>
<div class="stripe-top"></div>
<div class="content">
<div class="header">
<img src="${fullLogoUrl}" alt="Velora Log" />
<h1>Relatório de Solicitações</h1>
<div class="meta">Total: ${records.length} registro(s)</div>
</div>
<div class="gold-divider"></div>
<table><thead><tr>
<th>Cliente</th><th>E-mail</th><th>Telefone</th><th>Serviço</th><th>Status</th><th>Tempo</th><th>Data/Hora</th><th>Orçamento</th>
</tr></thead><tbody>${rows}</tbody></table>
</div>
<div class="footer">
<span>Gerado em: ${genDateTime}</span>
<span>Gerado por: ${escapeHtml(userName)}</span>
</div>
<script>window.onload=function(){setTimeout(function(){window.print()},500)}</script>
</body></html>`

  const win = window.open('', '_blank')
  if (!win) throw new Error('Pop-up bloqueado. Permita pop-ups para gerar o relatório.')
  win.document.write(html)
  win.document.close()
}
