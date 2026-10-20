function escapeHtml(str: string): string {
  return String(str ?? '')
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

export interface PdfReportConfig {
  title: string
  module: string
  headers: string[]
  rows: (string | number)[][]
  summary?: { label: string; value: string | number }[]
}

export function generateRhDpSstPdf(config: PdfReportConfig, userName: string): void {
  const { title, module, headers, rows, summary } = config
  const summaryHtml = summary?.length
    ? `<div class="summary">${summary
        .map(
          (s) =>
            `<div class="summary-item"><span class="summary-label">${escapeHtml(s.label)}</span><span class="summary-value">${escapeHtml(String(s.value))}</span></div>`,
        )
        .join('')}</div>`
    : ''
  const rowsHtml = rows
    .map(
      (row, i) =>
        `<tr class="${i % 2 === 0 ? 'even' : 'odd'}">${row
          .map((cell) => `<td>${escapeHtml(String(cell ?? '—'))}</td>`)
          .join('')}</tr>`,
    )
    .join('')
  const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><title>${escapeHtml(title)}</title><style>
@page{size:A4;margin:0}
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',Arial,sans-serif;color:#1a1a1a}
.stripe-top{background:linear-gradient(135deg,#063D30 0%,#042820 100%);height:10mm}
.content{padding:8mm 15mm 28mm}
.header{display:flex;justify-content:space-between;align-items:center;margin-bottom:5mm}
.header h1{flex:1;text-align:center;color:#063D30;font-size:22px;letter-spacing:1px}
.header .meta{font-size:10px;color:#66736D;text-align:right;min-width:120px}
.gold-divider{height:2px;background:linear-gradient(90deg,#C69B45,transparent);margin:0 0 5mm}
.summary{display:flex;flex-wrap:wrap;gap:10mm;margin-bottom:5mm}
.summary-item{background:#F1F4F2;border:1px solid #E4EAE6;padding:3mm 5mm;border-radius:3px}
.summary-label{display:block;font-size:9px;color:#66736D}
.summary-value{display:block;font-size:14px;font-weight:bold;color:#063D30}
table{width:100%;border-collapse:collapse;font-size:10px}
thead{display:table-header-group}
th{background:#063D30;color:#fff;padding:6px;text-align:left;font-weight:bold}
td{padding:5px 6px;border-bottom:1px solid #E4EAE6}
tr.even{background:#F8FAF9}
tr{page-break-inside:avoid}
.footer{position:fixed;bottom:0;left:0;right:0;display:flex;justify-content:space-between;padding:4mm 15mm;font-size:9px;color:#66736D;border-top:1px solid #E4EAE6;background:#fff}
.module-badge{display:inline-block;background:#063D30;color:#fff;font-size:11px;font-weight:bold;padding:2px 8px;border-radius:3px;margin-bottom:3mm}
</style></head><body>
<div class="stripe-top"></div>
<div class="content">
<div class="module-badge">${escapeHtml(module)}</div>
<div class="header">
<h1>${escapeHtml(title)}</h1>
<div class="meta">Total: ${rows.length} registro(s)</div>
</div>
<div class="gold-divider"></div>
${summaryHtml}
<table><thead><tr>${headers.map((h) => `<th>${escapeHtml(h)}</th>`).join('')}</tr></thead><tbody>${rowsHtml}</tbody></table>
</div>
<div class="footer">
<span>Gerado em: ${formatDateTime()}</span>
<span>Gerado por: ${escapeHtml(userName)}</span>
</div>
<script>window.onload=function(){setTimeout(function(){window.print()},500)}</script>
</body></html>`
  const win = window.open('', '_blank')
  if (!win) throw new Error('Pop-up bloqueado. Permita pop-ups para gerar o relatório.')
  win.document.write(html)
  win.document.close()
}
