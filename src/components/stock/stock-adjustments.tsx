import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
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
  getStockAdjustments,
  createStockAdjustment,
  updateStockAdjustment,
  getProductsForStock,
} from '@/services/stock'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import { toast } from '@/hooks/use-toast'
import { ADJUSTMENT_TYPES, type StockAdjustment } from '@/lib/stock-types'
import { Plus, Loader2, Search, Paperclip } from 'lucide-react'

const STATUS_COLORS: Record<string, string> = {
  Pendente: 'bg-amber-100 text-amber-700',
  Aprovado: 'bg-emerald-100 text-emerald-700',
  Reprovado: 'bg-red-100 text-red-700',
  Aplicado: 'bg-blue-100 text-blue-700',
}

export function StockAdjustments() {
  const { user } = useAuth()
  const userName = (user?.name as string) || 'Sistema'
  const [records, setRecords] = useState<StockAdjustment[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<Record<string, string>>({})
  const [attachment, setAttachment] = useState<File | null>(null)
  const [products, setProducts] = useState<any[]>([])
  const [submitting, setSubmitting] = useState(false)

  const load = async () => {
    try {
      setRecords(await getStockAdjustments())
    } catch {
      setRecords([])
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime('stock_adjustments', () => load())
  useEffect(() => {
    getProductsForStock()
      .then((p) => setProducts(p as any[]))
      .catch(() => {})
  }, [])

  const filtered = records.filter((r) => {
    const t = search.toLowerCase().trim()
    return (
      !t ||
      (r.numero_ajuste || '').toLowerCase().includes(t) ||
      (r.produto_nome || '').toLowerCase().includes(t)
    )
  })

  const handleNew = () => {
    setForm({
      numero_ajuste: `AJU-${Date.now().toString(36).toUpperCase().slice(-6)}`,
      data: new Date().toISOString().split('T')[0],
      responsavel: userName,
      status: 'Pendente',
      quantidade: '0',
      saldo_anterior: '0',
      saldo_atual: '0',
    })
    setAttachment(null)
    setOpen(true)
  }

  const handleProductSelect = (productId: string) => {
    const p = products.find((x) => x.id === productId)
    if (p) {
      const stock = p.stock || 0
      setForm({
        ...form,
        produto_id: p.id,
        produto_nome: p.name || '',
        produto_codigo: p.code || '',
        lote: p.lot || '',
        validade: p.validity || '',
        localizacao: p.location || '',
        saldo_anterior: String(stock),
        saldo_atual: String(stock),
      })
    }
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const qty = parseInt(form.quantidade) || 0
      const saldoAnt = parseInt(form.saldo_anterior) || 0
      const isSaida = ['Saída', 'Perda', 'Avaria', 'Quebra', 'Vencimento'].includes(
        form.tipo_ajuste || '',
      )
      const saldoAtual = isSaida ? saldoAnt - qty : saldoAnt + qty
      const formData = new FormData()
      Object.entries({
        ...form,
        quantidade: String(qty),
        saldo_anterior: String(saldoAnt),
        saldo_atual: String(saldoAtual),
        aprovador: '',
      }).forEach(([k, v]) => formData.append(k, v))
      if (attachment) formData.append('attachments', attachment)
      await createStockAdjustment(formData)
      toast({ title: 'Ajuste criado' })
      setOpen(false)
      load()
    } catch {
      toast({ title: 'Erro', variant: 'destructive' })
    }
    setSubmitting(false)
  }
  const handleStatus = async (id: string, status: string) => {
    try {
      await updateStockAdjustment(id, { status, aprovador: userName })
      toast({ title: 'Status atualizado' })
      load()
    } catch {
      toast({ title: 'Erro', variant: 'destructive' })
    }
  }

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar ajuste..."
            className="pl-10 focus-visible:ring-[#005B2E]"
          />
        </div>
        <Button
          onClick={handleNew}
          className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
        >
          <Plus className="w-4 h-4 mr-2" /> Novo Ajuste
        </Button>
      </div>
      <Card className="border-2 border-[#005B2E]/20 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#01361D] text-white">
                <th className="text-left px-3 py-2 font-bold">Número</th>
                <th className="text-left px-3 py-2 font-bold">Produto</th>
                <th className="text-left px-3 py-2 font-bold hidden md:table-cell">Tipo</th>
                <th className="text-left px-3 py-2 font-bold hidden md:table-cell">Lote</th>
                <th className="text-right px-3 py-2 font-bold">Qtd.</th>
                <th className="text-right px-3 py-2 font-bold hidden lg:table-cell">Saldo Ant.</th>
                <th className="text-right px-3 py-2 font-bold hidden lg:table-cell">Saldo Atual</th>
                <th className="text-left px-3 py-2 font-bold">Status</th>
                <th className="text-center px-3 py-2 font-bold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-b border-border hover:bg-[#005B2E]/5">
                  <td className="px-3 py-2 font-mono font-bold text-[#C89B3C]">
                    {r.numero_ajuste}
                  </td>
                  <td className="px-3 py-2 font-medium">{r.produto_nome || '—'}</td>
                  <td className="px-3 py-2 text-xs hidden md:table-cell">{r.tipo_ajuste}</td>
                  <td className="px-3 py-2 text-xs hidden md:table-cell">{r.lote || '—'}</td>
                  <td className="px-3 py-2 text-right font-bold">{r.quantidade}</td>
                  <td className="px-3 py-2 text-right hidden lg:table-cell">
                    {r.saldo_anterior || 0}
                  </td>
                  <td className="px-3 py-2 text-right hidden lg:table-cell font-bold">
                    {r.saldo_atual || 0}
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded ${STATUS_COLORS[r.status] || 'bg-gray-100'}`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex justify-center gap-1">
                      {r.status === 'Pendente' && (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleStatus(r.id, 'Aplicado')}
                            className="text-emerald-600 h-7 text-xs"
                          >
                            Aprovar
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleStatus(r.id, 'Reprovado')}
                            className="text-red-600 h-7 text-xs"
                          >
                            Reprovar
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#005B2E]">Novo Ajuste de Estoque</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-sm font-semibold">Número</Label>
                <Input
                  value={form.numero_ajuste || ''}
                  disabled
                  className="focus-visible:ring-[#005B2E]"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-sm font-semibold">Data</Label>
                <Input
                  type="date"
                  value={form.data || ''}
                  onChange={(e) => setForm({ ...form, data: e.target.value })}
                  className="focus-visible:ring-[#005B2E]"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-semibold">Produto</Label>
              <Select onValueChange={handleProductSelect}>
                <SelectTrigger className="focus-visible:ring-[#005B2E]">
                  <SelectValue placeholder="Selecione o produto" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} ({p.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-sm font-semibold">Tipo de Ajuste</Label>
                <Select
                  value={form.tipo_ajuste || 'Entrada'}
                  onValueChange={(v) => setForm({ ...form, tipo_ajuste: v })}
                >
                  <SelectTrigger className="focus-visible:ring-[#005B2E]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ADJUSTMENT_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-sm font-semibold">Quantidade</Label>
                <Input
                  type="number"
                  value={form.quantidade || '0'}
                  onChange={(e) => setForm({ ...form, quantidade: e.target.value })}
                  className="focus-visible:ring-[#005B2E]"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-sm font-semibold">Lote</Label>
                <Input
                  value={form.lote || ''}
                  onChange={(e) => setForm({ ...form, lote: e.target.value })}
                  className="focus-visible:ring-[#005B2E]"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-sm font-semibold">Validade</Label>
                <Input
                  type="date"
                  value={form.validade || ''}
                  onChange={(e) => setForm({ ...form, validade: e.target.value })}
                  className="focus-visible:ring-[#005B2E]"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-sm font-semibold">Localização</Label>
                <Input
                  value={form.localizacao || ''}
                  onChange={(e) => setForm({ ...form, localizacao: e.target.value })}
                  className="focus-visible:ring-[#005B2E]"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-sm font-semibold">Saldo Anterior</Label>
                <Input
                  value={form.saldo_anterior || '0'}
                  disabled
                  className="focus-visible:ring-[#005B2E]"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-sm font-semibold">Saldo Atual</Label>
                <Input
                  value={form.saldo_atual || '0'}
                  disabled
                  className="focus-visible:ring-[#005B2E]"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-semibold">Motivo</Label>
              <Input
                value={form.motivo || ''}
                onChange={(e) => setForm({ ...form, motivo: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-semibold">Observações</Label>
              <Textarea
                value={form.observacoes || ''}
                onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
                rows={2}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-semibold">Anexo</Label>
              <div className="flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-muted-foreground" />
                <Input
                  type="file"
                  onChange={(e) => setAttachment(e.target.files?.[0] || null)}
                  className="text-xs focus-visible:ring-[#005B2E]"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
            >
              {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Criar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
