import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
  createPurchaseReturn,
  updatePurchaseReturn,
  getNextPurchaseNumber,
  updatePurchaseOrder,
} from '@/services/purchasing'
import { updateProduct } from '@/services/products'
import { useAuth } from '@/hooks/use-auth'
import {
  RETURN_STATUS,
  type PurchaseReturn,
  type PurchaseOrder,
  type PurchaseInvoice,
  type ReturnItem,
} from '@/lib/purchasing-types'
import { Loader2, Check, Plus, X } from 'lucide-react'
import { toast } from 'sonner'

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
  editing: PurchaseReturn | null
  orders: PurchaseOrder[]
  invoices: PurchaseInvoice[]
  products: Array<Record<string, unknown>>
  onSaved: () => void
}

const emptyItem: ReturnItem = { code: '', product: '', quantity: '', unit_price: '', total: '' }

export function PurchaseReturnDialog({
  open,
  onOpenChange,
  editing,
  orders,
  invoices,
  products,
  onSaved,
}: Props) {
  const { user } = useAuth()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    order_id: '',
    order_number: '',
    invoice_id: '',
    invoice_doc_number: '',
    supplier_id: '',
    supplier_name: '',
    reason: '',
    status: 'Em Digitação',
  })
  const [items, setItems] = useState<ReturnItem[]>([{ ...emptyItem }])

  const initData = () => {
    if (editing) {
      setForm({
        order_id: editing.order_id || '',
        order_number: editing.order_number || '',
        invoice_id: editing.invoice_id || '',
        invoice_doc_number: editing.invoice_doc_number || '',
        supplier_id: editing.supplier_id || '',
        supplier_name: editing.supplier_name || '',
        reason: editing.reason || '',
        status: editing.status || 'Em Digitação',
      })
      setItems(editing.items?.length ? editing.items : [{ ...emptyItem }])
    } else {
      setForm({
        order_id: '',
        order_number: '',
        invoice_id: '',
        invoice_doc_number: '',
        supplier_id: '',
        supplier_name: '',
        reason: '',
        status: 'Em Digitação',
      })
      setItems([{ ...emptyItem }])
    }
  }

  const handleOrderSelect = (orderId: string) => {
    const order = orders.find((o) => o.id === orderId)
    if (order) {
      setForm((f) => ({
        ...f,
        order_id: orderId,
        order_number: order.order_number,
        supplier_id: order.supplier_id,
        supplier_name: order.supplier_name,
      }))
      setItems(
        order.items?.map((it) => ({
          code: it.code,
          product: it.product,
          quantity: '',
          unit_price: it.unit_price,
          total: '0',
        })) || [{ ...emptyItem }],
      )
    }
  }

  const handleInvoiceSelect = (invId: string) => {
    const inv = invoices.find((i) => i.id === invId)
    if (inv)
      setForm((f) => ({
        ...f,
        invoice_id: invId,
        invoice_doc_number: inv.invoice_doc_number || inv.invoice_number,
      }))
  }

  const setItem = (i: number, field: keyof ReturnItem, value: string) =>
    setItems((prev) =>
      prev.map((it, idx) => {
        if (idx !== i) return it
        const updated = { ...it, [field]: value }
        const qty = parseFloat(updated.quantity) || 0
        const price = parseFloat(updated.unit_price) || 0
        updated.total = String((qty * price).toFixed(2))
        return updated
      }),
    )

  const handleSave = async (finalize: boolean) => {
    setSaving(true)
    try {
      const totalVal = items.reduce((s, i) => s + (parseFloat(i.total) || 0), 0).toFixed(2)
      const newStatus = finalize ? 'Finalizada' : form.status
      const history = [
        ...(editing?.history || []),
        {
          action: finalize ? 'Finalizada' : 'Salvo',
          user: (user?.name as string) || '',
          date: new Date().toISOString(),
          note: '',
        },
      ]
      const data: Record<string, unknown> = {
        ...form,
        status: newStatus,
        items: items.filter((i) => i.product),
        total_value: totalVal,
        responsible_user: (user?.name as string) || '',
        history,
      }
      if (editing) await updatePurchaseReturn(editing.id, data)
      else {
        const { number } = await getNextPurchaseNumber('return')
        data.return_number = number
        await createPurchaseReturn(data)
      }
      if (finalize) {
        for (const item of items.filter((i) => i.product && i.quantity)) {
          const product = products.find((p) => p.code === item.code || p.name === item.product)
          if (product) {
            const currentStock = (product.stock as number) || 0
            await updateProduct(product.id as string, {
              stock: Math.max(0, currentStock - (parseFloat(item.quantity) || 0)),
            })
          }
        }
        const order = orders.find((o) => o.id === form.order_id)
        if (order) {
          await updatePurchaseOrder(order.id, {
            history: [
              ...(order.history || []),
              {
                action: 'Devolução registrada',
                user: (user?.name as string) || '',
                date: new Date().toISOString(),
                note: `Devolução ${editing?.return_number || ''}`,
              },
            ],
          })
        }
      }
      toast.success(finalize ? 'Devolução finalizada — estoque atualizado' : 'Devolução salva')
      onOpenChange(false)
      onSaved()
    } catch {
      toast.error('Erro ao salvar devolução')
    }
    setSaving(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (v) initData()
        onOpenChange(v)
      }}
    >
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? 'Editar Devolução' : 'Nova Devolução'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Pedido de Compra</Label>
              <Select value={form.order_id} onValueChange={handleOrderSelect}>
                <SelectTrigger className="focus-visible:ring-[#005B2E]">
                  <SelectValue placeholder="Selecione o pedido" />
                </SelectTrigger>
                <SelectContent>
                  {orders.map((o) => (
                    <SelectItem key={o.id} value={o.id}>
                      {o.order_number} — {o.supplier_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Nota Fiscal</Label>
              <Select value={form.invoice_id} onValueChange={handleInvoiceSelect}>
                <SelectTrigger className="focus-visible:ring-[#005B2E]">
                  <SelectValue placeholder="Selecione a NF" />
                </SelectTrigger>
                <SelectContent>
                  {invoices
                    .filter((i) => !form.order_id || i.order_id === form.order_id)
                    .map((i) => (
                      <SelectItem key={i.id} value={i.id}>
                        {i.invoice_number || i.id}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Fornecedor</Label>
              <Input
                value={form.supplier_name}
                onChange={(e) => setForm({ ...form, supplier_name: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div>
              <Label className="text-xs">Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger className="focus-visible:ring-[#005B2E]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RETURN_STATUS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label className="text-xs">Motivo da Devolução</Label>
            <Textarea
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              className="focus-visible:ring-[#005B2E]"
              rows={2}
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm font-bold">Itens Devolvidos</Label>
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
                          className="h-8 text-xs"
                        />
                      </td>
                      <td className="p-1">
                        <Input
                          value={it.product}
                          onChange={(e) => setItem(i, 'product', e.target.value)}
                          className="h-8 text-xs"
                        />
                      </td>
                      <td className="p-1">
                        <Input
                          type="number"
                          value={it.quantity}
                          onChange={(e) => setItem(i, 'quantity', e.target.value)}
                          className="h-8 text-xs"
                        />
                      </td>
                      <td className="p-1">
                        <Input
                          type="number"
                          value={it.unit_price}
                          onChange={(e) => setItem(i, 'unit_price', e.target.value)}
                          className="h-8 text-xs"
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
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
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
            <Check className="w-4 h-4 mr-2" /> Finalizar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
