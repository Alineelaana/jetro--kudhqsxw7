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
import { getWmsShippings, createWmsShipping, updateWmsShipping } from '@/services/wms'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import { toast } from '@/hooks/use-toast'
import { SHIPPING_STATUS, type WmsShipping } from '@/lib/wms-types'
import { Plus, Loader2, Search, AlertTriangle } from 'lucide-react'

const STATUS_COLORS: Record<string, string> = {
  'Aguardando Expedição': 'bg-amber-100 text-amber-700',
  'Em Preparação': 'bg-blue-100 text-blue-700',
  'Aguardando Veículo': 'bg-cyan-100 text-cyan-700',
  'Em Carregamento': 'bg-purple-100 text-purple-700',
  Liberada: 'bg-indigo-100 text-indigo-700',
  Coletada: 'bg-teal-100 text-teal-700',
  'Em Transporte': 'bg-blue-100 text-blue-700',
  Entregue: 'bg-emerald-100 text-emerald-700',
  Cancelada: 'bg-red-100 text-red-700',
}

const NEXT_STATUS: Record<string, string> = {
  'Aguardando Expedição': 'Em Preparação',
  'Em Preparação': 'Aguardando Veículo',
  'Aguardando Veículo': 'Em Carregamento',
  'Em Carregamento': 'Liberada',
  Liberada: 'Em Transporte',
  'Em Transporte': 'Entregue',
}

export function WmsShipping() {
  const { user } = useAuth()
  const userName = (user?.name as string) || 'Sistema'
  const [records, setRecords] = useState<WmsShipping[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  const load = async () => {
    try {
      setRecords((await getWmsShippings()) as WmsShipping[])
    } catch {
      setRecords([])
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime('wms_shippings', () => load())

  const filtered = records.filter((r) => {
    const t = search.toLowerCase().trim()
    return (
      !t ||
      (r.numero_expedicao || '').toLowerCase().includes(t) ||
      (r.cliente || '').toLowerCase().includes(t) ||
      (r.pedido || '').toLowerCase().includes(t)
    )
  })

  const handleNew = () => {
    setForm({
      numero_expedicao: `EXP-${Date.now().toString(36).toUpperCase().slice(-6)}`,
      status: 'Aguardando Expedição',
      responsavel: userName,
      quantidade_volumes: '0',
      peso_bruto: '0',
      peso_liquido: '0',
    })
    setOpen(true)
  }
  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      await createWmsShipping({
        ...form,
        quantidade_volumes: parseInt(form.quantidade_volumes) || 0,
      })
      toast({ title: 'Expedição criada' })
      setOpen(false)
      load()
    } catch {
      toast({ title: 'Erro', variant: 'destructive' })
    }
    setSubmitting(false)
  }
  const handleStatus = async (id: string, status: string) => {
    if (status === 'Liberada') {
      const rec = records.find((r) => r.id === id)
      if (rec && !rec.nota_fiscal) {
        toast({ title: 'Bloqueio: Nota fiscal não autorizada', variant: 'destructive' })
        return
      }
    }
    try {
      await updateWmsShipping(id, { status })
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
            placeholder="Buscar expedição..."
            className="pl-10 focus-visible:ring-[#005B2E]"
          />
        </div>
        <Button
          onClick={handleNew}
          className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
        >
          <Plus className="w-4 h-4 mr-2" /> Nova Expedição
        </Button>
      </div>
      <Card className="border-2 border-[#005B2E]/20 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#01361D] text-white">
                <th className="text-left px-3 py-2 font-bold">Número</th>
                <th className="text-left px-3 py-2 font-bold hidden md:table-cell">Pedido</th>
                <th className="text-left px-3 py-2 font-bold">Cliente</th>
                <th className="text-left px-3 py-2 font-bold hidden lg:table-cell">
                  Transportadora
                </th>
                <th className="text-left px-3 py-2 font-bold hidden md:table-cell">Veículo</th>
                <th className="text-left px-3 py-2 font-bold">Status</th>
                <th className="text-center px-3 py-2 font-bold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-b border-border hover:bg-[#005B2E]/5">
                  <td className="px-3 py-2 font-mono font-bold text-[#C89B3C]">
                    {r.numero_expedicao}
                  </td>
                  <td className="px-3 py-2 text-xs hidden md:table-cell">{r.pedido || '—'}</td>
                  <td className="px-3 py-2 font-medium">{r.cliente || '—'}</td>
                  <td className="px-3 py-2 text-xs hidden lg:table-cell">
                    {r.transportadora || '—'}
                  </td>
                  <td className="px-3 py-2 text-xs hidden md:table-cell">{r.veiculo || '—'}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded ${STATUS_COLORS[r.status] || 'bg-gray-100'}`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex justify-center gap-1">
                      {NEXT_STATUS[r.status] && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleStatus(r.id, NEXT_STATUS[r.status])}
                          className="text-[#005B2E] h-7 text-xs"
                        >
                          {NEXT_STATUS[r.status]}
                        </Button>
                      )}
                      {r.status !== 'Entregue' && r.status !== 'Cancelada' && (
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
            <DialogTitle className="text-[#005B2E]">Nova Expedição WMS</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-sm font-semibold">Número</Label>
                <Input
                  value={form.numero_expedicao || ''}
                  disabled
                  className="focus-visible:ring-[#005B2E]"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-sm font-semibold">Pedido</Label>
                <Input
                  value={form.pedido || ''}
                  onChange={(e) => setForm({ ...form, pedido: e.target.value })}
                  className="focus-visible:ring-[#005B2E]"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-sm font-semibold">Nota Fiscal</Label>
                <Input
                  value={form.nota_fiscal || ''}
                  onChange={(e) => setForm({ ...form, nota_fiscal: e.target.value })}
                  className="focus-visible:ring-[#005B2E]"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-sm font-semibold">Cliente</Label>
                <Input
                  value={form.cliente || ''}
                  onChange={(e) => setForm({ ...form, cliente: e.target.value })}
                  className="focus-visible:ring-[#005B2E]"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-sm font-semibold">Transportadora</Label>
                <Input
                  value={form.transportadora || ''}
                  onChange={(e) => setForm({ ...form, transportadora: e.target.value })}
                  className="focus-visible:ring-[#005B2E]"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-sm font-semibold">Motorista</Label>
                <Input
                  value={form.motorista || ''}
                  onChange={(e) => setForm({ ...form, motorista: e.target.value })}
                  className="focus-visible:ring-[#005B2E]"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-sm font-semibold">Veículo</Label>
                <Input
                  value={form.veiculo || ''}
                  onChange={(e) => setForm({ ...form, veiculo: e.target.value })}
                  className="focus-visible:ring-[#005B2E]"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-sm font-semibold">Rota</Label>
                <Input
                  value={form.rota || ''}
                  onChange={(e) => setForm({ ...form, rota: e.target.value })}
                  className="focus-visible:ring-[#005B2E]"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
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
                <Label className="text-sm font-semibold">Peso Bruto</Label>
                <Input
                  value={form.peso_bruto || '0'}
                  onChange={(e) => setForm({ ...form, peso_bruto: e.target.value })}
                  className="focus-visible:ring-[#005B2E]"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-sm font-semibold">Peso Líquido</Label>
                <Input
                  value={form.peso_liquido || '0'}
                  onChange={(e) => setForm({ ...form, peso_liquido: e.target.value })}
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
