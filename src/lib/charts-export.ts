import logoUrl from '@/assets/chatgpt-image-1-de-ago.de-2026-103549-f6f46.png'
import type { BudgetRecord } from '@/lib/types'

const STATUS_META = [
  { status: 'PENDENTE', label: 'Pendentes', color: '#f59e0b', bgColor: '#fef3c7' },
  { status: 'EM ANDAMENTO', label: 'Em Andamento', color: '#3b82f6', bgColor: '#dbeafe' },
  { status: 'EM CONTATO COM O CLIENTE', label: 'Em Contato', color: '#06b6d4', bgColor: '#cffafe' },
  { status: 'CONCLUÍDO', label: 'Concluídos', color: '#22c55e', bgColor: '#dcfce7' },
  { status: 'CANCELADO', label: 'Cancelados', color: '#ef4444', bgColor: '#fee2e2' },
]

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

export function downloadChartsImage(records: BudgetRecord[], userName: string): void {
  const canvas = document.createElement('canvas')
  canvas.width = 1200
  canvas.height = 700
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const fullLogoUrl = new URL(logoUrl, window.location.href).href
  const logo = new Image()

  const draw = () => {
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.globalAlpha = 0.07
    const wmSize = 400
    ctx.drawImage(logo, (canvas.width - wmSize) / 2, (canvas.height - wmSize) / 2, wmSize, wmSize)
    ctx.globalAlpha = 1.0

    const grad = ctx.createLinearGradient(0, 0, canvas.width, 0)
    grad.addColorStop(0, '#063D30')
    grad.addColorStop(1, '#116B50')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, canvas.width, 8)

    ctx.fillStyle = '#063D30'
    ctx.font = 'bold 26px Segoe UI, Arial, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('Relatório de Status das Solicitações — HURAM', canvas.width / 2, 55)

    ctx.fillStyle = '#66736D'
    ctx.font = '14px Segoe UI, Arial, sans-serif'
    ctx.fillText(`Total de registros: ${records.length}`, canvas.width / 2, 80)

    const total = records.length || 1
    const cardW = 210
    const cardH = 130
    const gap = 15
    const startX = (canvas.width - (cardW * 5 + gap * 4)) / 2
    const startY = 110

    STATUS_META.forEach((meta, i) => {
      const count = records.filter((r) => (r.status || 'PENDENTE') === meta.status).length
      const pct = Math.round((count / total) * 100)
      const x = startX + i * (cardW + gap)

      ctx.fillStyle = meta.bgColor
      drawRoundedRect(ctx, x, startY, cardW, cardH, 10)
      ctx.fill()
      ctx.strokeStyle = meta.color
      ctx.lineWidth = 2
      drawRoundedRect(ctx, x, startY, cardW, cardH, 10)
      ctx.stroke()

      ctx.fillStyle = meta.color
      ctx.font = 'bold 36px Segoe UI, Arial, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(String(count), x + cardW / 2, startY + 50)

      ctx.fillStyle = '#333'
      ctx.font = 'bold 13px Segoe UI, Arial, sans-serif'
      ctx.fillText(meta.label, x + cardW / 2, startY + 75)

      const barW = cardW - 30
      const barX = x + 15
      const barY = startY + 95
      ctx.fillStyle = '#E4EAE6'
      ctx.fillRect(barX, barY, barW, 8)
      ctx.fillStyle = meta.color
      ctx.fillRect(barX, barY, (barW * pct) / 100, 8)

      ctx.fillStyle = '#66736D'
      ctx.font = '12px Segoe UI, Arial, sans-serif'
      ctx.fillText(`${pct}%`, x + cardW / 2, startY + 122)
    })

    const now = new Date()
    const caption = `Baixado por: ${userName} — ${now.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })}`
    ctx.fillStyle = '#C69B45'
    ctx.font = 'bold 13px Segoe UI, Arial, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(caption, canvas.width / 2, canvas.height - 25)

    canvas.toBlob((blob) => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `graficos_status_${now.toISOString().split('T')[0]}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }, 'image/png')
  }

  logo.onload = draw
  logo.src = fullLogoUrl
}
