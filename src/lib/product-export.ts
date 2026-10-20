import type { Product } from '@/lib/product-types'

function escapeHtml(str: string): string {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function formatDateTime(): string {
  return new Date().toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function exportProductsExcel(products: Product[]): void {
  const safe = Array.isArray(products) ? products.filter(Boolean) : []
  const genDateTime = formatDateTime()

  const rows = safe
    .map(
      (p) => `<tr>
<td>${escapeHtml(p?.code || '—')}</td>
<td>${escapeHtml(p?.name || '—')}</td>
<td>${escapeHtml(p?.description || '—')}</td>
<td>${escapeHtml(p?.ncm || '—')}</td>
<td>${escapeHtml(p?.ean || '—')}</td>
<td>${escapeHtml(p?.unit || '—')}</td>
<td>${escapeHtml(p?.price || '—')}</td>
<td>${escapeHtml(p?.brand || '—')}</td>
<td>${escapeHtml(p?.category || '—')}</td>
<td>${p?.stock ?? 0}</td>
<td>${p?.active !== false ? 'Ativo' : 'Inativo'}</td>
</tr>`,
    )
    .join('')

  const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="UTF-8"></head><body>
<table border="1">
<tr><td colspan="11"><strong>Relatório de Produtos — Jetro</strong></td></tr>
<tr><td colspan="11">Gerado em: ${escapeHtml(genDateTime)}</td></tr>
<tr><td colspan="11"></td></tr>
<tr style="background:#063D30;color:#fff;font-weight:bold">
<th>Código</th><th>Nome</th><th>Descrição</th><th>NCM</th><th>EAN</th><th>Unidade</th><th>Preço</th><th>Marca</th><th>Categoria</th><th>Estoque</th><th>Status</th>
</tr>
${rows}
</table></body></html>`

  const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `produtos_${new Date().toISOString().split('T')[0]}.xls`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function exportProductsPdf(products: Product[]): void {
  const safe = Array.isArray(products) ? products.filter(Boolean) : []
  const genDateTime = formatDateTime()

  const rows = safe
    .map(
      (p, i) => `<tr class="${i % 2 === 0 ? 'even' : 'odd'}">
<td>${escapeHtml(p?.code || '—')}</td>
<td>${escapeHtml(p?.name || '—')}</td>
<td>${escapeHtml(p?.ean || '—')}</td>
<td>${escapeHtml(p?.category || '—')}</td>
<td>${escapeHtml(p?.price || '—')}</td>
<td>${p?.stock ?? 0}</td>
<td>${p?.active !== false ? 'Ativo' : 'Inativo'}</td>
</tr>`,
    )
    .join('')

  const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8">
<title>Relatório de Produtos</title><style>
@page{size:A4;margin:0}
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',Arial,sans-serif;color:#1a1a1a}
.stripe-top{background:linear-gradient(135deg,#063D30 0%,#042820 100%);height:10mm}
.content{padding:8mm 15mm 28mm}
.header{display:flex;justify-content:space-between;align-items:center;margin-bottom:5mm}
.header h1{flex:1;text-align:center;color:#063D30;font-size:22px;letter-spacing:1px}
.header .meta{font-size:10px;color:#66736D;text-align:right;min-width:120px}
.gold-divider{height:2px;background:linear-gradient(90deg,#C69B45,transparent);margin:0 0 5mm}
table{width:100%;border-collapse:collapse;font-size:10px}
thead{display:table-header-group}
th{background:#063D30;color:#fff;padding:6px;text-align:left;font-weight:bold}
td{padding:5px 6px;border-bottom:1px solid #E4EAE6}
tr.even{background:#F8FAF9}
tr{page-break-inside:avoid}
.footer{position:fixed;bottom:0;left:0;right:0;display:flex;justify-content:space-between;padding:4mm 15mm;font-size:9px;color:#66736D;border-top:1px solid #E4EAE6;background:#fff}
</style></head><body>
<div class="stripe-top"></div>
<div class="content">
<div class="header">
<h1>Relatório de Produtos</h1>
<div class="meta">Total: ${safe.length} produto(s)</div>
</div>
<div class="gold-divider"></div>
<table><thead><tr>
<th>Código</th><th>Nome</th><th>EAN</th><th>Categoria</th><th>Preço</th><th>Estoque</th><th>Status</th>
</tr></thead><tbody>${rows}</tbody></table>
</div>
<div class="footer">
<span>Gerado em: ${escapeHtml(genDateTime)}</span>
<span>Jetro</span>
</div>
<script>window.onload=function(){setTimeout(function(){window.print()},500)}</script>
</body></html>`

  const win = window.open('', '_blank')
  if (!win) throw new Error('Pop-up bloqueado. Permita pop-ups para gerar o relatório.')
  win.document.write(html)
  win.document.close()
}
