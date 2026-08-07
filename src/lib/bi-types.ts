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
