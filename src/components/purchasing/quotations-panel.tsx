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
  getQuotations,
  createQuotation,
  updateQuotation,
  getNextPurchaseNumber,
  getSuppliers,
  createPurchaseOrder,
} from '@/services/purchasing'
import { getPurchaseRequests } from '@/services/purchasing'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import {
  QUOTATION_STATUS,
  STATUS_COLORS,
  type Quotation,
  type SupplierQuote,
  type PurchaseRequest,
} from '@/lib/purchasing-types'
import { Plus, Search, Pencil, Loader2, FileText, X, Trophy, Check } from 'lucide-react'
import { toast } from 'sonner'

const emptyQuote: SupplierQuote = {
  supplier_id: '',
  supplier_name: '',
  unit_value: '',
  quantity: '',
  delivery_time: '',
  payment_method: '',
  payment_condition: '',
  freight: '',
  observations: '',
}

export function QuotationsPanel() {
  const { user } = useAuth()
  const [records, setRecords] = useState<Quotation[]>([])
  const [requests, setRequests] = useState<PurchaseRequest[]>([])
  const [suppliers, setSuppliers] = useState<Array<Record<string, unknown>>>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Quotation | null>(null)
  const [saving, setSaving] = useState(false)
  const [selRequestId, setSelRequestId] = useState('')
  const [quotes, setQuotes] = useState<SupplierQuote[]>([{ ...emptyQuote }])
  const [winningId, setWinningId] = useState('')

  const load = async () => {
    try {
      setRecords((await getQuotations()) as unknown as Quotation[])
      setRequests(
        ((await getPurchaseRequests()) as unknown as PurchaseRequest[]).filter(
          (r) => r.status === 'Aprovada',
        ),
      )
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
  useRealtime('quotations', () => load())

  const filtered = useMemo(() => {
    const term = search.toLowerCase().trim()
    return records.filter(
      (r) =>
        !term ||
        r?.quotation_number?.toLowerCase()?.includes(term) ||
        r?.winning_supplier_name?.toLowerCase()?.includes(term),
    )
  }, [records, search])

  const highlights = useMemo(() => {
    if (quotes.length === 0) return {}
    const valid = quotes.filter((q) => q.unit_value && q.delivery_time)
    if (valid.length === 0) return {}
    const lowest = valid.reduce((min, q) =>
      parseFloat(q.unit_value) < parseFloat(min.unit_value) ? q : min,
    )
    const fastest = valid.reduce((min, q) =>
      parseInt(q.delivery_time) < parseInt(min.delivery_time) ? q : min,
    )
    const bestValue = valid.reduce((best, q) => {
      const score =
        parseFloat(q.unit_value) * parseFloat(q.quantity || '1') + parseFloat(q.freight || '0')
      const bestScore =
        parseFloat(best.unit_value) * parseFloat(best.quantity || '1') +
        parseFloat(best.freight || '0')
      return score < bestScore ? q : best
    })
    return {
      lowest_price: lowest.supplier_id,
      fastest_delivery: fastest.supplier_id,
      best_value: bestValue.supplier_id,
    }
  }, [quotes])

  const handleNew = () => {
    setEditing(null)
    setSelRequestId('')
    setQuotes([{ ...emptyQuote }])
    setWinningId('')
    setFormOpen(true)
  }
  const handleEdit = (q: Quotation) => {
    setEditing(q)
    setSelRequestId(q.request_id || '')
    setQuotes(q.supplier_quotes?.length ? q.supplier_quotes : [{ ...emptyQuote }])
    setWinningId(q.winning_supplier_id || '')
    setFormOpen(true)
  }

  const setQuote = (i: number, field: keyof SupplierQuote, value: string) => {
    setQuotes((prev) =>
      prev.map((q, idx) => {
        if (idx !== i) return q
        const updated = { ...q, [field]: value }
        if (field === 'supplier_id') {
          const s = suppliers.find((sp) => sp.id === value)
          updated.supplier_name = (s?.full_name as string) || (s?.company_name as string) || ''
        }
        return updated
      }),
    )
  }

  const handleSave = async (finalize: boolean) => {
    setSaving(true)
    try {
      const req = requests.find((r) => r.id === selRequestId)
      const data: Record<string, unknown> = {
        request_id: selRequestId,
        request_number: req?.request_number || '',
        supplier_quotes: quotes.filter((q) => q.supplier_id),
        highlights,
        winning_supplier_id: winningId,
        winning_supplier_name: quotes.find((q) => q.supplier_id === winningId)?.supplier_name || '',
        status: finalize ? 'Finalizada' : editing?.status || 'Em Digitação',
        responsible_user: (user?.name as string) || '',
        history: [
          ...(editing?.history || []),
          {
            action: finalize ? 'Finalizada' : 'Salvo',
            user: (user?.name as string) || '',
            date: new Date().toISOString(),
            note: '',
          },
        ],
      }
      if (editing) {
        await updateQuotation(editing.id, data)
      } else {
        const { number } = await getNextPurchaseNumber('quotation')
        data.quotation_number = number
        await createQuotation(data)
      }
      toast.success(finalize ? 'Cotação finalizada' : 'Cotação salva')
      setFormOpen(false)
      load()
    } catch {
      toast.error('Erro ao salvar cotação')
    }
    setSaving(false)
  }

  const handleGenerateOrder = async (q: Quotation) => {
    if (!q.winning_supplier_id) {
      toast.error('Selecione um fornecedor vencedor primeiro')
      return
    }
    try {
      const { number } = await getNextPurchaseNumber('order')
      const winQuote = q.supplier_quotes?.find((s) => s.supplier_id === q.winning_supplier_id)
      const req = requests.find((r) => r.id === q.request_id)
      const items = (req?.items || []).map((it) => ({
        code: '',
        product: it.product,
        quantity: it.quantity,
        unit_price: winQuote?.unit_value || '0',
        discount: '0',
        total: String(
          (parseFloat(it.quantity || '0') * parseFloat(winQuote?.unit_value || '0')).toFixed(2),
        ),
      }))
      const productsValue = items.reduce((s, i) => s + parseFloat(i.total || '0'), 0)
      await createPurchaseOrder({
        order_number: number,
        status: 'Em Digitação',
        supplier_id: q.winning_supplier_id,
        supplier_name: q.winning_supplier_name,
        quotation_id: q.id,
        request_id: q.request_id,
        company: req?.company || '',
        branch: req?.branch || '',
        buyer: (user?.name as string) || '',
        buyer_id: user?.id as string,
        payment_condition: winQuote?.payment_condition || '',
        payment_method: winQuote?.payment_method || '',
        delivery_forecast: winQuote?.delivery_time || '',
        items,
        freight: winQuote?.freight || '0',
        discounts: '0',
        other_expenses: '0',
        products_value: String(productsValue.toFixed(2)),
        total_value: String((productsValue + parseFloat(winQuote?.freight || '0')).toFixed(2)),
        responsible_user: (user?.name as string) || '',
        history: [
          {
            action: 'Pedido gerado da cotação',
            user: (user?.name as string) || '',
            date: new Date().toISOString(),
            note: q.quotation_number || '',
          },
        ],
      })
      await updateQuotation(q.id, { status: 'Finalizada' })
      toast.success('Pedido de compra gerado!')
      load()
    } catch {
      toast.error('Erro ao gerar pedido')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-lg font-bold">Cotações</h3>
        <Button
          onClick={handleNew}
          className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
        >
          <Plus className="w-4 h-4 mr-2" /> Nova Cotação
        </Button>
      </div>
      <Card className="border-2 border-[#005B2E]/20">
        <CardContent className="py-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar cotações..."
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
            <p className="text-lg font-bold">Nenhuma cotação encontrada.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-2 border-[#005B2E]/20 shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#01361D] text-white">
                  <th className="text-left px-3 py-3 font-bold">Nº</th>
                  <th className="text-left px-3 py-3 font-bold">Solicitação</th>
                  <th className="text-left px-3 py-3 font-bold">Fornecedor Vencedor</th>
                  <th className="text-left px-3 py-3 font-bold">Status</th>
                  <th className="text-left px-3 py-3 font-bold">Data</th>
                  <th className="text-center px-3 py-3 font-bold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((q) => (
                  <tr key={q.id} className="border-b border-border hover:bg-[#005B2E]/5">
                    <td className="px-3 py-3">
                      <span className="text-xs font-mono font-bold text-[#C89B3C]">
                        {q.quotation_number || '—'}
                      </span>
                    </td>
                    <td className="px-3 py-3">{q.request_number || '—'}</td>
                    <td className="px-3 py-3">{q.winning_supplier_name || '—'}</td>
                    <td className="px-3 py-3">
                      <span
                        className={`text-xs font-bold px-2 py-1 rounded ${STATUS_COLORS[q.status] || 'bg-gray-100 text-gray-600'}`}
                      >
                        {q.status || '—'}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-xs">
                      {q.created ? new Date(q.created).toLocaleDateString('pt-BR') : '—'}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(q)}
                          className="text-[#005B2E] hover:bg-[#005B2E]/10"
                          title="Editar"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        {q.status === 'Em Digitação' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleGenerateOrder(q)}
                            className="text-[#005B2E] hover:bg-[#005B2E]/10"
                            title="Gerar Pedido"
                          >
                            <Trophy className="w-3.5 h-3.5" />
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
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar Cotação' : 'Nova Cotação'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Solicitação Aprovada</Label>
              <Select value={selRequestId} onValueChange={setSelRequestId}>
                <SelectTrigger className="focus-visible:ring-[#005B2E]">
                  <SelectValue placeholder="Selecione uma solicitação aprovada" />
                </SelectTrigger>
                <SelectContent>
                  {requests.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.request_number} — {r.requester}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm font-bold">Cotações dos Fornecedores</Label>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setQuotes([...quotes, { ...emptyQuote }])}
                  className="border-[#005B2E] text-[#005B2E]"
                >
                  <Plus className="w-3 h-3 mr-1" /> Fornecedor
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-muted">
                      <th className="text-left p-2">Fornecedor</th>
                      <th className="text-left p-2 w-24">Vlr Unit.</th>
                      <th className="text-left p-2 w-20">Qtd</th>
                      <th className="text-left p-2 w-20">Prazo (d)</th>
                      <th className="text-left p-2 w-24">Frete</th>
                      <th className="text-left p-2">Pagamento</th>
                      <th className="text-center p-2">Vencedor</th>
                      <th className="w-8"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {quotes.map((q, i) => (
                      <tr
                        key={i}
                        className={highlights.lowest_price === q.supplier_id ? 'bg-emerald-50' : ''}
                      >
                        <td className="p-1">
                          <Select
                            value={q.supplier_id}
                            onValueChange={(v) => setQuote(i, 'supplier_id', v)}
                          >
                            <SelectTrigger className="h-8 text-xs focus-visible:ring-[#005B2E]">
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
                        </td>
                        <td className="p-1">
                          <Input
                            type="number"
                            value={q.unit_value}
                            onChange={(e) => setQuote(i, 'unit_value', e.target.value)}
                            className="h-8 text-xs focus-visible:ring-[#005B2E]"
                          />
                          {highlights.lowest_price === q.supplier_id && (
                            <span className="text-[9px] text-emerald-600 font-bold">
                              Menor preço
                            </span>
                          )}
                        </td>
                        <td className="p-1">
                          <Input
                            type="number"
                            value={q.quantity}
                            onChange={(e) => setQuote(i, 'quantity', e.target.value)}
                            className="h-8 text-xs focus-visible:ring-[#005B2E]"
                          />
                        </td>
                        <td className="p-1">
                          <Input
                            type="number"
                            value={q.delivery_time}
                            onChange={(e) => setQuote(i, 'delivery_time', e.target.value)}
                            className="h-8 text-xs focus-visible:ring-[#005B2E]"
                          />
                          {highlights.fastest_delivery === q.supplier_id && (
                            <span className="text-[9px] text-blue-600 font-bold">Menor prazo</span>
                          )}
                        </td>
                        <td className="p-1">
                          <Input
                            type="number"
                            value={q.freight}
                            onChange={(e) => setQuote(i, 'freight', e.target.value)}
                            className="h-8 text-xs focus-visible:ring-[#005B2E]"
                          />
                        </td>
                        <td className="p-1">
                          <Input
                            value={q.payment_condition}
                            onChange={(e) => setQuote(i, 'payment_condition', e.target.value)}
                            className="h-8 text-xs focus-visible:ring-[#005B2E]"
                            placeholder="Condição"
                          />
                        </td>
                        <td className="p-1 text-center">
                          <input
                            type="radio"
                            checked={winningId === q.supplier_id}
                            onChange={() => q.supplier_id && setWinningId(q.supplier_id)}
                          />
                        </td>
                        <td className="p-1">
                          {quotes.length > 1 && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setQuotes(quotes.filter((_, idx) => idx !== i))}
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
              {Object.keys(highlights).length > 0 && (
                <div className="flex gap-2 mt-2 text-xs">
                  <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded font-bold">
                    Menor preço
                  </span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded font-bold">
                    Menor prazo
                  </span>
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded font-bold">
                    Melhor custo-benefício
                  </span>
                </div>
              )}
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
              disabled={saving || !winningId}
              className="bg-[#005B2E] hover:bg-[#01361D] text-white"
            >
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}{' '}
              <Check className="w-4 h-4 mr-2" /> Finalizar Cotação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
