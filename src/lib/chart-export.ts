import {
  withBranding,
  downloadCanvas,
  drawRoundedRect,
  loadImage,
  type ExportFormat,
} from './chart-export-core'

const slug = (t: string) => t.toLowerCase().replace(/\s+/g, '_')

export async function downloadBarChart(
  data: { name: string; value: number }[],
  color: string,
  title: string,
  userName: string,
  format: ExportFormat,
): Promise<void> {
  const canvas = await withBranding(1200, 700, title, userName, (ctx, c) => {
    if (!data.length) return
    const maxVal = Math.max(...data.map((d) => d.value), 1)
    const cx = 120,
      cy = 110,
      cw = c.width - 240,
      ch = 480
    const barW = Math.min(90, (cw / data.length) * 0.6)
    const gap = (cw - barW * data.length) / (data.length + 1)
    ctx.strokeStyle = '#E4EAE6'
    ctx.fillStyle = '#66736D'
    ctx.font = '12px Segoe UI, Arial'
    ctx.textAlign = 'right'
    for (let i = 0; i <= 5; i++) {
      const y = cy + ch - (ch * i) / 5
      ctx.beginPath()
      ctx.moveTo(cx, y)
      ctx.lineTo(cx + cw, y)
      ctx.stroke()
      ctx.fillText(String(Math.round((maxVal * i) / 5)), cx - 10, y + 4)
    }
    data.forEach((d, i) => {
      const x = cx + gap + i * (barW + gap)
      const bh = (d.value / maxVal) * ch
      const y = cy + ch - bh
      ctx.fillStyle = color
      drawRoundedRect(ctx, x, y, barW, bh, 8)
      ctx.fill()
      ctx.fillStyle = '#202B28'
      ctx.font = 'bold 14px Segoe UI, Arial'
      ctx.textAlign = 'center'
      ctx.fillText(String(d.value), x + barW / 2, y - 8)
      ctx.fillStyle = '#66736D'
      ctx.font = '12px Segoe UI, Arial'
      ctx.fillText(
        d.name.length > 12 ? d.name.slice(0, 12) + '…' : d.name,
        x + barW / 2,
        cy + ch + 22,
      )
    })
  })
  downloadCanvas(canvas, format, slug(title))
}

export async function downloadPieChart(
  data: { name: string; value: number; color: string }[],
  title: string,
  userName: string,
  format: ExportFormat,
): Promise<void> {
  const canvas = await withBranding(1200, 700, title, userName, (ctx, c) => {
    const total = data.reduce((s, d) => s + d.value, 0) || 1
    const px = c.width / 2 - 150,
      py = 380,
      radius = 150
    let angle = -Math.PI / 2
    data.forEach((d) => {
      const slice = (d.value / total) * Math.PI * 2
      ctx.beginPath()
      ctx.moveTo(px, py)
      ctx.arc(px, py, radius, angle, angle + slice)
      ctx.closePath()
      ctx.fillStyle = d.color
      ctx.fill()
      angle += slice
    })
    let ly = 250
    const lx = c.width / 2 + 120
    data.forEach((d) => {
      ctx.fillStyle = d.color
      drawRoundedRect(ctx, lx, ly, 16, 16, 4)
      ctx.fill()
      ctx.fillStyle = '#333'
      ctx.font = '14px Segoe UI, Arial'
      ctx.textAlign = 'left'
      ctx.fillText(
        `${d.name}: ${d.value} (${Math.round((d.value / total) * 100)}%)`,
        lx + 24,
        ly + 13,
      )
      ly += 32
    })
  })
  downloadCanvas(canvas, format, slug(title))
}

export async function downloadStatCard(
  label: string,
  value: string,
  color: string,
  title: string,
  userName: string,
  format: ExportFormat,
): Promise<void> {
  const canvas = await withBranding(800, 500, title, userName, (ctx, c) => {
    const cw = c.width - 200,
      ch = 260,
      cx = 100,
      cy = 140
    ctx.fillStyle = color + '20'
    drawRoundedRect(ctx, cx, cy, cw, ch, 16)
    ctx.fill()
    ctx.strokeStyle = color
    ctx.lineWidth = 3
    drawRoundedRect(ctx, cx, cy, cw, ch, 16)
    ctx.stroke()
    ctx.fillStyle = color
    ctx.font = 'bold 64px Segoe UI, Arial'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(value, c.width / 2, cy + ch / 2 - 15)
    ctx.fillStyle = '#333'
    ctx.font = 'bold 20px Segoe UI, Arial'
    ctx.fillText(label, c.width / 2, cy + ch / 2 + 40)
  })
  downloadCanvas(canvas, format, slug(title))
}

export async function downloadTopAttendant(
  name: string,
  avg: number,
  avatarUrl: string | null,
  title: string,
  userName: string,
  format: ExportFormat,
): Promise<void> {
  const avatar = avatarUrl ? await loadImage(avatarUrl) : null
  const canvas = await withBranding(800, 500, title, userName, (ctx, c) => {
    const cw = c.width - 160,
      ch = 280,
      cx = 80,
      cy = 130
    const g = ctx.createLinearGradient(cx, cy, cx + cw, cy + ch)
    g.addColorStop(0, '#C89B3C20')
    g.addColorStop(1, '#005B2E20')
    ctx.fillStyle = g
    drawRoundedRect(ctx, cx, cy, cw, ch, 16)
    ctx.fill()
    ctx.strokeStyle = '#C89B3C'
    ctx.lineWidth = 3
    drawRoundedRect(ctx, cx, cy, cw, ch, 16)
    ctx.stroke()
    const ax = cx + 80,
      ay = cy + ch / 2
    if (avatar && avatar.naturalWidth > 0) {
      ctx.save()
      ctx.beginPath()
      ctx.arc(ax, ay, 50, 0, Math.PI * 2)
      ctx.closePath()
      ctx.clip()
      ctx.drawImage(avatar, ax - 50, ay - 50, 100, 100)
      ctx.restore()
      ctx.strokeStyle = '#C69B45'
      ctx.lineWidth = 4
      ctx.beginPath()
      ctx.arc(ax, ay, 50, 0, Math.PI * 2)
      ctx.stroke()
    } else {
      ctx.fillStyle = '#C69B4530'
      ctx.beginPath()
      ctx.arc(ax, ay, 50, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = '#C69B45'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.arc(ax, ay, 50, 0, Math.PI * 2)
      ctx.stroke()
      ctx.fillStyle = '#C69B45'
      ctx.font = 'bold 36px Segoe UI, Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('★', ax, ay)
    }
    ctx.fillStyle = '#C69B45'
    ctx.font = 'bold 16px Segoe UI, Arial'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'alphabetic'
    ctx.fillText('★ Usuário Destaque', ax + 80, ay - 25)
    ctx.fillStyle = '#202B28'
    ctx.font = 'bold 28px Segoe UI, Arial'
    ctx.fillText(name, ax + 80, ay + 5)
    ctx.fillStyle = '#66736D'
    ctx.font = '18px Segoe UI, Arial'
    ctx.fillText(`Média: ${avg}`, ax + 80, ay + 35)
  })
  downloadCanvas(canvas, format, slug(title))
}

export async function downloadCommentsReport(
  comments: { author: string; rating: number; comment: string }[],
  title: string,
  userName: string,
  format: ExportFormat,
): Promise<void> {
  const rowH = 80
  const height = Math.max(500, 150 + comments.length * rowH)
  const canvas = await withBranding(1200, height, title, userName, (ctx, c) => {
    let y = 120
    comments.forEach((r) => {
      ctx.fillStyle = '#f5f5f5'
      drawRoundedRect(ctx, 60, y, c.width - 120, rowH - 10, 8)
      ctx.fill()
      ctx.strokeStyle = '#e5e7eb'
      ctx.lineWidth = 1
      drawRoundedRect(ctx, 60, y, c.width - 120, rowH - 10, 8)
      ctx.stroke()
      ctx.fillStyle = '#333'
      ctx.font = 'bold 14px Segoe UI, Arial'
      ctx.textAlign = 'left'
      ctx.fillText(r.author, 80, y + 22)
      for (let i = 0; i < 5; i++) {
        ctx.fillStyle = i < r.rating ? '#C69B45' : '#E4EAE6'
        ctx.font = '14px Segoe UI, Arial'
        ctx.fillText('★', 80 + i * 16, y + 42)
      }
      ctx.fillStyle = '#66736D'
      ctx.font = '13px Segoe UI, Arial'
      const txt = r.comment.length > 80 ? r.comment.slice(0, 80) + '…' : r.comment
      ctx.fillText(txt, 80, y + 58)
      y += rowH
    })
  })
  downloadCanvas(canvas, format, slug(title))
}
