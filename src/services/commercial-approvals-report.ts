import * as XLSX from 'xlsx'
import type { CommercialReleaseDivergence, CommercialReleaseRequest } from './commercial-approvals'

export interface ReportFilters {
  status?: string
  search?: string
  empresaId?: string
  filialId?: string
  rcaName?: string
  responsavelId?: string
  ruleType?: string
  dateFrom?: string
  dateTo?: string
}

function fmtDate(value?: string | null): string {
  if (!value) return ''
  try {
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) return value
    return d.toLocaleString('pt-BR')
  } catch {
    return value || ''
  }
}

function analysisTime(
  request?: CommercialReleaseRequest,
  divergence?: CommercialReleaseDivergence,
): string {
  const created = divergence?.created || request?.created
  const decided = divergence?.decided_at
  if (!created || !decided) return ''
  const diff = new Date(decided).getTime() - new Date(created).getTime()
  if (Number.isNaN(diff) || diff < 0) return ''
  const hours = Math.floor(diff / 3600000)
  const minutes = Math.round((diff % 3600000) / 60000)
  if (hours > 24) {
    const days = Math.floor(hours / 24)
    return `${days}d ${hours % 24}h`
  }
  return `${hours}h ${minutes}min`
}

function fmtValue(v: number | undefined, unit?: string): string {
  if (v === undefined || v === null || Number.isNaN(v)) return ''
  if (unit === 'percent') return `${v.toFixed(4)}%`
  return v.toFixed(4)
}

export interface BuildReportInput {
  requests: CommercialReleaseRequest[]
  divergencesByRequest: Record<string, CommercialReleaseDivergence[]>
}

export function buildReleaseReportRows(input: BuildReportInput) {
  const rows: Record<string, string | number>[] = []
  for (const request of input.requests) {
    const divs = input.divergencesByRequest[request.id] || []
    if (divs.length === 0) {
      rows.push({
        'Nº Pedido': request.order_number,
        Cliente: request.client_name,
        RCA: request.rca_name,
        'Empresa/Filial': [request.empresa_id, request.filial_id].filter(Boolean).join(' / '),
        Item: '',
        'Regra comercial': '',
        'Valor do pedido': request.order_value ?? 0,
        Limite: '',
        'Valor solicitado': '',
        Status: request.status,
        Responsável: request.responsavel_name,
        'Decidido por': '',
        'Data da solicitação': fmtDate(request.created),
        'Data da decisão': '',
        'Tempo de análise': '',
        'Motivo da recusa': '',
      })
      continue
    }
    for (const d of divs) {
      rows.push({
        'Nº Pedido': request.order_number,
        Cliente: request.client_name,
        RCA: request.rca_name,
        'Empresa/Filial': [request.empresa_id, request.filial_id].filter(Boolean).join(' / '),
        Item: [d.product_code, d.product_description].filter(Boolean).join(' - '),
        'Regra comercial': d.rule_description,
        'Valor do pedido': request.order_value ?? 0,
        Limite: fmtValue(d.limit_value, d.limit_unit),
        'Valor solicitado': fmtValue(d.requested_value, d.requested_unit),
        Status: d.status,
        Responsável: request.responsavel_name,
        'Decidido por': d.decided_by,
        'Data da solicitação': fmtDate(request.created),
        'Data da decisão': fmtDate(d.decided_at),
        'Tempo de análise': analysisTime(request, d),
        'Motivo da recusa': d.decision_note || '',
      })
    }
  }
  return rows
}

export function exportReleaseReportToExcel(input: BuildReportInput, filters: ReportFilters) {
  const rows = buildReleaseReportRows(input)
  const totalPedidos = input.requests.length
  const totalDivergencias = rows.length

  const ws = XLSX.utils.json_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Liberações')

  // Resumo com totais SEPARADOS
  const summary = [
    { Indicador: 'Total de pedidos', Valor: totalPedidos },
    { Indicador: 'Total de divergências', Valor: totalDivergencias },
  ]
  const wsSummary = XLSX.utils.json_to_sheet(summary)
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Resumo')

  const filterParts: string[] = []
  if (filters.status) filterParts.push(`Situação: ${filters.status}`)
  if (filters.search) filterParts.push(`Busca: ${filters.search}`)
  if (filters.empresaId) filterParts.push(`Empresa: ${filters.empresaId}`)
  if (filters.filialId) filterParts.push(`Filial: ${filters.filialId}`)
  if (filters.rcaName) filterParts.push(`RCA: ${filters.rcaName}`)
  if (filters.responsavelId) filterParts.push(`Responsável: ${filters.responsavelId}`)
  if (filters.ruleType) filterParts.push(`Divergência: ${filters.ruleType}`)
  if (filters.dateFrom) filterParts.push(`De: ${filters.dateFrom}`)
  if (filters.dateTo) filterParts.push(`Até: ${filters.dateTo}`)
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet([{ Filtros: filterParts.join(' | ') || 'Todos' }]),
    'Filtros',
  )

  const fileName = `liberacoes-comerciais-${new Date().toISOString().slice(0, 10)}.xlsx`
  XLSX.writeFile(wb, fileName)
  return { fileName, totalPedidos, totalDivergencias }
}
