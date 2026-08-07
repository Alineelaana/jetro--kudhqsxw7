import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import {
  Loader2,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Percent,
  ArrowLeftRight,
  Package,
  AlertTriangle,
} from 'lucide-react'
import { getCrossModuleAnalytics } from '@/services/bi-analytics'
import { logBIAudit } from '@/services/bi'
import { useBIFilters } from './bi-filters'
import { BiStatCard } from './bi-stat-card'
import { useRealtime } from '@/hooks/use-realtime'
import type { CrossModuleAnalyticsData } from '@/lib/bi-types'

function fmt(v: number): string {
  return v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function BiDashboard() {
  const { filters } = useBIFilters()
  const [data, setData] = useState<CrossModuleAnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      setData(await getCrossModuleAnalytics(filters))
    } catch {
      /* ignore */
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [filters])
  useEffect(() => {
    logBIAudit('view', '', 'Visualizacao: Dashboard BI')
  }, [])
  useRealtime('sales_orders', () => load())
  useRealtime('financial_receivables', () => load())
  useRealtime('production_orders', () => load())

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )
  if (!data)
    return <p className="text-center py-6 text-muted-foreground">Erro ao carregar dados.</p>

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <BiStatCard
          icon={DollarSign}
          label="Receita Total"
          value={`R$ ${fmt(data.sales.revenue)}`}
          color="text-[#005B2E]"
        />
        <BiStatCard
          icon={ShoppingCart}
          label="Total de Pedidos"
          value={String(data.sales.total)}
          color="text-blue-600"
        />
        <BiStatCard
          icon={TrendingUp}
          label="Ticket Médio"
          value={`R$ ${fmt(data.sales.ticketMedio)}`}
          color="text-purple-600"
        />
        <BiStatCard
          icon={Percent}
          label="Taxa de Conversão"
          value={`${fmt(data.sales.conversionRate)}%`}
          color="text-emerald-600"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card className="border-2 border-[#005B2E]/20">
          <CardContent className="py-4">
            <div className="flex items-center gap-2 mb-2">
              <ArrowLeftRight className="w-4 h-4 text-[#005B2E]" />
              <h3 className="font-bold text-[#005B2E] text-sm">Vendas vs Estoque</h3>
            </div>
            <p className="text-2xl font-black">{fmt(data.salesVsStockAvailability)}%</p>
            <p className="text-xs text-muted-foreground">Disponibilidade de produtos</p>
          </CardContent>
        </Card>
        <Card className="border-2 border-[#005B2E]/20">
          <CardContent className="py-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-[#005B2E]" />
              <h3 className="font-bold text-[#005B2E] text-sm">Vendas vs Recebíveis</h3>
            </div>
            <p className="text-2xl font-black">{fmt(data.salesVsReceivables)}%</p>
            <p className="text-xs text-muted-foreground">Recebíveis sobre receita</p>
          </CardContent>
        </Card>
        <Card className="border-2 border-[#005B2E]/20">
          <CardContent className="py-4">
            <div className="flex items-center gap-2 mb-2">
              <Package className="w-4 h-4 text-[#005B2E]" />
              <h3 className="font-bold text-[#005B2E] text-sm">Produção vs Vendas</h3>
            </div>
            <p className="text-2xl font-black">{fmt(data.productionVsSalesForecast)}%</p>
            <p className="text-xs text-muted-foreground">Produção concluída vs pedidos</p>
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-2 border-[#005B2E]/20">
          <CardContent className="py-4">
            <h3 className="font-bold text-[#005B2E] mb-3">Top 5 Vendedores</h3>
            {data.sales.vendedorRanking.length > 0 ? (
              <div className="space-y-1">
                {data.sales.vendedorRanking.slice(0, 5).map((v, i) => (
                  <div key={i} className="flex justify-between text-sm border-b border-border py-1">
                    <span className="font-medium">{v.name}</span>
                    <span className="text-[#005B2E]">R$ {fmt(v.value)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Sem dados</p>
            )}
          </CardContent>
        </Card>
        <Card className="border-2 border-[#005B2E]/20">
          <CardContent className="py-4">
            <h3 className="font-bold text-[#005B2E] mb-3">Top 5 Clientes</h3>
            {data.sales.topClients.length > 0 ? (
              <div className="space-y-1">
                {data.sales.topClients.slice(0, 5).map((c, i) => (
                  <div key={i} className="flex justify-between text-sm border-b border-border py-1">
                    <span className="font-medium">{c.name}</span>
                    <span className="text-[#005B2E]">R$ {fmt(c.value)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Sem dados</p>
            )}
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <BiStatCard
          icon={AlertTriangle}
          label="Estoque Baixo"
          value={String(data.stock.lowStock)}
          color="text-amber-600"
        />
        <BiStatCard
          icon={Package}
          label="Sem Estoque"
          value={String(data.stock.outOfStock)}
          color="text-red-600"
        />
        <BiStatCard
          icon={DollarSign}
          label="A Receber"
          value={`R$ ${fmt(data.financial.totalReceivables)}`}
          color="text-cyan-600"
        />
        <BiStatCard
          icon={AlertTriangle}
          label="Inadimplência"
          value={`${fmt(data.financial.inadimplencia)}%`}
          color="text-red-600"
        />
      </div>
    </div>
  )
}
