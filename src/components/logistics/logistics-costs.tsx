import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
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
import { getCosts, createCost } from '@/services/logistics'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import { toast } from '@/hooks/use-toast'
import { COST_TYPES } from '@/lib/logistics-types'
import { canViewLogisticsCosts } from '@/lib/logistics-permissions'
import { Plus, Search, Loader2, DollarSign } from 'lucide-react'

const fmtCurrency = (v: string) => {
  const n = parseFloat(v || '0')
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function LogisticsCosts() {
  const { user } = useAuth()
  const role = user?.role as string
  const [records, setRecords] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  const load = async () => {
    try {
      setRecords(await getCosts())
    } catch {
      setRecords([])
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime('logistics_costs', () => load())

  const filtered = records.filter((r) => {
    const t = search.toLowerCase().trim()
    const desc = String(r.descricao || '').toLowerCase()
    const tipo = String(r.tipo_custo || '').toLowerCase()
    return !t || desc.includes(t) || tipo.includes(t)
  })

  const total = filtered.reduce((sum, r) => sum + parseFloat(String(r.valor || '0')), 0)

  const handleNew = () => {
    setForm({
      data: new Date().toISOString().split('T')[0],
      responsavel: (user?.name as string) || '',
      valor: '0',
      tipo_custo: 'Frete',
    })
    setOpen(true)
  }
  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      await createCost({ ...form, valor: form.valor || '0', historico: [] })
      toast({ title: 'Custo registrado' })
      setOpen(false)
      load()
    } catch {
      toast({ title: 'Erro', variant: 'destructive' })
    }
    setSubmitting(false)
  }

  if (!canViewLogisticsCosts(role)) {
    return (
      <Card className="border-2 border-dashed">
        <div className="py-16 text-center">
          <DollarSign className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-bold">Você não tem permissão para visualizar custos.</p>
        </div>
      </Card>
    )
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
            placeholder="Buscar custo..."
            className="pl-10 focus-visible:ring-[#005B2E]"
          />
        </div>
        <Button
          onClick={handleNew}
          className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
        >
          <Plus className="w-4 h-4 mr-2" /> Novo Custo
        </Button>
      </div>
      <Card className="border-2 border-[#005B2E]/20 p-4">
        <p className="text-sm text-muted-foreground">
          Total:{' '}
          <span className="font-bold text-[#005B2E] text-lg">{fmtCurrency(String(total))}</span>
        </p>
      </Card>
      <Card className="border-2 border-[#005B2E]/20 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#01361D] text-white">
                <th className="text-left px-3 py-2 font-bold">Descrição</th>
                <th className="text-left px-3 py-2 font-bold">Tipo</th>
                <th className="text-left px-3 py-2 font-bold hidden md:table-cell">Entrega/Rota</th>
                <th className="text-right px-3 py-2 font-bold">Valor</th>
                <th className="text-left px-3 py-2 font-bold hidden md:table-cell">Data</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-12 text-center text-muted-foreground">
                    <DollarSign className="w-10 h-10 mx-auto mb-2 opacity-40" />
                    Nenhum custo registrado
                  </td>
                </tr>
              ) : (
                filtered.map((r, i) => (
                  <tr key={i} className="border-b border-border hover:bg-[#005B2E]/5">
                    <td className="px-3 py-2 font-medium">{r.descricao || '—'}</td>
                    <td className="px-3 py-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                        {r.tipo_custo}
                      </span>
                    </td>
                    <td className="px-3 py-2 hidden md:table-cell text-xs">
                      {r.entrega || r.rota || '—'}
                    </td>
                    <td className="px-3 py-2 text-right font-bold">
                      {fmtCurrency(String(r.valor || '0'))}
                    </td>
                    <td className="px-3 py-2 hidden md:table-cell text-xs">
                      {r.data ? new Date(String(r.data)).toLocaleDateString('pt-BR') : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-[#005B2E]">Novo Custo</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-sm font-semibold">Descrição</Label>
              <Input
                value={form.descricao || ''}
                onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-sm font-semibold">Tipo</Label>
                <Select
                  value={form.tipo_custo}
                  onValueChange={(v) => setForm({ ...form, tipo_custo: v })}
                >
                  <SelectTrigger className="focus-visible:ring-[#005B2E]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COST_TYPES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-sm font-semibold">Valor</Label>
                <Input
                  type="number"
                  value={form.valor || '0'}
                  onChange={(e) => setForm({ ...form, valor: e.target.value })}
                  className="focus-visible:ring-[#005B2E]"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-sm font-semibold">Entrega</Label>
                <Input
                  value={form.entrega || ''}
                  onChange={(e) => setForm({ ...form, entrega: e.target.value })}
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
              {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Registrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
