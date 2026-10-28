import React, { useState, useEffect, useMemo, useCallback } from 'react'
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  Search,
  Filter,
  RefreshCw,
  Building2,
  DollarSign,
  ShieldAlert,
  Clock,
  ArrowRight,
  Eye,
  Layers,
  History,
  Info,
  Sliders,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import {
  getPendingOrdersForApproval,
  executeOrderApprovalAction,
  getApprovalTiers,
  getApprovalTrail,
  PendingOrderApproval,
  OrderApprovalTier,
  OrderApprovalRecord,
} from '@/services/order-approvals'

export function OrderApprovalsHubScreen() {
  const { user } = useAuth()
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [pendingOrders, setPendingOrders] = useState<PendingOrderApproval[]>([])
  const [tiers, setTiers] = useState<OrderApprovalTier[]>([])
  const [recentAuditTrail, setRecentAuditTrail] = useState<OrderApprovalRecord[]>([])

  // Filtros
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'todos' | 'venda' | 'compra'>('todos')
  const [filterCompany, setFilterCompany] = useState<string>('todas')
  const [filterMaxValue, setFilterMaxValue] = useState<string>('')

  // Modais de ação
  const [selectedOrder, setSelectedOrder] = useState<PendingOrderApproval | null>(null)
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false)
  const [approveDialogOpen, setApproveDialogOpen] = useState(false)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [approvalNotes, setApprovalNotes] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')
  const [selectedOrderTrail, setSelectedOrderTrail] = useState<OrderApprovalRecord[]>([])
  const [loadingTrail, setLoadingTrail] = useState(false)

  // Carregar dados
  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [ordersData, tiersData, trailData] = await Promise.all([
        getPendingOrdersForApproval(),
        getApprovalTiers(),
        getApprovalTrail(),
      ])
      setPendingOrders(ordersData)
      setTiers(tiersData)
      setRecentAuditTrail(trailData.slice(0, 50))
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao buscar pedidos'
      toast({
        title: 'Erro de carregamento',
        description: msg,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Empresas únicas presentes nos pedidos
  const companies = useMemo(() => {
    const list = new Set<string>()
    pendingOrders.forEach((o) => {
      if (o.company) list.add(o.company)
    })
    return Array.from(list)
  }, [pendingOrders])

  // Pedidos filtrados
  const filteredOrders = useMemo(() => {
    return pendingOrders.filter((order) => {
      // Tipo
      if (filterType !== 'todos' && order.order_type !== filterType) {
        return false
      }
      // Empresa
      if (filterCompany !== 'todas' && order.company !== filterCompany) {
        return false
      }
      // Valor máximo
      if (filterMaxValue) {
        const maxVal = parseFloat(filterMaxValue)
        if (!isNaN(maxVal) && order.total_value > maxVal) {
          return false
        }
      }
      // Busca geral
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase()
        const matchNumber = order.order_number.toLowerCase().includes(query)
        const matchParty = order.client_or_supplier_name.toLowerCase().includes(query)
        const matchRequester = order.requester_name.toLowerCase().includes(query)
        const matchReason = order.approval_reasons.some((r) => r.toLowerCase().includes(query))
        if (!matchNumber && !matchParty && !matchRequester && !matchReason) {
          return false
        }
      }
      return true
    })
  }, [pendingOrders, filterType, filterCompany, filterMaxValue, searchTerm])

  // Totais dos pedidos pendentes filtrados
  const totals = useMemo(() => {
    let salesCount = 0
    let salesValue = 0
    let purchaseCount = 0
    let purchaseValue = 0

    filteredOrders.forEach((o) => {
      if (o.order_type === 'venda') {
        salesCount++
        salesValue += o.total_value
      } else {
        purchaseCount++
        purchaseValue += o.total_value
      }
    })

    return {
      totalCount: filteredOrders.length,
      totalValue: salesValue + purchaseValue,
      salesCount,
      salesValue,
      purchaseCount,
      purchaseValue,
    }
  }, [filteredOrders])

  // Alçada do usuário logado
  const currentUserTier = useMemo(() => {
    if (!user) return null
    const role = user.role || 'PADRAO'
    const match = tiers.find((t) => t.role_or_profile === role && t.active)
    if (match) return match
    if (role === 'SUP') {
      return {
        id: 'sup_default',
        role_or_profile: 'SUP',
        name: 'Superusuário / Diretoria Geral',
        order_type: 'ambos' as const,
        max_value_direct: 999999999,
        max_value_approval: 999999999,
        max_discount_percent: 100,
        can_approve_credit_override: true,
        active: true,
      }
    }
    return null
  }, [user, tiers])

  // Verifica se o usuário atual pode aprovar determinado pedido
  const checkCanApprove = (order: PendingOrderApproval) => {
    if (!user) return { can: false, reason: 'Usuário não autenticado' }

    // Segregação de funções: Solicitante não pode aprovar seu próprio pedido
    if (user.role !== 'SUP' && order.requester_id && order.requester_id === user.id) {
      return {
        can: false,
        reason: 'Segregação de funções: você é o solicitante deste pedido.',
      }
    }

    if (user.role === 'SUP') {
      return { can: true, reason: 'Alçada irrestrita (SUP)' }
    }

    const maxAppr = currentUserTier?.max_value_approval ?? 0
    if (maxAppr <= 0) {
      return {
        can: false,
        reason: 'Seu perfil não possui alçada para liberação de pedidos.',
      }
    }

    if (order.total_value > maxAppr) {
      return {
        can: false,
        reason: `Valor (R$ ${order.total_value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}) excede seu limite de alçada (R$ ${maxAppr.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}).`,
      }
    }

    return { can: true, reason: 'Dentro da sua alçada' }
  }

  // Abertura de modal de detalhes e trilha
  const handleOpenDetails = async (order: PendingOrderApproval) => {
    setSelectedOrder(order)
    setViewDetailsOpen(true)
    setLoadingTrail(true)
    try {
      const trail = await getApprovalTrail(order.id)
      setSelectedOrderTrail(trail)
    } finally {
      setLoadingTrail(false)
    }
  }

  // Execução de aprovação
  const handleConfirmApproval = async () => {
    if (!selectedOrder) return
    setSubmitting(true)
    try {
      const res = await executeOrderApprovalAction({
        order_id: selectedOrder.id,
        order_type: selectedOrder.order_type,
        action: 'aprovar',
        notes: approvalNotes,
      })

      toast({
        title: 'Pedido Aprovado!',
        description: res.message || `Pedido ${selectedOrder.order_number} liberado com sucesso.`,
      })

      setApproveDialogOpen(false)
      setViewDetailsOpen(false)
      setApprovalNotes('')
      setSelectedOrder(null)
      loadData()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao aprovar pedido'
      toast({
        title: 'Erro na aprovação',
        description: msg,
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  // Execução de rejeição
  const handleConfirmRejection = async () => {
    if (!selectedOrder) return
    if (!rejectionReason.trim()) {
      toast({
        title: 'Motivo obrigatório',
        description: 'Informe justificativa detalhada para a rejeição do pedido.',
        variant: 'destructive',
      })
      return
    }

    setSubmitting(true)
    try {
      const res = await executeOrderApprovalAction({
        order_id: selectedOrder.id,
        order_type: selectedOrder.order_type,
        action: 'rejeitar',
        reason: rejectionReason,
      })

      toast({
        title: 'Pedido Rejeitado',
        description: res.message || `Pedido ${selectedOrder.order_number} cancelado/rejeitado.`,
      })

      setRejectDialogOpen(false)
      setViewDetailsOpen(false)
      setRejectionReason('')
      setSelectedOrder(null)
      loadData()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao rejeitar pedido'
      toast({
        title: 'Erro na rejeição',
        description: msg,
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 p-4 md:p-6 pb-20 max-w-[1600px] mx-auto">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Central de Aprovações de Pedidos
            </h1>
            <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-300">
              v0.0.651
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Gestão centralizada de alçadas, validação de crédito e liberação de pedidos de Venda e
            Compra do ERP HURAM.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Atualizar Fila
          </Button>
        </div>
      </div>

      {/* Cartão de Alçada do Usuário Conectado */}
      {user && (
        <Card className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-slate-200">
          <CardContent className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-100 dark:bg-blue-900/50 rounded-lg text-blue-700 dark:text-blue-300">
                <Sliders className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                    Seu Perfil de Aprovação:
                  </span>
                  <Badge variant="secondary" className="font-mono text-xs">
                    {currentUserTier?.name || user.role || 'Padrão'}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Usuário:{' '}
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {user.name}
                  </span>{' '}
                  ({user.email})
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs">
              <div className="bg-white dark:bg-slate-950 px-3 py-1.5 rounded border">
                <span className="text-muted-foreground">Alçada Máx. Aprovação: </span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {user.role === 'SUP'
                    ? 'Irrestrita (Diretoria)'
                    : `R$ ${(currentUserTier?.max_value_approval ?? 0).toLocaleString('pt-BR', {
                        minimumFractionDigits: 2,
                      })}`}
                </span>
              </div>
              <div className="bg-white dark:bg-slate-950 px-3 py-1.5 rounded border">
                <span className="text-muted-foreground">Liberação de Crédito: </span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {user.role === 'SUP' || currentUserTier?.can_approve_credit_override
                    ? 'Autorizado'
                    : 'Não'}
                </span>
              </div>
              <div className="bg-white dark:bg-slate-950 px-3 py-1.5 rounded border">
                <span className="text-muted-foreground">Desconto Máx.: </span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {user.role === 'SUP' ? '100%' : `${currentUserTier?.max_discount_percent ?? 5}%`}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cards de Métricas e Totalização */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-amber-500 shadow-sm">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs uppercase font-medium">
              Total Pendente
            </CardDescription>
            <CardTitle className="text-2xl font-bold flex items-baseline justify-between">
              <span>{totals.totalCount} pedidos</span>
              <Clock className="h-4 w-4 text-amber-500" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-xs text-muted-foreground">
              Volume total:{' '}
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                R$ {totals.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500 shadow-sm">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs uppercase font-medium">
              Vendas Pendentes
            </CardDescription>
            <CardTitle className="text-2xl font-bold flex items-baseline justify-between">
              <span>{totals.salesCount}</span>
              <Badge variant="outline" className="text-blue-700 border-blue-200 bg-blue-50">
                Venda
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-xs text-muted-foreground">
              Soma:{' '}
              <span className="font-semibold text-blue-700 dark:text-blue-300">
                R$ {totals.salesValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 shadow-sm">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs uppercase font-medium">
              Compras Pendentes
            </CardDescription>
            <CardTitle className="text-2xl font-bold flex items-baseline justify-between">
              <span>{totals.purchaseCount}</span>
              <Badge variant="outline" className="text-purple-700 border-purple-200 bg-purple-50">
                Compra
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-xs text-muted-foreground">
              Soma:{' '}
              <span className="font-semibold text-purple-700 dark:text-purple-300">
                R$ {totals.purchaseValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500 shadow-sm">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs uppercase font-medium">
              Aprovações na Sua Alçada
            </CardDescription>
            <CardTitle className="text-2xl font-bold flex items-baseline justify-between">
              <span>{filteredOrders.filter((o) => checkCanApprove(o).can).length} aptos</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-xs text-muted-foreground">
              Pedidos que você pode liberar diretamente agora
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros de Fila */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nº do pedido, cliente/fornecedor, solicitante ou motivo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <Select
                value={filterType}
                onValueChange={(v: 'todos' | 'venda' | 'compra') => setFilterType(v)}
              >
                <SelectTrigger className="w-[130px]">
                  <Filter className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos Tipos</SelectItem>
                  <SelectItem value="venda">Vendas</SelectItem>
                  <SelectItem value="compra">Compras</SelectItem>
                </SelectContent>
              </Select>

              {companies.length > 0 && (
                <Select value={filterCompany} onValueChange={(v) => setFilterCompany(v)}>
                  <SelectTrigger className="w-[160px]">
                    <Building2 className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                    <SelectValue placeholder="Empresa" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas Empresas</SelectItem>
                    {companies.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              <div className="relative w-[130px]">
                <DollarSign className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  type="number"
                  placeholder="Até R$..."
                  value={filterMaxValue}
                  onChange={(e) => setFilterMaxValue(e.target.value)}
                  className="pl-7 text-xs"
                />
              </div>

              {(searchTerm ||
                filterType !== 'todos' ||
                filterCompany !== 'todas' ||
                filterMaxValue) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchTerm('')
                    setFilterType('todos')
                    setFilterCompany('todas')
                    setFilterMaxValue('')
                  }}
                  className="text-xs text-muted-foreground hover:text-slate-900"
                >
                  Limpar
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs: Pedidos Pendentes e Trilha Recente */}
      <Tabs defaultValue="pending" className="w-full">
        <div className="flex items-center justify-between border-b pb-2">
          <TabsList>
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Fila de Pendências ({filteredOrders.length})</span>
            </TabsTrigger>
            <TabsTrigger value="trail" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              <span>Trilha Auditada Recente</span>
            </TabsTrigger>
            <TabsTrigger value="tiers" className="flex items-center gap-2">
              <Sliders className="h-4 w-4" />
              <span>Matriz de Alçadas HURAM</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Conteúdo Fila Pendente */}
        <TabsContent value="pending" className="pt-4">
          {loading ? (
            <div className="text-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Buscando fila de aprovação...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                  Nenhum pedido pendente de aprovação
                </h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto mt-1">
                  Todos os pedidos de Venda e Compra estão liberados ou processados. Novos pedidos
                  que excederem as alçadas aparecerão automaticamente aqui.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredOrders.map((order) => {
                const canApproveStatus = checkCanApprove(order)

                return (
                  <Card
                    key={`${order.order_type}-${order.id}`}
                    className="hover:shadow-md transition-shadow border-slate-200 dark:border-slate-800"
                  >
                    <CardContent className="p-4 sm:p-5">
                      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                        {/* Identificação do Pedido */}
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-bold text-base text-slate-900 dark:text-slate-100">
                              Pedido {order.order_number}
                            </span>
                            <Badge
                              variant="outline"
                              className={
                                order.order_type === 'venda'
                                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                                  : 'bg-purple-50 text-purple-700 border-purple-200'
                              }
                            >
                              {order.order_type === 'venda' ? 'Venda' : 'Compra'}
                            </Badge>
                            <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                              {order.status}
                            </Badge>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Building2 className="h-3 w-3" />
                              {order.company} • {order.branch}
                            </span>
                          </div>

                          <div className="text-sm text-slate-700 dark:text-slate-300 font-medium">
                            {order.order_type === 'venda' ? 'Cliente: ' : 'Fornecedor: '}
                            <span className="text-slate-950 dark:text-white font-semibold">
                              {order.client_or_supplier_name}
                            </span>
                            {order.client_or_supplier_doc && (
                              <span className="text-xs text-muted-foreground ml-1">
                                ({order.client_or_supplier_doc})
                              </span>
                            )}
                          </div>

                          <div className="text-xs text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1">
                            <span>
                              Solicitante:{' '}
                              <strong className="text-slate-700 dark:text-slate-300">
                                {order.requester_name}
                              </strong>
                            </span>
                            <span>
                              Data:{' '}
                              {new Date(order.date).toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>

                          {/* Motivos de Retenção */}
                          <div className="pt-1 flex flex-wrap gap-1.5 items-center">
                            <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1">
                              <AlertTriangle className="h-3 w-3" /> Motivos de Retenção:
                            </span>
                            {order.approval_reasons.map((r, i) => (
                              <Badge
                                key={i}
                                variant="outline"
                                className="text-xs bg-amber-50/50 border-amber-200 text-amber-900 dark:text-amber-300 font-normal py-0"
                              >
                                {r}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* Valor e Ações */}
                        <div className="flex flex-row lg:flex-col items-end justify-between w-full lg:w-auto gap-3 pt-2 lg:pt-0 border-t lg:border-t-0">
                          <div className="text-left lg:text-right">
                            <div className="text-xs text-muted-foreground">Valor Total</div>
                            <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
                              R${' '}
                              {order.total_value.toLocaleString('pt-BR', {
                                minimumFractionDigits: 2,
                              })}
                            </div>
                            {order.discount_value && order.discount_value > 0 ? (
                              <div className="text-xs text-amber-600 font-medium">
                                Desc.: R${' '}
                                {order.discount_value.toLocaleString('pt-BR', {
                                  minimumFractionDigits: 2,
                                })}
                              </div>
                            ) : null}
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenDetails(order)}
                              className="flex items-center gap-1 text-xs"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              Ver Detalhes
                            </Button>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedOrder(order)
                                setRejectionReason('')
                                setRejectDialogOpen(true)
                              }}
                              className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 flex items-center gap-1"
                            >
                              <XCircle className="h-3.5 w-3.5" />
                              Rejeitar
                            </Button>

                            <Button
                              size="sm"
                              disabled={!canApproveStatus.can}
                              title={
                                canApproveStatus.can ? 'Aprovar Pedido' : canApproveStatus.reason
                              }
                              onClick={() => {
                                setSelectedOrder(order)
                                setApprovalNotes('')
                                setApproveDialogOpen(true)
                              }}
                              className={`text-xs flex items-center gap-1 ${
                                canApproveStatus.can
                                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                              }`}
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Aprovar
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Aviso se usuário não pode aprovar */}
                      {!canApproveStatus.can && (
                        <div className="mt-3 pt-2 border-t border-dashed flex items-center gap-2 text-xs text-amber-700 dark:text-amber-400">
                          <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
                          <span>{canApproveStatus.reason}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        {/* Conteúdo Trilha Auditada */}
        <TabsContent value="trail" className="pt-4">
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <History className="h-4 w-4 text-blue-600" />
                Histórico Geral de Aprovações e Rejeições (Auditoria HURAM)
              </CardTitle>
              <CardDescription className="text-xs">
                Registros gravados no servidor com carimbo de tempo, usuário aprovador, nível de
                alçada e motivo.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              {recentAuditTrail.length === 0 ? (
                <p className="text-sm text-muted-foreground py-6 text-center">
                  Nenhum registro de aprovação gravado até o momento.
                </p>
              ) : (
                <div className="space-y-3">
                  {recentAuditTrail.map((record) => (
                    <div
                      key={record.id}
                      className="p-3 rounded-lg border bg-slate-50/50 dark:bg-slate-900/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              record.action === 'aprovado'
                                ? 'default'
                                : record.action === 'rejeitado'
                                  ? 'destructive'
                                  : 'secondary'
                            }
                            className={record.action === 'aprovado' ? 'bg-emerald-600' : ''}
                          >
                            {record.action.toUpperCase()}
                          </Badge>
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            Pedido {record.order_number} ({record.order_type})
                          </span>
                          <span className="text-muted-foreground">
                            Valor: R${' '}
                            {record.total_value.toLocaleString('pt-BR', {
                              minimumFractionDigits: 2,
                            })}
                          </span>
                        </div>
                        <div className="text-muted-foreground flex flex-wrap gap-x-3">
                          <span>
                            Aprovador: <strong>{record.approver_name || 'Sistema'}</strong> (
                            {record.tier_level || 'Padrão'})
                          </span>
                          <span>
                            Solicitante: <strong>{record.requester_name || '-'}</strong>
                          </span>
                          {record.reason && (
                            <span className="text-red-600 dark:text-red-400">
                              Motivo: {record.reason}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-muted-foreground font-mono text-[11px] shrink-0">
                        {new Date(record.created).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Matriz de Alçadas HURAM */}
        <TabsContent value="tiers" className="pt-4">
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Sliders className="h-4 w-4 text-blue-600" />
                Matriz de Limites e Alçadas de Aprovação por Perfil
              </CardTitle>
              <CardDescription className="text-xs">
                Parâmetros que determinam se o pedido exige aprovação de instâncias superiores e
                quem tem poder de liberação.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 uppercase font-semibold">
                    <tr>
                      <th className="p-2.5">Perfil / Cargo</th>
                      <th className="p-2.5">Nome de Referência</th>
                      <th className="p-2.5">Escopo</th>
                      <th className="p-2.5">Direto sem Aprovação</th>
                      <th className="p-2.5">Alçada Máx. Liberação</th>
                      <th className="p-2.5">Desconto Máx.</th>
                      <th className="p-2.5">Libera Crédito?</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {tiers.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                        <td className="p-2.5 font-bold">{t.role_or_profile}</td>
                        <td className="p-2.5">{t.name}</td>
                        <td className="p-2.5 uppercase">{t.order_type}</td>
                        <td className="p-2.5 font-mono">
                          R${' '}
                          {t.max_value_direct.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-2.5 font-mono font-bold text-emerald-600">
                          {t.max_value_approval > 900000000
                            ? 'Irrestrito'
                            : `R$ ${t.max_value_approval.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                        </td>
                        <td className="p-2.5 font-mono">{t.max_discount_percent}%</td>
                        <td className="p-2.5">
                          {t.can_approve_credit_override ? (
                            <Badge
                              variant="outline"
                              className="bg-emerald-50 text-emerald-700 border-emerald-300"
                            >
                              Sim
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">Não</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* DIÁLOGO: DETALHES COMPLETOS DO PEDIDO E TRILHA */}
      <Dialog open={viewDetailsOpen} onOpenChange={setViewDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Detalhes do Pedido {selectedOrder?.order_number} (
              {selectedOrder?.order_type === 'venda' ? 'Venda' : 'Compra'})
            </DialogTitle>
            <DialogDescription>
              Empresa: {selectedOrder?.company} • Filial: {selectedOrder?.branch} • Estágio:{' '}
              {selectedOrder?.status}
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4 text-sm">
              {/* Resumo executivo */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                <div>
                  <span className="text-xs text-muted-foreground block">
                    {selectedOrder.order_type === 'venda' ? 'Cliente' : 'Fornecedor'}
                  </span>
                  <span className="font-semibold">{selectedOrder.client_or_supplier_name}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Solicitante</span>
                  <span className="font-semibold">{selectedOrder.requester_name}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Valor Total</span>
                  <span className="font-bold text-emerald-600 text-base">
                    R${' '}
                    {selectedOrder.total_value.toLocaleString('pt-BR', {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Condição de Pagamento</span>
                  <span>{selectedOrder.payment_condition || 'Padrão / Não informada'}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Data de Criação</span>
                  <span>
                    {new Date(selectedOrder.date).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Status de Alçada</span>
                  <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-300">
                    Aguardando Aprovação
                  </Badge>
                </div>
              </div>

              {/* Motivos de Retenção */}
              <div className="p-3 border rounded-lg bg-amber-50/50 dark:bg-amber-950/20">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400 mb-2 flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4" /> Motivos para Requerer Aprovação Superior
                </h4>
                <ul className="list-disc list-inside space-y-1 text-xs text-amber-900 dark:text-amber-200">
                  {selectedOrder.approval_reasons.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>

              {/* Itens do Pedido (se disponíveis no rawOrder) */}
              {selectedOrder.rawOrder && Array.isArray(selectedOrder.rawOrder.items) && (
                <div>
                  <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                    <Layers className="h-4 w-4" /> Itens do Pedido (
                    {(selectedOrder.rawOrder.items as unknown[]).length})
                  </h4>
                  <div className="border rounded-md overflow-hidden max-h-48 overflow-y-auto">
                    <table className="w-full text-xs">
                      <thead className="bg-slate-100 dark:bg-slate-800">
                        <tr>
                          <th className="p-2 text-left">Código / Descrição</th>
                          <th className="p-2 text-right">Qtd</th>
                          <th className="p-2 text-right">Unitário</th>
                          <th className="p-2 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {(
                          selectedOrder.rawOrder.items as Array<{
                            code?: string
                            description?: string
                            quantity?: number
                            unit_price?: number
                            total?: number
                          }>
                        ).map((item, idx) => (
                          <tr key={idx}>
                            <td className="p-2 font-medium">
                              {item.code ? `${item.code} - ` : ''}
                              {item.description || 'Item sem descrição'}
                            </td>
                            <td className="p-2 text-right">{item.quantity || 1}</td>
                            <td className="p-2 text-right">
                              R${' '}
                              {(item.unit_price || 0).toLocaleString('pt-BR', {
                                minimumFractionDigits: 2,
                              })}
                            </td>
                            <td className="p-2 text-right font-semibold">
                              R${' '}
                              {(item.total || 0).toLocaleString('pt-BR', {
                                minimumFractionDigits: 2,
                              })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Trilha do Pedido */}
              <div>
                <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                  <History className="h-4 w-4" /> Trilha de Aprovação deste Pedido
                </h4>
                {loadingTrail ? (
                  <p className="text-xs text-muted-foreground">Carregando trilha...</p>
                ) : selectedOrderTrail.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    Nenhuma ação anterior registrada além da submissão inicial.
                  </p>
                ) : (
                  <div className="space-y-2 border rounded-md p-2 bg-slate-50 dark:bg-slate-900/50">
                    {selectedOrderTrail.map((tr) => (
                      <div
                        key={tr.id}
                        className="text-xs flex items-center justify-between border-b pb-1 last:border-b-0"
                      >
                        <div>
                          <span className="font-bold uppercase text-slate-800 dark:text-slate-200">
                            {tr.action}:
                          </span>{' '}
                          {tr.approver_name || tr.requester_name} ({tr.tier_level || 'Solicitante'})
                          {tr.reason && (
                            <div className="text-muted-foreground">Motivo: {tr.reason}</div>
                          )}
                        </div>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {new Date(tr.created).toLocaleString('pt-BR')}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setViewDetailsOpen(false)}>
              Fechar
            </Button>
            {selectedOrder && (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setViewDetailsOpen(false)
                    setRejectionReason('')
                    setRejectDialogOpen(true)
                  }}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Rejeitar
                </Button>
                <Button
                  disabled={!checkCanApprove(selectedOrder).can}
                  onClick={() => {
                    setViewDetailsOpen(false)
                    setApprovalNotes('')
                    setApproveDialogOpen(true)
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  Aprovar Pedido
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIÁLOGO: CONFIRMAÇÃO DE APROVAÇÃO */}
      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
              Liberar e Aprovar Pedido {selectedOrder?.order_number}
            </DialogTitle>
            <DialogDescription>
              Você está autorizando o avanço deste pedido com base em sua alçada (
              {currentUserTier?.name || user?.role || 'Aprovador'}).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-sm">
            <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Valor a ser liberado:</span>
                <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  R${' '}
                  {(selectedOrder?.total_value || 0).toLocaleString('pt-BR', {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Beneficiário / Parceiro:</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">
                  {selectedOrder?.client_or_supplier_name}
                </span>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold block mb-1">
                Observações da Liberação (Opcional):
              </label>
              <Textarea
                placeholder="Ex.: Alçada validada pela gerência; condições de pagamento autorizadas conforme política comercial..."
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              disabled={submitting}
              onClick={() => setApproveDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              disabled={submitting}
              onClick={handleConfirmApproval}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {submitting ? 'Gravando no Servidor...' : 'Confirmar Aprovação'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIÁLOGO: REJEIÇÃO / CANCELAMENTO COM JUSTIFICATIVA OBRIGATÓRIA */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <XCircle className="h-5 w-5" />
              Rejeitar Pedido {selectedOrder?.order_number}
            </DialogTitle>
            <DialogDescription>
              A rejeição cancelará o pedido e notificará o solicitante imediatamente com o motivo
              informado.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-sm">
            <div>
              <label className="text-xs font-semibold text-red-700 dark:text-red-400 block mb-1">
                Motivo da Rejeição (OBRIGATÓRIO):
              </label>
              <Textarea
                placeholder="Ex.: Margem insuficiente de contribuição; limite de crédito estourado sem garantia; preço abaixo da tabela autorizada..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
                className="border-red-300 focus:border-red-500"
              />
              <p className="text-[11px] text-muted-foreground mt-1">
                Esta justificativa será registrada na trilha auditada e enviada como notificação ao
                solicitante.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              disabled={submitting}
              onClick={() => setRejectDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              disabled={submitting || !rejectionReason.trim()}
              onClick={handleConfirmRejection}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {submitting ? 'Processando...' : 'Confirmar Rejeição'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
export default OrderApprovalsHubScreen
