import { CORPORATE_IDENTITY, getLogoUrl } from './identity'

let cachedLogo: HTMLImageElement | null = null

export function loadLogo(): Promise<HTMLImageElement> {
  if (cachedLogo?.complete && cachedLogo.naturalWidth > 0) return Promise.resolve(cachedLogo)
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      cachedLogo = img
      resolve(img)
    }
    img.onerror = () => resolve(new Image())
    img.src = getLogoUrl()
  })
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve) => {
    if (!src) {
      resolve(new Image())
      return
    }
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => resolve(new Image())
    img.src = src
  })
}

export function drawRoundedRect(
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

export function downloadCanvas(canvas: HTMLCanvasElement, format: string, filename: string) {
  const mime = format === 'jpg' ? 'image/jpeg' : 'image/png'
  canvas.toBlob(
    (blob) => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${filename}_${new Date().toISOString().split('T')[0]}.${format}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    },
    mime,
    0.95,
  )
}

export async function withBranding(
  width: number,
  height: number,
  title: string,
  userName: string,
  drawContent: (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => void,
): Promise<HTMLCanvasElement> {
  const logo = await loadLogo()
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!
  const c = CORPORATE_IDENTITY

  ctx.fillStyle = c.bgColor
  ctx.fillRect(0, 0, width, height)

  if (logo.naturalWidth > 0) {
    ctx.globalAlpha = 0.06
    const ws = Math.min(width, height) * 0.55
    ctx.drawImage(logo, (width - ws) / 2, (height - ws) / 2, ws, ws)
    ctx.globalAlpha = 1
  }

  const grad = ctx.createLinearGradient(0, 0, width, 0)
  grad.addColorStop(0, c.primaryColor)
  grad.addColorStop(1, c.primaryDarkColor)
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, width, 8)

  ctx.fillStyle = c.primaryColor
  ctx.font = `bold 26px ${c.fontFamily}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(title, width / 2, 50)

  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'
  drawContent(ctx, canvas)

  const now = new Date()
  const ds = now.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
  ctx.fillStyle = c.goldColor
  ctx.font = `bold 14px ${c.fontFamily}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(`${c.systemName} — ${userName} — ${ds}`, width / 2, height - 25)

  return canvas
}
