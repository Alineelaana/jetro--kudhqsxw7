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

const emptyItem: OrderItem = {
  code: '',
  product: '',
  quantity: '',
  unit_price: '',
  discount: '0',
  total: '0',
}

export function PurchaseOrdersPanel() {
  const { user } = useAuth()
  const [records, setRecords] = useState<PurchaseOrder[]>([])
  const [suppliers, setSuppliers] = useState<Array<Record<string, unknown>>>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<PurchaseOrder | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    supplier_id: '',
    supplier_name: '',
    company: '',
    branch: '',
    buyer: '',
    payment_condition: '',
    payment_method: '',
    delivery_forecast: '',
    freight: '0',
    discounts: '0',
    other_expenses: '0',
  })
  const [items, setItems] = useState<OrderItem[]>([{ ...emptyItem }])
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

  const productsValue = items.reduce((s, i) => s + (parseFloat(i.total) || 0), 0)
  const totalValue =
    productsValue +
    (parseFloat(form.freight) || 0) -
    (parseFloat(form.discounts) || 0) +
    (parseFloat(form.other_expenses) || 0)

  const handleNew = () => {
    setEditing(null)
    setForm({
      supplier_id: '',
      supplier_name: '',
      company: '',
      branch: '',
      buyer: (user?.name as string) || '',
      payment_condition: '',
      payment_method: '',
      delivery_forecast: '',
      freight: '0',
      discounts: '0',
      other_expenses: '0',
    })
    setItems([{ ...emptyItem }])
    setFormOpen(true)
  }
  const handleImportConfirm = (importedItems: OrderItem[]) => {
    setEditing(null)
    setForm({
      supplier_id: '',
      supplier_name: '',
      company: '',
      branch: '',
      buyer: (user?.name as string) || '',
      payment_condition: '',
      payment_method: '',
      delivery_forecast: '',
      freight: '0',
      discounts: '0',
      other_expenses: '0',
    })
    setItems(importedItems.length > 0 ? importedItems : [{ ...emptyItem }])
    setImportOpen(false)
    setFormOpen(true)
  }

  const handleEdit = (o: PurchaseOrder) => {
    setEditing(o)
    setForm({
      supplier_id: o.supplier_id || '',
      supplier_name: o.supplier_name || '',
      company: o.company || '',
      branch: o.branch || '',
      buyer: o.buyer || '',
      payment_condition: o.payment_condition || '',
      payment_method: o.payment_method || '',
      delivery_forecast: o.delivery_forecast || '',
      freight: o.freight || '0',
      discounts: o.discounts || '0',
      other_expenses: o.other_expenses || '0',
    })
    setItems(o.items?.length ? o.items : [{ ...emptyItem }])
    setFormOpen(true)
  }

  const setItem = (i: number, field: keyof OrderItem, value: string) => {
    setItems((prev) =>
      prev.map((it, idx) => {
        if (idx !== i) return it
        const updated = { ...it, [field]: value }
        const qty = parseFloat(updated.quantity) || 0
        const price = parseFloat(updated.unit_price) || 0
        const disc = parseFloat(updated.discount) || 0
        updated.total = String((qty * price - disc).toFixed(2))
        return updated
      }),
    )
  }

  const handleSave = async (submitForApproval: boolean) => {
    setSaving(true)
    try {
      const threshold = await getApprovalThreshold()
      const autoApprove = submitForApproval && totalValue <= threshold
      const status = submitForApproval
        ? autoApprove
          ? 'Aprovado'
          : 'Aguardando Aprovação'
        : editing?.status || 'Em Digitação'
      const data: Record<string, unknown> = {
        ...form,
        buyer_id: user?.id as string,
        items: items.filter((i) => i.product),
        freight: form.freight,
        discounts: form.discounts,
        other_expenses: form.other_expenses,
        products_value: String(productsValue.toFixed(2)),
        total_value: String(totalValue.toFixed(2)),
        status,
        responsible_user: (user?.name as string) || '',
        history: [
          ...(editing?.history || []),
          {
            action: submitForApproval
              ? autoApprove
                ? 'Aprovado automaticamente'
                : 'Enviado para aprovação'
              : 'Salvo',
            user: (user?.name as string) || '',
            date: new Date().toISOString(),
            note: autoApprove ? `Valor R$ ${totalValue.toFixed(2)} <= R$ ${threshold}` : '',
          },
        ],
      }
      if (editing) {
        await updatePurchaseOrder(editing.id, data)
      } else {
        const { number } = await getNextPurchaseNumber('order')
        data.order_number = number
        await createPurchaseOrder(data)
      }
      toast.success(
        submitForApproval
          ? autoApprove
            ? 'Pedido aprovado automaticamente'
            : 'Pedido enviado para aprovação'
          : 'Pedido salvo',
      )
      setFormOpen(false)
      load()
    } catch {
      toast.error('Erro ao salvar pedido')
    }
    setSaving(false)
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
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar Pedido' : 'Novo Pedido de Compra'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <Label className="text-xs">Fornecedor</Label>
                <Select
                  value={form.supplier_id}
                  onValueChange={(v) => {
                    const s = suppliers.find((sp) => sp.id === v)
                    setForm({
                      ...form,
                      supplier_id: v,
                      supplier_name: (s?.full_name as string) || (s?.company_name as string) || '',
                    })
                  }}
                >
                  <SelectTrigger className="focus-visible:ring-[#005B2E]">
                    <SelectValue placeholder="Fornecedor" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((s) => (
                      <SelectItem key={s.id as string} value={s.id as string}>
                        {(s.full_name as string) || (s.company_name as string) || '—'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Empresa</Label>
                <Input
                  value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                  className="focus-visible:ring-[#005B2E]"
                />
              </div>
              <div>
                <Label className="text-xs">Filial</Label>
                <Input
                  value={form.branch}
                  onChange={(e) => setForm({ ...form, branch: e.target.value })}
                  className="focus-visible:ring-[#005B2E]"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <Label className="text-xs">Comprador</Label>
                <Input
                  value={form.buyer}
                  onChange={(e) => setForm({ ...form, buyer: e.target.value })}
                  className="focus-visible:ring-[#005B2E]"
                />
              </div>
              <div>
                <Label className="text-xs">Cond. Pagamento</Label>
                <Input
                  value={form.payment_condition}
                  onChange={(e) => setForm({ ...form, payment_condition: e.target.value })}
                  className="focus-visible:ring-[#005B2E]"
                />
              </div>
              <div>
                <Label className="text-xs">Forma Pagamento</Label>
                <Input
                  value={form.payment_method}
                  onChange={(e) => setForm({ ...form, payment_method: e.target.value })}
                  className="focus-visible:ring-[#005B2E]"
                />
              </div>
            </div>
            <div>
              <Label className="text-xs">Previsão de Entrega</Label>
              <Input
                value={form.delivery_forecast}
                onChange={(e) => setForm({ ...form, delivery_forecast: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
                placeholder="Ex: 15/08/2026"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm font-bold">Produtos</Label>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setItems([...items, { ...emptyItem }])}
                  className="border-[#005B2E] text-[#005B2E]"
                >
                  <Plus className="w-3 h-3 mr-1" /> Item
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-muted">
                      <th className="text-left p-2">Código</th>
                      <th className="text-left p-2">Produto</th>
                      <th className="text-left p-2 w-16">Qtd</th>
                      <th className="text-left p-2 w-24">Vlr Unit.</th>
                      <th className="text-left p-2 w-20">Desc.</th>
                      <th className="text-left p-2 w-24">Total</th>
                      <th className="w-8"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((it, i) => (
                      <tr key={i}>
                        <td className="p-1">
                          <Input
                            value={it.code}
                            onChange={(e) => setItem(i, 'code', e.target.value)}
                            className="h-8 text-xs focus-visible:ring-[#005B2E]"
                          />
                        </td>
                        <td className="p-1">
                          <Input
                            value={it.product}
                            onChange={(e) => setItem(i, 'product', e.target.value)}
                            className="h-8 text-xs focus-visible:ring-[#005B2E]"
                          />
                        </td>
                        <td className="p-1">
                          <Input
                            type="number"
                            value={it.quantity}
                            onChange={(e) => setItem(i, 'quantity', e.target.value)}
                            className="h-8 text-xs focus-visible:ring-[#005B2E]"
                          />
                        </td>
                        <td className="p-1">
                          <Input
                            type="number"
                            value={it.unit_price}
                            onChange={(e) => setItem(i, 'unit_price', e.target.value)}
                            className="h-8 text-xs focus-visible:ring-[#005B2E]"
                          />
                        </td>
                        <td className="p-1">
                          <Input
                            type="number"
                            value={it.discount}
                            onChange={(e) => setItem(i, 'discount', e.target.value)}
                            className="h-8 text-xs focus-visible:ring-[#005B2E]"
                          />
                        </td>
                        <td className="p-1 font-bold">{it.total}</td>
                        <td className="p-1">
                          {items.length > 1 && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setItems(items.filter((_, idx) => idx !== i))}
                              className="text-red-600 h-8 w-8 p-0"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t">
              <div>
                <Label className="text-xs">Vlr Produtos</Label>
                <p className="text-sm font-bold">R$ {productsValue.toFixed(2)}</p>
              </div>
              <div>
                <Label className="text-xs">Frete</Label>
                <Input
                  type="number"
                  value={form.freight}
                  onChange={(e) => setForm({ ...form, freight: e.target.value })}
                  className="h-8 text-xs focus-visible:ring-[#005B2E]"
                />
              </div>
              <div>
                <Label className="text-xs">Descontos</Label>
                <Input
                  type="number"
                  value={form.discounts}
                  onChange={(e) => setForm({ ...form, discounts: e.target.value })}
                  className="h-8 text-xs focus-visible:ring-[#005B2E]"
                />
              </div>
              <div>
                <Label className="text-xs">Outras Despesas</Label>
                <Input
                  type="number"
                  value={form.other_expenses}
                  onChange={(e) => setForm({ ...form, other_expenses: e.target.value })}
                  className="h-8 text-xs focus-visible:ring-[#005B2E]"
                />
              </div>
            </div>
            <div className="text-right">
              <span className="text-lg font-black text-[#005B2E]">
                Valor Total: R$ {totalValue.toFixed(2)}
              </span>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSave(false)}
              disabled={saving}
              className="border-[#005B2E] text-[#005B2E]"
            >
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Salvar
            </Button>
            <Button
              onClick={() => handleSave(true)}
              disabled={saving}
              className="bg-[#005B2E] hover:bg-[#01361D] text-white"
            >
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}{' '}
              <Check className="w-4 h-4 mr-2" /> Aprovar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
