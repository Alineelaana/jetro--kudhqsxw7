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
import { getStockInventories, createStockInventory, updateStockInventory } from '@/services/stock'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import { toast } from '@/hooks/use-toast'
import { INVENTORY_TYPES, INVENTORY_STATUS, type StockInventory } from '@/lib/stock-types'
import { Plus, Loader2, Search } from 'lucide-react'

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
  const userName = (user?.name as string) || (user?.email as string) || 'Sistema'
  const [records, setRecords] = useState<StockInventory[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

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

  const filtered = records.filter((r) => {
    const term = search.toLowerCase().trim()
    return (
      !term ||
      (r.numero_inventario || '').toLowerCase().includes(term) ||
      (r.responsavel || '').toLowerCase().includes(term)
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
      await createStockInventory({
        ...form,
        itens: JSON.parse(form.itens || '[]'),
      })
      toast({ title: 'Inventário criado' })
      setOpen(false)
      load()
    } catch {
      toast({ title: 'Erro ao criar', variant: 'destructive' })
    }
    setSubmitting(false)
  }

  const handleStatusChange = async (id: string, status: string) => {
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
                <th className="text-left px-3 py-2 font-bold">Tipo</th>
                <th className="text-left px-3 py-2 font-bold hidden md:table-cell">Abertura</th>
                <th className="text-left px-3 py-2 font-bold">Responsável</th>
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
                  <td className="px-3 py-2">{r.responsavel || '—'}</td>
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
                          onClick={() => handleStatusChange(r.id, 'Em Contagem')}
                          className="text-blue-600 h-7 text-xs"
                        >
                          Iniciar
                        </Button>
                      )}
                      {r.status === 'Em Contagem' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleStatusChange(r.id, 'Aguardando Aprovação')}
                          className="text-purple-600 h-7 text-xs"
                        >
                          Enviar Aprov.
                        </Button>
                      )}
                      {r.status === 'Aguardando Aprovação' && (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleStatusChange(r.id, 'Finalizado')}
                            className="text-emerald-600 h-7 text-xs"
                          >
                            Aprovar
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleStatusChange(r.id, 'Cancelado')}
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
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-sm font-semibold">Empresa</Label>
                <Input
                  value={form.empresa || ''}
                  onChange={(e) => setForm({ ...form, empresa: e.target.value })}
                  className="focus-visible:ring-[#005B2E]"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-sm font-semibold">Filial</Label>
                <Input
                  value={form.filial || ''}
                  onChange={(e) => setForm({ ...form, filial: e.target.value })}
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
            <div className="space-y-1">
              <Label className="text-sm font-semibold">Observações</Label>
              <Textarea
                value={form.observacoes || ''}
                onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
                rows={2}
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
