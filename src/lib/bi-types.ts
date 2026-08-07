export interface BIFilters {
  empresa?: string
  filial?: string
  startDate?: string
  endDate?: string
}

export interface SalesAnalyticsData {
  total: number
  revenue: number
  ticketMedio: number
  conversionRate: number
  approved: number
  cancelled: number
  vendedorRanking: Array<{ name: string; count: number; value: number }>
  topClients: Array<{ name: string; count: number; value: number }>
}

export interface StockAnalyticsData {
  totalProducts: number
  lowStock: number
  outOfStock: number
  totalStockValue: number
  alerts: number
  unresolvedAlerts: number
  lowStockItems: Array<Record<string, unknown>>
}

export interface FinancialAnalyticsData {
  totalReceivables: number
  totalPayables: number
  overdueReceivables: number
  overduePayables: number
  cashFlow: number
  inadimplencia: number
  movements: number
}

export interface IndustrialAnalyticsData {
  total: number
  completed: number
  inProgress: number
  late: number
  onTimeRate: number
}

export interface CrossModuleAnalyticsData {
  sales: SalesAnalyticsData
  stock: StockAnalyticsData
  financial: FinancialAnalyticsData
  industrial: IndustrialAnalyticsData
  salesVsStockAvailability: number
  salesVsReceivables: number
  productionVsSalesForecast: number
}

export interface BIReport {
  id: string
  name: string
  description: string
  configuration: Record<string, unknown>
  filters: Record<string, unknown>
  report_type: string
  company: string
  branch: string
  created_by: string
  created_by_name: string
  is_shared: boolean
  created: string
  updated: string
}

export interface BIDashboard {
  id: string
  owner: string
  owner_name: string
  name: string
  description: string
  center: string
  layout: Record<string, unknown>
  widgets: Record<string, unknown>
  is_shared: boolean
  shared_users: string[]
  company: string
  branch: string
  saved_filters: Record<string, unknown>
  favorite_indicators: string[]
  created: string
  updated: string
}

export interface ExecutiveAnalyticsData {
  faturamento: number
  receitaLiquida: number
  lucroBruto: number
  ebitda: number
  margem: number
  fluxoCaixa: number
  contasReceber: number
  contasPagar: number
  inadimplencia: number
  pedidos: number
  producao: number
  expedicao: number
  compras: number
  estoque: number
  capitalEmpatado: number
  clientesAtivos: number
  novosClientes: number
  ticketMedio: number
  crescimento: number
  projecao: number
  alertas: number
}

export interface CommercialIntelligenceData {
  faturamento: number
  projecao: number
  meta: number
  percentualMeta: number
  diasUteis: number
  diasDecorridos: number
  topVendedores: Array<{ name: string; value: number; count: number }>
  topMargem: Array<{ name: string; value: number }>
  baixaMargem: Array<{ name: string; value: number }>
  clientesCrescimento: Array<{ name: string; value: number }>
  clientesDeclinio: Array<{ name: string; value: number }>
  clientesInativos: number
  produtosRentaveis: Array<{ name: string; value: number }>
  produtosBaixaRent: Array<{ name: string; value: number }>
  regioesLucrativas: Array<{ name: string; value: number }>
  mix: number
  positivacao: number
  pipeline: number
  conversao: number
  comparativoMesAnterior: number
  breakdownRca: Array<{ name: string; value: number; projecao: number }>
  breakdownProduto: Array<{ name: string; value: number; projecao: number }>
  breakdownRegiao: Array<{ name: string; value: number; projecao: number }>
}

export interface GenericCenterData {
  stats: Array<{ label: string; value: string; color: string }>
  tables: Array<{
    title: string
    columns: Array<{ key: string; label: string }>
    rows: Array<Record<string, unknown>>
  }>
}

export interface CenterConfig {
  key: string
  title: string
  description: string
  loadFunction: (filters: BIFilters) => Promise<GenericCenterData>
}
