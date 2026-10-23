import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Truck,
  Activity,
  Layers,
  MapPin,
  Clock,
  AlertTriangle,
  Boxes,
  DollarSign,
  PackageCheck,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Building2,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useBrand } from '@/hooks/use-brand'
import { LogisticsOrchestrationDashboard } from '@/components/logistics/logistics-orchestration-dashboard'
import { LogisticsDashboard } from '@/components/logistics/logistics-dashboard'
import { LogisticsPlanning } from '@/components/logistics/logistics-planning'
import { LogisticsExceptions } from '@/components/logistics/logistics-exceptions'
import {
  getDeliveries,
  getVehicles,
  getFreights,
  getOccurrences,
  getRoutes,
} from '@/services/logistics'
import { getJourneys } from '@/services/transport-journeys'
import { useRealtime } from '@/hooks/use-realtime'
import { toast } from '@/hooks/use-toast'

export function ScreenCentralLogistica() {
  const navigate = useNavigate()
  const { brand, empresasDisponiveis, empresaAtivaId } = useBrand()
  const [currentTab, setCurrentTab] = useState('cockpit')
  const [refreshing, setRefreshing] = useState(false)
  const [loading, setLoading] = useState(true)

  const [stats, setStats] = useState({
    emTransito: 0,
    veiculosOp: 0,
    ocorrenciasAbertas: 0,
    rotasAtivas: 0,
    fretesTotal: 0,
    viagensAtivas: 0,
  })

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

  const loadKpis = async () => {
    try {
      const [deliveries, vehicles, occurrences, routes, freights, journeys] = await Promise.all([
        getDeliveries().catch(() => []),
        getVehicles().catch(() => []),
        getOccurrences().catch(() => []),
        getRoutes().catch(() => []),
        getFreights().catch(() => []),
        getJourneys().catch(() => []),
      ])

      const delArr = deliveries as any[]
      const vehArr = vehicles as any[]
      const occArr = occurrences as any[]
      const rouArr = routes as any[]
      const freArr = freights as any[]
      const jouArr = journeys as any[]

      const emTransito = delArr.filter((d) =>
        ['Em Trânsito', 'Saiu para Entrega'].includes(d.status),
      ).length
      const veiculosOp = vehArr.filter((v) => v.situacao === 'Em Rota').length
      const ocorrenciasAbertas = occArr.filter((o) =>
        ['Aberta', 'Em Análise'].includes(o.situacao),
      ).length
      const rotasAtivas = rouArr.length
      const fretesTotal = freArr.reduce((acc, f) => acc + parseFloat(f.valor_total || '0'), 0)
      const viagensAtivas = jouArr.filter(
        (j) => !['Finalizada', 'Cancelada'].includes(j.status),
      ).length

      setStats({
        emTransito,
        veiculosOp,
        ocorrenciasAbertas,
        rotasAtivas,
        fretesTotal,
        viagensAtivas,
      })
    } catch {
      // safe fallback
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadKpis()
  }, [empresaAtivaId])

  useRealtime('logistics_deliveries', () => loadKpis())
  useRealtime('logistics_vehicles', () => loadKpis())
  useRealtime('logistics_occurrences', () => loadKpis())
  useRealtime('transport_journeys', () => loadKpis())

  const handleRefresh = () => {
    setRefreshing(true)
    loadKpis()
    toast({ title: 'Dados da Central Logística atualizados' })
  }

  const fmtCurrency = (v: number) =>
    v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  return (
    <div className="space-y-4">
      {/* CABEÇALHO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#005B2E] text-white shadow-sm">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-black text-foreground tracking-tight">
                Central Logística
              </h1>
              <Badge
                variant="outline"
                className="text-xs bg-[#005B2E]/10 text-[#005B2E] font-bold border-[#005B2E]/30"
              >
                Torre de Controle Logístico & TMS
              </Badge>
              {empresaAtivaId && (
                <Badge variant="secondary" className="text-xs flex items-center gap-1 font-medium">
                  <Building2 className="w-3 h-3 text-[#005B2E]" />
                  {empresaAtualNome}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Visão gerencial consolidada, indicadores clicáveis em tempo real, orquestração WMS-TMS
              e central de exceções.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
            className="text-xs focus-visible:ring-[#005B2E]"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${refreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* INDICADORES CLICÁVEIS CONFORME ESPECIFICAÇÃO:
          Clicar no indicador direciona diretamente para a tela operacional correspondente */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* 1. Entregas em Trânsito -> Distribuição e Entregas */}
        <button
          type="button"
          onClick={() => navigate('/admin/logistica/distribuicao-entregas')}
          className="text-left p-3 rounded-xl border-2 border-emerald-200 bg-emerald-50/40 hover:border-[#005B2E] hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-800">Em Trânsito</span>
            <ExternalLink className="w-3.5 h-3.5 text-muted-foreground group-hover:text-[#005B2E]" />
          </div>
          <span className="text-2xl font-black text-[#005B2E] block mt-1">{stats.emTransito}</span>
          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
            Distribuição & Entregas <ChevronRight className="w-2.5 h-2.5" />
          </span>
        </button>

        {/* 2. Veículos em Operação -> Transporte e Frota */}
        <button
          type="button"
          onClick={() => navigate('/admin/logistica/transporte-frota')}
          className="text-left p-3 rounded-xl border-2 border-indigo-200 bg-indigo-50/40 hover:border-indigo-500 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-indigo-800">Veículos em Rota</span>
            <ExternalLink className="w-3.5 h-3.5 text-muted-foreground group-hover:text-indigo-600" />
          </div>
          <span className="text-2xl font-black text-indigo-700 block mt-1">{stats.veiculosOp}</span>
          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
            Transporte & Frota <ChevronRight className="w-2.5 h-2.5" />
          </span>
        </button>

        {/* 3. Ocorrências Ativas -> Ocorrências e Rastreabilidade */}
        <button
          type="button"
          onClick={() => navigate('/admin/logistica/ocorrencias-rastreabilidade')}
          className="text-left p-3 rounded-xl border-2 border-rose-200 bg-rose-50/40 hover:border-rose-500 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-rose-800">Ocorrências</span>
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
          </div>
          <span className="text-2xl font-black text-rose-700 block mt-1">
            {stats.ocorrenciasAbertas}
          </span>
          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
            Rastreamento & Ocorrências <ChevronRight className="w-2.5 h-2.5" />
          </span>
        </button>

        {/* 4. Rotas Programadas -> Rotas e Roteirização */}
        <button
          type="button"
          onClick={() => navigate('/admin/logistica/rotas-roteirizacao')}
          className="text-left p-3 rounded-xl border-2 border-blue-200 bg-blue-50/40 hover:border-blue-500 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-blue-800">Rotas Ativas</span>
            <ExternalLink className="w-3.5 h-3.5 text-muted-foreground group-hover:text-blue-600" />
          </div>
          <span className="text-2xl font-black text-blue-700 block mt-1">{stats.rotasAtivas}</span>
          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
            Rotas & Roteirização <ChevronRight className="w-2.5 h-2.5" />
          </span>
        </button>

        {/* 5. Custo Total de Fretes -> Frete e Tabelas */}
        <button
          type="button"
          onClick={() => navigate('/admin/logistica/frete-tabelas')}
          className="text-left p-3 rounded-xl border-2 border-amber-200 bg-amber-50/40 hover:border-amber-500 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-800">Fretes Totais</span>
            <DollarSign className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <span className="text-lg font-black text-amber-700 block mt-1 truncate">
            {fmtCurrency(stats.fretesTotal)}
          </span>
          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
            Frete & Tabelas <ChevronRight className="w-2.5 h-2.5" />
          </span>
        </button>

        {/* 6. Viagens Ativas -> Custos e Indicadores */}
        <button
          type="button"
          onClick={() => navigate('/admin/logistica/custos-indicadores')}
          className="text-left p-3 rounded-xl border-2 border-purple-200 bg-purple-50/40 hover:border-purple-500 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-purple-800">Viagens Ativas</span>
            <Activity className="w-3.5 h-3.5 text-purple-600" />
          </div>
          <span className="text-2xl font-black text-purple-700 block mt-1">
            {stats.viagensAtivas}
          </span>
          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
            Custos & Indicadores <ChevronRight className="w-2.5 h-2.5" />
          </span>
        </button>
      </div>

      {/* ABAS DA CENTRAL LOGÍSTICA */}
      <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-4">
        <TabsList className="bg-muted/60 p-1 rounded-xl grid grid-cols-2 md:grid-cols-4 h-auto gap-1">
          <TabsTrigger value="cockpit" className="text-xs py-2 font-bold flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[#005B2E]" />
            <span>Cockpit Logístico</span>
          </TabsTrigger>
          <TabsTrigger value="painel" className="text-xs py-2 font-bold flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-blue-600" />
            <span>Painel Operacional</span>
          </TabsTrigger>
          <TabsTrigger
            value="planejamento"
            className="text-xs py-2 font-bold flex items-center gap-1.5"
          >
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Fila de Planejamento</span>
          </TabsTrigger>
          <TabsTrigger
            value="excecoes"
            className="text-xs py-2 font-bold flex items-center gap-1.5"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            <span>Central de Exceções</span>
          </TabsTrigger>
        </TabsList>

        {/* ABA 1: COCKPIT LOGÍSTICO */}
        <TabsContent value="cockpit" className="space-y-4">
          <LogisticsOrchestrationDashboard />
        </TabsContent>

        {/* ABA 2: PAINEL OPERACIONAL */}
        <TabsContent value="painel" className="space-y-4">
          <LogisticsDashboard />
        </TabsContent>

        {/* ABA 3: PLANEJAMENTO GERAL */}
        <TabsContent value="planejamento" className="space-y-4">
          <LogisticsPlanning />
        </TabsContent>

        {/* ABA 4: EXCEÇÕES E ALERTAS */}
        <TabsContent value="excecoes" className="space-y-4">
          <LogisticsExceptions />
        </TabsContent>
      </Tabs>
    </div>
  )
}
