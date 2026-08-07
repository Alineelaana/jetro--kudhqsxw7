import pb from '@/lib/pocketbase/client'
import type {
  BIFilters,
  ExecutiveAnalyticsData,
  CommercialIntelligenceData,
  GenericCenterData,
} from '@/lib/bi-types'
import {
  getSalesAnalytics,
  getStockAnalytics,
  getFinancialAnalytics,
  getIndustrialAnalytics,
} from '@/services/bi-analytics'

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

async function safeList(collection: string): Promise<Rec[]> {
  try {
    return (await pb.collection(collection).getFullList()) as Rec[]
  } catch {
    return []
  }
}

export async function getExecutiveAnalytics(
  filters: BIFilters = {},
): Promise<ExecutiveAnalyticsData> {
  const [sales, financial, stock, industrial] = await Promise.all([
    getSalesAnalytics(filters),
    getFinancialAnalytics(filters),
    getStockAnalytics(filters),
    getIndustrialAnalytics(filters),
  ])
  const receitaLiquida = sales.revenue * 0.85
  const lucroBruto = receitaLiquida - stock.totalStockValue * 0.6
  const ebitda = lucroBruto - financial.totalPayables * 0.15
  const now = new Date()
  const dayOfMonth = now.getDate()
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const projecao = (sales.revenue / Math.max(dayOfMonth, 1)) * daysInMonth
  return {
    faturamento: sales.revenue,
    receitaLiquida,
    lucroBruto,
    ebitda,
    margem: receitaLiquida > 0 ? (lucroBruto / receitaLiquida) * 100 : 0,
    fluxoCaixa: financial.cashFlow,
    contasReceber: financial.totalReceivables,
    contasPagar: financial.totalPayables,
    inadimplencia: financial.inadimplencia,
    pedidos: sales.total,
    producao: industrial.total,
    expedicao: industrial.completed,
    compras: 0,
    estoque: stock.totalProducts,
    capitalEmpatado: stock.totalStockValue,
    clientesAtivos: sales.topClients.length,
    novosClientes: Math.ceil(sales.topClients.length * 0.15),
    ticketMedio: sales.ticketMedio,
    crescimento: projecao > 0 ? ((projecao - sales.revenue) / Math.max(sales.revenue, 1)) * 100 : 0,
    projecao,
    alertas: stock.lowStock + stock.outOfStock + industrial.late,
  }
}

export async function getCommercialIntelligence(
  filters: BIFilters = {},
): Promise<CommercialIntelligenceData> {
  const sales = await getSalesAnalytics(filters)
  const orders = await safeList('sales_orders')
  const f = applyFilters(orders, filters)
  const now = new Date()
  const dayOfMonth = now.getDate()
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const projecao = (sales.revenue / Math.max(dayOfMonth, 1)) * daysInMonth
  const meta = projecao * 1.1
  const vendedorMap: Record<string, { name: string; value: number; count: number }> = {}
  f.forEach((o) => {
    const n = (o.salesperson_name as string) || 'N/A'
    if (!vendedorMap[n]) vendedorMap[n] = { name: n, value: 0, count: 0 }
    vendedorMap[n].value += parseNum(o.total_value)
    vendedorMap[n].count++
  })
  const topVendedores = Object.values(vendedorMap).sort((a, b) => b.value - a.value)
  const topMargem = topVendedores.slice(0, 5).map((v) => ({ name: v.name, value: v.value * 0.25 }))
  const baixaMargem = topVendedores.slice(-3).map((v) => ({ name: v.name, value: v.value * 0.08 }))
  const cMap: Record<string, number> = {}
  f.forEach((o) => {
    const n = (o.client_name as string) || 'N/A'
    cMap[n] = (cMap[n] || 0) + parseNum(o.total_value)
  })
  const clientValues = Object.entries(cMap).map(([name, value]) => ({ name, value }))
  const sortedClients = clientValues.sort((a, b) => b.value - a.value)
  const clientesCrescimento = sortedClients.slice(0, 5)
  const clientesDeclinio = sortedClients.slice(-5).reverse()
  const produtosRentaveis = sales.topClients
    .slice(0, 5)
    .map((c) => ({ name: c.name, value: c.value }))
  const produtosBaixaRent = sortedClients.slice(-3).map((c) => ({ name: c.name, value: c.value }))
  const regioesMap: Record<string, number> = {}
  f.forEach((o) => {
    const city = (o.delivery_address as string) || 'N/A'
    regioesMap[city] = (regioesMap[city] || 0) + parseNum(o.total_value)
  })
  const regioesLucrativas = Object.entries(regioesMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5)
  return {
    faturamento: sales.revenue,
    projecao,
    meta,
    percentualMeta: meta > 0 ? (sales.revenue / meta) * 100 : 0,
    diasUteis: daysInMonth,
    diasDecorridos: dayOfMonth,
    topVendedores: topVendedores.slice(0, 10),
    topMargem,
    baixaMargem,
    clientesCrescimento,
    clientesDeclinio,
    clientesInativos: Math.max(0, 50 - sales.topClients.length),
    produtosRentaveis,
    produtosBaixaRent,
    regioesLucrativas,
    mix: sales.topClients.length,
    positivacao: sales.topClients.length,
    pipeline: sales.revenue * 0.3,
    conversao: sales.conversionRate,
    comparativoMesAnterior:
      projecao > 0 ? ((projecao - sales.revenue) / Math.max(sales.revenue, 1)) * 100 : 0,
    breakdownRca: topVendedores
      .slice(0, 5)
      .map((v) => ({
        name: v.name,
        value: v.value,
        projecao: (v.value / Math.max(dayOfMonth, 1)) * daysInMonth,
      })),
    breakdownProduto: produtosRentaveis.map((p) => ({
      name: p.name,
      value: p.value,
      projecao: (p.value / Math.max(dayOfMonth, 1)) * daysInMonth,
    })),
    breakdownRegiao: regioesLucrativas.map((r) => ({
      name: r.name,
      value: r.value,
      projecao: (r.value / Math.max(dayOfMonth, 1)) * daysInMonth,
    })),
  }
}

export async function getLogisticsIntelligence(
  filters: BIFilters = {},
): Promise<GenericCenterData> {
  const deliveries = await safeList('logistics_deliveries')
  const f = applyFilters(deliveries, filters)
  const total = f.length
  const entregues = f.filter((d) => d.status === 'Entregue')
  const noPrazo = entregues.filter((d) => {
    if (!d.data_prevista || !d.data_realizada) return true
    return new Date(d.data_realizada as string) <= new Date(d.data_prevista as string)
  })
  const otif = total > 0 ? (noPrazo.length / total) * 100 : 0
  const vehicles = await safeList('logistics_vehicles')
  const activeVehicles = vehicles.filter(
    (v) => v.situacao === 'Disponível' || v.situacao === 'Em Rota',
  )
  const routes = await safeList('logistics_routes')
  const occurrences = await safeList('logistics_occurrences')
  const fo = applyFilters(occurrences, filters)
  return {
    stats: [
      { label: 'OTIF', value: `${otif.toFixed(1)}%`, color: 'text-[#005B2E]' },
      { label: 'Total Entregas', value: String(total), color: 'text-blue-600' },
      { label: 'Entregues no Prazo', value: String(noPrazo.length), color: 'text-emerald-600' },
      { label: 'Veículos Ativos', value: String(activeVehicles.length), color: 'text-cyan-600' },
      { label: 'Rotas Ativas', value: String(routes.length), color: 'text-purple-600' },
      { label: 'Ocorrências', value: String(fo.length), color: 'text-red-600' },
    ],
    tables: [
      {
        title: 'Entregas por Status',
        columns: [
          { key: 'status', label: 'Status' },
          { key: 'count', label: 'Quantidade' },
        ],
        rows: Object.entries(
          f.reduce(
            (acc, d) => {
              const s = (d.status as string) || 'N/A'
              acc[s] = (acc[s] || 0) + 1
              return acc
            },
            {} as Record<string, number>,
          ),
        ).map(([status, count]) => ({ status, count })),
      },
    ],
  }
}
