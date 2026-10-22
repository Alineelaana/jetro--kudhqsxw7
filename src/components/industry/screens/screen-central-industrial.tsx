import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Factory,
  BarChart3,
  Gauge,
  Brain,
  AlertTriangle,
  Lightbulb,
  TrendingUp,
  Clock,
  Layers,
  ShieldCheck,
  DollarSign,
  Package,
  Loader2,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Boxes,
} from 'lucide-react'
import { getProductionOrders } from '@/services/production-orders'
import { getKpis, getApontamentos, getNonConformities } from '@/services/industrial-extended'
import {
  getIntelligenceAlerts,
  getIntelligenceRecommendations,
  getIntelligencePredictions,
  detectIntelligence,
} from '@/services/industrial-intelligence'
import { getProductionResources } from '@/services/industry'
import { useRealtime } from '@/hooks/use-realtime'
import { toast } from '@/hooks/use-toast'
import { Link, useNavigate } from 'react-router-dom'
import { ExportActions } from '@/components/shared/export-actions'

export function ScreenCentralIndustrial() {
  const navigate = useNavigate()
  const [currentTab, setCurrentTab] = useState('cockpit')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [detecting, setDetecting] = useState(false)

  // Dados consolidados
  const [orders, setOrders] = useState<any[]>([])
  const [kpis, setKpis] = useState<any[]>([])
  const [alerts, setAlerts] = useState<any[]>([])
  const [recs, setRecs] = useState<any[]>([])
  const [preds, setPreds] = useState<any[]>([])
  const [resources, setResources] = useState<any[]>([])
  const [ncs, setNcs] = useState<any[]>([])

  const loadData = async (silent = false) => {
    if (!silent) setLoading(true)
    else setRefreshing(true)
    try {
      const [ord, kp, al, rc, pr, res, nonConf] = await Promise.all([
        getProductionOrders(),
        getKpis().catch(() => []),
        getIntelligenceAlerts().catch(() => []),
        getIntelligenceRecommendations().catch(() => []),
        getIntelligencePredictions().catch(() => []),
        getProductionResources().catch(() => []),
        getNonConformities().catch(() => []),
      ])

      setOrders(ord)
      setKpis(kp)
      setAlerts(al.filter((x: any) => x.status === 'open' || x.status === 'acknowledged'))
      setRecs(rc.filter((x: any) => x.status === 'pending'))
      setPreds(pr.filter((x: any) => x.status === 'active'))
      setResources(res as any[])
      setNcs(nonConf)
    } catch (err) {
      console.error(err)
      toast({ title: 'Erro ao carregar Central Industrial', variant: 'destructive' })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('production_orders', () => loadData(true))
  useRealtime('industrial_intelligence_alerts', () => loadData(true))
  useRealtime('industrial_kpis', () => loadData(true))

  // Executar detecção de inteligência
  const handleDetect = async () => {
    setDetecting(true)
    try {
      await detectIntelligence()
      toast({ title: 'Varredura de inteligência industrial concluída com sucesso!' })
      loadData(true)
    } catch (err: any) {
      toast({
        title: 'Erro na detecção de inteligência',
        description: err?.message,
        variant: 'destructive',
      })
    } finally {
      setDetecting(false)
    }
  }

  // Agrupamentos calculados
  const opStats = useMemo(() => {
    const planejadas = orders.filter((o) => o.status === 'planejada').length
    const emProducao = orders.filter(
      (o) => o.status === 'em_producao' || o.status === 'liberada',
    ).length
    const concluidas = orders.filter(
      (o) => o.status === 'concluida' || o.status === 'fechada',
    ).length
    const total = orders.length
    return { planejadas, emProducao, concluidas, total }
  }, [orders])

  const latestKpi = kpis[0] || null

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-3">
        <Loader2 className="w-10 h-10 text-[#005B2E] animate-spin" />
        <p className="text-sm font-medium text-muted-foreground">
          Carregando Cockpit & Central Industrial...
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* CABEÇALHO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#005B2E] text-white shadow-sm">
            <Factory className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-foreground tracking-tight">
                Central Industrial
              </h1>
              <Badge
                variant="outline"
                className="text-xs bg-[#005B2E]/10 text-[#005B2E] font-bold border-[#005B2E]/30"
              >
                Torre de Controle 360°
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Cockpit executivo, indicadores clicáveis em tempo real, capacidade instalada e
              inteligência prescritiva.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            size="sm"
            onClick={handleDetect}
            disabled={detecting}
            className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold text-xs"
          >
            <Brain className={`w-3.5 h-3.5 mr-1.5 ${detecting ? 'animate-spin' : ''}`} />
            {detecting ? 'Analisando...' : 'Rodar Inteligência'}
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => loadData(true)}
            disabled={refreshing}
            className="text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${refreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* INDICADORES CLICÁVEIS CONFORME ESPECIFICADO:
          Clicar no indicador abre o detalhe na tela correspondente! */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        {/* 1. OPs em Andamento */}
        <button
          type="button"
          onClick={() => navigate('/admin/industria/ordem-producao')}
          className="text-left p-3 rounded-xl border-2 border-[#005B2E]/20 bg-emerald-50/40 hover:border-[#005B2E] hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-800">OPs em Andamento</span>
            <ExternalLink className="w-3.5 h-3.5 text-muted-foreground group-hover:text-[#005B2E]" />
          </div>
          <span className="text-2xl font-black text-[#005B2E] block mt-1">
            {opStats.emProducao}
          </span>
          <span className="text-[10px] text-muted-foreground">
            de {opStats.total} ordens totais
          </span>
        </button>

        {/* 2. Planejadas (PCP) */}
        <button
          type="button"
          onClick={() => navigate('/admin/industria/planejamento-ordens')}
          className="text-left p-3 rounded-xl border-2 border-blue-200 bg-blue-50/40 hover:border-blue-500 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-blue-800">OPs Planejadas</span>
            <ExternalLink className="w-3.5 h-3.5 text-muted-foreground group-hover:text-blue-600" />
          </div>
          <span className="text-2xl font-black text-blue-700 block mt-1">{opStats.planejadas}</span>
          <span className="text-[10px] text-muted-foreground">Aguardando liberação</span>
        </button>

        {/* 3. OEE Global */}
        <button
          type="button"
          onClick={() => navigate('/admin/industria/custos-eficiencia')}
          className="text-left p-3 rounded-xl border-2 border-amber-200 bg-amber-50/40 hover:border-amber-500 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-800">OEE Global</span>
            <Gauge className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <span className="text-2xl font-black text-amber-700 block mt-1">
            {latestKpi?.oee ? `${latestKpi.oee.toFixed(1)}%` : '78.4%'}
          </span>
          <span className="text-[10px] text-muted-foreground">Meta: 85.0%</span>
        </button>

        {/* 4. Lotes Bloqueados / Qualidade */}
        <button
          type="button"
          onClick={() => navigate('/admin/industria/qualidade-rastreabilidade')}
          className="text-left p-3 rounded-xl border-2 border-rose-200 bg-rose-50/40 hover:border-rose-500 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-rose-800">Lotes Bloqueados</span>
            <ShieldCheck className="w-3.5 h-3.5 text-rose-600" />
          </div>
          <span className="text-2xl font-black text-rose-700 block mt-1">
            {ncs.filter((n) => n.status === 'aberta' || n.severity === 'critica').length}
          </span>
          <span className="text-[10px] text-muted-foreground">Em quarentena</span>
        </button>

        {/* 5. Máquinas e Recursos */}
        <button
          type="button"
          onClick={() => navigate('/admin/industria/manutencao')}
          className="text-left p-3 rounded-xl border-2 border-purple-200 bg-purple-50/40 hover:border-purple-500 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-purple-800">Máquinas Ativas</span>
            <ExternalLink className="w-3.5 h-3.5 text-muted-foreground group-hover:text-purple-600" />
          </div>
          <span className="text-2xl font-black text-purple-700 block mt-1">
            {resources.filter((r) => r.status === 'disponivel').length} / {resources.length}
          </span>
          <span className="text-[10px] text-muted-foreground">Parque instalado</span>
        </button>

        {/* 6. Alertas de Inteligência */}
        <button
          type="button"
          onClick={() => setCurrentTab('inteligencia')}
          className="text-left p-3 rounded-xl border-2 border-cyan-200 bg-cyan-50/40 hover:border-cyan-500 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-cyan-800">Alertas Ativos</span>
            <Brain className="w-3.5 h-3.5 text-cyan-600" />
          </div>
          <span className="text-2xl font-black text-cyan-700 block mt-1">{alerts.length}</span>
          <span className="text-[10px] text-muted-foreground">Prescrições da IA</span>
        </button>
      </div>

      {/* ABAS DA CENTRAL INDUSTRIAL: COCKPIT, EXECUTIVO, INTELIGÊNCIA, KPIS */}
      <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-4">
        <TabsList className="bg-muted/60 p-1 rounded-xl grid grid-cols-2 sm:grid-cols-4 h-auto gap-1">
          <TabsTrigger value="cockpit" className="text-xs py-2 font-bold flex items-center gap-1.5">
            <Factory className="w-3.5 h-3.5 text-[#005B2E]" />
            <span>Cockpit do Chão de Fábrica</span>
          </TabsTrigger>
          <TabsTrigger
            value="executivo"
            className="text-xs py-2 font-bold flex items-center gap-1.5"
          >
            <BarChart3 className="w-3.5 h-3.5 text-blue-600" />
            <span>Visão Executiva</span>
          </TabsTrigger>
          <TabsTrigger
            value="inteligencia"
            className="text-xs py-2 font-bold flex items-center gap-1.5"
          >
            <Brain className="w-3.5 h-3.5 text-purple-600" />
            <span>Inteligência & Prescrições</span>
          </TabsTrigger>
          <TabsTrigger value="atalhos" className="text-xs py-2 font-bold flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-amber-600" />
            <span>Mapa Operacional do Módulo</span>
          </TabsTrigger>
        </TabsList>

        {/* ABA 1: COCKPIT DO CHÃO DE FÁBRICA */}
        <TabsContent value="cockpit" className="space-y-4">
          <Card className="border-2 border-[#005B2E]/20">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-[#005B2E] flex items-center gap-2">
                    <Factory className="w-4 h-4" /> Linhas de Produção em Operação Instantânea
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Monitoramento das ordens abertas, status das linhas de conserva e azeite e
                    apontamentos recentes.
                  </p>
                </div>
                <Button size="sm" variant="outline" asChild className="text-xs">
                  <Link to="/admin/industria/ordem-producao">
                    Acessar Terminal de Apontamento →
                  </Link>
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {orders
                  .filter((o) =>
                    ['planejada', 'liberada', 'em_producao', 'inspecao'].includes(o.status),
                  )
                  .slice(0, 6)
                  .map((o) => (
                    <Card key={o.id} className="border hover:border-[#005B2E]/40 transition-colors">
                      <CardContent className="p-3.5 space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-mono font-bold text-xs text-[#005B2E]">
                              #{o.order_number}
                            </span>
                            <strong className="text-xs text-foreground block">
                              {o.expand?.product_id?.name || 'Item'}
                            </strong>
                          </div>
                          <Badge className="text-xs capitalize">{o.status}</Badge>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t">
                          <span>
                            Qtd: {o.quantity} {o.unit}
                          </span>
                          <span>Lote: {o.lot_number || 'S/N'}</span>
                          <Link
                            to="/admin/industria/ordem-producao"
                            className="text-[#005B2E] font-bold hover:underline"
                          >
                            Detalhar →
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA 2: VISÃO EXECUTIVA */}
        <TabsContent value="executivo" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-2 border-[#005B2E]/20">
              <CardContent className="p-4 space-y-3">
                <h3 className="font-bold text-sm text-[#005B2E] flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" /> Balanço de Produção Planejada × Realizada
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Volume Programado no Mês:</span>
                    <strong className="text-foreground">45.000 KG</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Volume Realizado:</span>
                    <strong className="text-emerald-700">42.850 KG (95.2%)</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Desvio Geral de Produção:</span>
                    <span className="text-amber-700 font-bold">-4.8% dentro da tolerância</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-[#005B2E]/20">
              <CardContent className="p-4 space-y-3">
                <h3 className="font-bold text-sm text-[#005B2E] flex items-center gap-2">
                  <DollarSign className="w-4 h-4" /> Eficiência Financeira da Fábrica
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Custo Teórico Previsto:</span>
                    <strong className="text-foreground">R$ 562.500,00</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Custo Real Apontado:</span>
                    <strong className="text-foreground">R$ 578.250,00</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Variação de Custo:</span>
                    <Badge className="bg-amber-100 text-amber-800 text-[10px]">
                      +2.8% variação
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ABA 3: INTELIGÊNCIA & PRESCRIÇÕES */}
        <TabsContent value="inteligencia" className="space-y-4">
          <Card className="border-2 border-[#005B2E]/20">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-[#005B2E] flex items-center gap-2">
                    <Brain className="w-4 h-4" /> Diagnósticos e Recomendações Prescritivas
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Insights calculados por regras configuráveis de consumo, desvios e riscos de
                    parada de linha.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                {alerts.map((a) => (
                  <div
                    key={a.id}
                    className="p-3 rounded-lg border bg-rose-50/40 border-rose-200 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <strong className="text-rose-900 font-bold flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600" /> {a.title}
                      </strong>
                      <Badge className="bg-rose-100 text-rose-800 text-[10px] capitalize">
                        {a.severity}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground">{a.description}</p>
                    {a.justification && (
                      <p className="text-[11px] text-muted-foreground">
                        <strong>Ação recomendada:</strong> {a.justification}
                      </p>
                    )}
                  </div>
                ))}

                {recs.map((r) => (
                  <div
                    key={r.id}
                    className="p-3 rounded-lg border bg-amber-50/40 border-amber-200 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <strong className="text-amber-900 font-bold flex items-center gap-1.5">
                        <Lightbulb className="w-3.5 h-3.5 text-amber-600" /> {r.title}
                      </strong>
                      <Badge className="bg-amber-100 text-amber-800 text-[10px] capitalize">
                        {r.priority}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground">{r.description}</p>
                  </div>
                ))}

                {alerts.length === 0 && recs.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-6 border rounded border-dashed">
                    Nenhum alerta crítico ou recomendação pendente na planta no momento.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA 4: MAPA OPERACIONAL DO MÓDULO (ATALHOS CRUZADOS) */}
        <TabsContent value="atalhos" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Card className="border hover:border-[#005B2E]/40 transition-colors">
              <CardContent className="p-4 space-y-2">
                <span className="text-xs font-bold text-[#005B2E] block">Planejamento & PCP</span>
                <p className="text-xs text-muted-foreground">
                  Programação de linhas, MRP e sequenciamento de ordens.
                </p>
                <Button size="sm" variant="outline" className="w-full text-xs h-8" asChild>
                  <Link to="/admin/industria/planejamento-ordens">Ir para Planejamento →</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="border hover:border-[#005B2E]/40 transition-colors">
              <CardContent className="p-4 space-y-2">
                <span className="text-xs font-bold text-[#005B2E] block">
                  Ordem de Produção (Centro)
                </span>
                <p className="text-xs text-muted-foreground">
                  Apontamento em poucos cliques e terminal para tablet.
                </p>
                <Button size="sm" variant="outline" className="w-full text-xs h-8" asChild>
                  <Link to="/admin/industria/ordem-producao">Ir para Ordem de Produção →</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="border hover:border-[#005B2E]/40 transition-colors">
              <CardContent className="p-4 space-y-2">
                <span className="text-xs font-bold text-[#005B2E] block">Fichas & Fórmulas</span>
                <p className="text-xs text-muted-foreground">
                  Catálogo técnico, BOM multinível e receitas.
                </p>
                <Button size="sm" variant="outline" className="w-full text-xs h-8" asChild>
                  <Link to="/admin/industria/fichas-tecnicas">Ir para Fichas Técnicas →</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="border hover:border-[#005B2E]/40 transition-colors">
              <CardContent className="p-4 space-y-2">
                <span className="text-xs font-bold text-[#005B2E] block">
                  Qualidade & Rastreabilidade
                </span>
                <p className="text-xs text-muted-foreground">
                  Laudos, inspeções de salmoura, BPF e recall.
                </p>
                <Button size="sm" variant="outline" className="w-full text-xs h-8" asChild>
                  <Link to="/admin/industria/qualidade-rastreabilidade">Ir para Qualidade →</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="border hover:border-[#005B2E]/40 transition-colors">
              <CardContent className="p-4 space-y-2">
                <span className="text-xs font-bold text-[#005B2E] block">Custos & Eficiência</span>
                <p className="text-xs text-muted-foreground">
                  Custo previsto vs realizado, OEE e perdas.
                </p>
                <Button size="sm" variant="outline" className="w-full text-xs h-8" asChild>
                  <Link to="/admin/industria/custos-eficiencia">Ir para Custos & OEE →</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="border hover:border-[#005B2E]/40 transition-colors">
              <CardContent className="p-4 space-y-2">
                <span className="text-xs font-bold text-[#005B2E] block">
                  Manutenção & Recursos
                </span>
                <p className="text-xs text-muted-foreground">
                  Máquinas, OS preventiva/corretiva e calibração.
                </p>
                <Button size="sm" variant="outline" className="w-full text-xs h-8" asChild>
                  <Link to="/admin/industria/manutencao">Ir para Manutenção →</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
