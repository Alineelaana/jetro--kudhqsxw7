import { useState, useEffect, useMemo } from 'react'
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
import { getProducts } from '@/services/products'
import {
  getClients,
  getSalespeople,
  getCarriers,
  getPriceTableList,
  getPaymentConditions,
  getPaymentMethods,
  createSalesOrder,
  updateSalesOrder,
  getNextSalesNumber,
  logSalesAudit,
} from '@/services/sales'
import { useAuth } from '@/hooks/use-auth'
import { useSystemParams } from '@/hooks/use-system-params'
import { FREIGHT_TYPES, type SalesOrder, type SalesOrderItem } from '@/lib/sales-types'
import { Loader2, Save, Check, Plus, X, Send } from 'lucide-react'
import { toast } from 'sonner'

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
  order: SalesOrder | null
  onSaved: () => void
}

const emptyItem: SalesOrderItem = {
  code: '',
  product: '',
  unit: '',
  quantity: '1',
  available_stock: '',
  table_price: '',
  unit_price: '',
  discount: '0',
  addition: '0',
  total: '0',
  margin: '',
  situation: '',
}

export function SalesOrderDialog({ open, onOpenChange, order, onSaved }: Props) {
  const { user } = useAuth()
  const { getParamNumber } = useSystemParams()
  const maxDiscountPercent = getParamNumber('Vendas', 'max_discount', 0)
  const [saving, setSaving] = useState(false)
  const [clients, setClients] = useState<Array<Record<string, unknown>>>([])
  const [products, setProducts] = useState<Array<Record<string, unknown>>>([])
  const [salespeople, setSalespeople] = useState<Array<Record<string, unknown>>>([])
  const [carriers, setCarriers] = useState<Array<Record<string, unknown>>>([])
  const [priceTables, setPriceTables] = useState<Array<Record<string, unknown>>>([])
  const [payConditions, setPayConditions] = useState<Array<Record<string, unknown>>>([])
  const [payMethods, setPayMethods] = useState<Array<Record<string, unknown>>>([])
  const [form, setForm] = useState<Record<string, string>>({})
  const [items, setItems] = useState<SalesOrderItem[]>([{ ...emptyItem }])

  useEffect(() => {
    if (open) {
      getProducts()
        .then((p) => setProducts(p as unknown as Array<Record<string, unknown>>))
        .catch(() => {})
      getClients()
        .then((c) => setClients(c))
        .catch(() => {})
      getSalespeople()
        .then((s) => setSalespeople(s))
        .catch(() => {})
      getCarriers()
        .then((c) => setCarriers(c))
        .catch(() => {})
      getPriceTableList()
        .then((t) => setPriceTables(t))
        .catch(() => {})
      getPaymentConditions()
        .then((c) => setPayConditions(c))
        .catch(() => {})
      getPaymentMethods()
        .then((m) => setPayMethods(m))
        .catch(() => {})
      if (order) {
        setForm({
          client_id: order.client_id,
          client_name: order.client_name,
          salesperson_name: order.salesperson_name,
          price_table_id: order.price_table_id,
          payment_condition: order.payment_condition,
          payment_method: order.payment_method,
          delivery_date: order.delivery_date,
          carrier_name: order.carrier_name,
          freight_type: order.freight_type,
          delivery_address: order.delivery_address,
          cost_center: order.cost_center,
          internal_notes: order.internal_notes,
          fiscal_notes: order.fiscal_notes,
          freight_value: order.freight_value || '0',
          insurance_value: order.insurance_value || '0',
          other_expenses: order.other_expenses || '0',
        })
        setItems(order.items?.length ? order.items : [{ ...emptyItem }])
      } else {
        setForm({
          freight_value: '0',
          insurance_value: '0',
          other_expenses: '0',
          freight_type: 'CIF',
        })
        setItems([{ ...emptyItem }])
      }
    }
  }, [open, order])

  const grossValue = useMemo(
    () => items.reduce((s, i) => s + (parseFloat(i.total) || 0), 0),
    [items],
  )
  const discountValue = useMemo(
    () => items.reduce((s, i) => s + (parseFloat(i.discount) || 0), 0),
    [items],
  )
  const additionValue = useMemo(
    () => items.reduce((s, i) => s + (parseFloat(i.addition) || 0), 0),
    [items],
  )
  const totalValue =
    grossValue -
    discountValue +
    additionValue +
    (parseFloat(form.freight_value) || 0) +
    (parseFloat(form.insurance_value) || 0) +
    (parseFloat(form.other_expenses) || 0)

  const setItem = (i: number, field: keyof SalesOrderItem, value: string) => {
    setItems((prev) =>
      prev.map((it, idx) => {
        if (idx !== i) return it
        const updated = { ...it, [field]: value }
        if (field === 'product') {
          const p = products.find((pr) => (pr.name as string) === value)
          if (p) {
            updated.code = (p.code as string) || ''
            updated.unit = (p.unit as string) || ''
            updated.available_stock = String((p.stock as number) ?? 0)
            updated.table_price = (p.price as string) || ''
            updated.unit_price = (p.price as string) || '0'
          }
        }
        if (['quantity', 'unit_price', 'discount', 'addition'].includes(field)) {
          const qty = parseFloat(updated.quantity) || 0
          const price = parseFloat(updated.unit_price) || 0
          let disc = parseFloat(updated.discount) || 0
          if (maxDiscountPercent > 0 && price > 0 && qty > 0) {
            const maxDisc = (qty * price * maxDiscountPercent) / 100
            if (disc > maxDisc) disc = maxDisc
          }
          updated.discount = String(disc)
          const add = parseFloat(updated.addition) || 0
          updated.total = String((qty * price - disc + add).toFixed(2))
          updated.situation =
            parseFloat(updated.available_stock) >= qty ? 'OK' : 'Estoque insuficiente'
        }
        return updated
      }),
    )
  }

  const handlePriceTableChange = (tableId: string) => {
    setForm((prev) => ({ ...prev, price_table_id: tableId }))
    if (!tableId) return
    const table = priceTables.find((t) => t.id === tableId)
    if (!table) return
    const rawItems = table.items
    let tableItems: Array<Record<string, unknown>> = []
    if (Array.isArray(rawItems)) tableItems = rawItems
    else if (typeof rawItems === 'string') {
      try {
        tableItems = JSON.parse(rawItems)
      } catch {
        /* ignore */
      }
    }
    const tableDiscount = parseFloat(String(table.discount_percent || '0').replace(',', '.')) || 0
    setItems((prev) =>
      prev.map((it) => {
        if (!it.product) return it
        const match = tableItems.find(
          (ti) => String(ti.name || '') === it.product || String(ti.code || '') === it.code,
        )
        const newPrice = match
          ? String(match.new_price || match.current_price || match.price || it.unit_price)
          : it.unit_price
        const lineDiscount = match?.max_discount
          ? parseFloat(String(match.max_discount).replace(',', '.')) || 0
          : tableDiscount
        const qty = parseFloat(it.quantity) || 0
        const priceNum = parseFloat(String(newPrice).replace(',', '.')) || 0
        const total = (qty * priceNum - lineDiscount).toFixed(2)
        return {
          ...it,
          table_price: newPrice,
          unit_price: newPrice,
          discount: String(lineDiscount),
          total,
          situation: parseFloat(it.available_stock) >= qty ? 'OK' : 'Estoque insuficiente',
        }
      }),
    )
  }

  const handleSave = async (submitForApproval: boolean) => {
    setSaving(true)
    try {
      const userName = (user?.name as string) || 'Sistema'
      const status = submitForApproval ? 'Aguardando Aprovação' : order?.status || 'Rascunho'
      const clientName =
        (clients.find((c) => c.id === form.client_id)?.full_name as string) ||
        form.client_name ||
        ''
      const data: Record<string, unknown> = {
        ...form,
        client_name: clientName,
        salesperson_name: form.salesperson_name || '',
        items: items.filter((i) => i.product),
        gross_value: String(grossValue.toFixed(2)),
        discount_value: String(discountValue.toFixed(2)),
        addition_value: String(additionValue.toFixed(2)),
        tax_value: '0',
        total_value: String(totalValue.toFixed(2)),
        status,
        responsible_user: userName,
        company: 'Velora Log',
        branch: 'Matriz',
        history: [
          ...(order?.history || []),
          {
            action: submitForApproval ? 'Enviado para aprovação' : 'Salvo',
            user: userName,
            date: new Date().toISOString(),
            note: '',
          },
        ],
      }
      if (order) {
        await updateSalesOrder(order.id, data)
        logSalesAudit('update', 'sales', order.id, `Pedido ${order.order_number} atualizado`)
      } else {
        const { number } = await getNextSalesNumber('order')
        data.order_number = number
        await createSalesOrder(data)
        logSalesAudit('create', 'sales', '', `Pedido ${number} criado`)
      }
      toast.success(submitForApproval ? 'Pedido enviado para aprovação' : 'Pedido salvo')
      onOpenChange(false)
      onSaved()
    } catch {
      toast.error('Erro ao salvar pedido')
    }
    setSaving(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{order ? 'Editar Pedido' : 'Novo Pedido de Venda'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <Label className="text-xs">Cliente</Label>
              <Select
                value={form.client_id || ''}
                onValueChange={(v) => {
                  const c = clients.find((cl) => cl.id === v)
                  setForm({
                    ...form,
                    client_id: v,
                    client_name: (c?.full_name as string) || (c?.company_name as string) || '',
                  })
                }}
              >
                <SelectTrigger className="focus-visible:ring-[#005B2E]">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((c) => (
                    <SelectItem key={c.id as string} value={c.id as string}>
                      {(c.full_name as string) || (c.company_name as string) || '—'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Vendedor</Label>
              <Select
                value={form.salesperson_name || ''}
                onValueChange={(v) => setForm({ ...form, salesperson_name: v })}
              >
                <SelectTrigger className="focus-visible:ring-[#005B2E]">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {salespeople.map((s) => (
                    <SelectItem key={s.id as string} value={(s.name as string) || ''}>
                      {s.name as string}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Tabela de Preços</Label>
              <Select value={form.price_table_id || ''} onValueChange={handlePriceTableChange}>
                <SelectTrigger className="focus-visible:ring-[#005B2E]">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {priceTables.map((t) => (
                    <SelectItem key={t.id as string} value={t.id as string}>
                      {(t.table_name as string) || '—'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <Label className="text-xs">Cond. Pagamento</Label>
              <Select
                value={form.payment_condition || ''}
                onValueChange={(v) => setForm({ ...form, payment_condition: v })}
              >
                <SelectTrigger className="focus-visible:ring-[#005B2E]">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {payConditions.map((c) => (
                    <SelectItem key={c.id as string} value={(c.name as string) || ''}>
                      {c.name as string}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Forma Pagamento</Label>
              <Select
                value={form.payment_method || ''}
                onValueChange={(v) => setForm({ ...form, payment_method: v })}
              >
                <SelectTrigger className="focus-visible:ring-[#005B2E]">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {payMethods.map((m) => (
                    <SelectItem key={m.id as string} value={(m.name as string) || ''}>
                      {m.name as string}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Data Entrega</Label>
              <Input
                value={form.delivery_date || ''}
                onChange={(e) => setForm({ ...form, delivery_date: e.target.value })}
                placeholder="Ex: 15/08/2026"
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <Label className="text-xs">Transportadora</Label>
              <Select
                value={form.carrier_name || ''}
                onValueChange={(v) => setForm({ ...form, carrier_name: v })}
              >
                <SelectTrigger className="focus-visible:ring-[#005B2E]">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {carriers.map((c) => (
                    <SelectItem key={c.id as string} value={(c.name as string) || ''}>
                      {c.name as string}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Tipo de Frete</Label>
              <Select
                value={form.freight_type || 'CIF'}
                onValueChange={(v) => setForm({ ...form, freight_type: v })}
              >
                <SelectTrigger className="focus-visible:ring-[#005B2E]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FREIGHT_TYPES.map((f) => (
                    <SelectItem key={f} value={f}>
                      {f}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Centro de Custo</Label>
              <Input
                value={form.cost_center || ''}
                onChange={(e) => setForm({ ...form, cost_center: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
          </div>
          <div>
            <Label className="text-xs">Endereço de Entrega</Label>
            <Input
              value={form.delivery_address || ''}
              onChange={(e) => setForm({ ...form, delivery_address: e.target.value })}
              className="focus-visible:ring-[#005B2E]"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm font-bold">Itens do Pedido</Label>
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
                    <th className="text-left p-2">Produto</th>
                    <th className="text-left p-2 w-16">Qtd</th>
                    <th className="text-left p-2 w-24">Vlr Unit.</th>
                    <th className="text-left p-2 w-20">Desc.</th>
                    <th className="text-left p-2 w-20">Acrésc.</th>
                    <th className="text-left p-2 w-24">Total</th>
                    <th className="w-8"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it, i) => (
                    <tr key={i}>
                      <td className="p-1">
                        <Select value={it.product} onValueChange={(v) => setItem(i, 'product', v)}>
                          <SelectTrigger className="h-8 text-xs focus-visible:ring-[#005B2E]">
                            <SelectValue placeholder="Produto" />
                          </SelectTrigger>
                          <SelectContent>
                            {products.map((p) => (
                              <SelectItem key={p.id as string} value={(p.name as string) || ''}>
                                {p.name as string}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
                      <td className="p-1">
                        <Input
                          type="number"
                          value={it.addition}
                          onChange={(e) => setItem(i, 'addition', e.target.value)}
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
              <Label className="text-xs">Valor Bruto</Label>
              <p className="text-sm font-bold">R$ {grossValue.toFixed(2)}</p>
            </div>
            <div>
              <Label className="text-xs">Frete</Label>
              <Input
                type="number"
                value={form.freight_value}
                onChange={(e) => setForm({ ...form, freight_value: e.target.value })}
                className="h-8 text-xs focus-visible:ring-[#005B2E]"
              />
            </div>
            <div>
              <Label className="text-xs">Seguro</Label>
              <Input
                type="number"
                value={form.insurance_value}
                onChange={(e) => setForm({ ...form, insurance_value: e.target.value })}
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
          <div className="text-right space-y-1">
            {form.price_table_id && (
              <p className="text-xs text-muted-foreground">
                Tabela: {String(priceTables.find((t) => t.id === form.price_table_id)?.table_name || '—')}
              </p>
            )}
            <span className="text-lg font-black text-[#005B2E]">
              Valor Total: R$ {totalValue.toFixed(2)}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Observações Internas</Label>
              <Textarea
                value={form.internal_notes || ''}
                onChange={(e) => setForm({ ...form, internal_notes: e.target.value })}
                rows={2}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div>
              <Label className="text-xs">Observações para NF</Label>
              <Textarea
                value={form.fiscal_notes || ''}
                onChange={(e) => setForm({ ...form, fiscal_notes: e.target.value })}
                rows={2}
                className="focus-visible:ring-[#005B2E]"
              />
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
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}{' '}
            <Save className="w-4 h-4 mr-2" /> Salvar Rascunho
          </Button>
          <Button
            onClick={() => handleSave(true)}
            disabled={saving}
            className="bg-[#005B2E] hover:bg-[#01361D] text-white"
          >
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}{' '}
            <Send className="w-4 h-4 mr-2" /> Enviar para Aprovação
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
