import pb from '@/lib/pocketbase/client'
import type { ProjectionData, ProjectionFilters, BusinessDaysConfig } from '@/lib/projection-utils'

export async function getProjectionData(
  filters: Partial<ProjectionFilters>,
): Promise<ProjectionData> {
  const params = new URLSearchParams()
  if (filters.empresa) params.set('empresa', filters.empresa)
  if (filters.filial) params.set('filial', filters.filial)
  if (filters.competencia) params.set('competencia', filters.competencia)
  if (filters.rca) params.set('rca', filters.rca)
  if (filters.gerente) params.set('gerente', filters.gerente)
  if (filters.fornecedor) params.set('fornecedor', filters.fornecedor)
  if (filters.produto) params.set('produto', filters.produto)
  if (filters.regiao) params.set('regiao', filters.regiao)
  if (filters.cliente) params.set('cliente', filters.cliente)
  const qs = params.toString()
  return pb.send(`/backend/v1/projection/data${qs ? `?${qs}` : ''}`, { method: 'GET' })
}

export async function getBusinessDaysConfig(
  mes: number,
  ano: number,
  empresa?: string,
  filial?: string,
): Promise<BusinessDaysConfig | null> {
  try {
    const parts = [`mes = ${mes}`, `ano = ${ano}`]
    if (empresa) parts.push(`empresa = "${empresa}"`)
    if (filial) parts.push(`filial = "${filial}"`)
    const res = await pb
      .collection('business_days_configs')
      .getList(1, 1, { filter: parts.join(' && ') })
    return (res.items[0] as unknown as BusinessDaysConfig) || null
  } catch {
    return null
  }
}

export async function saveBusinessDaysConfig(data: {
  mes: number
  ano: number
  total_business_days: number
  empresa?: string
  filial?: string
}): Promise<{ id: string; created?: boolean; updated?: boolean }> {
  return pb.send('/backend/v1/projection/business-days-config', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
  })
}

export function logProjectionExport(format: string, filters: Partial<ProjectionFilters>) {
  pb.send('/backend/v1/audit/create', {
    method: 'POST',
    body: JSON.stringify({
      action: 'export',
      module: 'bi',
      target_collection: 'projection_exports',
      target_summary: `Projeção de Vendas (${format}) - Comp: ${filters.competencia || 'atual'}`,
      empresa: filters.empresa || '',
      filial: filters.filial || '',
    }),
    headers: { 'Content-Type': 'application/json' },
  }).catch(() => {})
}
