import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import {
  Loader2,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Percent,
  Wallet,
  Factory,
  Package,
  Users,
  AlertTriangle,
  Target,
  BarChart3,
} from 'lucide-react'
import { getExecutiveAnalytics } from '@/services/bi-analytics-extended'
import { logBIAudit } from '@/services/bi'
import { useBIFilters } from '../bi-filters'
import { BiStatCard } from '../bi-stat-card'
import { BiDrillDown } from '../bi-drill-down'
import { useRealtime } from '@/hooks/use-realtime'
import type { ExecutiveAnalyticsData } from '@/lib/bi-types'

function fmt(v: number): string {
  return v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function BiExecutive() {
  const { filters } = useBIFilters()
  const [data, setData] = useState<ExecutiveAnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [drillTarget, setDrillTarget] = useState<string | null>(null)

  const load = async () => {
    try {
      setData(await getExecutiveAnalytics(filters))
    } catch {
      setData(null)
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [filters])
  useEffect(() => {
    logBIAudit('view', '', 'Visualizacao: Dashboard Executivo Enterprise')
  }, [])
  useRealtime('sales_orders', () => load())
  useRealtime('financial_receivables', () => load())

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
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <button onClick={() => setDrillTarget('Faturamento')}>
          <BiStatCard
            icon={DollarSign}
            label="Faturamento"
            value={`R$ ${fmt(data.faturamento)}`}
            color="text-[#005B2E]"
          />
        </button>
        <button onClick={() => setDrillTarget('Receita Líquida')}>
          <BiStatCard
            icon={TrendingUp}
            label="Receita Líquida"
            value={`R$ ${fmt(data.receitaLiquida)}`}
            color="text-emerald-600"
          />
        </button>
        <button onClick={() => setDrillTarget('Lucro Bruto')}>
          <BiStatCard
            icon={DollarSign}
            label="Lucro Bruto"
            value={`R$ ${fmt(data.lucroBruto)}`}
            color="text-blue-600"
          />
        </button>
        <button onClick={() => setDrillTarget('EBITDA')}>
          <BiStatCard
            icon={BarChart3}
            label="EBITDA"
            value={`R$ ${fmt(data.ebitda)}`}
            color="text-purple-600"
          />
        </button>
        <button onClick={() => setDrillTarget('Margem')}>
          <BiStatCard
            icon={Percent}
            label="Margem"
            value={`${fmt(data.margem)}%`}
            color="text-cyan-600"
          />
        </button>
        <button onClick={() => setDrillTarget('Fluxo de Caixa')}>
          <BiStatCard
            icon={Wallet}
            label="Fluxo de Caixa"
            value={`R$ ${fmt(data.fluxoCaixa)}`}
            color={data.fluxoCaixa >= 0 ? 'text-[#005B2E]' : 'text-red-600'}
          />
        </button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <BiStatCard
          icon={DollarSign}
          label="Contas a Receber"
          value={`R$ ${fmt(data.contasReceber)}`}
          color="text-emerald-600"
        />
        <BiStatCard
          icon={DollarSign}
          label="Contas a Pagar"
          value={`R$ ${fmt(data.contasPagar)}`}
          color="text-red-600"
        />
        <BiStatCard
          icon={Percent}
          label="Inadimplência"
          value={`${fmt(data.inadimplencia)}%`}
          color="text-amber-600"
        />
        <BiStatCard
          icon={ShoppingCart}
          label="Pedidos"
          value={String(data.pedidos)}
          color="text-blue-600"
        />
        <BiStatCard
          icon={Factory}
          label="Produção"
          value={String(data.producao)}
          color="text-cyan-600"
        />
        <BiStatCard
          icon={Package}
          label="Estoque"
          value={String(data.estoque)}
          color="text-purple-600"
        />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <BiStatCard
          icon={DollarSign}
          label="Capital Empatado"
          value={`R$ ${fmt(data.capitalEmpatado)}`}
          color="text-orange-600"
        />
        <BiStatCard
          icon={Users}
          label="Clientes Ativos"
          value={String(data.clientesAtivos)}
          color="text-[#005B2E]"
        />
        <BiStatCard
          icon={Users}
          label="Novos Clientes"
          value={String(data.novosClientes)}
          color="text-emerald-600"
        />
        <BiStatCard
          icon={TrendingUp}
          label="Ticket Médio"
          value={`R$ ${fmt(data.ticketMedio)}`}
          color="text-blue-600"
        />
        <BiStatCard
          icon={Target}
          label="Projeção"
          value={`R$ ${fmt(data.projecao)}`}
          color="text-[#005B2E]"
        />
        <BiStatCard
          icon={AlertTriangle}
          label="Alertas"
          value={String(data.alertas)}
          color="text-red-600"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-2 border-[#005B2E]/20">
          <CardContent className="py-4">
            <h3 className="font-bold text-[#005B2E] mb-2">Indicadores Financeiros</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between border-b border-border py-1">
                <span className="text-muted-foreground">Faturamento</span>
                <span className="font-medium">R$ {fmt(data.faturamento)}</span>
              </div>
              <div className="flex justify-between border-b border-border py-1">
                <span className="text-muted-foreground">EBITDA</span>
                <span className="font-medium">R$ {fmt(data.ebitda)}</span>
              </div>
              <div className="flex justify-between border-b border-border py-1">
                <span className="text-muted-foreground">Margem</span>
                <span className="font-bold text-[#005B2E]">{fmt(data.margem)}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-2 border-[#005B2E]/20">
          <CardContent className="py-4">
            <h3 className="font-bold text-[#005B2E] mb-2">Indicadores Operacionais</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between border-b border-border py-1">
                <span className="text-muted-foreground">Pedidos</span>
                <span className="font-medium">{data.pedidos}</span>
              </div>
              <div className="flex justify-between border-b border-border py-1">
                <span className="text-muted-foreground">Produção</span>
                <span className="font-medium">{data.producao}</span>
              </div>
              <div className="flex justify-between border-b border-border py-1">
                <span className="text-muted-foreground">Expedição</span>
                <span className="font-medium">{data.expedicao}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-2 border-[#005B2E]/20">
          <CardContent className="py-4">
            <h3 className="font-bold text-[#005B2E] mb-2">Projeções & Metas</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between border-b border-border py-1">
                <span className="text-muted-foreground">Projeção Mensal</span>
                <span className="font-bold text-[#005B2E]">R$ {fmt(data.projecao)}</span>
              </div>
              <div className="flex justify-between border-b border-border py-1">
                <span className="text-muted-foreground">Crescimento</span>
                <span className={data.crescimento >= 0 ? 'text-emerald-600' : 'text-red-600'}>
                  {fmt(data.crescimento)}%
                </span>
              </div>
              <div className="flex justify-between border-b border-border py-1">
                <span className="text-muted-foreground">Alertas Estratégicos</span>
                <span className="text-red-600">{data.alertas}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <BiDrillDown target={drillTarget} onClose={() => setDrillTarget(null)} />
    </div>
  )
}
