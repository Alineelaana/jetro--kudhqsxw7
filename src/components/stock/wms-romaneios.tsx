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
import { getWmsRomaneios, createWmsRomaneio, updateWmsRomaneio } from '@/services/wms'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import { toast } from '@/hooks/use-toast'
import { type WmsRomaneio } from '@/lib/wms-types'
import { Plus, Loader2, Search } from 'lucide-react'

const STATUS_COLORS: Record<string, string> = {
  'Em Planejamento': 'bg-gray-100 text-gray-700',
  Liberada: 'bg-blue-100 text-blue-700',
  Concluída: 'bg-emerald-100 text-emerald-700',
  Cancelada: 'bg-red-100 text-red-700',
}

export function WmsRomaneios() {
  const { user } = useAuth()
  const userName = (user?.name as string) || 'Sistema'
  const [records, setRecords] = useState<WmsRomaneio[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  const load = async () => {
    try {
      setRecords((await getWmsRomaneios()) as WmsRomaneio[])
    } catch {
      setRecords([])
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime('wms_romaneios', () => load())

  const filtered = records.filter((r) => {
    const t = search.toLowerCase().trim()
    return (
      !t ||
      (r.numero_romaneio || '').toLowerCase().includes(t) ||
      (r.rota || '').toLowerCase().includes(t) ||
      (r.transportadora || '').toLowerCase().includes(t)
    )
  })

  const handleNew = () => {
    setForm({
      numero_romaneio: `ROM-${Date.now().toString(36).toUpperCase().slice(-6)}`,
      data: new Date().toISOString().split('T')[0],
      status: 'Em Planejamento',
      responsavel: userName,
      quantidade_volumes: '0',
      peso_total: '0',
    })
    setOpen(true)
  }
  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      await createWmsRomaneio({
        ...form,
        pedidos: [],
        clientes: [],
        notas_fiscais: [],
        quantidade_volumes: parseInt(form.quantidade_volumes) || 0,
      })
      toast({ title: 'Romaneio criado' })
      setOpen(false)
      load()
    } catch {
      toast({ title: 'Erro', variant: 'destructive' })
    }
    setSubmitting(false)
  }
  const handleStatus = async (id: string, status: string) => {
    try {
      await updateWmsRomaneio(id, { status })
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
            placeholder="Buscar romaneio..."
            className="pl-10 focus-visible:ring-[#005B2E]"
          />
        </div>
        <Button
          onClick={handleNew}
          className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
        >
          <Plus className="w-4 h-4 mr-2" /> Novo Romaneio
        </Button>
      </div>
      <Card className="border-2 border-[#005B2E]/20 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#01361D] text-white">
                <th className="text-left px-3 py-2 font-bold">Número</th>
                <th className="text-left px-3 py-2 font-bold hidden md:table-cell">Data</th>
                <th className="text-left px-3 py-2 font-bold">Rota</th>
                <th className="text-left px-3 py-2 font-bold hidden md:table-cell">
                  Transportadora
                </th>
                <th className="text-right px-3 py-2 font-bold hidden md:table-cell">Volumes</th>
                <th className="text-left px-3 py-2 font-bold">Status</th>
                <th className="text-center px-3 py-2 font-bold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-b border-border hover:bg-[#005B2E]/5">
                  <td className="px-3 py-2 font-mono font-bold text-[#C89B3C]">
                    {r.numero_romaneio}
                  </td>
                  <td className="px-3 py-2 text-xs hidden md:table-cell">
                    {r.data ? new Date(r.data).toLocaleDateString('pt-BR') : '—'}
                  </td>
                  <td className="px-3 py-2 font-medium">{r.rota || '—'}</td>
                  <td className="px-3 py-2 text-xs hidden md:table-cell">
                    {r.transportadora || '—'}
                  </td>
                  <td className="px-3 py-2 text-right hidden md:table-cell">
                    {r.quantidade_volumes || 0}
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
                      {r.status === 'Em Planejamento' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleStatus(r.id, 'Liberada')}
                          className="text-blue-600 h-7 text-xs"
                        >
                          Liberar
                        </Button>
                      )}
                      {r.status === 'Liberada' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleStatus(r.id, 'Concluída')}
                          className="text-emerald-600 h-7 text-xs"
                        >
                          Concluir
                        </Button>
                      )}
                      {r.status !== 'Concluída' && r.status !== 'Cancelada' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleStatus(r.id, 'Cancelada')}
                          className="text-red-600 h-7 text-xs"
                        >
                          Cancelar
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
            <DialogTitle className="text-[#005B2E]">Novo Romaneio</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-sm font-semibold">Número</Label>
                <Input
                  value={form.numero_romaneio || ''}
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
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-sm font-semibold">Rota</Label>
                <Input
                  value={form.rota || ''}
                  onChange={(e) => setForm({ ...form, rota: e.target.value })}
                  className="focus-visible:ring-[#005B2E]"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-sm font-semibold">Transportadora</Label>
                <Input
                  value={form.transportadora || ''}
                  onChange={(e) => setForm({ ...form, transportadora: e.target.value })}
                  className="focus-visible:ring-[#005B2E]"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-sm font-semibold">Motorista</Label>
                <Input
                  value={form.motorista || ''}
                  onChange={(e) => setForm({ ...form, motorista: e.target.value })}
                  className="focus-visible:ring-[#005B2E]"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-sm font-semibold">Veículo</Label>
                <Input
                  value={form.veiculo || ''}
                  onChange={(e) => setForm({ ...form, veiculo: e.target.value })}
                  className="focus-visible:ring-[#005B2E]"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-sm font-semibold">Volumes</Label>
                <Input
                  type="number"
                  value={form.quantidade_volumes || '0'}
                  onChange={(e) => setForm({ ...form, quantidade_volumes: e.target.value })}
                  className="focus-visible:ring-[#005B2E]"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-sm font-semibold">Peso Total</Label>
                <Input
                  value={form.peso_total || '0'}
                  onChange={(e) => setForm({ ...form, peso_total: e.target.value })}
                  className="focus-visible:ring-[#005B2E]"
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
