import { useState, useEffect } from 'react'
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
import {
  getPurchaseReturns,
  getPurchaseOrders,
  getPurchaseInvoices,
  getSuppliers,
} from '@/services/purchasing'
import { getProducts } from '@/services/products'
import { useRealtime } from '@/hooks/use-realtime'
import {
  STATUS_COLORS,
  RETURN_STATUS,
  type PurchaseReturn,
  type PurchaseOrder,
  type PurchaseInvoice,
} from '@/lib/purchasing-types'
import { PurchaseReturnDialog } from '@/components/purchasing/purchase-return-dialog'
import { Plus, Search, Pencil, Loader2, FileText } from 'lucide-react'

export function PurchaseReturnsPanel() {
  const [records, setRecords] = useState<PurchaseReturn[]>([])
  const [orders, setOrders] = useState<PurchaseOrder[]>([])
  const [invoices, setInvoices] = useState<PurchaseInvoice[]>([])
  const [suppliers, setSuppliers] = useState<Array<Record<string, unknown>>>([])
  const [products, setProducts] = useState<Array<Record<string, unknown>>>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<PurchaseReturn | null>(null)

  const load = async () => {
    try {
      const [rets, ords, invs] = await Promise.all([
        getPurchaseReturns(),
        getPurchaseOrders(),
        getPurchaseInvoices(),
      ])
      setRecords(rets as unknown as PurchaseReturn[])
      setOrders(ords as unknown as PurchaseOrder[])
      setInvoices(invs as unknown as PurchaseInvoice[])
    } catch {
      setRecords([])
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
    getSuppliers()
      .then((s) => setSuppliers(s as unknown as Array<Record<string, unknown>>))
      .catch(() => {})
    getProducts()
      .then((p) => setProducts(p as unknown as Array<Record<string, unknown>>))
      .catch(() => {})
  }, [])
  useRealtime('purchase_returns', () => load())

  const filtered = records.filter((r) => {
    const ms =
      !search ||
      r?.return_number?.toLowerCase().includes(search.toLowerCase()) ||
      r?.supplier_name?.toLowerCase().includes(search.toLowerCase())
    const mf = statusFilter === 'all' || r?.status === statusFilter
    return ms && mf
  })

  const handleNew = () => {
    setEditing(null)
    setFormOpen(true)
  }
  const handleEdit = (ret: PurchaseReturn) => {
    setEditing(ret)
    setFormOpen(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-lg font-bold">Devoluções ao Fornecedor</h3>
        <Button
          onClick={handleNew}
          className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
        >
          <Plus className="w-4 h-4 mr-2" /> Nova Devolução
        </Button>
      </div>
      <Card className="border-2 border-[#005B2E]/20">
        <CardContent className="py-4 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar devoluções..."
                className="pl-10 focus-visible:ring-[#005B2E]"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48 focus-visible:ring-[#005B2E]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                {RETURN_STATUS.map((s) => (
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
            <p className="text-lg font-bold">Nenhuma devolução encontrada.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-2 border-[#005B2E]/20 shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#01361D] text-white">
                  <th className="text-left px-3 py-3 font-bold">Nº Devolução</th>
                  <th className="text-left px-3 py-3 font-bold">Fornecedor</th>
                  <th className="text-left px-3 py-3 font-bold hidden md:table-cell">Pedido</th>
                  <th className="text-left px-3 py-3 font-bold hidden sm:table-cell">
                    Nota Fiscal
                  </th>
                  <th className="text-left px-3 py-3 font-bold">Valor</th>
                  <th className="text-left px-3 py-3 font-bold">Status</th>
                  <th className="text-left px-3 py-3 font-bold hidden sm:table-cell">Data</th>
                  <th className="text-center px-3 py-3 font-bold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="border-b border-border hover:bg-[#005B2E]/5">
                    <td className="px-3 py-3">
                      <span className="text-xs font-mono font-bold text-[#C89B3C]">
                        {r.return_number || '—'}
                      </span>
                    </td>
                    <td className="px-3 py-3">{r.supplier_name || '—'}</td>
                    <td className="px-3 py-3 hidden md:table-cell">{r.order_number || '—'}</td>
                    <td className="px-3 py-3 hidden sm:table-cell">
                      {r.invoice_doc_number || '—'}
                    </td>
                    <td className="px-3 py-3 font-bold">R$ {r.total_value || '0,00'}</td>
                    <td className="px-3 py-3">
                      <span
                        className={`text-xs font-bold px-2 py-1 rounded ${STATUS_COLORS[r.status] || 'bg-gray-100 text-gray-600'}`}
                      >
                        {r.status || '—'}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-xs hidden sm:table-cell">
                      {r.created ? new Date(r.created).toLocaleDateString('pt-BR') : '—'}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(r)}
                          className="text-[#005B2E] hover:bg-[#005B2E]/10"
                          title="Editar"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
      <PurchaseReturnDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        editing={editing}
        orders={orders}
        invoices={invoices}
        products={products}
        onSaved={load}
      />
    </div>
  )
}
