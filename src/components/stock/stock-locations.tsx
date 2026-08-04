import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
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
import { getStockLocations, createStockLocation, deleteStockLocation } from '@/services/stock'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import { toast } from '@/hooks/use-toast'
import { LOCATION_TYPES, type StockLocation } from '@/lib/stock-types'
import { Plus, Loader2, Search, Trash2 } from 'lucide-react'

export function StockLocations() {
  const { user } = useAuth()
  const userName = (user?.name as string) || 'Sistema'
  const [records, setRecords] = useState<StockLocation[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<Record<string, string | boolean>>({})
  const [submitting, setSubmitting] = useState(false)

  const load = async () => {
    try {
      setRecords(await getStockLocations())
    } catch {
      setRecords([])
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime('stock_locations', () => load())

  const filtered = records.filter((r) => {
    const term = search.toLowerCase().trim()
    return (
      !term ||
      (r.codigo || '').toLowerCase().includes(term) ||
      (r.descricao || '').toLowerCase().includes(term)
    )
  })

  const handleNew = () => {
    setForm({
      codigo: `LOC-${String(records.length + 1).padStart(3, '0')}`,
      situacao: 'Ativo',
      tipo: 'Armazenagem',
      permite_mistura_produtos: false,
      permite_mistura_lotes: false,
      capacidade: '0',
    })
    setOpen(true)
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      await createStockLocation({
        ...form,
        capacidade: parseInt(String(form.capacidade)) || 0,
        permite_mistura_produtos: !!form.permite_mistura_produtos,
        permite_mistura_lotes: !!form.permite_mistura_lotes,
        produtos_armazenados: [],
      })
      toast({ title: 'Localização criada' })
      setOpen(false)
      load()
    } catch {
      toast({ title: 'Erro', variant: 'destructive' })
    }
    setSubmitting(false)
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteStockLocation(id)
      toast({ title: 'Excluído' })
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
            placeholder="Buscar localização..."
            className="pl-10 focus-visible:ring-[#005B2E]"
          />
        </div>
        <Button
          onClick={handleNew}
          className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
        >
          <Plus className="w-4 h-4 mr-2" /> Nova Localização
        </Button>
      </div>
      <Card className="border-2 border-[#005B2E]/20 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#01361D] text-white">
                <th className="text-left px-3 py-2 font-bold">Código</th>
                <th className="text-left px-3 py-2 font-bold">Descrição</th>
                <th className="text-left px-3 py-2 font-bold hidden md:table-cell">Tipo</th>
                <th className="text-right px-3 py-2 font-bold hidden md:table-cell">Capacidade</th>
                <th className="text-left px-3 py-2 font-bold">Situação</th>
                <th className="text-center px-3 py-2 font-bold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-b border-border hover:bg-[#005B2E]/5">
                  <td className="px-3 py-2 font-mono font-bold text-[#C89B3C]">{r.codigo}</td>
                  <td className="px-3 py-2 font-medium">{r.descricao || '—'}</td>
                  <td className="px-3 py-2 text-xs hidden md:table-cell">{r.tipo}</td>
                  <td className="px-3 py-2 text-right hidden md:table-cell">{r.capacidade || 0}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded ${r.situacao === 'Ativo' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}
                    >
                      {r.situacao}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex justify-center">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(r.id)}
                        className="text-red-600 h-8 w-8 p-0"
                        title="Excluir"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
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
            <DialogTitle className="text-[#005B2E]">Nova Localização</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-sm font-semibold">Código</Label>
                <Input
                  value={String(form.codigo || '')}
                  onChange={(e) => setForm({ ...form, codigo: e.target.value })}
                  className="focus-visible:ring-[#005B2E]"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-sm font-semibold">Tipo</Label>
                <Select
                  value={String(form.tipo || 'Armazenagem')}
                  onValueChange={(v) => setForm({ ...form, tipo: v })}
                >
                  <SelectTrigger className="focus-visible:ring-[#005B2E]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LOCATION_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-semibold">Descrição</Label>
              <Input
                value={String(form.descricao || '')}
                onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-sm font-semibold">Empresa</Label>
                <Input
                  value={String(form.empresa || '')}
                  onChange={(e) => setForm({ ...form, empresa: e.target.value })}
                  className="focus-visible:ring-[#005B2E]"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-sm font-semibold">Filial</Label>
                <Input
                  value={String(form.filial || '')}
                  onChange={(e) => setForm({ ...form, filial: e.target.value })}
                  className="focus-visible:ring-[#005B2E]"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-sm font-semibold">Depósito</Label>
                <Input
                  value={String(form.deposito || '')}
                  onChange={(e) => setForm({ ...form, deposito: e.target.value })}
                  className="focus-visible:ring-[#005B2E]"
                />
              </div>
            </div>
            <div className="grid grid-cols-5 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Setor</Label>
                <Input
                  value={String(form.setor || '')}
                  onChange={(e) => setForm({ ...form, setor: e.target.value })}
                  className="focus-visible:ring-[#005B2E]"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Rua</Label>
                <Input
                  value={String(form.rua || '')}
                  onChange={(e) => setForm({ ...form, rua: e.target.value })}
                  className="focus-visible:ring-[#005B2E]"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Coluna</Label>
                <Input
                  value={String(form.coluna || '')}
                  onChange={(e) => setForm({ ...form, coluna: e.target.value })}
                  className="focus-visible:ring-[#005B2E]"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Nível</Label>
                <Input
                  value={String(form.nivel || '')}
                  onChange={(e) => setForm({ ...form, nivel: e.target.value })}
                  className="focus-visible:ring-[#005B2E]"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Posição</Label>
                <Input
                  value={String(form.posicao || '')}
                  onChange={(e) => setForm({ ...form, posicao: e.target.value })}
                  className="focus-visible:ring-[#005B2E]"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-sm font-semibold">Capacidade</Label>
                <Input
                  type="number"
                  value={String(form.capacidade || '0')}
                  onChange={(e) => setForm({ ...form, capacidade: e.target.value })}
                  className="focus-visible:ring-[#005B2E]"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  checked={!!form.permite_mistura_produtos}
                  onCheckedChange={(v) => setForm({ ...form, permite_mistura_produtos: v })}
                  className="data-[state=checked]:bg-[#005B2E]"
                />
                <span className="text-sm">Mistura de Produtos</span>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={!!form.permite_mistura_lotes}
                  onCheckedChange={(v) => setForm({ ...form, permite_mistura_lotes: v })}
                  className="data-[state=checked]:bg-[#005B2E]"
                />
                <span className="text-sm">Mistura de Lotes</span>
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
