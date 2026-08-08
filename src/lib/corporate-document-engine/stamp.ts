import type { CorporateStamp } from './types'
import { CORPORATE_IDENTITY } from './identity'

export function buildStamp(params: {
  user: Record<string, unknown> | null
  empresaId: string
  filialId: string
  module: string
  documentType: string
  filters?: Record<string, string>
}): CorporateStamp {
  const now = new Date()
  return {
    empresa: params.empresaId || 'Todas',
    filial: params.filialId || 'Todas',
    userName: (params.user?.name as string) || (params.user?.email as string) || '—',
    userRole: (params.user?.role as string) || 'PADRAO',
    module: params.module,
    documentType: params.documentType,
    filters: params.filters,
    competencia: now.toLocaleDateString('pt-BR', { month: '2-digit', year: 'numeric' }),
  }
}

export function formatStampHtml(stamp: CorporateStamp): string {
  const now = new Date()
  const dateTime = now.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
  const filtersStr = stamp.filters
    ? Object.entries(stamp.filters)
        .map(([k, v]) => `${k}: ${v}`)
        .join(' | ')
    : 'Nenhum'
  return `${CORPORATE_IDENTITY.systemName} | Empresa: ${stamp.empresa} | Filial: ${stamp.filial} | Usuário: ${stamp.userName} | Data: ${dateTime} | Competência: ${stamp.competencia} | Filtros: ${filtersStr}`
}

export function formatStampCanvas(
  stamp: CorporateStamp,
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
): void {
  const now = new Date()
  const dateTime = now.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
  const filtersStr = stamp.filters
    ? Object.entries(stamp.filters)
        .map(([k, v]) => `${k}: ${v}`)
        .join(' | ')
    : 'Nenhum'

  ctx.fillStyle = CORPORATE_IDENTITY.goldColor
  ctx.font = `bold 13px ${CORPORATE_IDENTITY.fontFamily}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(
    `${CORPORATE_IDENTITY.systemName} | ${stamp.userName} | ${dateTime}`,
    width / 2,
    height - 50,
  )

  ctx.fillStyle = CORPORATE_IDENTITY.mutedTextColor
  ctx.font = `10px ${CORPORATE_IDENTITY.fontFamily}`
  ctx.fillText(
    `Empresa: ${stamp.empresa} | Filial: ${stamp.filial} | Competência: ${stamp.competencia} | Filtros: ${filtersStr}`,
    width / 2,
    height - 30,
  )
}

export function getMetaText(stamp: CorporateStamp): string {
  const now = new Date()
  const dateTime = now.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
  return `Empresa: ${stamp.empresa}<br>Filial: ${stamp.filial}<br>Usuário: ${stamp.userName}<br>${dateTime}`
}
