import logoUrl from '@/assets/whatsapp-image-2026-08-09-at-23.25.57-64131.jpeg'

export interface CrmReportPdfData {
  reportType: string
  totalLeads: number
  totalOpps: number
  wonOpps: number
  conversionRate: string
  funnelValue: number
  leadsBySource: Array<{ name: string; count: number }>
  leadsByStatus: Array<{ name: string; count: number }>
  lostOpps: number
  proposalsCount: number
  activitiesCount: number
  userName: string
  userRole: string
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

const CHART_COLORS = [
  '#005B2E',
  '#C89B3C',
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#8b5cf6',
  '#ec4899',
  '#ef4444',
]

export function generateCrmReportPdf(d: CrmReportPdfData): void {
  const fullLogoUrl = new URL(logoUrl, window.location.href).href
  const now = new Date()
  const genDate = now.toLocaleDateString('pt-BR')
  const genTime = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  const maxSource = Math.max(...d.leadsBySource.map((s) => s.count), 1)

  const metrics = [
    { label: 'Total de Leads', value: String(d.totalLeads), color: '#005B2E' },
    { label: 'Oportunidades', value: String(d.totalOpps), color: '#3b82f6' },
    { label: 'Ganhas', value: String(d.wonOpps), color: '#10b981' },
    { label: 'Conversão', value: `${d.conversionRate}%`, color: '#C89B3C' },
  ]
    .map(
      (m) => `<div class="metric" style="border-top:3px solid ${m.color}">
<p class="m-val" style="color:${m.color}">${m.value}</p>
<p class="m-lbl">${escapeHtml(m.label)}</p></div>`,
    )
    .join('')

  const sourceRows = d.leadsBySource
    .map(
      (s) => `<tr><td>${escapeHtml(s.name)}</td><td class="num">${s.count}</td>
<td><div class="bar-bg"><div class="bar-fill" style="width:${(s.count / maxSource) * 100}%;background:linear-gradient(90deg,#005B2E,#01361D)"></div></div></td></tr>`,
    )
    .join('')

  const statusRows = d.leadsByStatus
    .map((s, i) => {
      const c = CHART_COLORS[i % CHART_COLORS.length]
      return `<tr><td><span class="dot" style="background:${c}"></span>${escapeHtml(s.name)}</td>
<td class="num">${s.count}</td></tr>`
    })
    .join('')

  const funnelValueStr = d.funnelValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })

  const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8">
<title>Relatório CRM — ${escapeHtml(d.reportType)}</title><style>
@page{size:A4;margin:0}
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',Arial,sans-serif;color:#1a1a1a;background:#fff}
.stripe{background:linear-gradient(135deg,#005B2E 0%,#01361D 100%);height:8mm}
.wrap{padding:6mm 14mm 24mm}
.hdr{display:flex;align-items:center;gap:10mm;margin-bottom:4mm}
.hdr img{height:40px;object-fit:contain}
.hdr-meta{flex:1;text-align:right}
.hdr-meta h1{color:#005B2E;font-size:18px;letter-spacing:.5px}
.hdr-meta .sub{font-size:10px;color:#666;margin-top:2px}
.gold{height:2px;background:linear-gradient(90deg,#C89B3C,transparent);margin-bottom:4mm}
.meta-strip{display:flex;gap:6mm;background:#f7f7f5;border-radius:4px;padding:3mm 4mm;margin-bottom:5mm;font-size:10px}
.meta-strip .item{flex:1}
.meta-strip .lbl{color:#888;font-size:8px;text-transform:uppercase;letter-spacing:.5px}
.meta-strip .val{font-weight:600;color:#333;margin-top:1px}
.metrics{display:flex;gap:3mm;margin-bottom:5mm}
.metric{flex:1;background:#f9faf8;border-radius:6px;padding:3mm 4mm;border-top:3px solid #005B2E}
.m-val{font-size:22px;font-weight:800;line-height:1.1}
.m-lbl{font-size:8px;color:#666;margin-top:2px;text-transform:uppercase;letter-spacing:.3px}
.grid{display:flex;gap:4mm;margin-bottom:4mm}
.col{flex:1}
.tbl-title{font-size:11px;font-weight:700;color:#005B2E;margin-bottom:2mm;padding-bottom:1mm;border-bottom:1px solid #e0e0e0}
table{width:100%;border-collapse:collapse;font-size:10px}
th{background:#005B2E;color:#fff;padding:4px 6px;text-align:left;font-weight:600;font-size:9px}
td{padding:4px 6px;border-bottom:1px solid #eee}
td.num{text-align:center;font-weight:700;width:20mm}
.bar-bg{height:10px;background:#f0f0f0;border-radius:3px;overflow:hidden}
.bar-fill{height:100%;border-radius:3px}
.dot{display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:6px}
.funnel{background:#f9faf8;border-radius:6px;padding:4mm;margin-bottom:3mm}
.funnel-grid{display:flex;gap:4mm}
.funnel-item{flex:1;text-align:center}
.funnel-item .v{font-size:16px;font-weight:800}
.funnel-item .l{font-size:8px;color:#666;margin-top:2px}
.footer{position:fixed;bottom:0;left:0;right:0;display:flex;justify-content:space-between;padding:3mm 14mm;font-size:8px;color:#999;border-top:1px solid #eee;background:#fff}
</style></head><body>
<div class="stripe"></div>
<div class="wrap">
<div class="hdr">
<img src="${fullLogoUrl}" alt="Jetro" />
<div class="hdr-meta">
<h1>Relatório CRM — ${escapeHtml(d.reportType)}</h1>
<p class="sub">Jetro • Sistema de Gestão Logística</p>
</div>
</div>
<div class="gold"></div>
<div class="meta-strip">
<div class="item"><p class="lbl">Gerado por</p><p class="val">${escapeHtml(d.userName)} • ${escapeHtml(d.userRole)}</p></div>
<div class="item"><p class="lbl">Data</p><p class="val">${genDate}</p></div>
<div class="item"><p class="lbl">Hora</p><p class="val">${genTime}</p></div>
</div>
<div class="metrics">${metrics}</div>
<div class="grid">
<div class="col">
<p class="tbl-title">Leads por Origem</p>
<table><thead><tr><th>Origem</th><th>Qtd</th><th>Distribuição</th></tr></thead><tbody>${sourceRows || '<tr><td colspan="3" style="text-align:center;color:#999">Sem dados</td></tr>'}</tbody></table>
</div>
<div class="col">
<p class="tbl-title">Leads por Situação</p>
<table><thead><tr><th>Situação</th><th>Qtd</th></tr></thead><tbody>${statusRows || '<tr><td colspan="2" style="text-align:center;color:#999">Sem dados</td></tr>'}</tbody></table>
</div>
</div>
<div class="funnel">
<p class="tbl-title">Resumo do Funil</p>
<div class="funnel-grid">
<div class="funnel-item"><p class="v" style="color:#005B2E">R$ ${escapeHtml(funnelValueStr)}</p><p class="l">Valor do Funil</p></div>
<div class="funnel-item"><p class="v" style="color:#ef4444">${d.lostOpps}</p><p class="l">Perdidas</p></div>
<div class="funnel-item"><p class="v" style="color:#3b82f6">${d.proposalsCount}</p><p class="l">Propostas</p></div>
<div class="funnel-item"><p class="v" style="color:#C89B3C">${d.activitiesCount}</p><p class="l">Atividades</p></div>
</div>
</div>
</div>
<div class="footer">
<span>Jetro — Relatório CRM • ${escapeHtml(d.reportType)}</span>
<span>${genDate} às ${genTime} • ${escapeHtml(d.userName)}</span>
</div>
<script>window.onload=function(){setTimeout(function(){window.print()},500)}</script>
</body></html>`

  const win = window.open('', '_blank')
  if (!win) throw new Error('Pop-up bloqueado. Permita pop-ups para gerar o relatório.')
  win.document.write(html)
  win.document.close()
}
