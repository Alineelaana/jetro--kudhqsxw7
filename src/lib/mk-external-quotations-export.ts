import type { MkExternalQuotation } from '@/lib/mk-external-quotations-types'
import { logEqAudit } from '@/services/mk-external-quotations'

function escapeHtml(str: string): string {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function exportComparativePdf(quotation: MkExternalQuotation, userName: string): void {
  const genDateTime = new Date().toLocaleString('pt-BR')
  const propostas = quotation.proposals || []
  const criteria = [
    { label: 'Valor Final', get: (p: (typeof propostas)[0]) => `R$ ${p.final_value}` },
    { label: 'Prazo de Entrega', get: (p: (typeof propostas)[0]) => p.delivery_deadline || '—' },
    {
      label: 'Condição de Pagamento',
      get: (p: (typeof propostas)[0]) => p.payment_condition || '—',
    },
    { label: 'Frete', get: (p: (typeof propostas)[0]) => `R$ ${p.freight || '0'}` },
    { label: 'Validade', get: (p: (typeof propostas)[0]) => p.validity || '—' },
    { label: 'Garantia', get: (p: (typeof propostas)[0]) => p.warranty || '—' },
    {
      label: 'Especificação Técnica',
      get: (p: (typeof propostas)[0]) => p.technical_specifications || '—',
    },
    { label: 'Desconto', get: (p: (typeof propostas)[0]) => `R$ ${p.discount || '0'}` },
  ]
  const isRecommended = (supplierId: string) => supplierId === quotation.recommended_supplier_id
  const rows = criteria
    .map((c) => {
      const cells = propostas
        .map((p) => {
          const rec = isRecommended(p.supplier_id) ? ' ⭐' : ''
          return `<td style="padding:6px;border:1px solid #ddd">${escapeHtml(c.get(p))}${rec}</td>`
        })
        .join('')
      return `<tr><td style="padding:6px;border:1px solid #ddd;font-weight:bold;background:#f0f0f0">${c.label}</td>${cells}</tr>`
    })
    .join('')
  const supplierHeaders = propostas
    .map((p) => {
      const rec = isRecommended(p.supplier_id) ? ' ⭐' : ''
      return `<th style="padding:8px;background:#005B2E;color:#fff;border:1px solid #005B2E">${escapeHtml(p.supplier_name)}${rec}</th>`
    })
    .join('')
  const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><title>Comparativo de Cotação</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:Segoe UI,Arial,sans-serif;padding:20px}h1{color:#005B2E;margin-bottom:10px}.info{font-size:12px;color:#555;margin-bottom:15px}table{width:100%;border-collapse:collapse;font-size:11px}.footer{margin-top:20px;font-size:10px;color:#888;border-top:1px solid #ddd;padding-top:10px}</style></head><body>
<h1>Comparativo de Cotação Externa</h1>
<div class="info">
<b>Empresa:</b> ${escapeHtml(quotation.company)} | <b>Filial:</b> ${escapeHtml(quotation.branch || '—')}<br>
<b>Cotação:</b> ${escapeHtml(quotation.quotation_number)} — ${escapeHtml(quotation.title)}<br>
<b>Solicitante:</b> ${escapeHtml(quotation.requester)} | <b>Fornecedor Recomendado:</b> ${escapeHtml(quotation.recommended_supplier_name || '—')}<br>
<b>Aprovadores:</b> ${(quotation.approval_data || []).map((a) => escapeHtml(a.user)).join(', ') || '—'}
</div>
<table><thead><tr><th style="padding:8px;background:#01361D;color:#fff;border:1px solid #01361D">Critério</th>${supplierHeaders}</tr></thead><tbody>${rows}</tbody></table>
<div class="footer">Exportado por: ${escapeHtml(userName)} em ${escapeHtml(genDateTime)}</div>
<script>window.onload=function(){setTimeout(function(){window.print()},500)}</script>
</body></html>`
  const win = window.open('', '_blank')
  if (win) {
    win.document.write(html)
    win.document.close()
  }
  logEqAudit('exportacao', quotation.id, `Comparativo exportado por ${userName}`)
}

export function exportComparativeExcel(quotation: MkExternalQuotation, userName: string): void {
  const genDateTime = new Date().toLocaleString('pt-BR')
  const propostas = quotation.proposals || []
  const criteria = [
    'Valor Final',
    'Prazo de Entrega',
    'Condição de Pagamento',
    'Frete',
    'Validade',
    'Garantia',
    'Especificação Técnica',
    'Desconto',
  ]
  const getVal = (p: (typeof propostas)[0], idx: number): string => {
    const vals = [
      p.final_value,
      p.delivery_deadline,
      p.payment_condition,
      p.freight,
      p.validity,
      p.warranty,
      p.technical_specifications,
      p.discount,
    ]
    return String(vals[idx] || '—')
  }
  const supplierHeaders = propostas
    .map(
      (p) =>
        `<th>${escapeHtml(p.supplier_name)}${p.supplier_id === quotation.recommended_supplier_id ? ' ⭐' : ''}</th>`,
    )
    .join('')
  const rows = criteria
    .map((_, idx) => {
      const cells = propostas.map((p) => `<td>${escapeHtml(getVal(p, idx))}</td>`).join('')
      return `<tr><td style="font-weight:bold">${criteria[idx]}</td>${cells}</tr>`
    })
    .join('')
  const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="UTF-8"></head><body>
<table border="1"><tr><td colspan="${propostas.length + 1}"><strong>Comparativo de Cotação — ${escapeHtml(quotation.quotation_number)} — ${escapeHtml(quotation.title)}</strong></td></tr>
<tr><td colspan="${propostas.length + 1}">Empresa: ${escapeHtml(quotation.company)} | Filial: ${escapeHtml(quotation.branch || '—')} | Solicitante: ${escapeHtml(quotation.requester)}</td></tr>
<tr><td colspan="${propostas.length + 1}">Exportado por: ${escapeHtml(userName)} em ${escapeHtml(genDateTime)}</td></tr>
<tr><td colspan="${propostas.length + 1}"></td></tr>
<tr style="background:#005B2E;color:#fff;font-weight:bold"><th>Critério</th>${supplierHeaders}</tr>
${rows}</table></body></html>`
  const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `comparativo_${quotation.quotation_number || 'cotacao'}.xls`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  logEqAudit('exportacao', quotation.id, `Comparativo Excel exportado por ${userName}`)
}
