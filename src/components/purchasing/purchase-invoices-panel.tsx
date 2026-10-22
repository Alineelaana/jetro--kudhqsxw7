import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { getPurchaseInvoices, getPurchaseOrders, getSuppliers } from '@/services/purchasing'
import { getProducts } from '@/services/products'
import { useRealtime } from '@/hooks/use-realtime'
import { STATUS_COLORS, type PurchaseInvoice, type PurchaseOrder } from '@/lib/purchasing-types'
import { PurchaseInvoiceDialog } from '@/components/purchasing/purchase-invoice-dialog'
import { Plus, Search, Pencil, Loader2, FileText, Upload } from 'lucide-react'
import { XmlImportDialog } from '@/components/fiscal/xml-import-dialog'

export function PurchaseInvoicesPanel() {
  const [records, setRecords] = useState<PurchaseInvoice[]>([])
  const [orders, setOrders] = useState<PurchaseOrder[]>([])
  const [suppliers, setSuppliers] = useState<Array<Record<string, unknown>>>([])
  const [products, setProducts] = useState<Array<Record<string, unknown>>>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [xmlImportOpen, setXmlImportOpen] = useState(false)
  const [editing, setEditing] = useState<PurchaseInvoice | null>(null)

  const load = async () => {
    try {
      const [invs, ords] = await Promise.all([getPurchaseInvoices(), getPurchaseOrders()])
      setRecords(invs as unknown as PurchaseInvoice[])
      setOrders(ords as unknown as PurchaseOrder[])
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
  useRealtime('purchase_invoices', () => load())

  const filtered = records.filter(
    (r) =>
      !search ||
      r?.invoice_number?.toLowerCase().includes(search.toLowerCase()) ||
      r?.supplier_name?.toLowerCase().includes(search.toLowerCase()),
  )

  const handleNew = () => {
    setEditing(null)
    setFormOpen(true)
  }
  const handleEdit = (inv: PurchaseInvoice) => {
    setEditing(inv)
    setFormOpen(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="text-lg font-bold">Entrada de Notas Fiscais</h3>
          <p className="text-xs text-muted-foreground">
            Lançamento por upload XML com idempotência de 44 dígitos e De-Para de fornecedores
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setXmlImportOpen(true)}
            variant="outline"
            className="border-[#005B2E] text-[#005B2E] hover:bg-[#005B2E]/10 font-bold"
          >
            <Upload className="w-4 h-4 mr-2" /> Importar XML da NF-e
          </Button>
          <Button
            onClick={handleNew}
            className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
          >
            <Plus className="w-4 h-4 mr-2" /> Nova Nota Manual
          </Button>
        </div>
      </div>
      <Card className="border-2 border-[#005B2E]/20">
        <CardContent className="py-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar notas fiscais..."
              className="pl-10 focus-visible:ring-[#005B2E]"
            />
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
            <p className="text-lg font-bold">Nenhuma nota fiscal encontrada.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-2 border-[#005B2E]/20 shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#01361D] text-white">
                  <th className="text-left px-3 py-3 font-bold">Nº NF</th>
                  <th className="text-left px-3 py-3 font-bold">Pedido</th>
                  <th className="text-left px-3 py-3 font-bold">Fornecedor</th>
                  <th className="text-left px-3 py-3 font-bold">Valor</th>
                  <th className="text-left px-3 py-3 font-bold">Status</th>
                  <th className="text-left px-3 py-3 font-bold hidden sm:table-cell">Data</th>
                  <th className="text-center px-3 py-3 font-bold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((inv) => (
                  <tr key={inv.id} className="border-b border-border hover:bg-[#005B2E]/5">
                    <td className="px-3 py-3">
                      <span className="text-xs font-mono font-bold text-[#C89B3C]">
                        {inv.invoice_number || '—'}
                      </span>
                    </td>
                    <td className="px-3 py-3">{inv.order_number || '—'}</td>
                    <td className="px-3 py-3">{inv.supplier_name || '—'}</td>
                    <td className="px-3 py-3 font-bold">R$ {inv.total_value || '0,00'}</td>
                    <td className="px-3 py-3">
                      <span
                        className={`text-xs font-bold px-2 py-1 rounded ${STATUS_COLORS[inv.status] || 'bg-gray-100 text-gray-600'}`}
                      >
                        {inv.status || '—'}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-xs hidden sm:table-cell">
                      {inv.created ? new Date(inv.created).toLocaleDateString('pt-BR') : '—'}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(inv)}
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
      <PurchaseInvoiceDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        editing={editing}
        orders={orders}
        suppliers={suppliers}
        products={products}
        onSaved={load}
      />

      {/* DIÁLOGO DE IMPORTAÇÃO DE XML DE ENTRADA IDEMPOTENTE (FASE B) */}
      <XmlImportDialog open={xmlImportOpen} onOpenChange={setXmlImportOpen} onSuccess={load} />
    </div>
  )
}
