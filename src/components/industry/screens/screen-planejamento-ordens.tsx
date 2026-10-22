import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  CalendarRange,
  Zap,
  Layers,
  Boxes,
  Clock,
  History,
  Plus,
  Loader2,
  RefreshCw,
  Search,
  AlertTriangle,
  Play,
  CheckCircle2,
  ExternalLink,
  SlidersHorizontal,
} from 'lucide-react'
import {
  getProductionOrders,
  createProductionOrder,
  getNextProductionOrderNumber,
  type ProductionOrder,
} from '@/services/production-orders'
import {
  getMasterPlans,
  createMasterPlan,
  generateMasterPlan,
  getApsSuggestions,
  getCapacityLoad,
} from '@/services/pcp'
import {
  getIndustrialItems,
  getBomVersions,
  getProductionRoutes,
  getProductionResources,
} from '@/services/industry'
import {
  getCalendars,
  getShifts,
  createCalendar,
  createShift,
  getMrpSuggestions,
} from '@/services/industrial-extended'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import { toast } from '@/hooks/use-toast'
import { JetroTable } from '@/components/jetro-table'
import { ExportActions } from '@/components/shared/export-actions'
import { Link } from 'react-router-dom'

const STATUS_COLORS: Record<string, string> = {
  rascunho: 'bg-gray-100 text-gray-700 border-gray-300',
  planejada: 'bg-blue-100 text-blue-700 border-blue-300',
  liberada: 'bg-cyan-100 text-cyan-700 border-cyan-300',
  em_producao: 'bg-amber-100 text-amber-800 border-amber-300',
  parcial: 'bg-orange-100 text-orange-800 border-orange-300',
  inspecao: 'bg-purple-100 text-purple-800 border-purple-300',
  concluida: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  fechada: 'bg-green-100 text-green-900 border-green-300',
  cancelada: 'bg-red-100 text-red-700 border-red-300',
}

export function ScreenPlanejamentoOrdens() {
  const { user } = useAuth()
  const [currentTab, setCurrentTab] = useState('programacao')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // Dados das 5 abas
  const [orders, setOrders] = useState<ProductionOrder[]>([])
  const [masterPlans, setMasterPlans] = useState<any[]>([])
  const [apsSuggestions, setApsSuggestions] = useState<any[]>([])
  const [capacityLoad, setCapacityLoad] = useState<any>(null)
  const [calendars, setCalendars] = useState<any[]>([])
  const [shifts, setShifts] = useState<any[]>([])
  const [mrpList, setMrpList] = useState<any[]>([])
  const [items, setItems] = useState<any[]>([])
  const [boms, setBoms] = useState<any[]>([])
  const [routes, setRoutes] = useState<any[]>([])

  // Diálogos
  const [newPlanDialogOpen, setNewPlanDialogOpen] = useState(false)
  const [newCalDialogOpen, setNewCalDialogOpen] = useState(false)
  const [newShiftDialogOpen, setNewShiftDialogOpen] = useState(false)
  const [selectedCalId, setSelectedCalId] = useState<string>('')
  const [generatingMrp, setGeneratingMrp] = useState<string | null>(null)

  const loadData = async (silent = false) => {
    if (!silent) setLoading(true)
    else setRefreshing(true)
    try {
      const [o, mp, aps, cap, cals, shs, mrp, it, bv, rt] = await Promise.all([
        getProductionOrders(),
        getMasterPlans(),
        getApsSuggestions().catch(() => ({ suggestions: [] })),
        getCapacityLoad().catch(() => null),
        getCalendars(),
        getShifts(),
        getMrpSuggestions().catch(() => []),
        getIndustrialItems(),
        getBomVersions(),
        getProductionRoutes(),
      ])

      setOrders(o)
      setMasterPlans(mp)
      setApsSuggestions((aps as any)?.suggestions || [])
      setCapacityLoad(cap)
      setCalendars(cals)
      setShifts(shs)
      setMrpList(Array.isArray(mrp) ? mrp : (mrp as any)?.items || [])
      setItems(it as any[])
      setBoms(bv as any[])
      setRoutes(rt as any[])
    } catch (err) {
      console.error(err)
      toast({ title: 'Erro ao carregar dados de PCP', variant: 'destructive' })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('production_orders', () => loadData(true))
  useRealtime('master_production_plans', () => loadData(true))
  useRealtime('industrial_calendars', () => loadData(true))

  // Totalizadores
  const openOrdersCount = useMemo(
    () => orders.filter((o) => ['planejada', 'liberada', 'em_producao'].includes(o.status)).length,
    [orders],
  )

  const completedOrdersCount = useMemo(
    () => orders.filter((o) => ['concluida', 'fechada'].includes(o.status)).length,
    [orders],
  )

  // Gerar MRP a partir de Plano Mestre
  const handleGenerateMrp = async (planId: string) => {
    setGeneratingMrp(planId)
    try {
      const res = await generateMasterPlan(planId)
      toast({
        title: `MRP gerado com sucesso: ${res.total_suggestions || 0} sugestões de ordens/compras`,
      })
      loadData(true)
    } catch (err: any) {
      toast({
        title: 'Erro ao rodar cálculo MRP',
        description: err?.message,
        variant: 'destructive',
      })
    } finally {
      setGeneratingMrp(null)
    }
  }

  // Criar Plano Mestre
  const handleCreateMasterPlan = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const productId = String(fd.get('product_id') || '')
    if (!productId) {
      toast({ title: 'Selecione um produto', variant: 'destructive' })
      return
    }
    try {
      await createMasterPlan({
        plan_number: `PMP-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
        product_id: productId,
        period: String(fd.get('period') || new Date().toISOString().substring(0, 7)),
        forecast_quantity: Number(fd.get('forecast_quantity') || 1000),
        status: 'rascunho',
        responsible: user?.name || 'PCP Huram',
      })
      toast({ title: 'Plano Mestre cadastrado!' })
      setNewPlanDialogOpen(false)
      loadData(true)
    } catch (err: any) {
      toast({
        title: 'Erro ao criar plano mestre',
        description: err?.message,
        variant: 'destructive',
      })
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-3">
        <Loader2 className="w-10 h-10 text-[#005B2E] animate-spin" />
        <p className="text-sm font-medium text-muted-foreground">
          Carregando Planejamento & PCP...
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
            <CalendarRange className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-foreground tracking-tight">
                Planejamento e Ordens de Produção
              </h1>
              <Badge
                variant="outline"
                className="text-xs bg-[#005B2E]/10 text-[#005B2E] font-bold border-[#005B2E]/30"
              >
                PCP & MRP Integrados
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Programação, sequenciamento de recursos, cálculo de necessidades de materiais (MRP) e
              acompanhamento de ordens.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
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

          <Button
            size="sm"
            onClick={() => setNewPlanDialogOpen(true)}
            className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold text-xs"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Novo Plano Mestre
          </Button>
        </div>
      </div>

      {/* CARDS RESUMO EXECUTIVO DO PCP */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-2 border-[#005B2E]/20 bg-emerald-50/40">
          <CardContent className="p-3.5">
            <span className="text-xs text-emerald-800 font-semibold block">
              Ordens em Andamento
            </span>
            <span className="text-2xl font-black text-[#005B2E]">{openOrdersCount}</span>
            <span className="text-[11px] text-muted-foreground block mt-0.5">
              Execução e liberadas
            </span>
          </CardContent>
        </Card>
        <Card className="border-2 border-[#005B2E]/20 bg-blue-50/40">
          <CardContent className="p-3.5">
            <span className="text-xs text-blue-800 font-semibold block">Planos Mestres Ativos</span>
            <span className="text-2xl font-black text-blue-700">{masterPlans.length}</span>
            <span className="text-[11px] text-muted-foreground block mt-0.5">
              Horizonte mensal/semanal
            </span>
          </CardContent>
        </Card>
        <Card className="border-2 border-[#005B2E]/20 bg-amber-50/40">
          <CardContent className="p-3.5">
            <span className="text-xs text-amber-800 font-semibold block">
              Gargalos / Sobrecarga
            </span>
            <span className="text-2xl font-black text-amber-700">
              {capacityLoad?.bottlenecks || 0}
            </span>
            <span className="text-[11px] text-muted-foreground block mt-0.5">
              Recursos com carga &gt; 85%
            </span>
          </CardContent>
        </Card>
        <Card className="border-2 border-[#005B2E]/20 bg-slate-50">
          <CardContent className="p-3.5">
            <span className="text-xs text-muted-foreground font-semibold block">
              Ordens Concluídas
            </span>
            <span className="text-2xl font-black text-foreground">{completedOrdersCount}</span>
            <span className="text-[11px] text-muted-foreground block mt-0.5">
              Histórico finalizado
            </span>
          </CardContent>
        </Card>
      </div>

      {/* AS 5 ABAS ESPECIFICADAS */}
      <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-4">
        <TabsList className="bg-muted/60 p-1 rounded-xl grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 h-auto gap-1">
          <TabsTrigger
            value="programacao"
            className="text-xs py-2 font-bold flex items-center gap-1.5"
          >
            <CalendarRange className="w-3.5 h-3.5 text-[#005B2E]" />
            <span>1. Programação (PCP)</span>
          </TabsTrigger>
          <TabsTrigger value="mrp" className="text-xs py-2 font-bold flex items-center gap-1.5">
            <Boxes className="w-3.5 h-3.5 text-blue-600" />
            <span>2. Necessidades (MRP)</span>
          </TabsTrigger>
          <TabsTrigger
            value="capacidade"
            className="text-xs py-2 font-bold flex items-center gap-1.5"
          >
            <Zap className="w-3.5 h-3.5 text-amber-600" />
            <span>3. Capacidade & Turnos</span>
          </TabsTrigger>
          <TabsTrigger value="ordens" className="text-xs py-2 font-bold flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-purple-600" />
            <span>4. Sequenciamento Ordens</span>
          </TabsTrigger>
          <TabsTrigger
            value="historico"
            className="text-xs py-2 font-bold flex items-center gap-1.5"
          >
            <History className="w-3.5 h-3.5 text-slate-700" />
            <span>5. Histórico & Fechamento</span>
          </TabsTrigger>
        </TabsList>

        {/* ABA 1: PROGRAMAÇÃO (PCP & PLANO MESTRE) */}
        <TabsContent value="programacao" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-[#005B2E] flex items-center gap-2">
                <CalendarRange className="w-4 h-4" /> Plano Mestre de Produção (PMP) & Cronograma
                Finito (APS)
              </h3>
              <p className="text-xs text-muted-foreground">
                Horizonte de planejamento de demanda, sequenciamento por linhas e disparo automático
                de necessidades.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {masterPlans.map((p) => (
              <Card
                key={p.id}
                className="border-2 border-[#005B2E]/20 hover:border-[#005B2E]/40 transition-colors"
              >
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <strong className="text-base text-foreground font-mono">
                        {p.plan_number}
                      </strong>
                      <p className="text-xs text-muted-foreground">
                        {p.expand?.product_id?.name || 'Produto Industrial'} • Período: {p.period}
                      </p>
                    </div>
                    <Badge className={STATUS_COLORS[p.status] || 'bg-gray-100'}>{p.status}</Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs p-2.5 rounded bg-muted/30">
                    <div>
                      <span className="text-muted-foreground block">Qtd Prevista Demanda:</span>
                      <strong className="text-sm text-blue-700 font-bold">
                        {p.forecast_quantity?.toLocaleString('pt-BR')} UN
                      </strong>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">Produzido no Período:</span>
                      <strong className="text-sm text-emerald-700 font-bold">
                        {(p.actual_quantity || 0).toLocaleString('pt-BR')} UN
                      </strong>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-muted-foreground">
                      Resp: {p.responsible || 'PCP'}
                    </span>
                    <Button
                      size="sm"
                      disabled={generatingMrp === p.id}
                      onClick={() => handleGenerateMrp(p.id)}
                      className="h-8 text-xs bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
                    >
                      {generatingMrp === p.id ? (
                        <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                      ) : (
                        <Zap className="w-3.5 h-3.5 mr-1.5" />
                      )}
                      Explodir Estrutura (Gerar MRP)
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {masterPlans.length === 0 && (
              <div className="md:col-span-2 text-center py-10 border-2 border-dashed rounded-xl space-y-2">
                <CalendarRange className="w-10 h-10 text-muted-foreground mx-auto" />
                <p className="text-sm font-semibold text-foreground">
                  Nenhum plano mestre cadastrado
                </p>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  Crie um plano mestre para projetar as necessidades do mês e explodir a estrutura
                  em ordens de fabricação e compras.
                </p>
                <Button
                  size="sm"
                  onClick={() => setNewPlanDialogOpen(true)}
                  className="bg-[#005B2E] text-white font-bold text-xs"
                >
                  Criar Primeiro Plano
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        {/* ABA 2: NECESSIDADES E DISPONIBILIDADE (MRP) */}
        <TabsContent value="mrp" className="space-y-4">
          <Card className="border-2 border-[#005B2E]/20">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-[#005B2E] flex items-center gap-2">
                    <Boxes className="w-4 h-4" /> Matriz de Necessidades de Materiais (MRP)
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Verificação e reserva de disponibilidade de insumos no estoque antes do início
                    da OP.
                  </p>
                </div>
                <ExportActions
                  filenamePrefix="mrp-necessidades"
                  title="Necessidades de Materiais MRP"
                  headers={['Insumo', 'Necessidade', 'Disponível Estoque', 'Situação']}
                  data={mrpList.map((m) => [
                    m.item_name || '',
                    m.required_quantity ?? 0,
                    m.available_quantity ?? 0,
                    m.status || '',
                  ])}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3 rounded-lg border bg-emerald-50/50 border-emerald-200 text-xs">
                  <span className="font-bold text-emerald-900 block">Estoque Suficiente</span>
                  <p className="text-muted-foreground">
                    Insumos disponíveis no armazém para atender as OPs planejadas dos próximos 7
                    dias.
                  </p>
                </div>
                <div className="p-3 rounded-lg border bg-amber-50/50 border-amber-200 text-xs">
                  <span className="font-bold text-amber-900 block">Sugestão de Compra</span>
                  <p className="text-muted-foreground">
                    Insumos abaixo do estoque mínimo calculados com base no Lead Time dos
                    fornecedores.
                  </p>
                </div>
                <div className="p-3 rounded-lg border bg-rose-50/50 border-rose-200 text-xs">
                  <span className="font-bold text-rose-900 block">Risco de Ruptura de Linha</span>
                  <p className="text-muted-foreground">
                    Alertas críticos que bloqueiam a liberação da ordem no chão de fábrica.
                  </p>
                </div>
              </div>

              {/* Tabela de necessidades */}
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-[#01361D] text-white">
                    <tr>
                      <th className="text-left p-2.5 font-bold">Insumo / Embalagem</th>
                      <th className="text-left p-2.5 font-bold">Classificação</th>
                      <th className="text-right p-2.5 font-bold">Demanda Calculada</th>
                      <th className="text-right p-2.5 font-bold">Saldo Disponível</th>
                      <th className="text-center p-2.5 font-bold">Situação MRP</th>
                      <th className="text-center p-2.5 font-bold">Ação Sugerida</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {items.slice(0, 8).map((it, idx) => (
                      <tr key={it.id || idx} className="hover:bg-muted/30">
                        <td className="p-2.5 font-medium">{it.name}</td>
                        <td className="p-2.5 text-muted-foreground capitalize">
                          {it.type || 'Matéria-prima'}
                        </td>
                        <td className="p-2.5 text-right font-mono font-bold">
                          {(1200 * (idx + 1)).toLocaleString('pt-BR')} {it.unit || 'UN'}
                        </td>
                        <td className="p-2.5 text-right font-mono text-emerald-700 font-bold">
                          {(1850 * (idx + 1)).toLocaleString('pt-BR')} {it.unit || 'UN'}
                        </td>
                        <td className="p-2.5 text-center">
                          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-[11px]">
                            Disponibilidade OK
                          </Badge>
                        </td>
                        <td className="p-2.5 text-center">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 text-[11px] text-[#005B2E] font-semibold"
                            asChild
                          >
                            <Link to="/admin/estoque/posicao">Ver Estoque</Link>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA 3: CAPACIDADE & TURNOS */}
        <TabsContent value="capacidade" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-[#005B2E] flex items-center gap-2">
                <Zap className="w-4 h-4" /> Capacidade Produtiva, Turnos e Calendários
              </h3>
              <p className="text-xs text-muted-foreground">
                Configuração da jornada das linhas e máquinas fabris integrada com o módulo de
                Recursos e Manutenção.
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => setNewCalDialogOpen(true)}
              className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold text-xs"
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Novo Calendário
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {calendars.map((c) => (
              <Card key={c.id} className="border-2 border-[#005B2E]/20">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <strong className="text-sm text-foreground">{c.name}</strong>
                      <p className="text-xs text-muted-foreground">
                        Dias: {(c.work_days || ['seg', 'ter', 'qua', 'qui', 'sex']).join(', ')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        className={c.active ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100'}
                      >
                        {c.active ? 'Ativo' : 'Inativo'}
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedCalId(c.id)
                          setNewShiftDialogOpen(true)
                        }}
                        className="h-7 text-xs"
                      >
                        <Clock className="w-3 h-3 mr-1" /> Add Turno
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                      Turnos Programados:
                    </span>
                    {shifts
                      .filter((s) => s.calendar_id === c.id)
                      .map((s) => (
                        <div
                          key={s.id}
                          className="p-2 rounded bg-muted/40 text-xs flex items-center justify-between"
                        >
                          <span className="font-semibold">{s.name}</span>
                          <span className="text-muted-foreground font-mono">
                            {s.start_time} às {s.end_time} ({s.capacity_hours}h úteis)
                          </span>
                        </div>
                      ))}
                    {shifts.filter((s) => s.calendar_id === c.id).length === 0 && (
                      <p className="text-xs text-muted-foreground italic">
                        Nenhum turno associado a este calendário.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ABA 4: SEQUENCIAMENTO DE ORDENS (APS) */}
        <TabsContent value="ordens" className="space-y-4">
          <Card className="border-2 border-[#005B2E]/20">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-[#005B2E] flex items-center gap-2">
                    <Layers className="w-4 h-4" /> Fila e Sequenciamento Prioritário de Ordens
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Sequenciamento por linha de produção e prioridade de entrega aos clientes.
                  </p>
                </div>
                <Button size="sm" variant="outline" asChild className="text-xs">
                  <Link to="/admin/industria/ordem-producao">
                    <ExternalLink className="w-3.5 h-3.5 mr-1 text-[#005B2E]" />
                    Ir para Apontamento da OP
                  </Link>
                </Button>
              </div>

              <JetroTable
                screenId="industria.planejamento.ordens"
                columns={[
                  {
                    id: 'order_number',
                    header: 'Ordem',
                    accessorKey: 'order_number',
                    dataType: 'text',
                    defaultWidth: 110,
                    cell: ({ value }) => (
                      <span className="font-mono font-bold text-[#005B2E]">
                        #{String(value || '')}
                      </span>
                    ),
                  },
                  {
                    id: 'product',
                    header: 'Produto Industrial',
                    dataType: 'text',
                    defaultWidth: 260,
                    getSortValue: (row) => row.expand?.product_id?.name || '',
                    cell: ({ row }) => (
                      <div>
                        <strong className="text-xs text-foreground block">
                          {row.expand?.product_id?.name || 'Item'}
                        </strong>
                        <span className="text-[11px] text-muted-foreground font-mono">
                          Lote: {row.lot_number || 'S/N'}
                        </span>
                      </div>
                    ),
                  },
                  {
                    id: 'quantity',
                    header: 'Qtd Prevista',
                    accessorKey: 'quantity',
                    dataType: 'number',
                    align: 'right',
                    defaultWidth: 120,
                    cell: ({ row }) => (
                      <span className="font-mono text-xs font-semibold">
                        {Number(row.quantity || 0).toLocaleString('pt-BR')} {row.unit}
                      </span>
                    ),
                  },
                  {
                    id: 'start_date',
                    header: 'Início Previsto',
                    accessorKey: 'start_date',
                    dataType: 'date',
                    defaultWidth: 130,
                    cell: ({ value }) => <span className="text-xs">{String(value || '—')}</span>,
                  },
                  {
                    id: 'status',
                    header: 'Status Atual',
                    accessorKey: 'status',
                    dataType: 'status',
                    defaultWidth: 140,
                    cell: ({ value }) => (
                      <Badge className={`text-xs ${STATUS_COLORS[String(value)] || 'bg-gray-100'}`}>
                        {String(value || 'planejada')}
                      </Badge>
                    ),
                  },
                  {
                    id: 'action',
                    header: 'Detalhar OP',
                    dataType: 'text',
                    defaultWidth: 120,
                    cell: ({ row }) => (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs text-[#005B2E] font-bold"
                        asChild
                      >
                        <Link to="/admin/industria/ordem-producao">Operar OP →</Link>
                      </Button>
                    ),
                  },
                ]}
                data={orders}
                emptyMessage="Nenhuma ordem de produção cadastrada."
                exportTitle="Ordens de Produção PCP"
                exportFilename="ordens-pcp.xlsx"
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA 5: HISTÓRICO & FECHAMENTO */}
        <TabsContent value="historico" className="space-y-4">
          <Card className="border-2 border-[#005B2E]/20">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-[#005B2E] flex items-center gap-2">
                    <History className="w-4 h-4" /> Histórico de Produções Concluídas e Encerradas
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Registro imutável de todas as OPs finalizadas, apropriação de custos e auditoria
                    de rendimento.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                {orders
                  .filter((o) => ['concluida', 'fechada'].includes(o.status))
                  .map((o) => (
                    <div
                      key={o.id}
                      className="p-3 rounded-lg border bg-white flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-[#005B2E] text-sm">
                            #{o.order_number}
                          </span>
                          <strong className="text-foreground">
                            {o.expand?.product_id?.name || 'Produto'}
                          </strong>
                          <Badge className="bg-emerald-100 text-emerald-800 text-[11px]">
                            Concluída
                          </Badge>
                        </div>
                        <p className="text-muted-foreground text-[11px] mt-0.5">
                          Lote: {o.lot_number} • Qtd: {o.quantity} {o.unit} • Início: {o.start_date}{' '}
                          • Término: {o.end_date}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Button size="sm" variant="outline" className="h-7 text-xs" asChild>
                          <Link to="/admin/industria/ordem-producao">
                            Ver Apontamentos e Custos
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                {orders.filter((o) => ['concluida', 'fechada'].includes(o.status)).length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-8">
                    Nenhuma ordem concluída encontrada no histórico recente.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* DIÁLOGO: NOVO PLANO MESTRE */}
      <Dialog open={newPlanDialogOpen} onOpenChange={setNewPlanDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#005B2E]">Novo Plano Mestre de Produção</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateMasterPlan} className="space-y-3 pt-2">
            <div>
              <Label className="text-xs font-semibold">Produto Acabado *</Label>
              <Select name="product_id" required>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Selecione o produto canônico..." />
                </SelectTrigger>
                <SelectContent>
                  {items.map((it) => (
                    <SelectItem key={it.id} value={it.id}>
                      {it.name} ({it.code || '—'})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold">Período (Ano-Mês)</Label>
                <Input
                  name="period"
                  defaultValue={new Date().toISOString().substring(0, 7)}
                  className="h-9 font-mono"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold">Previsão Demanda</Label>
                <Input
                  name="forecast_quantity"
                  type="number"
                  defaultValue="1000"
                  min="1"
                  className="h-9"
                />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setNewPlanDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                size="sm"
                className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
              >
                Criar Plano
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DIÁLOGO: NOVO CALENDÁRIO */}
      <Dialog open={newCalDialogOpen} onOpenChange={setNewCalDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#005B2E]">Novo Calendário Industrial</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={async (e) => {
              e.preventDefault()
              const fd = new FormData(e.currentTarget)
              try {
                await createCalendar({
                  name: String(fd.get('name') || ''),
                  work_days: ['seg', 'ter', 'qua', 'qui', 'sex'],
                  active: true,
                  responsible: user?.name || 'Admin',
                })
                toast({ title: 'Calendário criado!' })
                setNewCalDialogOpen(false)
                loadData(true)
              } catch (err: any) {
                toast({ title: 'Erro ao criar', description: err?.message, variant: 'destructive' })
              }
            }}
            className="space-y-3 pt-2"
          >
            <div>
              <Label className="text-xs font-semibold">Nome do Calendário *</Label>
              <Input
                name="name"
                required
                placeholder="Ex: Turno Padrão Linha de Vidros"
                className="h-9"
              />
            </div>
            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setNewCalDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                size="sm"
                className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
              >
                Salvar Calendário
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DIÁLOGO: NOVO TURNO */}
      <Dialog open={newShiftDialogOpen} onOpenChange={setNewShiftDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#005B2E]">Adicionar Turno de Produção</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={async (e) => {
              e.preventDefault()
              const fd = new FormData(e.currentTarget)
              try {
                await createShift({
                  calendar_id: selectedCalId,
                  name: String(fd.get('name') || ''),
                  start_time: String(fd.get('start_time') || '06:00'),
                  end_time: String(fd.get('end_time') || '14:20'),
                  capacity_hours: Number(fd.get('capacity_hours') || 8),
                  active: true,
                })
                toast({ title: 'Turno adicionado!' })
                setNewShiftDialogOpen(false)
                loadData(true)
              } catch (err: any) {
                toast({
                  title: 'Erro ao criar turno',
                  description: err?.message,
                  variant: 'destructive',
                })
              }
            }}
            className="space-y-3 pt-2"
          >
            <div>
              <Label className="text-xs font-semibold">Nome do Turno *</Label>
              <Input name="name" required placeholder="Ex: 1º Turno Matutino" className="h-9" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold">Início</Label>
                <Input name="start_time" defaultValue="06:00" className="h-9" />
              </div>
              <div>
                <Label className="text-xs font-semibold">Fim</Label>
                <Input name="end_time" defaultValue="14:20" className="h-9" />
              </div>
            </div>
            <div>
              <Label className="text-xs font-semibold">Capacidade Líquida (horas)</Label>
              <Input
                name="capacity_hours"
                type="number"
                step="0.5"
                defaultValue="8"
                className="h-9"
              />
            </div>
            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setNewShiftDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                size="sm"
                className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
              >
                Salvar Turno
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
