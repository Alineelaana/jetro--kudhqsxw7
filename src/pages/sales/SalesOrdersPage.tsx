import { useState, useEffect, useMemo, useCallback } from 'react'
import { SalesPageWrapper } from '@/components/sales/sales-page-wrapper'
import pb from '@/lib/pocketbase/client'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import {
  type SalesOrderRecord,
  type OrderItem,
  type FaturamentoStatus,
  parseOrderItems,
  resolveOrderInvoicingStatus,
  formatCurrency,
  formatDate,
  confirmSalesOrder,
  confirmOrderSeparation,
  releaseOrderForInvoicing,
  cancelSalesOrder,
} from '@/services/sales-invoicing-flow'
import { JetroTable, type JetroColumnDef } from '@/components/jetro-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Search,
  CheckCircle2,
  Boxes,
  Send,
  XCircle,
  Loader2,
  RefreshCw,
  Package,
  Layers,
  FileText,
  AlertTriangle,
} from 'lucide-react'
import { toast } from 'sonner'

type FilterKey = 'all' | FaturamentoStatus

const FILTER_TABS: Array<{ key: FilterKey; label: string; countColor: string }> = [
  { key: 'all', label: 'Todos os Pedidos', countColor: 'bg-muted text-foreground' },
  {
    key: 'pendente_liberacao',
    label: 'Pendente Liberação',
    countColor: 'bg-amber-100 text-amber-800 border-amber-300',
  },
  {
    key: 'pendente_faturamento',
    label: 'Pendente Faturamento',
    countColor: 'bg-blue-100 text-blue-800 border-blue-300',
  },
  {
    key: 'faturado',
    label: 'Faturado',
    countColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  },
  {
    key: 'cancelado',
    label: 'Cancelado',
    countColor: 'bg-rose-100 text-rose-800 border-rose-300',
  },
]

function getStatusBadge(order: SalesOrderRecord) {
  const status = resolveOrderInvoicingStatus(order)
  switch (status) {
    case 'pendente_liberacao':
      return (
        <Badge
          variant="outline"
          className="bg-amber-50 text-amber-800 border-amber-300 font-semibold"
        >
          Pendente Liberação
        </Badge>
      )
    case 'pendente_faturamento':
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-300 font-semibold">
          Pendente Faturamento
        </Badge>
      )
    case 'faturado':
      return (
        <Badge
          variant="outline"
          className="bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold"
        >
          Faturado
        </Badge>
      )
    case 'cancelado':
      return (
        <Badge variant="outline" className="bg-rose-50 text-rose-800 border-rose-300 font-semibold">
          Cancelado
        </Badge>
      )
    default:
      return (
        <Badge variant="outline" className="font-semibold">
          {order.status || 'Indefinido'}
        </Badge>
      )
  }
}

export default function SalesOrdersPage() {
  const { user } = useAuth()
  const userName = (user?.name as string) || (user?.email as string) || 'Operador'

  const [orders, setOrders] = useState<SalesOrderRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedFilter, setSelectedFilter] = useState<FilterKey>('all')
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)

  // Diálogo de cancelamento com justificativa
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  // Diálogo de resultado da separação / conferência de estoque
  const [stockModalOpen, setStockModalOpen] = useState(false)
  const [stockModalData, setStockModalData] = useState<{
    orderNumber: string
    todosDisponiveis: boolean
    detalhes: Array<{
      product_name: string
      solicitado: number
      estoque_atual: number
      reservado_outros: number
      disponivel: number
      atende: boolean
    }>
  } | null>(null)

  const loadOrders = useCallback(async () => {
    try {
      const records = await pb.collection('sales_orders').getFullList<SalesOrderRecord>({
        sort: '-created',
      })
      setOrders(records)
      if (selectedOrderId && !records.some((r) => r.id === selectedOrderId)) {
        setSelectedOrderId(null)
      }
    } catch (err) {
      console.error('Falha ao carregar pedidos de venda:', err)
      toast.error('Erro ao carregar lista de pedidos de venda.')
    } finally {
      setLoading(false)
    }
  }, [selectedOrderId])

  useEffect(() => {
    void loadOrders()
  }, [loadOrders])

  useRealtime('sales_orders', () => {
    void loadOrders()
  })

  // Contadores por filtro de status
  const counts = useMemo(() => {
    const res: Record<FilterKey, number> = {
      all: orders.length,
      pendente_liberacao: 0,
      pendente_faturamento: 0,
      faturado: 0,
      cancelado: 0,
    }
    for (const o of orders) {
      const st = resolveOrderInvoicingStatus(o)
      if (res[st] !== undefined) {
        res[st] += 1
      }
    }
    return res
  }, [orders])

  // Filtragem
  const filteredOrders = useMemo(() => {
    const term = search.trim().toLowerCase()
    return orders.filter((o) => {
      const st = resolveOrderInvoicingStatus(o)
      if (selectedFilter !== 'all' && st !== selectedFilter) return false
      if (!term) return true
      const numMatch = (o.order_number || '').toLowerCase().includes(term)
      const cliMatch = (o.client_name || '').toLowerCase().includes(term)
      const sellerMatch = (o.salesperson_name || '').toLowerCase().includes(term)
      return numMatch || cliMatch || sellerMatch
    })
  }, [orders, selectedFilter, search])

  // Pedido selecionado
  const selectedOrder = useMemo(() => {
    if (!selectedOrderId) return null
    return orders.find((o) => o.id === selectedOrderId) || null
  }, [orders, selectedOrderId])

  // Itens do pedido selecionado
  const selectedItems: OrderItem[] = useMemo(() => {
    if (!selectedOrder) return []
    return parseOrderItems(selectedOrder.items)
  }, [selectedOrder])

  const selectedOrderStatus = selectedOrder ? resolveOrderInvoicingStatus(selectedOrder) : null

  // Ações chamando sales-invoicing-flow
  const handleConfirm = async () => {
    if (!selectedOrder) return
    setActionLoading(true)
    try {
      const res = await confirmSalesOrder(selectedOrder, userName)
      if (res.success) {
        toast.success(
          `Pedido #${selectedOrder.order_number} confirmado! Provisão financeira e reserva de estoque ativadas.`,
        )
        await loadOrders()
      } else {
        toast.error(res.error || 'Falha ao confirmar pedido.')
      }
    } finally {
      setActionLoading(false)
    }
  }

  const handleConfirmSeparation = async () => {
    if (!selectedOrder) return
    setActionLoading(true)
    try {
      const res = await confirmOrderSeparation(selectedOrder, userName)
      setStockModalData({
        orderNumber: selectedOrder.order_number,
        todosDisponiveis: res.verification?.todos_disponiveis ?? false,
        detalhes: res.verification?.detalhes ?? [],
      })
      setStockModalOpen(true)
      if (res.success) {
        toast.success(
          `Separação do pedido #${selectedOrder.order_number} confirmada! Estoque verificado.`,
        )
        await loadOrders()
      } else {
        toast.error(res.error || 'Separação não autorizada por insuficiência de estoque.')
      }
    } finally {
      setActionLoading(false)
    }
  }

  const handleReleaseInvoicing = async () => {
    if (!selectedOrder) return
    setActionLoading(true)
    try {
      const res = await releaseOrderForInvoicing(selectedOrder, userName)
      if (res.success) {
        toast.success(
          `Pedido #${selectedOrder.order_number} liberado para faturamento com sucesso! Encaminhado à Central de Faturamento.`,
        )
        await loadOrders()
      } else {
        toast.error(res.error || 'Falha ao liberar faturamento.')
      }
    } finally {
      setActionLoading(false)
    }
  }

  const handleCancelClick = () => {
    if (!selectedOrder) return
    setCancelReason('')
    setCancelModalOpen(true)
  }

  const handleConfirmCancel = async () => {
    if (!selectedOrder) return
    const reason = cancelReason.trim() || 'Cancelamento solicitado pelo operador'
    setActionLoading(true)
    try {
      const res = await cancelSalesOrder(selectedOrder, reason, userName)
      if (res.success) {
        toast.success(
          `Pedido #${selectedOrder.order_number} cancelado. Provisões e reservas estornadas com sucesso.`,
        )
        setCancelModalOpen(false)
        await loadOrders()
      } else {
        toast.error(res.error || 'Falha ao cancelar pedido.')
      }
    } finally {
      setActionLoading(false)
    }
  }

  // Colunas do cabeçalho da venda (JetroTable)
  const columns: JetroColumnDef<SalesOrderRecord>[] = useMemo(
    () => [
      {
        id: 'order_number',
        header: 'Número',
        accessorKey: 'order_number',
        dataType: 'text',
        defaultWidth: 120,
        cell: ({ value, row }) => {
          const isSelected = row.id === selectedOrderId
          return (
            <div className="flex items-center gap-2">
              <span
                className={`font-mono font-bold text-xs ${
                  isSelected ? 'text-[#005B2E] underline' : 'text-[#C89B3C]'
                }`}
              >
                #{String(value || '—')}
              </span>
            </div>
          )
        },
      },
      {
        id: 'client_name',
        header: 'Cliente',
        accessorKey: 'client_name',
        dataType: 'text',
        defaultWidth: 240,
        cell: ({ value }) => (
          <span className="font-medium text-sm text-foreground line-clamp-1">
            {String(value || 'Cliente não informado')}
          </span>
        ),
      },
      {
        id: 'created',
        header: 'Data Emissão',
        accessorKey: 'created',
        dataType: 'date',
        defaultWidth: 130,
        cell: ({ value }) => (
          <span className="text-xs text-muted-foreground">{formatDate(value)}</span>
        ),
      },
      {
        id: 'salesperson_name',
        header: 'Vendedor',
        accessorKey: 'salesperson_name',
        dataType: 'text',
        defaultWidth: 160,
        cell: ({ value }) => (
          <span className="text-xs text-muted-foreground">{String(value || '—')}</span>
        ),
      },
      {
        id: 'total_value',
        header: 'Valor Total',
        accessorKey: 'total_value',
        dataType: 'currency',
        align: 'right',
        defaultWidth: 140,
        getSortValue: (row) =>
          parseFloat(String(row.total_value || row.gross_value || '0').replace(',', '.')) || 0,
        cell: ({ row }) => (
          <span className="font-bold text-xs text-[#005B2E]">
            {formatCurrency(row.total_value || row.gross_value || 0)}
          </span>
        ),
      },
      {
        id: 'faturamento_status',
        header: 'Status do Ciclo',
        accessorKey: 'status',
        dataType: 'text',
        align: 'center',
        defaultWidth: 180,
        cell: ({ row }) => getStatusBadge(row),
      },
      {
        id: 'separacao_status',
        header: 'Separação',
        accessorKey: 'separacao_status',
        dataType: 'text',
        align: 'center',
        defaultWidth: 130,
        cell: ({ row }) => {
          const sep = row.separacao_status
          if (sep === 'confirmada') {
            return (
              <Badge
                variant="outline"
                className="bg-emerald-50 text-emerald-700 border-emerald-300 text-[10px]"
              >
                Confirmada
              </Badge>
            )
          }
          return (
            <Badge
              variant="outline"
              className="bg-slate-50 text-slate-600 border-slate-300 text-[10px]"
            >
              Pendente
            </Badge>
          )
        },
      },
    ],
    [selectedOrderId],
  )

  return (
    <SalesPageWrapper>
      <div className="space-y-6">
        {/* Cabeçalho da tela */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-black text-[#005B2E] tracking-tight">
              Pedidos de Venda — Ciclo Comercial
            </h2>
            <p className="text-sm text-muted-foreground">
              Gestão master-detalhe do ciclo comercial: confirmação, separação de estoque, liberação
              e cancelamento com estorno.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void loadOrders()}
            disabled={loading || actionLoading}
            className="self-start sm:self-auto gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>

        {/* Barra de Filtros de Status (4 status oficiais + Todos) */}
        <div className="flex flex-wrap items-center gap-2 p-1 bg-muted/40 rounded-xl border">
          {FILTER_TABS.map((tab) => {
            const active = selectedFilter === tab.key
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setSelectedFilter(tab.key)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  active
                    ? 'bg-[#005B2E] text-white shadow-sm'
                    : 'bg-white/80 hover:bg-white text-muted-foreground hover:text-foreground'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full border font-bold ${
                    active ? 'bg-white/20 text-white border-white/30' : tab.countColor
                  }`}
                >
                  {counts[tab.key]}
                </span>
              </button>
            )
          })}
        </div>

        {/* Busca e Barra de Ações do Pedido Selecionado */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
          <div className="lg:col-span-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por número, cliente ou vendedor..."
              className="pl-9 text-xs h-9 bg-white focus-visible:ring-[#005B2E]"
            />
          </div>

          <div className="lg:col-span-8 flex flex-wrap items-center justify-end gap-2">
            {selectedOrder ? (
              <>
                <span className="text-xs text-muted-foreground mr-1">
                  Pedido <strong className="text-foreground">#{selectedOrder.order_number}</strong>{' '}
                  selecionado:
                </span>

                {/* Confirmar */}
                <Button
                  size="sm"
                  onClick={handleConfirm}
                  disabled={
                    actionLoading ||
                    selectedOrderStatus === 'cancelado' ||
                    selectedOrderStatus === 'faturado'
                  }
                  className="bg-[#005B2E] hover:bg-[#01361D] text-white text-xs h-8 gap-1 font-semibold"
                  title="Gera provisão no Contas a Receber e ativa reserva de estoque"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Confirmar
                </Button>

                {/* Confirmar Separação */}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleConfirmSeparation}
                  disabled={
                    actionLoading ||
                    selectedOrderStatus === 'cancelado' ||
                    selectedOrderStatus === 'faturado'
                  }
                  className="border-amber-400 text-amber-800 hover:bg-amber-50 text-xs h-8 gap-1 font-semibold"
                  title="Valida disponibilidade de estoque e confirma separação física"
                >
                  <Boxes className="w-3.5 h-3.5" />
                  Confirmar Separação
                </Button>

                {/* Liberar Faturamento */}
                <Button
                  size="sm"
                  onClick={handleReleaseInvoicing}
                  disabled={
                    actionLoading ||
                    selectedOrderStatus === 'cancelado' ||
                    selectedOrderStatus === 'faturado'
                  }
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-8 gap-1 font-semibold"
                  title="Encaminha para a Central de Faturamento"
                >
                  <Send className="w-3.5 h-3.5" />
                  Liberar Faturamento
                </Button>

                {/* Cancelar */}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCancelClick}
                  disabled={actionLoading || selectedOrderStatus === 'faturado'}
                  className="border-rose-300 text-rose-700 hover:bg-rose-50 text-xs h-8 gap-1 font-semibold"
                  title="Cancela o pedido e estorna reservas de estoque e provisões financeiras"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  Cancelar
                </Button>
              </>
            ) : (
              <div className="text-xs text-muted-foreground flex items-center gap-1.5 py-1 px-3 bg-muted/40 rounded-lg border border-dashed">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                Selecione um pedido na lista abaixo para habilitar as ações do ciclo.
              </div>
            )}
          </div>
        </div>

        {/* MASTER: Lista de Pedidos (JetroTable) */}
        <Card className="border shadow-sm">
          <CardHeader className="py-3 px-4 bg-muted/20 border-b flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
              <FileText className="w-4 h-4 text-[#005B2E]" />
              Lista de Pedidos ({filteredOrders.length})
            </CardTitle>
            <span className="text-[11px] text-muted-foreground">
              Clique em uma linha para selecionar e inspecionar os itens abaixo
            </span>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex justify-center items-center py-16">
                <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
              </div>
            ) : (
              <JetroTable
                screenId="vendas.pedidos.master-detalhe"
                columns={columns}
                data={filteredOrders}
                rowKey="id"
                onRowClick={(row) => setSelectedOrderId(row.id)}
                emptyMessage="Nenhum pedido encontrado para o filtro selecionado."
                exportTitle="Pedidos de Venda — HURAM ERP"
                exportFilename="pedidos-venda-huram.xlsx"
              />
            )}
          </CardContent>
        </Card>

        {/* DETALHE: Tabela de Itens do Pedido Selecionado */}
        <Card className="border-2 border-[#005B2E]/20 shadow-sm bg-card">
          <CardHeader className="py-3 px-4 bg-[#005B2E]/5 border-b flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-[#005B2E]" />
              <CardTitle className="text-sm font-black text-[#005B2E]">
                Itens do Pedido Selecionado
                {selectedOrder && (
                  <span className="text-foreground font-semibold ml-1">
                    (Pedido #{selectedOrder.order_number} · {selectedOrder.client_name})
                  </span>
                )}
              </CardTitle>
            </div>
            {selectedOrder && (
              <div className="flex items-center gap-3 text-xs">
                <span className="text-muted-foreground">
                  Entrega:{' '}
                  <strong className="text-foreground">
                    {formatDate(selectedOrder.delivery_date)}
                  </strong>
                </span>
                <span className="text-muted-foreground">
                  Condição:{' '}
                  <strong className="text-foreground">
                    {selectedOrder.payment_condition ||
                      selectedOrder.payment_method ||
                      'A combinar'}
                  </strong>
                </span>
                <span className="text-[#005B2E] font-black text-sm">
                  Total:{' '}
                  {formatCurrency(selectedOrder.total_value || selectedOrder.gross_value || 0)}
                </span>
              </div>
            )}
          </CardHeader>
          <CardContent className="p-4">
            {!selectedOrder ? (
              <div className="py-12 text-center text-muted-foreground">
                <Layers className="w-10 h-10 mx-auto mb-2 opacity-40 text-[#005B2E]" />
                <p className="text-sm font-medium">Nenhum pedido selecionado.</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Clique em um pedido na lista acima para visualizar os itens detalhados, preços e
                  subtotais.
                </p>
              </div>
            ) : selectedItems.length === 0 ? (
              <div className="py-10 text-center text-muted-foreground">
                <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-amber-500" />
                <p className="text-sm font-semibold">Este pedido não possui itens cadastrados.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-muted/50 text-muted-foreground border-b uppercase font-bold text-[11px]">
                      <th className="py-2 px-3">#</th>
                      <th className="py-2 px-3">Código</th>
                      <th className="py-2 px-3">Produto / Descrição</th>
                      <th className="py-2 px-3 text-center">NCM</th>
                      <th className="py-2 px-3 text-center">CFOP</th>
                      <th className="py-2 px-3 text-right">Qtd</th>
                      <th className="py-2 px-3 text-center">Unid</th>
                      <th className="py-2 px-3 text-right">Preço Unitário</th>
                      <th className="py-2 px-3 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {selectedItems.map((it, idx) => {
                      const q = Number(it.quantity) || 0
                      const p = Number(it.unit_price || it.price) || 0
                      const sub = Number(it.total || it.total_price) || q * p
                      return (
                        <tr key={idx} className="hover:bg-muted/20 transition-colors">
                          <td className="py-2.5 px-3 font-mono text-muted-foreground">{idx + 1}</td>
                          <td className="py-2.5 px-3 font-mono font-semibold text-foreground">
                            {it.product_code || it.product_id || '—'}
                          </td>
                          <td className="py-2.5 px-3 font-medium text-foreground">
                            {it.product_name || it.name || it.description || 'Produto'}
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono text-muted-foreground">
                            {it.ncm || '—'}
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono text-muted-foreground">
                            {it.cfop || '—'}
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-foreground">
                            {q.toLocaleString('pt-BR')}
                          </td>
                          <td className="py-2.5 px-3 text-center text-muted-foreground uppercase">
                            {it.unit || 'UN'}
                          </td>
                          <td className="py-2.5 px-3 text-right text-muted-foreground">
                            {formatCurrency(p)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-[#005B2E]">
                            {formatCurrency(sub)}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-muted/40 font-bold border-t text-xs">
                      <td colSpan={5} className="py-2.5 px-3 text-right text-muted-foreground">
                        Totalizadores dos Itens ({selectedItems.length}):
                      </td>
                      <td className="py-2.5 px-3 text-right text-foreground">
                        {selectedItems
                          .reduce((s, it) => s + (Number(it.quantity) || 0), 0)
                          .toLocaleString('pt-BR')}
                      </td>
                      <td colSpan={2} className="py-2.5 px-3"></td>
                      <td className="py-2.5 px-3 text-right text-sm text-[#005B2E]">
                        {formatCurrency(
                          selectedItems.reduce((s, it) => {
                            const q = Number(it.quantity) || 0
                            const p = Number(it.unit_price || it.price) || 0
                            const sub = Number(it.total || it.total_price) || q * p
                            return s + sub
                          }, 0),
                        )}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Diálogo de Cancelamento */}
      <Dialog open={cancelModalOpen} onOpenChange={setCancelModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-rose-700 flex items-center gap-2">
              <XCircle className="w-5 h-5 text-rose-600" />
              Cancelar Pedido #{selectedOrder?.order_number}
            </DialogTitle>
            <DialogDescription className="text-xs">
              O cancelamento irá estornar a reserva de estoque e cancelar a provisão financeira no
              Contas a Receber. Esta ação é registrada na auditoria e não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 py-2">
            <label className="text-xs font-semibold text-foreground">Motivo do cancelamento:</label>
            <Input
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Ex.: Desistência do cliente, negociação cancelada..."
              className="text-xs"
            />
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCancelModalOpen(false)}
              disabled={actionLoading}
            >
              Voltar
            </Button>
            <Button
              size="sm"
              onClick={handleConfirmCancel}
              disabled={actionLoading}
              className="bg-rose-600 hover:bg-rose-700 text-white font-semibold"
            >
              {actionLoading && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
              Confirmar Cancelamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de Verificação de Estoque / Separação */}
      <Dialog open={stockModalOpen} onOpenChange={setStockModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Boxes className="w-5 h-5 text-[#005B2E]" />
              Conferência de Separação de Estoque
            </DialogTitle>
            <DialogDescription className="text-xs">
              Validação física de estoque para o Pedido #{stockModalData?.orderNumber}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            {stockModalData?.todosDisponiveis ? (
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <span>
                  Todos os itens possuem saldo em estoque disponível! Separação confirmada.
                </span>
              </div>
            ) : (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
                <span>
                  Atenção: Existem itens com saldo insuficiente em estoque para atender este pedido.
                </span>
              </div>
            )}

            <div className="border rounded-lg overflow-hidden divide-y">
              {stockModalData?.detalhes.map((d, i) => (
                <div key={i} className="p-2.5 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-semibold text-foreground">{d.product_name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      Solicitado: <strong>{d.solicitado}</strong> | Estoque:{' '}
                      <strong>{d.estoque_atual}</strong> | Outras Reservas:{' '}
                      <strong>{d.reservado_outros}</strong>
                    </p>
                  </div>
                  <div>
                    {d.atende ? (
                      <Badge className="bg-emerald-600 text-white text-[10px]">Atende</Badge>
                    ) : (
                      <Badge className="bg-rose-600 text-white text-[10px]">Insuficiente</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button size="sm" onClick={() => setStockModalOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SalesPageWrapper>
  )
}
