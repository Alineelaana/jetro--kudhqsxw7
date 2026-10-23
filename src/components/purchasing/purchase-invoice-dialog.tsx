import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
  createPurchaseInvoice,
  updatePurchaseInvoice,
  getNextPurchaseNumber,
  updatePurchaseOrder,
} from '@/services/purchasing'
import { updateProduct } from '@/services/products'
import { useAuth } from '@/hooks/use-auth'
import { type PurchaseInvoice, type PurchaseOrder, type InvoiceItem } from '@/lib/purchasing-types'
import { parseNFeXml } from '@/lib/purchasing-xml'
import { Loader2, Upload, AlertTriangle, Check } from 'lucide-react'
import { toast } from 'sonner'

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
  editing: PurchaseInvoice | null
  orders: PurchaseOrder[]
  suppliers: Array<Record<string, unknown>>
  products: Array<Record<string, unknown>>
  onSaved: () => void
}

const emptyItem: InvoiceItem = {
  code: '',
  product: '',
  quantity: '',
  unit_price: '',
  total: '',
  tax: '',
}

export function PurchaseInvoiceDialog({
  open,
  onOpenChange,
  editing,
  orders,
  products,
  onSaved,
}: Props) {
  const { user } = useAuth()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    order_id: '',
    order_number: '',
    supplier_id: '',
    supplier_name: '',
    invoice_number: '',
    invoice_key: '',
    invoice_doc_number: '',
    invoice_series: '',
    total_value: '',
  })
  const [items, setItems] = useState<InvoiceItem[]>([{ ...emptyItem }])
  const [divergences, setDivergences] = useState<
    Array<{ field: string; expected: string; received: string }>
  >([])

  const initData = () => {
    if (editing) {
      setForm({
        order_id: editing.order_id || '',
        order_number: editing.order_number || '',
        supplier_id: editing.supplier_id || '',
        supplier_name: editing.supplier_name || '',
        invoice_number: editing.invoice_number || '',
        invoice_key: editing.invoice_key || '',
        invoice_doc_number: editing.invoice_doc_number || '',
        invoice_series: editing.invoice_series || '',
        total_value: editing.total_value || '',
      })
      setItems(editing.items?.length ? editing.items : [{ ...emptyItem }])
    } else {
      setForm({
        order_id: '',
        order_number: '',
        supplier_id: '',
        supplier_name: '',
        invoice_number: '',
        invoice_key: '',
        invoice_doc_number: '',
        invoice_series: '',
        total_value: '',
      })
      setItems([{ ...emptyItem }])
    }
    setDivergences([])
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
          quantity: it.quantity,
          unit_price: it.unit_price,
          total: it.total,
          tax: '0',
        })) || [{ ...emptyItem }],
      )
    }
  }

  const handleXmlImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const parsed = parseNFeXml(reader.result as string)
      if (!parsed) {
        toast.error('Erro ao processar XML')
        return
      }
      setForm((f) => ({
        ...f,
        invoice_number: parsed.invoice_number,
        invoice_key: parsed.invoice_key,
        invoice_doc_number: parsed.invoice_number,
        invoice_series: parsed.invoice_series,
        supplier_name: parsed.supplier_name || f.supplier_name,
        total_value: parsed.total_value,
      }))
      setItems(parsed.items.length ? parsed.items : [{ ...emptyItem }])
      const order = orders.find((o) => o.id === form.order_id)
      if (order?.items) {
        const divs: Array<{ field: string; expected: string; received: string }> = []
        parsed.items.forEach((pi) => {
          const oi = order.items!.find((o) => o.product === pi.product)
          if (!oi) {
            divs.push({
              field: `Produto: ${pi.product}`,
              expected: 'Não encontrado',
              received: pi.quantity,
            })
            return
          }
          if (parseFloat(pi.quantity) !== parseFloat(oi.quantity))
            divs.push({ field: `Qtd: ${pi.product}`, expected: oi.quantity, received: pi.quantity })
          if (parseFloat(pi.unit_price) !== parseFloat(oi.unit_price))
            divs.push({
              field: `Preço: ${pi.product}`,
              expected: oi.unit_price,
              received: pi.unit_price,
            })
        })
        setDivergences(divs)
      }
      toast.success('XML importado com sucesso')
    }
    reader.readAsText(file)
  }

  const setItem = (i: number, field: keyof InvoiceItem, value: string) =>
    setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, [field]: value } : it)))

  const handleSave = async (confirm: boolean) => {
    setSaving(true)
    try {
      const totalVal = items.reduce((s, i) => s + (parseFloat(i.total) || 0), 0).toFixed(2)
      const history = [
        ...(editing?.history || []),
        {
          action: confirm ? 'Confirmada' : 'Salvo',
          user: (user?.name as string) || '',
          date: new Date().toISOString(),
          note: '',
        },
      ]
      const data: Record<string, unknown> = {
        ...form,
        total_value: totalVal,
        items: items.filter((i) => i.product),
        divergences,
        status: confirm ? 'Confirmada' : editing?.status || 'Em Digitação',
        stock_updated: confirm,
        cost_updated: confirm,
        payable_generated: confirm,
        responsible_user: (user?.name as string) || '',
        history,
      }
      if (editing) await updatePurchaseInvoice(editing.id, data)
      else {
        const { number } = await getNextPurchaseNumber('invoice')
        if (!data.invoice_number) data.invoice_number = number
        await createPurchaseInvoice(data)
      }
      if (confirm) {
        for (const item of items.filter((i) => i.product)) {
          const product = products.find((p) => p.code === item.code || p.name === item.product)
          if (product) {
            const currentStock = (product.stock as number) || 0
            // O saldo físico é atualizado e o custo é recalculado pelo motor de Custo Médio Ponderado Real via backend
            await updateProduct(product.id as string, {
              stock: currentStock + (parseFloat(item.quantity) || 0),
              last_purchase: new Date().toISOString(),
            })
          }
        }
        const order = orders.find((o) => o.id === form.order_id)
        if (order) {
          const allReceived = items.every((ii) => {
            const oi = order.items?.find((o) => o.product === ii.product)
            return oi && parseFloat(ii.quantity) >= parseFloat(oi.quantity)
          })
          await updatePurchaseOrder(order.id, {
            status: allReceived ? 'Recebido Totalmente' : 'Recebido Parcialmente',
            history: [
              ...(order.history || []),
              {
                action: 'Nota fiscal confirmada',
                user: (user?.name as string) || '',
                date: new Date().toISOString(),
                note: '',
              },
            ],
          })
        }
      }
      toast.success(
        confirm ? 'Nota fiscal confirmada — estoque e custos atualizados' : 'Nota fiscal salva',
      )
      onOpenChange(false)
      onSaved()
    } catch {
      toast.error('Erro ao salvar nota fiscal')
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
          <DialogTitle>{editing ? 'Editar Nota Fiscal' : 'Nova Nota Fiscal'}</DialogTitle>
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
              <Label className="text-xs">Importar XML</Label>
              <label className="cursor-pointer inline-flex items-center gap-1 px-3 py-2 border border-[#005B2E] text-[#005B2E] rounded-lg text-xs font-medium hover:bg-[#005B2E]/10">
                <Upload className="w-3 h-3" /> Selecionar XML
                <input type="file" accept=".xml" className="hidden" onChange={handleXmlImport} />
              </label>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <Label className="text-xs">Nº NF</Label>
              <Input
                value={form.invoice_number}
                onChange={(e) => setForm({ ...form, invoice_number: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div>
              <Label className="text-xs">Série</Label>
              <Input
                value={form.invoice_series}
                onChange={(e) => setForm({ ...form, invoice_series: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div>
              <Label className="text-xs">Chave de Acesso</Label>
              <Input
                value={form.invoice_key}
                onChange={(e) => setForm({ ...form, invoice_key: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
          </div>
          <div>
            <Label className="text-xs">Fornecedor</Label>
            <Input
              value={form.supplier_name}
              onChange={(e) => setForm({ ...form, supplier_name: e.target.value })}
              className="focus-visible:ring-[#005B2E]"
            />
          </div>
          {divergences.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span className="text-sm font-bold text-amber-700">
                  Divergências Detectadas ({divergences.length})
                </span>
              </div>
              {divergences.map((d, i) => (
                <div key={i} className="text-xs text-amber-700">
                  {d.field}: Esperado {d.expected} / Recebido {d.received}
                </div>
              ))}
            </div>
          )}
          <div>
            <Label className="text-sm font-bold">Itens</Label>
            <div className="overflow-x-auto mt-2">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-muted">
                    <th className="text-left p-2">Código</th>
                    <th className="text-left p-2">Produto</th>
                    <th className="text-left p-2 w-16">Qtd</th>
                    <th className="text-left p-2 w-24">Vlr Unit.</th>
                    <th className="text-left p-2 w-24">Total</th>
                    <th className="text-left p-2 w-20">Imposto</th>
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
                      <td className="p-1">
                        <Input
                          type="number"
                          value={it.total}
                          onChange={(e) => setItem(i, 'total', e.target.value)}
                          className="h-8 text-xs"
                        />
                      </td>
                      <td className="p-1">
                        <Input
                          type="number"
                          value={it.tax}
                          onChange={(e) => setItem(i, 'tax', e.target.value)}
                          className="h-8 text-xs"
                        />
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
            <Check className="w-4 h-4 mr-2" /> Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
