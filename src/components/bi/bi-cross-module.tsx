import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import {
  Loader2,
  ArrowLeftRight,
  DollarSign,
  Package,
  ShoppingCart,
  Factory,
  TrendingUp,
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

export function BiCrossModule() {
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
    logBIAudit('view', '', 'Visualizacao: Visao Cruzada BI')
  }, [])
  useRealtime('sales_orders', () => load())
  useRealtime('financial_receivables', () => load())
  useRealtime('products', () => load())
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-2 border-[#005B2E]/20">
          <CardContent className="py-4">
            <div className="flex items-center gap-2 mb-2">
              <ArrowLeftRight className="w-5 h-5 text-[#005B2E]" />
              <h3 className="font-bold text-[#005B2E]">Vendas × Estoque</h3>
            </div>
            <p className="text-3xl font-black text-[#005B2E]">
              {fmt(data.salesVsStockAvailability)}%
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Disponibilidade de produtos para venda
            </p>
            <div className="mt-3 space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pedidos</span>
                <span>{data.sales.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sem estoque</span>
                <span className="text-red-600">{data.stock.outOfStock}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-2 border-[#005B2E]/20">
          <CardContent className="py-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-[#005B2E]" />
              <h3 className="font-bold text-[#005B2E]">Vendas × Recebíveis</h3>
            </div>
            <p className="text-3xl font-black text-[#005B2E]">{fmt(data.salesVsReceivables)}%</p>
            <p className="text-xs text-muted-foreground mt-1">Recebíveis sobre receita de vendas</p>
            <div className="mt-3 space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Receita</span>
                <span>R$ {fmt(data.sales.revenue)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">A receber</span>
                <span>R$ {fmt(data.financial.totalReceivables)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-2 border-[#005B2E]/20">
          <CardContent className="py-4">
            <div className="flex items-center gap-2 mb-2">
              <Factory className="w-5 h-5 text-[#005B2E]" />
              <h3 className="font-bold text-[#005B2E]">Produção × Vendas</h3>
            </div>
            <p className="text-3xl font-black text-[#005B2E]">
              {fmt(data.productionVsSalesForecast)}%
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Produção concluída vs pedidos de venda
            </p>
            <div className="mt-3 space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pedidos</span>
                <span>{data.sales.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">OPs concluídas</span>
                <span>{data.industrial.completed}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <BiStatCard
          icon={ShoppingCart}
          label="Receita de Vendas"
          value={`R$ ${fmt(data.sales.revenue)}`}
          color="text-[#005B2E]"
        />
        <BiStatCard
          icon={Package}
          label="Produtos com Estoque Baixo"
          value={String(data.stock.lowStock)}
          color="text-amber-600"
        />
        <BiStatCard
          icon={DollarSign}
          label="Fluxo de Caixa"
          value={`R$ ${fmt(data.financial.cashFlow)}`}
          color={data.financial.cashFlow >= 0 ? 'text-[#005B2E]' : 'text-red-600'}
        />
        <BiStatCard
          icon={TrendingUp}
          label="OPs em Produção"
          value={String(data.industrial.inProgress)}
          color="text-cyan-600"
        />
      </div>
    </div>
  )
}
