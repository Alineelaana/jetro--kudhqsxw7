import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
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
  getPurchaseOrders,
  createPurchaseOrder,
  updatePurchaseOrder,
  getNextPurchaseNumber,
  getSuppliers,
  getApprovalThreshold,
} from '@/services/purchasing'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import {
  ORDER_STATUS,
  STATUS_COLORS,
  type PurchaseOrder,
  type OrderItem,
} from '@/lib/purchasing-types'
import { PurchaseOrderImportDialog } from '@/components/purchasing/purchase-order-import-dialog'
import { PurchaseOrderStandardEditor } from '@/components/orders/purchase-order-standard-editor'
import {
  Plus,
  Search,
  Pencil,
  Loader2,
  FileText,
  X,
  Printer,
  Mail,
  Check,
  Upload,
} from 'lucide-react'
import { toast } from 'sonner'

export function PurchaseOrdersPanel() {
  const { user } = useAuth()
  const [records, setRecords] = useState<PurchaseOrder[]>([])
  const [suppliers, setSuppliers] = useState<Array<Record<string, unknown>>>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<PurchaseOrder | null>(null)
  const [importOpen, setImportOpen] = useState(false)

  const load = async () => {
    try {
      setRecords((await getPurchaseOrders()) as unknown as PurchaseOrder[])
    } catch {
      setRecords([])
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
    getSuppliers()
      .then((s) => setSuppliers(s as Array<Record<string, unknown>>))
      .catch(() => {})
  }, [])
  useRealtime('purchase_orders', () => load())

  const filtered = useMemo(() => {
    const term = search.toLowerCase().trim()
    return records.filter((r) => {
      const ms =
        !term ||
        r?.order_number?.toLowerCase()?.includes(term) ||
        r?.supplier_name?.toLowerCase()?.includes(term)
      const mf = statusFilter === 'all' || r?.status === statusFilter
      return ms && mf
    })
  }, [records, search, statusFilter])

  const handleNew = () => {
    setEditing(null)
    setFormOpen(true)
  }

  const handleImportConfirm = (importedItems: OrderItem[]) => {
    setEditing({
      id: '',
      order_number: '',
      supplier_id: '',
      supplier_name: '',
      company: 'DEC Eldorado',
      branch: 'Matriz',
      buyer: (user?.name as string) || '',
      buyer_id: user?.id,
      payment_condition: '',
      payment_method: '',
      delivery_forecast: '',
      freight: '0',
      discounts: '0',
      other_expenses: '0',
      products_value: '0',
      total_value: '0',
      status: 'Rascunho',
      items: importedItems,
      created: '',
      updated: '',
    })
    setImportOpen(false)
    setFormOpen(true)
  }

  const handleEdit = (o: PurchaseOrder) => {
    setEditing(o)
    setFormOpen(true)
  }

  const handlePrint = (o: PurchaseOrder) => {
    const html = `<!DOCTYPE html><html><head><title>Pedido ${o.order_number}</title></head><body style="font-family:Arial"><h1 style="color:#005B2E">Pedido de Compra ${o.order_number}</h1><p>Fornecedor: ${o.supplier_name}</p><p>Data: ${new Date(o.created).toLocaleDateString('pt-BR')}</p><table border="1" style="border-collapse:collapse;width:100%"><thead><tr style="background:#005B2E;color:#fff"><th>Código</th><th>Produto</th><th>Qtd</th><th>Vlr Unit.</th><th>Desc.</th><th>Total</th></tr></thead><tbody>${o.items?.map((i) => `<tr><td>${i.code}</td><td>${i.product}</td><td>${i.quantity}</td><td>${i.unit_price}</td><td>${i.discount}</td><td>${i.total}</td></tr>`).join('')}</tbody></table><p style="margin-top:10px;font-weight:bold">Valor Total: R$ ${o.total_value}</p><script>window.onload=()=>window.print()</script></body></html>`
    const win = window.open('', '_blank')
    if (win) {
      win.document.write(html)
      win.document.close()
    }
  }

  const handleCancel = async (o: PurchaseOrder) => {
    try {
      await updatePurchaseOrder(o.id, {
        status: 'Cancelado',
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
      toast.success('Pedido cancelado')
      load()
    } catch {
      toast.error('Erro ao cancelar')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-lg font-bold">Pedidos de Compra</h3>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setImportOpen(true)}
            className="border-[#005B2E] text-[#005B2E] font-bold"
          >
            <Upload className="w-4 h-4 mr-2" /> Importar Planilha
          </Button>
          <Button
            onClick={handleNew}
            className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
          >
            <Plus className="w-4 h-4 mr-2" /> Novo Pedido
          </Button>
        </div>
      </div>
      <Card className="border-2 border-[#005B2E]/20">
        <CardContent className="py-4 space-y-3">
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
                {ORDER_STATUS.map((s) => (
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
      ) : filtered.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="py-16 text-center">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-bold">Nenhum pedido encontrado.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-2 border-[#005B2E]/20 shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#01361D] text-white">
                  <th className="text-left px-3 py-3 font-bold">Nº</th>
                  <th className="text-left px-3 py-3 font-bold">Fornecedor</th>
                  <th className="text-left px-3 py-3 font-bold hidden md:table-cell">Comprador</th>
                  <th className="text-left px-3 py-3 font-bold">Valor Total</th>
                  <th className="text-left px-3 py-3 font-bold">Status</th>
                  <th className="text-left px-3 py-3 font-bold hidden sm:table-cell">Data</th>
                  <th className="text-center px-3 py-3 font-bold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((o) => (
                  <tr key={o.id} className="border-b border-border hover:bg-[#005B2E]/5">
                    <td className="px-3 py-3">
                      <span className="text-xs font-mono font-bold text-[#C89B3C]">
                        {o.order_number || '—'}
                      </span>
                    </td>
                    <td className="px-3 py-3 font-medium">{o.supplier_name || '—'}</td>
                    <td className="px-3 py-3 hidden md:table-cell">{o.buyer || '—'}</td>
                    <td className="px-3 py-3 font-bold">R$ {o.total_value || '0,00'}</td>
                    <td className="px-3 py-3">
                      <span
                        className={`text-xs font-bold px-2 py-1 rounded ${STATUS_COLORS[o.status] || 'bg-gray-100 text-gray-600'}`}
                      >
                        {o.status || '—'}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-xs hidden sm:table-cell">
                      {o.created ? new Date(o.created).toLocaleDateString('pt-BR') : '—'}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(o)}
                          className="text-[#005B2E] hover:bg-[#005B2E]/10"
                          title="Editar"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handlePrint(o)}
                          className="text-[#005B2E] hover:bg-[#005B2E]/10"
                          title="Imprimir"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </Button>
                        {o.status !== 'Cancelado' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleCancel(o)}
                            className="text-red-600 hover:bg-red-50"
                            title="Cancelar"
                          >
                            <X className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
      <PurchaseOrderImportDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        onConfirm={handleImportConfirm}
      />
      <PurchaseOrderStandardEditor
        open={formOpen}
        onOpenChange={setFormOpen}
        order={editing}
        onSaved={load}
      />
    </div>
  )
}
