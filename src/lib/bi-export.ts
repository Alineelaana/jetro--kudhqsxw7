import { exportCsv } from '@/lib/csv-export'
import { logBIExport } from '@/services/bi'

export function exportBICsv(
  title: string,
  headers: string[],
  rows: (string | number)[][],
  userName: string,
) {
  exportCsv(title, headers, rows)
  logBIExport('CSV', `${title} por ${userName}`)
}

export function exportBIPdf(
  title: string,
  userName: string,
  sections: Array<{ title: string; rows: string[][] }>,
) {
  const now = new Date().toLocaleString('pt-BR')
  const sectionsHtml = sections
    .map(
      (s) =>
        `<h3>${s.title}</h3><table border="1" style="border-collapse:collapse;width:100%;font-size:10px">${s.rows
          .map((r) => `<tr>${r.map((c) => `<td style="padding:3px">${c}</td>`).join('')}</tr>`)
          .join('')}</table>`,
    )
    .join('')
  const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><style>@page{size:A4;margin:0}*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Segoe UI',Arial,sans-serif;padding:15mm}.header{background:linear-gradient(135deg,#005B2E,#01361D);color:#fff;padding:10px 15px;border-radius:8px;margin-bottom:10px}h1{font-size:18px}h3{color:#005B2E;font-size:12px;margin:8px 0 4px}.meta{font-size:9px;color:#666;margin-top:4px}</style></head><body><div class="header"><h1>${title}</h1><div class="meta">Sistema: VeloraLog | Usuário: ${userName} | Data: ${now}</div></div>${sectionsHtml}<script>window.onload=function(){setTimeout(function(){window.print()},500)}</script></body></html>`
  const win = window.open('', '_blank')
  if (!win) return
  win.document.write(html)
  win.document.close()
  logBIExport('PDF', `${title} por ${userName}`)
}

export function exportBIImage(title: string, userName: string) {
  const canvas = document.createElement('canvas')
  canvas.width = 1200
  canvas.height = 600
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, 1200, 600)
  const grad = ctx.createLinearGradient(0, 0, 1200, 0)
  grad.addColorStop(0, '#005B2E')
  grad.addColorStop(1, '#01361D')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 1200, 8)
  ctx.fillStyle = '#005B2E'
  ctx.font = 'bold 24px Segoe UI, Arial'
  ctx.textAlign = 'center'
  ctx.fillText(title, 600, 50)
  ctx.fillStyle = '#666'
  ctx.font = '12px Segoe UI, Arial'
  const now = new Date().toLocaleString('pt-BR')
  ctx.fillText(`VeloraLog | Usuário: ${userName} | ${now}`, 600, 75)
  canvas.toBlob((blob) => {
    if (!blob) return
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${title}_${new Date().toISOString().split('T')[0]}.png`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, 'image/png')
  logBIExport('PNG', `${title} por ${userName}`)
}

export function exportBIPrint(title: string, userName: string) {
  logBIExport('Print', `${title} por ${userName}`)
  window.print()
}
