import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
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
  getStockInventories,
  createStockInventory,
  updateStockInventory,
  getProductsForStock,
} from '@/services/stock'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import { toast } from '@/hooks/use-toast'
import { INVENTORY_TYPES, type StockInventory, type InventoryItem } from '@/lib/stock-types'
import { Plus, Loader2, Search, Eye } from 'lucide-react'

const STATUS_COLORS: Record<string, string> = {
  'Em Preparação': 'bg-gray-100 text-gray-700',
  'Em Contagem': 'bg-blue-100 text-blue-700',
  'Aguardando Recontagem': 'bg-amber-100 text-amber-700',
  'Aguardando Aprovação': 'bg-purple-100 text-purple-700',
  Finalizado: 'bg-emerald-100 text-emerald-700',
  Cancelado: 'bg-red-100 text-red-700',
}

export function StockInventory() {
  const { user } = useAuth()
  const userName = (user?.name as string) || 'Sistema'
  const [records, setRecords] = useState<StockInventory[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [detailRec, setDetailRec] = useState<StockInventory | null>(null)
  const [items, setItems] = useState<InventoryItem[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [form, setForm] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [prodSearch, setProdSearch] = useState('')

  const load = async () => {
    try {
      setRecords(await getStockInventories())
    } catch {
      setRecords([])
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime('stock_inventories', () => load())

  const loadProducts = async () => {
    try {
      setProducts((await getProductsForStock()) as any[])
    } catch {
      /* intentionally ignored */
    }
  }
  useEffect(() => {
    loadProducts()
  }, [])

  const filtered = records.filter((r) => {
    const t = search.toLowerCase().trim()
    return (
      !t ||
      (r.numero_inventario || '').toLowerCase().includes(t) ||
      (r.responsavel || '').toLowerCase().includes(t)
    )
  })

  const handleNew = () => {
    setForm({
      numero_inventario: `INV-${Date.now().toString(36).toUpperCase().slice(-6)}`,
      data_abertura: new Date().toISOString().split('T')[0],
      responsavel: userName,
      status: 'Em Preparação',
      tipo_inventario: 'Geral',
      itens: '[]',
    })
    setOpen(true)
  }
  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      await createStockInventory({ ...form, itens: [] })
      toast({ title: 'Inventário criado' })
      setOpen(false)
      load()
    } catch {
      toast({ title: 'Erro', variant: 'destructive' })
    }
    setSubmitting(false)
  }
  const openDetail = (r: StockInventory) => {
    setDetailRec(r)
    setItems((r.itens as InventoryItem[]) || [])
    setDetailOpen(true)
  }
  const addProduct = (p: any) => {
    setItems([
      ...items,
      {
        produto_id: p.id,
        produto_codigo: p.code || '',
        produto_nome: p.name || '',
        lote: p.lot || '',
        validade: p.validity || '',
        localizacao: p.location || '',
        quantidade_sistema: p.stock || 0,
        quantidade_contada: 0,
        diferenca: 0,
        motivo_diferenca: '',
      },
    ])
  }
  const updateItem = (idx: number, field: keyof InventoryItem, val: string | number) => {
    const next = [...items]
    ;(next[idx] as any)[field] = field === 'quantidade_contada' ? Number(val) : val
    next[idx].diferenca = next[idx].quantidade_contada - next[idx].quantidade_sistema
    setItems(next)
  }
  const saveItems = async () => {
    if (!detailRec) return
    try {
      await updateStockInventory(detailRec.id, { itens: items })
      toast({ title: 'Contagem salva' })
      load()
    } catch {
      toast({ title: 'Erro', variant: 'destructive' })
    }
  }
  const handleStatus = async (status: string) => {
    if (!detailRec) return
    try {
      await updateStockInventory(detailRec.id, {
        status,
        itens: items,
        data_fechamento: ['Finalizado', 'Cancelado'].includes(status)
          ? new Date().toISOString()
          : '',
      })
      toast({ title: 'Status atualizado' })
      setDetailOpen(false)
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
  const filteredProducts = products.filter(
    (p) => !prodSearch || (p.name || '').toLowerCase().includes(prodSearch.toLowerCase()),
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar inventário..."
            className="pl-10 focus-visible:ring-[#005B2E]"
          />
        </div>
        <Button
          onClick={handleNew}
          className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
        >
          <Plus className="w-4 h-4 mr-2" /> Novo Inventário
        </Button>
      </div>
      <Card className="border-2 border-[#005B2E]/20 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#01361D] text-white">
                <th className="text-left px-3 py-2 font-bold">Número</th>
                <th className="text-left px-3 py-2 font-bold">Tipo</th>
                <th className="text-left px-3 py-2 font-bold hidden md:table-cell">Abertura</th>
                <th className="text-left px-3 py-2 font-bold">Status</th>
                <th className="text-center px-3 py-2 font-bold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-b border-border hover:bg-[#005B2E]/5">
                  <td className="px-3 py-2 font-mono font-bold text-[#C89B3C]">
                    {r.numero_inventario}
                  </td>
                  <td className="px-3 py-2">{r.tipo_inventario}</td>
                  <td className="px-3 py-2 text-xs hidden md:table-cell">
                    {r.data_abertura ? new Date(r.data_abertura).toLocaleDateString('pt-BR') : '—'}
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded ${STATUS_COLORS[r.status] || 'bg-gray-100'}`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-center">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openDetail(r)}
                      className="text-[#005B2E] h-7 text-xs"
                    >
                      <Eye className="w-3.5 h-3.5 mr-1" /> Detalhes
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-[#005B2E]">Novo Inventário</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-sm font-semibold">Número</Label>
                <Input
                  value={form.numero_inventario || ''}
                  disabled
                  className="focus-visible:ring-[#005B2E]"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-sm font-semibold">Data de Abertura</Label>
                <Input
                  type="date"
                  value={form.data_abertura || ''}
                  onChange={(e) => setForm({ ...form, data_abertura: e.target.value })}
                  className="focus-visible:ring-[#005B2E]"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-semibold">Tipo de Inventário</Label>
              <Select
                value={form.tipo_inventario || 'Geral'}
                onValueChange={(v) => setForm({ ...form, tipo_inventario: v })}
              >
                <SelectTrigger className="focus-visible:ring-[#005B2E]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INVENTORY_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#005B2E]">
              {detailRec?.numero_inventario} — Contagem
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {detailRec?.status === 'Em Preparação' && (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    value={prodSearch}
                    onChange={(e) => setProdSearch(e.target.value)}
                    placeholder="Buscar produto..."
                    className="focus-visible:ring-[#005B2E]"
                  />
                </div>
                <div className="max-h-32 overflow-y-auto border rounded">
                  {filteredProducts.slice(0, 5).map((p) => (
                    <button
                      key={p.id}
                      onClick={() => addProduct(p)}
                      className="block w-full text-left px-3 py-1 hover:bg-[#005B2E]/10 text-sm"
                    >
                      {p.name} ({p.code})
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-[#01361D] text-white">
                    <th className="text-left px-2 py-1">Código</th>
                    <th className="text-left px-2 py-1">Produto</th>
                    <th className="text-left px-2 py-1">Lote</th>
                    <th className="text-left px-2 py-1 hidden md:table-cell">Localização</th>
                    <th className="text-right px-2 py-1">Sistema</th>
                    <th className="text-right px-2 py-1">Contada</th>
                    <th className="text-right px-2 py-1">Dif.</th>
                    <th className="text-left px-2 py-1">Motivo</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it, idx) => (
                    <tr key={idx} className="border-b">
                      <td className="px-2 py-1 font-mono">{it.produto_codigo}</td>
                      <td className="px-2 py-1">{it.produto_nome}</td>
                      <td className="px-2 py-1">{it.lote || '—'}</td>
                      <td className="px-2 py-1 hidden md:table-cell">{it.localizacao || '—'}</td>
                      <td className="px-2 py-1 text-right">{it.quantidade_sistema}</td>
                      <td className="px-2 py-1 text-right">
                        {['Em Contagem', 'Aguardando Recontagem'].includes(
                          detailRec?.status || '',
                        ) ? (
                          <Input
                            type="number"
                            value={it.quantidade_contada}
                            onChange={(e) => updateItem(idx, 'quantidade_contada', e.target.value)}
                            className="h-7 w-16 text-xs text-right focus-visible:ring-[#005B2E]"
                          />
                        ) : (
                          it.quantidade_contada
                        )}
                      </td>
                      <td
                        className={`px-2 py-1 text-right font-bold ${it.diferenca !== 0 ? 'text-red-600' : ''}`}
                      >
                        {it.diferenca}
                      </td>
                      <td className="px-2 py-1">
                        {['Em Contagem', 'Aguardando Recontagem'].includes(
                          detailRec?.status || '',
                        ) ? (
                          <Input
                            value={it.motivo_diferenca}
                            onChange={(e) => updateItem(idx, 'motivo_diferenca', e.target.value)}
                            className="h-7 w-full text-xs focus-visible:ring-[#005B2E]"
                          />
                        ) : (
                          it.motivo_diferenca
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <DialogFooter className="flex-wrap gap-2">
            {detailRec?.status === 'Em Preparação' && (
              <Button
                size="sm"
                onClick={() => handleStatus('Em Contagem')}
                className="bg-blue-600 text-white"
              >
                Iniciar Contagem
              </Button>
            )}
            {['Em Contagem', 'Aguardando Recontagem'].includes(detailRec?.status || '') && (
              <Button size="sm" onClick={saveItems} className="bg-[#005B2E] text-white">
                Salvar Contagem
              </Button>
            )}
            {detailRec?.status === 'Em Contagem' && (
              <Button
                size="sm"
                onClick={() => handleStatus('Aguardando Recontagem')}
                className="bg-amber-600 text-white"
              >
                Segunda Contagem
              </Button>
            )}
            {['Aguardando Recontagem', 'Em Contagem'].includes(detailRec?.status || '') && (
              <Button
                size="sm"
                onClick={() => handleStatus('Aguardando Aprovação')}
                className="bg-purple-600 text-white"
              >
                Enviar Aprov.
              </Button>
            )}
            {detailRec?.status === 'Aguardando Aprovação' && (
              <>
                <Button
                  size="sm"
                  onClick={() => handleStatus('Finalizado')}
                  className="bg-emerald-600 text-white"
                >
                  Aprovar e Gerar Ajustes
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleStatus('Cancelado')}
                  className="bg-red-600 text-white"
                >
                  Reprovar
                </Button>
              </>
            )}
            {detailRec?.status === 'Em Preparação' && (
              <Button
                size="sm"
                onClick={() => handleStatus('Cancelado')}
                className="bg-red-600 text-white"
              >
                Cancelar
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
