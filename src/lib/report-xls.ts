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

export function generateSolicitationsXls(records: BudgetRecord[], userName: string): void {
  const genDateTime = new Date().toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  const rows = records
    .map(
      (r) => `<tr>
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

  const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="UTF-8"></head><body>
<table border="1">
<tr><td colspan="8"><strong>Relatório de Solicitações — Velora Log</strong></td></tr>
<tr><td colspan="8">Gerado em: ${escapeHtml(genDateTime)}</td></tr>
<tr><td colspan="8">Gerado por: ${escapeHtml(userName)}</td></tr>
<tr><td colspan="8"></td></tr>
<tr style="background:#005B2E;color:#fff;font-weight:bold">
<th>Cliente</th><th>E-mail</th><th>Telefone</th><th>Serviço</th><th>Status</th><th>Tempo de Resposta</th><th>Data/Hora</th><th>Orçamento</th>
</tr>
${rows}
</table></body></html>`

  const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `relatorio_solicitacoes_${new Date().toISOString().split('T')[0]}.xls`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
