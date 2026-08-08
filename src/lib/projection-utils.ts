export const PROJECTION_FORMULA = 'PROJEÇÃO = FATURADO ÷ DIAS ÚTEIS DECORRIDOS × DIAS ÚTEIS TOTAIS'

export interface ProjectionFilters {
  empresa: string
  filial: string
  competencia: string
  rca: string
  gerente: string
  fornecedor: string
  industria: string
  marca: string
  categoria: string
  produto: string
  regiao: string
  estado: string
  cidade: string
  cliente: string
  canal: string
  origem_venda: string
}

export interface ProjectionKPIs {
  meta: number
  vendido: number
  faturado: number
  pct_meta: number
  restante: number
  media_dia: number
  dias_uteis_decorridos: number
  dias_uteis_restantes: number
  dias_uteis_totais: number
  projecao: number
  pct_projetado: number
  diferenca_projetada: number
  tendencia: string
}

export interface DimensionRow {
  name: string
  meta: number
  vendido: number
  faturado: number
  pct_meta: number
  media_dia: number
  projecao: number
  pct_projetado: number
  diferenca: number
  status: string
}

export interface ProjectionData {
  kpis: ProjectionKPIs
  dimensions: Record<string, DimensionRow[]>
  daily_evolution: Array<{ date: string; faturado: number }>
  competencia: string
  elapsed_days: number
  total_days: number
}

export interface BusinessDaysConfig {
  id: string
  empresa: string
  filial: string
  mes: number
  ano: number
  total_business_days: number
  responsible_user: string
  responsible_user_name: string
  config_date: string
  last_change_date: string
  last_changed_by: string
}

export function fmt(v: number): string {
  return (v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
export function fmtCurrency(v: number): string {
  return `R$ ${fmt(v)}`
}
export function fmtPct(v: number): string {
  return `${fmt(v)}%`
}

export function getTendenciaInfo(t: string): { icon: string; label: string; color: string } {
  switch (t) {
    case 'acima':
      return { icon: '🟢', label: 'Acima da Meta', color: 'text-emerald-600' }
    case 'proximo':
      return { icon: '🟡', label: 'Próximo da Meta', color: 'text-amber-600' }
    case 'abaixo':
      return { icon: '🔴', label: 'Abaixo da Meta', color: 'text-red-600' }
    default:
      return { icon: '⚪', label: 'Sem Meta', color: 'text-muted-foreground' }
  }
}

export function getStatusInfo(s: string): { icon: string; label: string; color: string } {
  switch (s) {
    case 'acima':
      return { icon: '🟢', label: 'Acima', color: 'text-emerald-600' }
    case 'proximo':
      return { icon: '🟡', label: 'Próximo', color: 'text-amber-600' }
    case 'abaixo':
      return { icon: '🔴', label: 'Abaixo', color: 'text-red-600' }
    default:
      return { icon: '⚪', label: 'Sem Meta', color: 'text-muted-foreground' }
  }
}

export function suggestBusinessDays(mes: number, ano: number): number {
  const dim = new Date(ano, mes, 0).getDate()
  let c = 0
  for (let d = 1; d <= dim; d++) {
    const dt = new Date(ano, mes - 1, d),
      dow = dt.getDay()
    if (dow !== 0 && dow !== 6) c++
  }
  return c
}

export function getCurrentCompetencia(): string {
  const n = new Date()
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}`
}

export const DIMENSIONS = [
  { key: 'rca', label: 'RCA' },
  { key: 'gerente', label: 'Gerente' },
  { key: 'fornecedor', label: 'Fornecedor' },
  { key: 'produto', label: 'Produto' },
  { key: 'regiao', label: 'Região' },
] as const

export const EMPTY_FILTERS: ProjectionFilters = {
  empresa: '',
  filial: '',
  competencia: getCurrentCompetencia(),
  rca: '',
  gerente: '',
  fornecedor: '',
  industria: '',
  marca: '',
  categoria: '',
  produto: '',
  regiao: '',
  estado: '',
  cidade: '',
  cliente: '',
  canal: '',
  origem_venda: '',
}
