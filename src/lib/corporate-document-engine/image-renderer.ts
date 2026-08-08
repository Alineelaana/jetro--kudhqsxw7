import type { DocumentConfig } from './types'
import { CORPORATE_IDENTITY } from './identity'
import { withBranding, drawRoundedRect, downloadCanvas } from './canvas-utils'
import { formatStampCanvas } from './stamp'

export async function renderImageDocument(config: DocumentConfig): Promise<string> {
  const format = config.format === 'jpg' ? 'jpg' : 'png'
  const slug = config.title.toLowerCase().replace(/\s+/g, '_')
  const width = 1200
  const hasTable = config.sections.some((s) => s.headers?.length && s.rows?.length)
  const tableRows = config.sections.reduce((acc, s) => acc + (s.rows?.length || 0), 0)
  const height = Math.max(700, 150 + tableRows * 35 + config.sections.length * 60)

  const canvas = await withBranding(
    width,
    height,
    config.title,
    config.stamp.userName,
    (ctx, c) => {
      const c2 = CORPORATE_IDENTITY
      let y = 100

      for (const section of config.sections) {
        if (section.summary?.length) {
          const cardW = (width - 120 - (section.summary.length - 1) * 15) / section.summary.length
          section.summary.forEach((s, i) => {
            const x = 60 + i * (cardW + 15)
            ctx.fillStyle = c2.altRowColor
            drawRoundedRect(ctx, x, y, cardW, 70, 8)
            ctx.fill()
            ctx.fillStyle = c2.mutedTextColor
            ctx.font = `9px ${c2.fontFamily}`
            ctx.textAlign = 'left'
            ctx.fillText(s.label, x + 10, y + 20)
            ctx.fillStyle = c2.primaryColor
            ctx.font = `bold 18px ${c2.fontFamily}`
            ctx.fillText(String(s.value), x + 10, y + 48)
          })
          y += 90
        }

        if (section.headers?.length && section.rows?.length) {
          ctx.fillStyle = c2.primaryColor
          ctx.font = `bold 12px ${c2.fontFamily}`
          ctx.textAlign = 'left'
          ctx.fillText(section.title, 60, y + 15)
          y += 30

          const colW = (width - 120) / section.headers.length
          ctx.fillStyle = c2.primaryColor
          ctx.fillRect(60, y, width - 120, 28)
          ctx.fillStyle = '#fff'
          ctx.font = `bold 10px ${c2.fontFamily}`
          section.headers.forEach((h, i) => {
            ctx.fillText(h.length > 20 ? h.slice(0, 20) + '…' : h, 70 + i * colW, y + 18)
          })
          y += 28

          section.rows.forEach((row, ri) => {
            if (ri % 2 === 0) {
              ctx.fillStyle = c2.altRowColor
              ctx.fillRect(60, y, width - 120, 28)
            }
            ctx.fillStyle = c2.textColor
            ctx.font = `10px ${c2.fontFamily}`
            row.forEach((cell, ci) => {
              const val = String(cell ?? '—')
              ctx.fillText(val.length > 25 ? val.slice(0, 25) + '…' : val, 70 + ci * colW, y + 18)
            })
            y += 28
          })
          y += 20
        }
      }

      formatStampCanvas(config.stamp, ctx, width, height)
    },
  )

  downloadCanvas(canvas, format, slug)
  return `${slug}.${format}`
}
