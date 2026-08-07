import pb from '@/lib/pocketbase/client'
import type {
  BIFilters,
  SalesAnalyticsData,
  StockAnalyticsData,
  FinancialAnalyticsData,
  IndustrialAnalyticsData,
  CrossModuleAnalyticsData,
} from '@/lib/bi-types'

type Rec = Record<string, unknown>

function parseNum(v: unknown): number {
  const n = parseFloat(String(v || '0'))
  return isNaN(n) ? 0 : n
}

function applyFilters(records: Rec[], filters: BIFilters, dateField = 'created'): Rec[] {
  return records.filter((r) => {
    if (filters.empresa && r.company && r.company !== filters.empresa) return false
    if (filters.filial && r.branch && r.branch !== filters.filial) return false
    if (
      filters.startDate &&
      r[dateField] &&
      new Date(r[dateField] as string) < new Date(filters.startDate)
    )
      return false
    if (
      filters.endDate &&
      r[dateField] &&
      new Date(r[dateField] as string) > new Date(filters.endDate + 'T23:59:59')
    )
      return false
    return true
  })
}

export async function getSalesAnalytics(filters: BIFilters = {}): Promise<SalesAnalyticsData> {
  const orders = await pb
    .collection('sales_orders')
    .getFullList()
    .catch(() => [])
  const f = applyFilters(orders as Rec[], filters)
  const total = f.length
  const revenue = f.reduce((s, o) => s + parseNum(o.total_value), 0)
  const ticketMedio = total > 0 ? revenue / total : 0
  const approved = f.filter((o) =>
    ['Aprovado', 'Faturado Totalmente', 'Entregue'].includes(o.status as string),
  )
  const cancelled = f.filter((o) => o.status === 'Cancelado')
  const vMap: Record<string, { name: string; count: number; value: number }> = {}
  f.forEach((o) => {
    const n = (o.salesperson_name as string) || 'N/A'
    if (!vMap[n]) vMap[n] = { name: n, count: 0, value: 0 }
    vMap[n].count++
    vMap[n].value += parseNum(o.total_value)
  })
  const cMap: Record<string, { name: string; count: number; value: number }> = {}
  f.forEach((o) => {
    const n = (o.client_name as string) || 'N/A'
    if (!cMap[n]) cMap[n] = { name: n, count: 0, value: 0 }
    cMap[n].count++
    cMap[n].value += parseNum(o.total_value)
  })
  return {
    total,
    revenue,
    ticketMedio,
    conversionRate: total > 0 ? (approved.length / total) * 100 : 0,
    approved: approved.length,
    cancelled: cancelled.length,
    vendedorRanking: Object.values(vMap).sort((a, b) => b.value - a.value),
    topClients: Object.values(cMap)
      .sort((a, b) => b.value - a.value)
      .slice(0, 10),
  }
}

export async function getStockAnalytics(filters: BIFilters = {}): Promise<StockAnalyticsData> {
  const [products, alerts] = await Promise.all([
    pb
      .collection('products')
      .getFullList()
      .catch(() => []),
    pb
      .collection('stock_alerts')
      .getFullList()
      .catch(() => []),
  ])
  const fp = applyFilters(products as Rec[], filters)
  const lowStock = fp.filter((p) => (Number(p.stock) || 0) <= (Number(p.min_stock) || 0))
  const outOfStock = fp.filter((p) => (Number(p.stock) || 0) <= 0)
  return {
    totalProducts: fp.length,
    lowStock: lowStock.length,
    outOfStock: outOfStock.length,
    totalStockValue: fp.reduce((s, p) => s + parseNum(p.cost_price) * (Number(p.stock) || 0), 0),
    alerts: alerts.length,
    unresolvedAlerts: (alerts as Rec[]).filter((a) => !a.resolved).length,
    lowStockItems: lowStock.slice(0, 10),
  }
}

export async function getFinancialAnalytics(
  filters: BIFilters = {},
): Promise<FinancialAnalyticsData> {
  const [rec, pay, mov] = await Promise.all([
    pb
      .collection('financial_receivables')
      .getFullList()
      .catch(() => []),
    pb
      .collection('financial_payables')
      .getFullList()
      .catch(() => []),
    pb
      .collection('financial_movements')
      .getFullList()
      .catch(() => []),
  ])
  const rf = applyFilters(rec as Rec[], filters)
  const pf = applyFilters(pay as Rec[], filters)
  const mf = applyFilters(mov as Rec[], filters)
  const now = new Date()
  const overRec = rf.filter(
    (r) =>
      r.due_date &&
      new Date(r.due_date as string) < now &&
      !['Recebido', 'Cancelado'].includes(r.status as string),
  )
  const overPay = pf.filter(
    (p) =>
      p.due_date &&
      new Date(p.due_date as string) < now &&
      !['Pago', 'Cancelado'].includes(p.status as string),
  )
  const entradas = mf.reduce((s, m) => s + parseNum(m.entrada), 0)
  const saidas = mf.reduce((s, m) => s + parseNum(m.saida), 0)
  const totalRec = rf.reduce((s, r) => s + parseNum(r.value), 0)
  return {
    totalReceivables: totalRec,
    totalPayables: pf.reduce((s, p) => s + parseNum(p.value), 0),
    overdueReceivables: overRec.length,
    overduePayables: overPay.length,
    cashFlow: entradas - saidas,
    inadimplencia:
      totalRec > 0 ? (overRec.reduce((s, r) => s + parseNum(r.value), 0) / totalRec) * 100 : 0,
    movements: mf.length,
  }
}

export async function getIndustrialAnalytics(
  filters: BIFilters = {},
): Promise<IndustrialAnalyticsData> {
  const orders = await pb
    .collection('production_orders')
    .getFullList()
    .catch(() => [])
  const f = applyFilters(orders as Rec[], filters)
  const total = f.length
  const completed = f.filter((o) => ['concluida', 'fechada'].includes(o.status as string))
  const inProg = f.filter((o) =>
    ['em_producao', 'iniciada', 'liberada'].includes(o.status as string),
  )
  const late = f.filter(
    (o) =>
      o.end_date &&
      new Date(o.end_date as string) < new Date() &&
      !['concluida', 'fechada', 'cancelada'].includes(o.status as string),
  )
  return {
    total,
    completed: completed.length,
    inProgress: inProg.length,
    late: late.length,
    onTimeRate: total > 0 ? ((total - late.length) / total) * 100 : 0,
  }
}

export async function getCrossModuleAnalytics(
  filters: BIFilters = {},
): Promise<CrossModuleAnalyticsData> {
  const [sales, stock, financial, industrial] = await Promise.all([
    getSalesAnalytics(filters),
    getStockAnalytics(filters),
    getFinancialAnalytics(filters),
    getIndustrialAnalytics(filters),
  ])
  return {
    sales,
    stock,
    financial,
    industrial,
    salesVsStockAvailability:
      stock.totalProducts > 0
        ? ((stock.totalProducts - stock.outOfStock) / stock.totalProducts) * 100
        : 0,
    salesVsReceivables: sales.revenue > 0 ? (financial.totalReceivables / sales.revenue) * 100 : 0,
    productionVsSalesForecast:
      industrial.total > 0 && sales.total > 0 ? (industrial.completed / sales.total) * 100 : 0,
  }
}
