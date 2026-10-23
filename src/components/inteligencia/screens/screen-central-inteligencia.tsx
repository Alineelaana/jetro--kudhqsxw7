import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Package,
  Factory,
  Truck,
  Percent,
  Wallet,
  Building2,
  RefreshCw,
  ChevronRight,
  ExternalLink,
  Target,
  AlertTriangle,
  Users,
  BarChart3,
  CalendarClock,
  Sparkles,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useBrand } from '@/hooks/use-brand'
import { useRealtime } from '@/hooks/use-realtime'
import { toast } from '@/hooks/use-toast'
import pb from '@/lib/pocketbase/client'
import { getExecutiveAnalytics } from '@/services/bi-analytics-extended'
import { logBIAudit } from '@/services/bi'
import type { ExecutiveAnalyticsData } from '@/lib/bi-types'
import { BiDrillDown } from '@/components/bi/bi-drill-down'

function fmtBRL(v: number): string {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function fmtNum(v: number): string {
  return v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function ScreenCentralInteligencia() {
  const navigate = useNavigate()
  const { brand, empresasDisponiveis, empresaAtivaId } = useBrand()
  const [data, setData] = useState<ExecutiveAnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [drillTarget, setDrillTarget] = useState<string | null>(null)

  const empresaAtualNome = useMemo(() => {
    const emp = empresasDisponiveis?.find((e: any) => e.id === empresaAtivaId)
    return (
      emp?.nome_fantasia ||
      emp?.razao_social ||
      brand?.nomeExibicao ||
      brand?.empresaNome ||
      'Todas as Empresas'
    )
  }, [empresasDisponiveis, empresaAtivaId, brand])

  const loadData = async () => {
    try {
      const res = await getExecutiveAnalytics()
      setData(res)
    } catch {
      setData(null)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadData()
    logBIAudit('view', '', 'Visualização: Central de Inteligência Executiva')
  }, [empresaAtivaId])

  useRealtime('sales_orders', () => loadData())
  useRealtime('financial_receivables', () => loadData())
  useRealtime('stock_movements', () => loadData())

  const handleRefresh = () => {
    setRefreshing(true)
    loadData()
    toast({ title: 'Central de Inteligência atualizada com sucesso' })
  }

  return (
    <div className="space-y-4">
      {/* CABEÇALHO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#005B2E] text-white shadow-sm">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-black text-foreground tracking-tight">
                Central de Inteligência
              </h1>
              <Badge
                variant="outline"
                className="text-xs bg-[#005B2E]/10 text-[#005B2E] font-bold border-[#005B2E]/30"
              >
                Torre de Controle Executiva
              </Badge>
              {empresaAtivaId && (
                <Badge variant="secondary" className="text-xs flex items-center gap-1 font-medium">
                  <Building2 className="w-3 h-3 text-[#005B2E]" />
                  {empresaAtualNome}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Visão consolidada multiárea (Comercial, Estoque, Financeiro, Industrial, Logística e
              Vendas) com indicadores clicáveis e navegação analítica.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing || loading}
            className="text-xs focus-visible:ring-[#005B2E]"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${refreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button
            size="sm"
            onClick={() => navigate('/admin/inteligencia/relatorios')}
            className="text-xs bg-[#005B2E] hover:bg-[#004724] text-white font-bold"
          >
            <CalendarClock className="w-3.5 h-3.5 mr-1.5" />
            Relatórios & Agendamentos
          </Button>
        </div>
      </div>

      {/* 6 CARDS CLICÁVEIS POR ÁREA NAVEGANDO PARA AS ABAS DA TELA POR-AREA */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* 1. COMERCIAL */}
        <button
          type="button"
          onClick={() => navigate('/admin/inteligencia/por-area?tab=comercial')}
          className="text-left p-3 rounded-xl border-2 border-emerald-200 bg-emerald-50/40 hover:border-[#005B2E] hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-800">Comercial</span>
            <DollarSign className="w-3.5 h-3.5 text-[#005B2E]" />
          </div>
          <span className="text-lg font-black text-[#005B2E] block mt-1 truncate">
            {data ? fmtBRL(data.faturamento) : '—'}
          </span>
          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
            Faturamento <ChevronRight className="w-2.5 h-2.5" />
          </span>
        </button>

        {/* 2. ESTOQUE */}
        <button
          type="button"
          onClick={() => navigate('/admin/inteligencia/por-area?tab=estoque')}
          className="text-left p-3 rounded-xl border-2 border-purple-200 bg-purple-50/40 hover:border-purple-500 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-purple-800">Estoque</span>
            <Package className="w-3.5 h-3.5 text-purple-600" />
          </div>
          <span className="text-lg font-black text-purple-700 block mt-1 truncate">
            {data ? `${data.estoque} itens` : '—'}
          </span>
          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
            Giro & Ruptura <ChevronRight className="w-2.5 h-2.5" />
          </span>
        </button>

        {/* 3. FINANCEIRO */}
        <button
          type="button"
          onClick={() => navigate('/admin/inteligencia/por-area?tab=financeiro')}
          className="text-left p-3 rounded-xl border-2 border-blue-200 bg-blue-50/40 hover:border-blue-500 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-blue-800">Financeiro</span>
            <Wallet className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <span className="text-lg font-black text-blue-700 block mt-1 truncate">
            {data ? fmtBRL(data.fluxoCaixa) : '—'}
          </span>
          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
            Fluxo de Caixa <ChevronRight className="w-2.5 h-2.5" />
          </span>
        </button>

        {/* 4. INDUSTRIAL */}
        <button
          type="button"
          onClick={() => navigate('/admin/inteligencia/por-area?tab=industrial')}
          className="text-left p-3 rounded-xl border-2 border-amber-200 bg-amber-50/40 hover:border-amber-500 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-800">Industrial</span>
            <Factory className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <span className="text-lg font-black text-amber-700 block mt-1 truncate">
            {data ? `${data.producao} ordens` : '—'}
          </span>
          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
            OEE & Produção <ChevronRight className="w-2.5 h-2.5" />
          </span>
        </button>

        {/* 5. LOGÍSTICA */}
        <button
          type="button"
          onClick={() => navigate('/admin/inteligencia/por-area?tab=logistica')}
          className="text-left p-3 rounded-xl border-2 border-teal-200 bg-teal-50/40 hover:border-teal-500 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-teal-800">Logística</span>
            <Truck className="w-3.5 h-3.5 text-teal-600" />
          </div>
          <span className="text-lg font-black text-teal-700 block mt-1 truncate">
            {data ? `${data.expedicao} entregas` : '—'}
          </span>
          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
            OTIF & Fretes <ChevronRight className="w-2.5 h-2.5" />
          </span>
        </button>

        {/* 6. VENDAS */}
        <button
          type="button"
          onClick={() => navigate('/admin/inteligencia/por-area?tab=vendas')}
          className="text-left p-3 rounded-xl border-2 border-rose-200 bg-rose-50/40 hover:border-rose-500 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-rose-800">Vendas</span>
            <ShoppingCart className="w-3.5 h-3.5 text-rose-600" />
          </div>
          <span className="text-lg font-black text-rose-700 block mt-1 truncate">
            {data ? `${data.pedidos} pedidos` : '—'}
          </span>
          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
            Volume & Ticket <ChevronRight className="w-2.5 h-2.5" />
          </span>
        </button>
      </div>

      {/* PAINEL DE INDICADORES EXECUTIVOS CONSOLIDADOS */}
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-2 border-[#005B2E]/20 shadow-sm">
            <CardContent className="py-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-[#005B2E] flex items-center gap-1.5 text-sm">
                  <TrendingUp className="w-4 h-4" /> Desempenho Econômico
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/admin/inteligencia/por-area?tab=financeiro')}
                  className="text-xs h-7 text-[#005B2E]"
                >
                  Ver Área <ChevronRight className="w-3 h-3 ml-0.5" />
                </Button>
              </div>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between border-b pb-1.5">
                  <span className="text-muted-foreground">Receita Líquida</span>
                  <span className="font-semibold text-foreground">
                    {fmtBRL(data.receitaLiquida)}
                  </span>
                </div>
                <div className="flex justify-between border-b pb-1.5">
                  <span className="text-muted-foreground">Lucro Bruto</span>
                  <span className="font-semibold text-blue-600">{fmtBRL(data.lucroBruto)}</span>
                </div>
                <div className="flex justify-between border-b pb-1.5">
                  <span className="text-muted-foreground">EBITDA Gerencial</span>
                  <span className="font-bold text-purple-600">{fmtBRL(data.ebitda)}</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-muted-foreground">Margem Operacional</span>
                  <span className="font-black text-[#005B2E]">{fmtNum(data.margem)}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-[#005B2E]/20 shadow-sm">
            <CardContent className="py-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-[#005B2E] flex items-center gap-1.5 text-sm">
                  <Users className="w-4 h-4" /> Clientes & Carteira
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/admin/inteligencia/por-area?tab=comercial')}
                  className="text-xs h-7 text-[#005B2E]"
                >
                  Ver Área <ChevronRight className="w-3 h-3 ml-0.5" />
                </Button>
              </div>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between border-b pb-1.5">
                  <span className="text-muted-foreground">Clientes Ativos</span>
                  <span className="font-semibold text-foreground">{data.clientesAtivos}</span>
                </div>
                <div className="flex justify-between border-b pb-1.5">
                  <span className="text-muted-foreground">Novos Clientes (Mês)</span>
                  <span className="font-semibold text-emerald-600">{data.novosClientes}</span>
                </div>
                <div className="flex justify-between border-b pb-1.5">
                  <span className="text-muted-foreground">Ticket Médio</span>
                  <span className="font-semibold text-foreground">{fmtBRL(data.ticketMedio)}</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-muted-foreground">Inadimplência</span>
                  <span className="font-bold text-amber-600">{fmtNum(data.inadimplencia)}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-[#005B2E]/20 shadow-sm">
            <CardContent className="py-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-[#005B2E] flex items-center gap-1.5 text-sm">
                  <Target className="w-4 h-4" /> Projeções & Alertas
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/admin/inteligencia/dashboards-projecoes')}
                  className="text-xs h-7 text-[#005B2E]"
                >
                  Projeções <ChevronRight className="w-3 h-3 ml-0.5" />
                </Button>
              </div>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between border-b pb-1.5">
                  <span className="text-muted-foreground">Projeção Mensal</span>
                  <span className="font-bold text-[#005B2E]">{fmtBRL(data.projecao)}</span>
                </div>
                <div className="flex justify-between border-b pb-1.5">
                  <span className="text-muted-foreground">Crescimento Previsto</span>
                  <span
                    className={`font-semibold ${
                      data.crescimento >= 0 ? 'text-emerald-600' : 'text-red-600'
                    }`}
                  >
                    {data.crescimento >= 0 ? '+' : ''}
                    {fmtNum(data.crescimento)}%
                  </span>
                </div>
                <div className="flex justify-between border-b pb-1.5">
                  <span className="text-muted-foreground">Capital Empatado</span>
                  <span className="font-semibold text-orange-600">
                    {fmtBRL(data.capitalEmpatado)}
                  </span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-muted-foreground">Alertas Ativos</span>
                  <span className="font-bold text-red-600">{data.alertas} pendências</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ATALHOS RÁPIDOS INFERIORES */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
        <button
          type="button"
          onClick={() => navigate('/admin/inteligencia/dashboards-projecoes')}
          className="p-4 rounded-xl border border-border bg-card hover:border-[#005B2E] hover:shadow-sm text-left transition-all"
        >
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-foreground text-sm">Dashboards e Projeções</h4>
            <Sparkles className="w-4 h-4 text-[#005B2E]" />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Personalize visões executivas e simule tendências de faturamento e metas.
          </p>
        </button>

        <button
          type="button"
          onClick={() => navigate('/admin/inteligencia/por-area')}
          className="p-4 rounded-xl border border-border bg-card hover:border-[#005B2E] hover:shadow-sm text-left transition-all"
        >
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-foreground text-sm">Inteligência por Área</h4>
            <BarChart3 className="w-4 h-4 text-[#005B2E]" />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Aprofunde métricas de Comercial, Estoque, Financeiro, Indústria, Logística e Vendas.
          </p>
        </button>

        <button
          type="button"
          onClick={() => navigate('/admin/inteligencia/relatorios')}
          className="p-4 rounded-xl border border-border bg-card hover:border-[#005B2E] hover:shadow-sm text-left transition-all"
        >
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-foreground text-sm">Relatórios e Agendamentos</h4>
            <CalendarClock className="w-4 h-4 text-[#005B2E]" />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Acesse relatórios corporativos e configure disparos periódicos automatizados por e-mail.
          </p>
        </button>
      </div>

      <BiDrillDown target={drillTarget} onClose={() => setDrillTarget(null)} />
    </div>
  )
}
