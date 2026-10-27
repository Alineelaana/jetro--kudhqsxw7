import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getSalesOrders, updateSalesOrder, deleteSalesOrder, logSalesAudit } from '@/services/sales'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import { SalesOrderStandardEditor } from '@/components/orders/sales-order-standard-editor'
import { SALES_ORDER_STATUS, STATUS_COLORS, type SalesOrder } from '@/lib/sales-types'
import { JetroTable, type JetroColumnDef } from '@/components/jetro-table'
import { Plus, Search, Pencil, Loader2, FileText, X, Copy, Printer, Package } from 'lucide-react'
import { toast } from 'sonner'

export function SalesOrdersPanel() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<SalesOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<SalesOrder | null>(null)

  const load = async () => {
    try {
      setOrders(await getSalesOrders())
    } catch {
      setOrders([])
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime('sales_orders', () => load())

  const filtered = useMemo(() => {
    const term = search.toLowerCase().trim()
    return orders.filter((o) => {
      const ms =
        !term ||
        o?.order_number?.toLowerCase()?.includes(term) ||
        o?.client_name?.toLowerCase()?.includes(term)
      const mf = statusFilter === 'all' || o?.status === statusFilter
      return ms && mf
    })
  }, [orders, search, statusFilter])

  const handleNew = () => {
    setEditing(null)
    setDialogOpen(true)
  }
  const handleEdit = (o: SalesOrder) => {
    setEditing(o)
    setDialogOpen(true)
  }

  const handleDuplicate = (o: SalesOrder) => {
    setEditing({ ...o, id: '', order_number: '', status: 'Rascunho' })
    setDialogOpen(true)
  }

  const handleCancel = async (o: SalesOrder) => {
    try {
      await updateSalesOrder(o.id, {
        status: 'Cancelado',
        stock_reserved: false,
        history: [
          ...(o.history || []),
          {
            action: 'Cancelado',
            user: (user?.name as string) || '',
            date: new Date().toISOString(),
            note: '',
          },
        ],
      })
      logSalesAudit('cancel', 'sales', o.id, `Pedido ${o.order_number} cancelado`)
      toast.success('Pedido cancelado')
      load()
    } catch {
      toast.error('Erro ao cancelar')
    }
  }

  const handlePrint = (o: SalesOrder) => {
    const html = `<!DOCTYPE html><html><head><title>Pedido ${o.order_number}</title></head><body style="font-family:Arial"><h1 style="color:#005B2E">Pedido de Venda ${o.order_number}</h1><p>Cliente: ${o.client_name}</p><p>Data: ${new Date(o.created).toLocaleDateString('pt-BR')}</p><p>Vendedor: ${o.salesperson_name || '—'}</p><p>Status: ${o.status}</p><table border="1" style="border-collapse:collapse;width:100%"><thead><tr style="background:#005B2E;color:#fff"><th>Código</th><th>Produto</th><th>Qtd</th><th>Vlr Unit.</th><th>Total</th></tr></thead><tbody>${o.items?.map((i) => `<tr><td>${i.code}</td><td>${i.product}</td><td>${i.quantity}</td><td>${i.unit_price}</td><td>${i.total}</td></tr>`).join('')}</tbody></table><p style="margin-top:10px;font-weight:bold">Valor Total: R$ ${o.total_value}</p><script>window.onload=()=>window.print()</script></body></html>`
    const win = window.open('', '_blank')
    if (win) {
      win.document.write(html)
      win.document.close()
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-lg font-bold">Pedidos de Venda</h3>
        <Button
          onClick={handleNew}
          className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
        >
          <Plus className="w-4 h-4 mr-2" /> Novo Pedido de Venda
        </Button>
      </div>
      <Card className="border-2 border-[#005B2E]/20">
        <CardContent className="py-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar pedidos..."
                className="pl-10 focus-visible:ring-[#005B2E]"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48 focus-visible:ring-[#005B2E]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {SALES_ORDER_STATUS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
        </div>
      ) : orders.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="py-16 text-center">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-bold">Nenhum pedido encontrado.</p>
          </CardContent>
        </Card>
      ) : (
        <JetroTable
          screenId="vendas.pedidos"
          columns={[
            {
              id: 'order_number',
              header: 'Nº Pedido',
              accessorKey: 'order_number',
              dataType: 'text',
              defaultWidth: 120,
              cell: ({ value }) => (
                <span className="text-xs font-mono font-bold text-[#C89B3C]">
                  {String(value || '—')}
                </span>
              ),
            },
            {
              id: 'client_name',
              header: 'Cliente',
              accessorKey: 'client_name',
              dataType: 'text',
              defaultWidth: 220,
              cell: ({ value }) => <span className="font-medium">{String(value || '—')}</span>,
            },
            {
              id: 'salesperson_name',
              header: 'Vendedor',
              accessorKey: 'salesperson_name',
              dataType: 'text',
              defaultWidth: 150,
              cell: ({ value }) => <span>{String(value || '—')}</span>,
            },
            {
              id: 'total_value',
              header: 'Valor Total',
              accessorKey: 'total_value',
              dataType: 'currency',
              align: 'right',
              defaultWidth: 130,
              getSortValue: (row) =>
                parseFloat(String(row.total_value || '0').replace(',', '.')) || 0,
              cell: ({ value }) => <span className="font-bold">R$ {String(value || '0,00')}</span>,
            },
            {
              id: 'status',
              header: 'Status',
              accessorKey: 'status',
              dataType: 'text',
              align: 'center',
              defaultWidth: 130,
              cell: ({ value }) => (
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded ${STATUS_COLORS[String(value || '')] || 'bg-gray-100 text-gray-600'}`}
                >
                  {String(value || '—')}
                </span>
              ),
            },
            {
              id: 'created',
              header: 'Data',
              accessorKey: 'created',
              dataType: 'date',
              defaultWidth: 110,
              cell: ({ value }) => (
                <span className="text-xs">
                  {value ? new Date(String(value)).toLocaleDateString('pt-BR') : '—'}
                </span>
              ),
            },
            {
              id: 'actions',
              header: 'Ações',
              align: 'center',
              sortable: false,
              hideable: false,
              resizable: false,
              draggable: false,
              defaultWidth: 130,
              cell: ({ row }) => (
                <div className="flex items-center justify-center gap-0.5">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEdit(row)}
                    className="text-[#005B2E] hover:bg-[#005B2E]/10 h-7 w-7 p-0"
                    title="Editar"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDuplicate(row)}
                    className="text-blue-600 hover:bg-blue-50 h-7 w-7 p-0"
                    title="Duplicar"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handlePrint(row)}
                    className="text-[#005B2E] hover:bg-[#005B2E]/10 h-7 w-7 p-0"
                    title="Imprimir"
                  >
                    <Printer className="w-3.5 h-3.5" />
                  </Button>
                  {row.status !== 'Cancelado' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleCancel(row)}
                      className="text-red-600 hover:bg-red-50 h-7 w-7 p-0"
                      title="Cancelar"
                    >
                      <X className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              ),
            },
          ]}
          data={filtered}
          emptyMessage="Nenhum pedido corresponde aos filtros."
          exportTitle="Pedidos de Venda — Jetro ERP"
          exportFilename="pedidos-venda-jetro.xlsx"
        />
      )}
      <SalesOrderStandardEditor
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        order={editing}
        onSaved={load}
      />
    </div>
  )
}
