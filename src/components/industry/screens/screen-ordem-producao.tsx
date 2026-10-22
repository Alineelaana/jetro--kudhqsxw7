import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
  ClipboardList,
  Play,
  Pause,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Plus,
  Loader2,
  Tablet,
  FileSpreadsheet,
  Boxes,
  ShieldCheck,
  DollarSign,
  Package,
  Layers,
  History,
  Clock,
  ChevronRight,
  TrendingUp,
  RefreshCw,
  Search,
  ExternalLink,
} from 'lucide-react'
import {
  getProductionOrders,
  createProductionOrder,
  updateProductionOrder,
  getNextProductionOrderNumber,
  type ProductionOrder,
} from '@/services/production-orders'
import {
  getBomVersions,
  getBomComponents,
  getProductionRoutes,
  getRouteOperations,
  getIndustrialItems,
  getProductionResources,
} from '@/services/industry'
import {
  getApontamentos,
  createApontamento,
  getNonConformities,
  createNonConformity,
  getTraceability,
} from '@/services/industrial-extended'
import { getPhases, getPhaseCosts } from '@/services/industrial-phases'
import { transitionOrder, absorbCosts } from '@/services/pcp'
import { transitionPhase } from '@/services/industrial-flow'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import { toast } from '@/hooks/use-toast'
import { ExportActions } from '@/components/shared/export-actions'
import { RecordAttachmentsDialog } from '@/components/shared/record-attachments-dialog'
import { JetroTable } from '@/components/jetro-table'
import { Link } from 'react-router-dom'

const STATUS_LABELS: Record<string, string> = {
  rascunho: 'Rascunho',
  planejada: 'Planejada',
  liberada: 'Liberada',
  em_producao: 'Em Produção',
  parcial: 'Parcial',
  inspecao: 'Inspeção',
  concluida: 'Concluída',
  fechada: 'Fechada',
  cancelada: 'Cancelada',
}

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

export function ScreenOrdemProducao() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<ProductionOrder[]>([])
  const [selectedOrderId, setSelectedOrderId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [currentTab, setCurrentTab] = useState('planejamento')

  // Modos de interface
  const [tabletMode, setTabletMode] = useState(false)
  const [attachmentOpen, setAttachmentOpen] = useState(false)

  // Dados auxiliares vinculados à OP selecionada
  const [items, setItems] = useState<Record<string, unknown>[]>([])
  const [boms, setBoms] = useState<Record<string, unknown>[]>([])
  const [routes, setRoutes] = useState<Record<string, unknown>[]>([])
  const [resources, setResources] = useState<Record<string, unknown>[]>([])

  // Dados da OP ativa
  const [bomComponents, setBomComponents] = useState<any[]>([])
  const [routeOperations, setRouteOperations] = useState<any[]>([])
  const [apontamentos, setApontamentos] = useState<any[]>([])
  const [phases, setPhases] = useState<any[]>([])
  const [phaseCosts, setPhaseCosts] = useState<Record<string, any[]>>({})
  const [nonConformities, setNonConformities] = useState<any[]>([])
  const [traceabilityList, setTraceabilityList] = useState<any[]>([])

  // Diálogos rápidos
  const [orderDialogOpen, setOrderDialogOpen] = useState(false)
  const [apontamentoDialogOpen, setApontamentoDialogOpen] = useState(false)
  const [ncDialogOpen, setNcDialogOpen] = useState(false)

  // Filtro de seleção de OP
  const [searchTerm, setSearchTerm] = useState('')

  const loadData = async (silent = false) => {
    if (!silent) setLoading(true)
    else setRefreshing(true)
    try {
      const [oList, pList, bList, rList, resList] = await Promise.all([
        getProductionOrders(),
        getIndustrialItems(),
        getBomVersions(),
        getProductionRoutes(),
        getProductionResources(),
      ])
      setOrders(oList)
      setItems(pList as any[])
      setBoms(bList as any[])
      setRoutes(rList as any[])
      setResources(resList as any[])

      // Define ordem selecionada inicial se não houver
      if (!selectedOrderId && oList.length > 0) {
        setSelectedOrderId(oList[0].id)
      }
    } catch (err) {
      console.error(err)
      toast({ title: 'Erro ao carregar Ordens de Produção', variant: 'destructive' })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Carrega detalhes da OP selecionada
  const loadOrderDetails = async (orderId: string) => {
    if (!orderId) return
    const op = orders.find((o) => o.id === orderId)
    try {
      const [aponts, phs, ncs, traces] = await Promise.all([
        getApontamentos(orderId),
        getPhases(orderId),
        getNonConformities(orderId),
        getTraceability(orderId),
      ])
      setApontamentos(aponts)
      setPhases(phs)
      setNonConformities(ncs)
      setTraceabilityList(traces)

      // Se tiver versão da BOM associada à OP, carrega componentes previstos
      if (op?.bom_version_id) {
        const comps = await getBomComponents(op.bom_version_id)
        setBomComponents(comps)
      } else {
        setBomComponents([])
      }

      // Se tiver rota associada, carrega operações
      if (op?.route_id) {
        const ops = await getRouteOperations(op.route_id)
        setRouteOperations(ops)
      } else {
        setRouteOperations([])
      }

      // Custos de fases
      const cMap: Record<string, any[]> = {}
      for (const ph of phs) {
        cMap[ph.id] = await getPhaseCosts(ph.id)
      }
      setPhaseCosts(cMap)
    } catch (err) {
      console.warn('Erro ao carregar detalhes da OP:', err)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (selectedOrderId) {
      loadOrderDetails(selectedOrderId)
    }
  }, [selectedOrderId, orders])

  useRealtime('production_orders', () => loadData(true))
  useRealtime('industrial_apontamentos', () => {
    if (selectedOrderId) loadOrderDetails(selectedOrderId)
  })
  useRealtime('industrial_phases', () => {
    if (selectedOrderId) loadOrderDetails(selectedOrderId)
  })

  const currentOrder = useMemo(
    () => orders.find((o) => o.id === selectedOrderId) || null,
    [orders, selectedOrderId],
  )

  const filteredOrders = useMemo(() => {
    if (!searchTerm.trim()) return orders
    const term = searchTerm.toLowerCase()
    return orders.filter(
      (o) =>
        o.order_number?.toLowerCase().includes(term) ||
        o.expand?.product_id?.name?.toLowerCase().includes(term) ||
        o.lot_number?.toLowerCase().includes(term) ||
        o.status?.toLowerCase().includes(term),
    )
  }, [orders, searchTerm])

  // Totalizadores de produção desta OP
  const totals = useMemo(() => {
    const plannedQty = Number(currentOrder?.quantity) || 0
    const producedQty = apontamentos
      .filter((a) => a.type === 'producao' || a.type === 'fim')
      .reduce((sum, a) => sum + (Number(a.quantity_produced) || 0), 0)
    const rejectedQty = apontamentos.reduce((sum, a) => sum + (Number(a.quantity_rejected) || 0), 0)
    const reworkQty = apontamentos
      .filter((a) => a.type === 'rework')
      .reduce((sum, a) => sum + (Number(a.quantity_produced) || 0), 0)

    const balanceQty = Math.max(0, plannedQty - producedQty)
    const completionPct =
      plannedQty > 0 ? Math.min(100, Math.round((producedQty / plannedQty) * 100)) : 0
    const lossPct =
      producedQty + rejectedQty > 0
        ? ((rejectedQty / (producedQty + rejectedQty)) * 100).toFixed(1)
        : '0.0'

    // Custos desta OP
    let totalDirectCost = 0
    Object.values(phaseCosts).forEach((arr) => {
      arr.forEach((c) => {
        totalDirectCost += Number(c.amount) || 0
      })
    })

    return {
      plannedQty,
      producedQty,
      rejectedQty,
      reworkQty,
      balanceQty,
      completionPct,
      lossPct,
      totalDirectCost,
    }
  }, [currentOrder, apontamentos, phaseCosts])

  // Ações de fluxo da OP com validações
  const handleTransition = async (newStatus: string) => {
    if (!currentOrder) return
    try {
      await transitionOrder(currentOrder.id, newStatus)
      toast({
        title: `OP #${currentOrder.order_number} movida para ${STATUS_LABELS[newStatus] || newStatus}`,
      })
      loadData(true)
    } catch (err: any) {
      toast({
        title: 'Não foi possível alterar status da OP',
        description: err?.message || 'Verifique se há apontamentos ou validações pendentes.',
        variant: 'destructive',
      })
    }
  }

  // Apontamento rápido do chão de fábrica (tablet friendly)
  const handleQuickApontamento = async (type: string, qty = 0, paradaReason = '') => {
    if (!currentOrder) return
    try {
      await createApontamento({
        production_order_id: currentOrder.id,
        operator_name: user?.name || 'Operador Tablet',
        operation_name: 'Apontamento em Chão de Fábrica',
        type: type as any,
        quantity_produced: qty,
        quantity_rejected: 0,
        stoppage_reason: paradaReason,
        lot_number: currentOrder.lot_number || '',
        notes: `Apontamento via Chão de Fábrica (${tabletMode ? 'Modo Tablet' : 'Desktop'})`,
        responsible: user?.name || 'Operador',
      })
      toast({ title: `Apontamento de ${type.toUpperCase()} registrado com sucesso!` })
      loadOrderDetails(currentOrder.id)
    } catch (err: any) {
      toast({
        title: 'Erro ao registrar apontamento',
        description: err?.message,
        variant: 'destructive',
      })
    }
  }

  // Criação de nova OP preservando snapshot de BOM
  const handleCreateOrder = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const productId = String(fd.get('product_id') || '')
    if (!productId) {
      toast({ title: 'Selecione um produto', variant: 'destructive' })
      return
    }
    try {
      const nextNum = await getNextProductionOrderNumber()
      const newOp = await createProductionOrder({
        order_number: nextNum,
        status: 'planejada',
        product_id: productId,
        bom_version_id: String(fd.get('bom_version_id') || '') || undefined,
        route_id: String(fd.get('route_id') || '') || undefined,
        quantity: String(fd.get('quantity') || '1000'),
        unit: String(fd.get('unit') || 'KG'),
        lot_number: String(
          fd.get('lot_number') ||
            `LOT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        ),
        start_date: String(fd.get('start_date') || new Date().toISOString().substring(0, 10)),
        end_date: String(fd.get('end_date') || new Date().toISOString().substring(0, 10)),
        responsible: user?.name || 'Planejador',
        observations: String(fd.get('observations') || ''),
        order_type: String(fd.get('order_type') || 'producao'),
      })
      toast({ title: `Ordem #${newOp.order_number} criada com sucesso!` })
      setOrderDialogOpen(false)
      await loadData(true)
      setSelectedOrderId(newOp.id)
    } catch (err: any) {
      toast({ title: 'Erro ao criar OP', description: err?.message, variant: 'destructive' })
    }
  }

  // Encerramento e apropriação de custos
  const handleCloseAndAbsorbCosts = async () => {
    if (!currentOrder) return
    try {
      await absorbCosts(currentOrder.id)
      await transitionOrder(currentOrder.id, 'fechada')
      toast({ title: `Custos apropriados e OP #${currentOrder.order_number} fechada com sucesso!` })
      loadData(true)
    } catch (err: any) {
      toast({
        title: 'Falha ao encerrar OP e apropriar custos',
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
          Carregando centro de operações da produção...
        </p>
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${tabletMode ? 'p-2 bg-slate-50/50 rounded-xl' : ''}`}>
      {/* CABEÇALHO DO CENTRO DA OPERAÇÃO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#005B2E] text-white shadow-sm">
            <ClipboardList className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-foreground tracking-tight">
                Ordem de Produção
              </h1>
              <Badge
                variant="outline"
                className="text-xs bg-[#005B2E]/10 text-[#005B2E] font-bold border-[#005B2E]/30"
              >
                O Centro da Operação
              </Badge>
              {tabletMode && (
                <Badge className="bg-amber-500 text-white font-bold text-[11px] animate-pulse">
                  Modo Tablet Chão de Fábrica Ativo
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Acompanhamento operacional por OP: consumo, execução, lotes, perdas, qualidade e
              custos integrados.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            size="sm"
            variant={tabletMode ? 'default' : 'outline'}
            onClick={() => setTabletMode(!tabletMode)}
            className={tabletMode ? 'bg-amber-600 hover:bg-amber-700 text-white font-bold' : ''}
            title="Alternar para layout de alta usabilidade com toques largos para tablets de fábrica"
          >
            <Tablet className="w-4 h-4 mr-1.5" />
            {tabletMode ? 'Sair do Modo Tablet' : 'Modo Tablet Operador'}
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

          <Button
            size="sm"
            onClick={() => setOrderDialogOpen(true)}
            className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold text-xs"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Nova OP
          </Button>
        </div>
      </div>

      {/* SELETOR DE OP ATIVA + STATUS EXECUTIVO */}
      <Card className="border-2 border-[#005B2E]/20 shadow-sm bg-gradient-to-r from-white via-white to-[#005B2E]/5">
        <CardContent className="p-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            {/* Seletor dropdown com pesquisa rápida */}
            <div className="md:col-span-5 space-y-1">
              <Label className="text-xs font-semibold text-muted-foreground flex items-center justify-between">
                <span>Ordem de Produção Selecionada:</span>
                <span className="text-[11px] font-normal">{orders.length} ordens cadastradas</span>
              </Label>
              <Select value={selectedOrderId} onValueChange={setSelectedOrderId}>
                <SelectTrigger className="font-bold text-sm h-10 border-[#005B2E]/40 focus:ring-[#005B2E]">
                  <SelectValue placeholder="Selecione uma Ordem de Produção..." />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {orders.map((o) => (
                    <SelectItem key={o.id} value={o.id}>
                      <span className="font-mono font-bold text-[#005B2E]">#{o.order_number}</span>{' '}
                      — {o.expand?.product_id?.name || 'Item Industrial'} (
                      {STATUS_LABELS[o.status] || o.status})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Informações centrais da OP */}
            {currentOrder && (
              <div className="md:col-span-4 flex items-center gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Produto:</span>
                    <strong className="text-sm text-foreground">
                      {currentOrder.expand?.product_id?.name || 'Não informado'}
                    </strong>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>
                      Lote:{' '}
                      <strong className="font-mono text-foreground">
                        {currentOrder.lot_number || 'S/N'}
                      </strong>
                    </span>
                    <span>•</span>
                    <span>
                      Versão BOM:{' '}
                      <strong className="text-foreground">
                        v{currentOrder.expand?.bom_version_id?.version || 1}
                      </strong>
                    </span>
                    <span>•</span>
                    <span>
                      Resp:{' '}
                      <strong className="text-foreground">{currentOrder.responsible || '—'}</strong>
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Ações de transição de estado da OP */}
            {currentOrder && (
              <div className="md:col-span-3 flex flex-col items-end gap-1.5">
                <div className="flex items-center gap-2">
                  <Badge
                    className={`text-xs px-2.5 py-0.5 border ${STATUS_COLORS[currentOrder.status] || 'bg-gray-100 text-gray-700'}`}
                  >
                    {STATUS_LABELS[currentOrder.status] || currentOrder.status}
                  </Badge>
                  {currentOrder.status === 'rascunho' && (
                    <Button
                      size="sm"
                      onClick={() => handleTransition('planejada')}
                      className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold"
                    >
                      Planejar
                    </Button>
                  )}
                  {currentOrder.status === 'planejada' && (
                    <Button
                      size="sm"
                      onClick={() => handleTransition('liberada')}
                      className="h-8 text-xs bg-cyan-700 hover:bg-cyan-800 text-white font-bold"
                    >
                      Liberar Produção
                    </Button>
                  )}
                  {currentOrder.status === 'liberada' && (
                    <Button
                      size="sm"
                      onClick={() => handleTransition('em_producao')}
                      className="h-8 text-xs bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
                    >
                      <Play className="w-3.5 h-3.5 mr-1" /> Iniciar OP
                    </Button>
                  )}
                  {currentOrder.status === 'em_producao' && (
                    <Button
                      size="sm"
                      onClick={() => handleTransition('inspecao')}
                      className="h-8 text-xs bg-purple-700 hover:bg-purple-800 text-white font-bold"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Enviar Inspeção
                    </Button>
                  )}
                  {currentOrder.status === 'inspecao' && (
                    <Button
                      size="sm"
                      onClick={() => handleTransition('concluida')}
                      className="h-8 text-xs bg-emerald-700 hover:bg-emerald-800 text-white font-bold"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Concluir OP
                    </Button>
                  )}
                  {currentOrder.status === 'concluida' && (
                    <Button
                      size="sm"
                      onClick={handleCloseAndAbsorbCosts}
                      className="h-8 text-xs bg-green-800 hover:bg-green-900 text-white font-bold"
                      title="Encerra a OP e apropria os custos finais sem duplicar lançamentos financeiros"
                    >
                      <DollarSign className="w-3.5 h-3.5 mr-1" /> Fechar & Custear
                    </Button>
                  )}
                </div>
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  <button
                    type="button"
                    onClick={() => setAttachmentOpen(true)}
                    className="hover:underline text-[#005B2E] font-medium"
                  >
                    Anexos / Evidências da OP
                  </button>
                  <span>•</span>
                  <span>
                    Criada em:{' '}
                    {currentOrder.created
                      ? new Date(currentOrder.created).toLocaleDateString('pt-BR')
                      : '—'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* BARRA DE PROGRESSO E INDICADORES RÁPIDOS DA OP */}
          {currentOrder && (
            <div className="grid grid-cols-2 md:grid-cols-6 gap-2 pt-2 border-t border-[#005B2E]/10">
              <div className="p-2 rounded bg-muted/40">
                <span className="text-[11px] text-muted-foreground block">Previsto</span>
                <span className="text-sm font-bold text-foreground">
                  {totals.plannedQty.toLocaleString('pt-BR')} {currentOrder.unit}
                </span>
              </div>
              <div className="p-2 rounded bg-emerald-50 border border-emerald-200">
                <span className="text-[11px] text-emerald-800 block">Apontado Real</span>
                <span className="text-sm font-black text-emerald-700">
                  {totals.producedQty.toLocaleString('pt-BR')} {currentOrder.unit}
                </span>
              </div>
              <div className="p-2 rounded bg-amber-50 border border-amber-200">
                <span className="text-[11px] text-amber-800 block">Saldo a Produzir</span>
                <span className="text-sm font-bold text-amber-900">
                  {totals.balanceQty.toLocaleString('pt-BR')} {currentOrder.unit}
                </span>
              </div>
              <div className="p-2 rounded bg-muted/40">
                <span className="text-[11px] text-muted-foreground block">Progresso Físico</span>
                <div className="flex items-center gap-1.5">
                  <div className="flex-1 bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-[#005B2E] h-full transition-all"
                      style={{ width: `${totals.completionPct}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-[#005B2E]">{totals.completionPct}%</span>
                </div>
              </div>
              <div className="p-2 rounded bg-rose-50 border border-rose-200">
                <span className="text-[11px] text-rose-800 block">Perda/Refugo</span>
                <span className="text-sm font-bold text-rose-700">
                  {totals.rejectedQty.toLocaleString('pt-BR')} {currentOrder.unit} ({totals.lossPct}
                  %)
                </span>
              </div>
              <div className="p-2 rounded bg-slate-100">
                <span className="text-[11px] text-muted-foreground block">Custo Apontado</span>
                <span className="text-sm font-black text-[#005B2E]">
                  R$ {totals.totalDirectCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* MODO TABLET DO CHÃO DE FÁBRICA — BOTOES GRANDES DE TOQUE RÁPIDO */}
      {tabletMode && currentOrder && (
        <Card className="border-2 border-amber-400 bg-amber-50/40 shadow-md">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                <Tablet className="w-4 h-4 text-amber-600" />
                Terminal do Operador — Apontamentos em Poucos Toques
              </span>
              <span className="text-xs font-mono font-bold text-amber-900">
                OP #{currentOrder.order_number} • {currentOrder.expand?.product_id?.name}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button
                type="button"
                onClick={() => handleQuickApontamento('inicio')}
                className="h-16 text-base font-bold bg-[#005B2E] hover:bg-[#01361D] text-white flex flex-col items-center justify-center gap-1 shadow-sm active:scale-95 transition-transform"
              >
                <Play className="w-5 h-5" />
                <span>INICIAR TURNO/OP</span>
              </Button>

              <Button
                type="button"
                onClick={() => {
                  const qty = Number(prompt('Quantidade produzida neste ciclo:', '100')) || 0
                  if (qty > 0) handleQuickApontamento('producao', qty)
                }}
                className="h-16 text-base font-bold bg-blue-600 hover:bg-blue-700 text-white flex flex-col items-center justify-center gap-1 shadow-sm active:scale-95 transition-transform"
              >
                <TrendingUp className="w-5 h-5" />
                <span>APONTAR PRODUÇÃO (+)</span>
              </Button>

              <Button
                type="button"
                onClick={() => {
                  const reason =
                    prompt('Motivo da parada:', 'Ajuste de máquina / Limpeza / Falta insumo') ||
                    'Parada operacional'
                  handleQuickApontamento('parada', 0, reason)
                }}
                className="h-16 text-base font-bold bg-orange-600 hover:bg-orange-700 text-white flex flex-col items-center justify-center gap-1 shadow-sm active:scale-95 transition-transform"
              >
                <Pause className="w-5 h-5" />
                <span>REGISTRAR PARADA</span>
              </Button>

              <Button
                type="button"
                onClick={() => {
                  const reason =
                    prompt(
                      'Motivo do refugo / defeito:',
                      'Azeitona amassada / Vidro trincado / Salmoura fora',
                    ) || 'Defeito'
                  setNcDialogOpen(true)
                }}
                className="h-16 text-base font-bold bg-red-600 hover:bg-red-700 text-white flex flex-col items-center justify-center gap-1 shadow-sm active:scale-95 transition-transform"
              >
                <AlertTriangle className="w-5 h-5" />
                <span>APONTAR PERDA / NC</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 7 ABAS COMPLETAS DA ORDEM DE PRODUÇÃO (CENTRO DA OPERAÇÃO) */}
      <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-4">
        <TabsList className="bg-muted/60 p-1 rounded-xl grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 h-auto gap-1">
          <TabsTrigger
            value="planejamento"
            className="text-xs py-2 font-bold flex items-center gap-1.5"
          >
            <Layers className="w-3.5 h-3.5 text-[#005B2E]" />
            <span>1. Planejamento</span>
          </TabsTrigger>
          <TabsTrigger value="consumo" className="text-xs py-2 font-bold flex items-center gap-1.5">
            <Package className="w-3.5 h-3.5 text-blue-600" />
            <span>2. Consumo</span>
          </TabsTrigger>
          <TabsTrigger
            value="execucao"
            className="text-xs py-2 font-bold flex items-center gap-1.5"
          >
            <Play className="w-3.5 h-3.5 text-amber-600" />
            <span>3. Execução</span>
          </TabsTrigger>
          <TabsTrigger value="lotes" className="text-xs py-2 font-bold flex items-center gap-1.5">
            <Boxes className="w-3.5 h-3.5 text-purple-600" />
            <span>4. Lotes & Rastreab.</span>
          </TabsTrigger>
          <TabsTrigger value="perdas" className="text-xs py-2 font-bold flex items-center gap-1.5">
            <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
            <span>5. Perdas/Retrabalho</span>
          </TabsTrigger>
          <TabsTrigger
            value="qualidade"
            className="text-xs py-2 font-bold flex items-center gap-1.5"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>6. Qualidade</span>
          </TabsTrigger>
          <TabsTrigger value="custos" className="text-xs py-2 font-bold flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-green-700" />
            <span>7. Custos da OP</span>
          </TabsTrigger>
        </TabsList>

        {/* ABA 1: PLANEJAMENTO (PREVISTO) */}
        <TabsContent value="planejamento" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-2 border-[#005B2E]/20 md:col-span-2">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-[#005B2E] flex items-center gap-2">
                    <Layers className="w-4 h-4" /> Especificações do Planejamento
                  </h3>
                  <Badge variant="outline" className="text-xs">
                    Imutabilidade Garantida
                  </Badge>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-2.5 rounded bg-muted/40">
                    <span className="text-muted-foreground block">Nº da Ordem:</span>
                    <strong className="font-mono text-sm text-[#005B2E]">
                      #{currentOrder?.order_number || '—'}
                    </strong>
                  </div>
                  <div className="p-2.5 rounded bg-muted/40">
                    <span className="text-muted-foreground block">Tipo da Ordem:</span>
                    <strong className="capitalize">
                      {currentOrder?.order_type || 'Produção Normal'}
                    </strong>
                  </div>
                  <div className="p-2.5 rounded bg-muted/40">
                    <span className="text-muted-foreground block">Lote Gerado:</span>
                    <strong className="font-mono">{currentOrder?.lot_number || 'S/N'}</strong>
                  </div>
                  <div className="p-2.5 rounded bg-muted/40">
                    <span className="text-muted-foreground block">Data Início Previsto:</span>
                    <strong>{currentOrder?.start_date || '—'}</strong>
                  </div>
                  <div className="p-2.5 rounded bg-muted/40">
                    <span className="text-muted-foreground block">Data Fim Previsto:</span>
                    <strong>{currentOrder?.end_date || '—'}</strong>
                  </div>
                  <div className="p-2.5 rounded bg-muted/40">
                    <span className="text-muted-foreground block">Responsável PCP:</span>
                    <strong>{currentOrder?.responsible || 'PCP Huram'}</strong>
                  </div>
                </div>

                <div className="p-3 rounded-lg border bg-amber-50/50 border-amber-200 text-xs text-amber-900 space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-amber-700" />
                    Política de Snapshot de Fórmulas e Receitas:
                  </p>
                  <p>
                    Esta Ordem de Produção está amarrada à versão imutável da BOM{' '}
                    <strong>v{currentOrder?.expand?.bom_version_id?.version || 1}</strong>. Qualquer
                    alteração posterior nas receitas e fichas técnicas no módulo de engenharia NÃO
                    modifica o histórico desta produção.
                  </p>
                </div>

                {currentOrder?.observations && (
                  <div className="text-xs p-2.5 rounded bg-muted/30">
                    <span className="text-muted-foreground block font-semibold mb-0.5">
                      Observações da OP:
                    </span>
                    <p className="text-foreground">{currentOrder.observations}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-2 border-[#005B2E]/20">
              <CardContent className="p-4 space-y-3">
                <h3 className="font-bold text-sm text-[#005B2E]">Ações e Atalhos Cruzados</h3>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start text-xs h-9" asChild>
                    <Link to="/admin/industria/fichas-tecnicas">
                      <ExternalLink className="w-3.5 h-3.5 mr-2 text-[#005B2E]" />
                      Ver Ficha Técnica / Receita
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start text-xs h-9" asChild>
                    <Link to="/admin/estoque/posicao">
                      <ExternalLink className="w-3.5 h-3.5 mr-2 text-[#005B2E]" />
                      Consultar Estoque de Insumos
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start text-xs h-9" asChild>
                    <Link to="/admin/industria/manutencao">
                      <ExternalLink className="w-3.5 h-3.5 mr-2 text-[#005B2E]" />
                      Disponibilidade de Máquinas
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-xs h-9"
                    onClick={() => setAttachmentOpen(true)}
                  >
                    <ClipboardList className="w-3.5 h-3.5 mr-2 text-[#005B2E]" />
                    Anexos e Documentos da OP
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ABA 2: CONSUMO (INSUMOS E LOTES CONSUMIDOS) */}
        <TabsContent value="consumo" className="space-y-4">
          <Card className="border-2 border-[#005B2E]/20">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-[#005B2E] flex items-center gap-2">
                    <Package className="w-4 h-4" /> Insumos Previstos (BOM) × Consumo Real de Lotes
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Cálculo automático de necessidades de materiais e baixa condicionada a
                    validações de lote.
                  </p>
                </div>
                <ExportActions
                  filenamePrefix={`consumo-op-${currentOrder?.order_number || 'export'}`}
                  title={`Consumo de Insumos da OP #${currentOrder?.order_number || ''}`}
                  headers={['Componente', 'Qtd Prevista', 'Unidade', 'Perda Prevista']}
                  data={bomComponents.map((c) => [
                    c.expand?.item_id?.name || 'Insumo',
                    c.quantidade || 0,
                    c.unidade || 'UN',
                    c.perda_prevista ? `${c.perda_prevista}%` : '0%',
                  ])}
                />
              </div>

              <JetroTable
                screenId="industria.op.consumo"
                columns={[
                  {
                    id: 'ordem',
                    header: 'Seq',
                    accessorKey: 'ordem',
                    dataType: 'number',
                    defaultWidth: 70,
                    cell: ({ value }) => (
                      <span className="font-mono text-xs">{String(value || '1')}</span>
                    ),
                  },
                  {
                    id: 'componente',
                    header: 'Insumo / Matéria-prima',
                    dataType: 'text',
                    defaultWidth: 260,
                    getSortValue: (row) => row.expand?.item_id?.name || '',
                    cell: ({ row }) => (
                      <div>
                        <strong className="text-xs text-foreground block">
                          {row.expand?.item_id?.name || 'Insumo Industrial'}
                        </strong>
                        <span className="text-[11px] text-muted-foreground font-mono">
                          Cód: {row.expand?.item_id?.code || '—'}
                        </span>
                      </div>
                    ),
                  },
                  {
                    id: 'qtd_prevista',
                    header: 'Qtd Prevista',
                    accessorKey: 'quantidade',
                    dataType: 'number',
                    align: 'right',
                    defaultWidth: 130,
                    cell: ({ row }) => (
                      <span className="font-mono text-xs">
                        {((Number(row.quantidade) || 1) * (totals.plannedQty || 1)).toLocaleString(
                          'pt-BR',
                        )}{' '}
                        {row.unidade}
                      </span>
                    ),
                  },
                  {
                    id: 'lote_origem',
                    header: 'Lote Origem Consumido',
                    dataType: 'text',
                    defaultWidth: 180,
                    cell: ({ row }) => (
                      <Badge variant="outline" className="font-mono text-xs bg-slate-50">
                        {row.lote_sugerido || `LOT-IN-${row.id?.substring(0, 5) || '101'}`}
                      </Badge>
                    ),
                  },
                  {
                    id: 'perda',
                    header: 'Tolerância Perda',
                    accessorKey: 'perda_prevista',
                    dataType: 'number',
                    align: 'right',
                    defaultWidth: 120,
                    cell: ({ value }) => (
                      <span className="text-xs text-muted-foreground">
                        {value ? `${value}%` : '0.0%'}
                      </span>
                    ),
                  },
                  {
                    id: 'status_estoque',
                    header: 'Disponibilidade Estoque',
                    dataType: 'text',
                    defaultWidth: 160,
                    cell: () => (
                      <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-[11px]">
                        Disponível / Reservado
                      </Badge>
                    ),
                  },
                ]}
                data={bomComponents}
                emptyMessage="Nenhum insumo configurado na estrutura da BOM desta OP."
                exportTitle={`Insumos OP #${currentOrder?.order_number || ''}`}
                exportFilename="insumos-op.xlsx"
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA 3: EXECUÇÃO (FASES, TEMPOS, PARADAS, APONTAMENTOS) */}
        <TabsContent value="execucao" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-[#005B2E] flex items-center gap-2">
                <Play className="w-4 h-4" /> Apontamentos de Fases, Máquinas e Paradas
              </h3>
              <p className="text-xs text-muted-foreground">
                Início, pausa, conclusão, tempos reais, operadores e divergências previsto ×
                realizado.
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => setApontamentoDialogOpen(true)}
              className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold text-xs"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" /> Novo Apontamento
            </Button>
          </div>

          {/* Fases operacionais configuradas */}
          {phases.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {phases.map((ph) => (
                <Card key={ph.id} className="border-2 border-[#005B2E]/20">
                  <CardContent className="p-3.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono text-xs">
                          #{ph.sequence}
                        </Badge>
                        <strong className="text-sm text-foreground">{ph.operation_name}</strong>
                      </div>
                      <Badge className={`text-xs ${STATUS_COLORS[ph.status] || 'bg-gray-100'}`}>
                        {ph.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground pt-1 border-t">
                      <div>
                        <span>Operador:</span>
                        <strong className="text-foreground block">{ph.operator_name || '—'}</strong>
                      </div>
                      <div>
                        <span>Previsto:</span>
                        <strong className="text-foreground block">
                          {ph.expected_time_minutes || 0} min
                        </strong>
                      </div>
                      <div>
                        <span>Real:</span>
                        <strong className="text-foreground block">
                          {ph.actual_time_minutes || 0} min
                        </strong>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 pt-1">
                      {ph.status === 'pending' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            transitionPhase(ph.id, 'in_progress').then(() =>
                              loadOrderDetails(currentOrder!.id),
                            )
                          }
                          className="h-7 text-xs"
                        >
                          <Play className="w-3 h-3 mr-1 text-[#005B2E]" /> Iniciar
                        </Button>
                      )}
                      {ph.status === 'in_progress' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              transitionPhase(ph.id, 'paused').then(() =>
                                loadOrderDetails(currentOrder!.id),
                              )
                            }
                            className="h-7 text-xs text-amber-700"
                          >
                            <Pause className="w-3 h-3 mr-1" /> Pausar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              transitionPhase(ph.id, 'completed').then(() =>
                                loadOrderDetails(currentOrder!.id),
                              )
                            }
                            className="h-7 text-xs text-emerald-700 font-bold"
                          >
                            <CheckCircle2 className="w-3 h-3 mr-1" /> Concluir
                          </Button>
                        </>
                      )}
                      {ph.status === 'paused' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            transitionPhase(ph.id, 'in_progress').then(() =>
                              loadOrderDetails(currentOrder!.id),
                            )
                          }
                          className="h-7 text-xs text-blue-700"
                        >
                          <Play className="w-3 h-3 mr-1" /> Retomar
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Histórico completo de apontamentos */}
          <Card className="border-2 border-[#005B2E]/20">
            <CardContent className="p-4 space-y-3">
              <h4 className="font-bold text-xs text-muted-foreground uppercase tracking-wider">
                Log Cronológico de Apontamentos do Chão de Fábrica ({apontamentos.length})
              </h4>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {apontamentos.map((a) => (
                  <div
                    key={a.id}
                    className="p-3 rounded-lg border bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <Badge className="capitalize text-[11px] font-bold">{a.type}</Badge>
                      <div>
                        <p className="font-bold text-foreground">
                          {a.operation_name || 'Operação Industrial'} • Operador: {a.operator_name}
                        </p>
                        <p className="text-muted-foreground text-[11px]">
                          {a.quantity_produced > 0 && `Produzido: ${a.quantity_produced} • `}
                          {a.quantity_rejected > 0 && `Refugo: ${a.quantity_rejected} • `}
                          {a.stoppage_reason && `Motivo Parada: ${a.stoppage_reason} • `}
                          {a.notes}
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono text-muted-foreground shrink-0">
                      {a.created ? new Date(a.created).toLocaleString('pt-BR') : '—'}
                    </span>
                  </div>
                ))}
                {apontamentos.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-6">
                    Nenhum apontamento registrado para esta OP ainda.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA 4: LOTES E RASTREABILIDADE */}
        <TabsContent value="lotes" className="space-y-4">
          <Card className="border-2 border-[#005B2E]/20">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-[#005B2E] flex items-center gap-2">
                    <Boxes className="w-4 h-4" /> Rastreabilidade Ponta a Ponta do Lote
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Lote de entrada → Lote de produto acabado desta OP → Pedido de Venda/Cliente.
                    Base legal para auditoria e recall.
                  </p>
                </div>
                <Badge variant="outline" className="font-mono text-xs bg-slate-100 text-slate-800">
                  Lote da OP: {currentOrder?.lot_number || 'S/N'}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3 rounded-lg border bg-blue-50/50 border-blue-200 text-xs space-y-1">
                  <span className="font-bold text-blue-900 block">
                    1. Lotes de Entrada (Insumos)
                  </span>
                  <p className="text-muted-foreground">
                    Vinculados a notas de compra e recebimento de matéria-prima (ex.: azeitonas
                    frescas, salmoura, vidros, tampas).
                  </p>
                </div>
                <div className="p-3 rounded-lg border bg-amber-50/50 border-amber-200 text-xs space-y-1">
                  <span className="font-bold text-amber-900 block">
                    2. Lote em Processamento (OP)
                  </span>
                  <p className="text-muted-foreground">
                    Lote <strong>{currentOrder?.lot_number}</strong> produzido na linha com
                    apontamentos de lavagem, envase e pasteurização.
                  </p>
                </div>
                <div className="p-3 rounded-lg border bg-emerald-50/50 border-emerald-200 text-xs space-y-1">
                  <span className="font-bold text-emerald-900 block">
                    3. Lote de Saída (Faturamento)
                  </span>
                  <p className="text-muted-foreground">
                    Disponível para separação no WMS e expedição com tracking vinculado a pedidos de
                    venda e NF-e.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <h4 className="font-bold text-xs text-muted-foreground uppercase tracking-wider mb-2">
                  Histórico de Rastreabilidade Registrado ({traceabilityList.length})
                </h4>
                <div className="space-y-2">
                  {traceabilityList.map((t) => (
                    <div
                      key={t.id}
                      className="p-2.5 rounded border text-xs flex items-center justify-between bg-white"
                    >
                      <div>
                        <strong className="text-foreground">
                          {t.raw_material_lot || 'Lote Insumo'}
                        </strong>{' '}
                        →{' '}
                        <strong className="text-[#005B2E]">
                          {t.finished_product_lot || currentOrder?.lot_number}
                        </strong>
                        <span className="text-muted-foreground ml-2">
                          Qtd: {t.quantity_used || '—'}
                        </span>
                      </div>
                      <span className="text-[11px] text-muted-foreground font-mono">
                        {t.created ? new Date(t.created).toLocaleDateString('pt-BR') : '—'}
                      </span>
                    </div>
                  ))}
                  {traceabilityList.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-4 border rounded border-dashed">
                      Rastreabilidade gerada automaticamente conforme os insumos são apontados na
                      execução.
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA 5: PERDAS E RETRABALHO */}
        <TabsContent value="perdas" className="space-y-4">
          <Card className="border-2 border-[#005B2E]/20">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-[#005B2E] flex items-center gap-2">
                    <RotateCcw className="w-4 h-4" /> Controle Analítico de Perdas, Refugos e
                    Retrabalhos
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Identificação de desvios de consumo, peso drenado e motivos de perda nesta
                    ordem.
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => setNcDialogOpen(true)}
                  className="bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Registrar Não Conformidade
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-lg border bg-rose-50/50 border-rose-200">
                  <span className="text-xs text-rose-800 block">Total de Perdas</span>
                  <span className="text-xl font-black text-rose-700">
                    {totals.rejectedQty.toLocaleString('pt-BR')} {currentOrder?.unit}
                  </span>
                  <p className="text-[11px] text-rose-600 mt-0.5">
                    Taxa de perda calculada: {totals.lossPct}%
                  </p>
                </div>
                <div className="p-3 rounded-lg border bg-amber-50/50 border-amber-200">
                  <span className="text-xs text-amber-800 block">Retrabalho Apontado</span>
                  <span className="text-xl font-black text-amber-700">
                    {totals.reworkQty.toLocaleString('pt-BR')} {currentOrder?.unit}
                  </span>
                  <p className="text-[11px] text-amber-600 mt-0.5">Lotes reintegrados à linha</p>
                </div>
                <div className="p-3 rounded-lg border bg-blue-50/50 border-blue-200">
                  <span className="text-xs text-blue-800 block">Não Conformidades (NC)</span>
                  <span className="text-xl font-black text-blue-700">{nonConformities.length}</span>
                  <p className="text-[11px] text-blue-600 mt-0.5">
                    Ocorrências registradas nesta OP
                  </p>
                </div>
              </div>

              {/* Tabela de Não conformidades da OP */}
              <div className="space-y-2">
                <h4 className="font-bold text-xs text-muted-foreground uppercase tracking-wider">
                  Ocorrências e Ações Corretivas Vinculadas
                </h4>
                {nonConformities.map((nc) => (
                  <div key={nc.id} className="p-3 rounded-lg border bg-white space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <strong className="text-sm text-foreground">{nc.description}</strong>
                      <Badge className="bg-rose-100 text-rose-800 border-rose-300 capitalize text-[11px]">
                        {nc.severity} • {nc.status}
                      </Badge>
                    </div>
                    {nc.root_cause && (
                      <p className="text-muted-foreground">
                        <span className="font-semibold text-foreground">Causa Raiz:</span>{' '}
                        {nc.root_cause}
                      </p>
                    )}
                    {nc.corrective_action && (
                      <p className="text-muted-foreground">
                        <span className="font-semibold text-foreground">Ação Corretiva:</span>{' '}
                        {nc.corrective_action}
                      </p>
                    )}
                  </div>
                ))}
                {nonConformities.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-4 border rounded border-dashed">
                    Nenhuma não conformidade registrada nesta OP.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA 6: QUALIDADE (INSPEÇÕES E LIBERAÇÃO DA OP) */}
        <TabsContent value="qualidade" className="space-y-4">
          <Card className="border-2 border-[#005B2E]/20">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-[#005B2E] flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" /> Inspeções e Liberação Sanitária da OP
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Evidências sanitárias, conformidade BPF (Anvisa/MAPA) e laudo de aprovação
                    final.
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className="text-xs bg-emerald-50 text-emerald-800 border-emerald-300"
                >
                  Validação Qualidade Obrigatória
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg border bg-slate-50 space-y-2">
                  <span className="font-bold text-foreground block">
                    Critérios Críticos para Indústria Alimentícia / Conservas
                  </span>
                  <div className="space-y-1 text-muted-foreground">
                    <p>✓ Controle de Salmoura: Concentração de sal e pH entre 3,8 e 4,2</p>
                    <p>✓ Verificação de Peso Líquido × Peso Drenado por amostragem</p>
                    <p>✓ Teste de vedação e vácuo das embalagens / tampas</p>
                    <p>✓ Inspeção de ausência de corpos estranhos</p>
                  </div>
                </div>

                <div className="p-3 rounded-lg border bg-emerald-50/50 border-emerald-200 space-y-2">
                  <span className="font-bold text-emerald-900 block">
                    Parecer de Liberação do Lote
                  </span>
                  <p className="text-xs text-emerald-800">
                    A liberação de qualidade para faturamento e expedição é estritamente
                    condicionada à aprovação técnica.
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <Button
                      size="sm"
                      onClick={() => handleTransition('concluida')}
                      className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs"
                    >
                      Aprovar e Liberar OP
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setNcDialogOpen(true)}
                      className="text-rose-700 border-rose-300 text-xs"
                    >
                      Bloquear Lote / Reprovar
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA 7: CUSTOS (PREVISTO × REALIZADO DESTA OP) */}
        <TabsContent value="custos" className="space-y-4">
          <Card className="border-2 border-[#005B2E]/20">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-[#005B2E] flex items-center gap-2">
                    <DollarSign className="w-4 h-4" /> Formação e Apropriação de Custos da OP
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Custo previsto × custo realizado desta ordem sem duplicação de lançamentos no
                    Financeiro.
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={handleCloseAndAbsorbCosts}
                  className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold text-xs"
                >
                  <DollarSign className="w-3.5 h-3.5 mr-1" /> Apropriar Custos & Fechar
                </Button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-lg border bg-slate-50">
                  <span className="text-muted-foreground block">Custo Direto Total:</span>
                  <strong className="text-base text-foreground font-black">
                    R${' '}
                    {totals.totalDirectCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </strong>
                </div>
                <div className="p-3 rounded-lg border bg-slate-50">
                  <span className="text-muted-foreground block">Custo Unitário Real:</span>
                  <strong className="text-base text-[#005B2E] font-black">
                    R${' '}
                    {(totals.producedQty > 0
                      ? totals.totalDirectCost / totals.producedQty
                      : 0
                    ).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}{' '}
                    / {currentOrder?.unit}
                  </strong>
                </div>
                <div className="p-3 rounded-lg border bg-slate-50">
                  <span className="text-muted-foreground block">Impacto de Perdas:</span>
                  <strong className="text-base text-rose-700 font-bold">
                    R${' '}
                    {(
                      totals.rejectedQty *
                      (totals.producedQty > 0 ? totals.totalDirectCost / totals.producedQty : 0)
                    ).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </strong>
                </div>
                <div className="p-3 rounded-lg border bg-slate-50">
                  <span className="text-muted-foreground block">Status de Apropriação:</span>
                  <Badge variant="outline" className="text-xs mt-1">
                    {currentOrder?.status === 'fechada'
                      ? 'Apropriado no ERP'
                      : 'Aguardando Fechamento'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* DIÁLOGO: NOVA ORDEM DE PRODUÇÃO */}
      <Dialog open={orderDialogOpen} onOpenChange={setOrderDialogOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#005B2E] flex items-center gap-2">
              <ClipboardList className="w-5 h-5" /> Nova Ordem de Produção
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateOrder} className="space-y-3 pt-2">
            <div>
              <Label className="text-xs font-semibold">Produto Acabado a Produzir *</Label>
              <Select name="product_id" required>
                <SelectTrigger className="h-9 focus:ring-[#005B2E]">
                  <SelectValue placeholder="Selecione o produto canônico..." />
                </SelectTrigger>
                <SelectContent>
                  {items.map((i) => (
                    <SelectItem key={String(i.id)} value={String(i.id)}>
                      {String(i.name)} ({String(i.code || '—')})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold">Versão da BOM / Receita</Label>
                <Select name="bom_version_id">
                  <SelectTrigger className="h-9 focus:ring-[#005B2E]">
                    <SelectValue placeholder="BOM Ativa Padrão" />
                  </SelectTrigger>
                  <SelectContent>
                    {boms.map((b) => (
                      <SelectItem key={String(b.id)} value={String(b.id)}>
                        v{String(b.version)} — {String(b.type || 'Estrutura')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs font-semibold">Rota de Fabricação</Label>
                <Select name="route_id">
                  <SelectTrigger className="h-9 focus:ring-[#005B2E]">
                    <SelectValue placeholder="Rota Padrão" />
                  </SelectTrigger>
                  <SelectContent>
                    {routes.map((r) => (
                      <SelectItem key={String(r.id)} value={String(r.id)}>
                        {String(r.name || `Rota v${r.version || 1}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-xs font-semibold">Quantidade Prevista *</Label>
                <Input
                  name="quantity"
                  type="number"
                  defaultValue="1000"
                  min="1"
                  required
                  className="h-9"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold">Unidade</Label>
                <Input name="unit" defaultValue="KG" className="h-9" />
              </div>
              <div>
                <Label className="text-xs font-semibold">Lote Gerado</Label>
                <Input
                  name="lot_number"
                  defaultValue={`LOT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`}
                  className="h-9 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold">Início Previsto</Label>
                <Input
                  name="start_date"
                  type="date"
                  defaultValue={new Date().toISOString().substring(0, 10)}
                  className="h-9"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold">Término Previsto</Label>
                <Input
                  name="end_date"
                  type="date"
                  defaultValue={new Date().toISOString().substring(0, 10)}
                  className="h-9"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs font-semibold">Observações / Orientações</Label>
              <Textarea
                name="observations"
                rows={2}
                placeholder="Ex: Lote para atender pedido prioritário..."
                className="text-xs"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setOrderDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                size="sm"
                className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
              >
                Criar Ordem
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DIÁLOGO: NOVO APONTAMENTO DETALHADO */}
      <Dialog open={apontamentoDialogOpen} onOpenChange={setApontamentoDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-[#005B2E]">Registrar Apontamento Operacional</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={async (e) => {
              e.preventDefault()
              const fd = new FormData(e.currentTarget)
              try {
                await createApontamento({
                  production_order_id: currentOrder!.id,
                  operator_name: String(fd.get('operator_name') || user?.name || 'Operador'),
                  operation_name: String(fd.get('operation_name') || 'Operação'),
                  type: String(fd.get('type') || 'producao') as any,
                  quantity_produced: Number(fd.get('quantity_produced') || 0),
                  quantity_rejected: Number(fd.get('quantity_rejected') || 0),
                  stoppage_reason: String(fd.get('stoppage_reason') || ''),
                  notes: String(fd.get('notes') || ''),
                  lot_number: currentOrder?.lot_number || '',
                  responsible: user?.name || 'Operador',
                })
                toast({ title: 'Apontamento registrado!' })
                setApontamentoDialogOpen(false)
                loadOrderDetails(currentOrder!.id)
              } catch (err: any) {
                toast({
                  title: 'Erro ao apontar',
                  description: err?.message,
                  variant: 'destructive',
                })
              }
            }}
            className="space-y-3 pt-2"
          >
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold">Tipo do Apontamento</Label>
                <Select name="type" defaultValue="producao">
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inicio">Início</SelectItem>
                    <SelectItem value="producao">Produção</SelectItem>
                    <SelectItem value="pausa">Pausa</SelectItem>
                    <SelectItem value="parada">Parada de Máquina</SelectItem>
                    <SelectItem value="rework">Retrabalho</SelectItem>
                    <SelectItem value="fim">Fim de Turno / Conclusão</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs font-semibold">Operador</Label>
                <Input
                  name="operator_name"
                  defaultValue={user?.name || 'Operador'}
                  className="h-9"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold">Qtd Produzida</Label>
                <Input
                  name="quantity_produced"
                  type="number"
                  defaultValue="0"
                  min="0"
                  className="h-9"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold">Qtd Refugada / Perda</Label>
                <Input
                  name="quantity_rejected"
                  type="number"
                  defaultValue="0"
                  min="0"
                  className="h-9"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs font-semibold">Motivo de Parada (se aplicável)</Label>
              <Input
                name="stoppage_reason"
                placeholder="Ex: Quebra mecânica, troca de salmoura..."
                className="h-9"
              />
            </div>

            <div>
              <Label className="text-xs font-semibold">Observações</Label>
              <Textarea name="notes" rows={2} className="text-xs" />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setApontamentoDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                size="sm"
                className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
              >
                Salvar Apontamento
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DIÁLOGO: NOVA NÃO CONFORMIDADE */}
      <Dialog open={ncDialogOpen} onOpenChange={setNcDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-rose-700 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" /> Registrar Não Conformidade na OP
            </DialogTitle>
          </DialogHeader>
          <form
            onSubmit={async (e) => {
              e.preventDefault()
              const fd = new FormData(e.currentTarget)
              try {
                await createNonConformity({
                  production_order_id: currentOrder!.id,
                  description: String(fd.get('description') || ''),
                  severity: String(fd.get('severity') || 'media') as any,
                  status: 'aberta',
                  quantity_affected: Number(fd.get('quantity_affected') || 0),
                  root_cause: String(fd.get('root_cause') || ''),
                  corrective_action: String(fd.get('corrective_action') || ''),
                  lot_number: currentOrder?.lot_number || '',
                  responsible: user?.name || 'Qualidade',
                })
                toast({ title: 'Não conformidade registrada!' })
                setNcDialogOpen(false)
                loadOrderDetails(currentOrder!.id)
              } catch (err: any) {
                toast({
                  title: 'Erro ao registrar NC',
                  description: err?.message,
                  variant: 'destructive',
                })
              }
            }}
            className="space-y-3 pt-2"
          >
            <div>
              <Label className="text-xs font-semibold">Descrição do Defeito / Desvio *</Label>
              <Input
                name="description"
                required
                placeholder="Ex: Salmoura abaixo do pH, azeitona amassada..."
                className="h-9"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold">Severidade</Label>
                <Select name="severity" defaultValue="media">
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="baixa">Baixa</SelectItem>
                    <SelectItem value="media">Média</SelectItem>
                    <SelectItem value="alta">Alta</SelectItem>
                    <SelectItem value="critica">Crítica (Bloqueio)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs font-semibold">Qtd Afetada</Label>
                <Input
                  name="quantity_affected"
                  type="number"
                  defaultValue="0"
                  min="0"
                  className="h-9"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs font-semibold">Causa Raiz Identificada</Label>
              <Input
                name="root_cause"
                placeholder="Ex: Regulagem incorreta do dosador..."
                className="h-9"
              />
            </div>

            <div>
              <Label className="text-xs font-semibold">Ação Corretiva Imediata</Label>
              <Textarea
                name="corrective_action"
                rows={2}
                placeholder="Ex: Descarte do lote ou reprocessamento..."
                className="text-xs"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setNcDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                size="sm"
                className="bg-rose-700 hover:bg-rose-800 text-white font-bold"
              >
                Registrar NC
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DIÁLOGO GENÉRICO DE ANEXOS DA OP */}
      {currentOrder && (
        <RecordAttachmentsDialog
          open={attachmentOpen}
          onOpenChange={setAttachmentOpen}
          module="OP"
          recordId={currentOrder.id}
          recordTitle={`OP #${currentOrder.order_number} — ${currentOrder.expand?.product_id?.name || 'Produção'}`}
        />
      )}
    </div>
  )
}
