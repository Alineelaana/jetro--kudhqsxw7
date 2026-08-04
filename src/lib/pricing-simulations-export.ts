import logoUrl from '@/assets/chatgpt-image-1-de-ago.de-2026-103549-f6f46.png'
import { exportCsv } from '@/lib/csv-export'
import type { PricingSimulation } from '@/lib/pricing-types'

const SCENARIO_LABELS: Record<string, string> = {
  a_vista: 'Venda à Vista',
  pix: 'Venda no PIX',
  cartao: 'Venda no Cartão',
  atacado: 'Venda para Atacado',
  varejo: 'Venda para Varejo',
  promocional: 'Venda Promocional',
  personalizado: 'Personalizado',
}

function escapeHtml(str: string): string {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function formatDate(iso: string): string {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return '—'
  }
}

export function exportPricingSimulationsCsv(simulations: PricingSimulation[]): void {
  const headers = [
    'Cenário',
    'Tipo',
    'Preço',
    'Custo',
    'Margem (%)',
    'Lucro',
    'Rentabilidade (%)',
    'Criado por',
    'Data',
  ]
  const rows = simulations.map((s) => [
    s.scenario_name || '—',
    SCENARIO_LABELS[s.scenario_type] || s.scenario_type,
    s.simulated_price || '0',
    s.simulated_cost || '0',
    s.simulated_margin || '0',
    s.profit_value || '0',
    s.rentability || '0',
    s.created_by || '—',
    formatDate(s.created),
  ])
  exportCsv('simulacoes_precos', headers, rows)
}

export function exportPricingSimulationsPdf(
  simulations: PricingSimulation[],
  userName: string,
): void {
  const fullLogoUrl = new URL(logoUrl, window.location.href).href
  const genDate = new Date().toLocaleString('pt-BR')
  const headers = [
    'Cenário',
    'Tipo',
    'Preço',
    'Custo',
    'Margem (%)',
    'Lucro',
    'Rentab. (%)',
    'Criado por',
    'Data',
  ]
  const headerHtml = headers.map((h) => `<th>${escapeHtml(h)}</th>`).join('')
  const rowsHtml = simulations
    .map(
      (s, i) =>
        `<tr class="${i % 2 === 0 ? '' : 'alt'}">
<td>${escapeHtml(s.scenario_name || '—')}</td>
<td>${escapeHtml(SCENARIO_LABELS[s.scenario_type] || s.scenario_type)}</td>
<td>R$ ${escapeHtml(s.simulated_price || '0')}</td>
<td>R$ ${escapeHtml(s.simulated_cost || '0')}</td>
<td>${escapeHtml(s.simulated_margin || '0')}%</td>
<td>R$ ${escapeHtml(s.profit_value || '0')}</td>
<td>${escapeHtml(s.rentability || '0')}%</td>
<td>${escapeHtml(s.created_by || '—')}</td>
<td>${escapeHtml(formatDate(s.created))}</td>
</tr>`,
    )
    .join('')

  const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8">
<title>Relatório de Simulações de Preços</title><style>
@page{size:A4;margin:0}
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',Arial,sans-serif;color:#1a1a1a}
.stripe-top{background:linear-gradient(135deg,#005B2E 0%,#01361D 100%);height:10mm}
.content{padding:8mm 15mm 28mm}
.header{display:flex;justify-content:space-between;align-items:center;margin-bottom:5mm}
.header img{height:40px}
.header h1{flex:1;text-align:center;color:#005B2E;font-size:22px;letter-spacing:1px}
.header .meta{font-size:10px;color:#666;text-align:right;min-width:120px}
.gold-divider{height:2px;background:linear-gradient(90deg,#C89B3C,transparent);margin:0 0 5mm}
table{width:100%;border-collapse:collapse;font-size:10px}
thead{display:table-header-group}
th{background:#005B2E;color:#fff;padding:6px;text-align:left;font-weight:bold}
td{padding:5px 6px;border-bottom:1px solid #e0e0e0}
tr.alt{background:#f7f7f5}
tr{page-break-inside:avoid}
.footer{position:fixed;bottom:0;left:0;right:0;display:flex;justify-content:space-between;padding:4mm 15mm;font-size:9px;color:#666;border-top:1px solid #ddd;background:#fff}
</style></head><body>
<div class="stripe-top"></div>
<div class="content">
<div class="header">
<img src="${fullLogoUrl}" alt="Velora Log" />
<h1>Simulações de Preços</h1>
<div class="meta">Total: ${simulations.length} registro(s)<br>Gerado em: ${genDate}<br>Por: ${escapeHtml(userName)}</div>
</div>
<div class="gold-divider"></div>
<table><thead><tr>${headerHtml}</tr></thead><tbody>${rowsHtml}</tbody></table>
</div>
<div class="footer">
<span>Velora Log — Operações Logísticas de Excelência</span>
<span>Gerado por: ${escapeHtml(userName)}</span>
</div>
<script>window.onload=function(){setTimeout(function(){window.print()},500)}</script>
</body></html>`

  const win = window.open('', '_blank')
  if (!win) return
  win.document.write(html)
  win.document.close()
}
