import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
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
import { getStockInventories, createStockInventory, updateStockInventory } from '@/services/stock'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import { toast } from '@/hooks/use-toast'
import { type StockInventory } from '@/lib/stock-types'
import { Plus, Loader2, Search } from 'lucide-react'

const STATUS_COLORS: Record<string, string> = {
  'Em Preparação': 'bg-gray-100 text-gray-700',
  'Em Contagem': 'bg-blue-100 text-blue-700',
  'Aguardando Aprovação': 'bg-purple-100 text-purple-700',
  Finalizado: 'bg-emerald-100 text-emerald-700',
  Cancelado: 'bg-red-100 text-red-700',
}

const ROTATION_CRITERIA = [
  'Por Produto',
  'Por Categoria',
  'Curva ABC',
  'Por Localização',
  'Por Lote',
  'Nível de Risco',
] as const

export function WmsRotationalInventory() {
  const { user } = useAuth()
  const userName = (user?.name as string) || 'Sistema'
  const [records, setRecords] = useState<StockInventory[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  const load = async () => {
    try {
      const all = await getStockInventories()
      setRecords(all.filter((r) => r.tipo_inventario === 'Rotativo'))
    } catch {
      setRecords([])
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime('stock_inventories', () => load())

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
      numero_inventario: `IR-${Date.now().toString(36).toUpperCase().slice(-6)}`,
      data_abertura: new Date().toISOString().split('T')[0],
      responsavel: userName,
      status: 'Em Preparação',
      tipo_inventario: 'Rotativo',
    })
    setOpen(true)
  }
  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      await createStockInventory({ ...form, itens: [] })
      toast({ title: 'Inventário rotativo criado' })
      setOpen(false)
      load()
    } catch {
      toast({ title: 'Erro', variant: 'destructive' })
    }
    setSubmitting(false)
  }
  const handleStatus = async (id: string, status: string) => {
    try {
      await updateStockInventory(id, {
        status,
        data_fechamento: ['Finalizado', 'Cancelado'].includes(status)
          ? new Date().toISOString()
          : '',
      })
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
                <th className="text-left px-3 py-2 font-bold hidden md:table-cell">Abertura</th>
                <th className="text-left px-3 py-2 font-bold hidden md:table-cell">Responsável</th>
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
                  <td className="px-3 py-2 text-xs hidden md:table-cell">
                    {r.data_abertura ? new Date(r.data_abertura).toLocaleDateString('pt-BR') : '—'}
                  </td>
                  <td className="px-3 py-2 text-xs hidden md:table-cell">{r.responsavel || '—'}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded ${STATUS_COLORS[r.status] || 'bg-gray-100'}`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex justify-center gap-1">
                      {r.status === 'Em Preparação' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleStatus(r.id, 'Em Contagem')}
                          className="text-blue-600 h-7 text-xs"
                        >
                          Iniciar
                        </Button>
                      )}
                      {r.status === 'Em Contagem' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleStatus(r.id, 'Aguardando Aprovação')}
                          className="text-purple-600 h-7 text-xs"
                        >
                          Enviar Aprov.
                        </Button>
                      )}
                      {r.status === 'Aguardando Aprovação' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleStatus(r.id, 'Finalizado')}
                          className="text-emerald-600 h-7 text-xs"
                        >
                          Aprovar
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
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-[#005B2E]">Novo Inventário Rotativo</DialogTitle>
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
                <Label className="text-sm font-semibold">Data</Label>
                <Input
                  type="date"
                  value={form.data_abertura || ''}
                  onChange={(e) => setForm({ ...form, data_abertura: e.target.value })}
                  className="focus-visible:ring-[#005B2E]"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-semibold">Critério</Label>
              <Select
                value={form.observacoes || 'Por Produto'}
                onValueChange={(v) => setForm({ ...form, observacoes: v })}
              >
                <SelectTrigger className="focus-visible:ring-[#005B2E]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROTATION_CRITERIA.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-semibold">Responsável</Label>
              <Input
                value={form.responsavel || ''}
                disabled
                className="focus-visible:ring-[#005B2E]"
              />
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
