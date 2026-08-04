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
import { getOccurrences, createOccurrence, updateOccurrence } from '@/services/logistics'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import { toast } from '@/hooks/use-toast'
import {
  OCCURRENCE_TYPES,
  OCCURRENCE_STATUS,
  type LogisticsOccurrence,
} from '@/lib/logistics-types'
import { Plus, Search, Loader2, AlertTriangle } from 'lucide-react'

const STATUS_COLORS: Record<string, string> = {
  Aberta: 'bg-red-100 text-red-700',
  'Em Análise': 'bg-amber-100 text-amber-700',
  Resolvida: 'bg-emerald-100 text-emerald-700',
  Cancelada: 'bg-gray-100 text-gray-600',
}

export function LogisticsOccurrences() {
  const { user } = useAuth()
  const [records, setRecords] = useState<LogisticsOccurrence[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  const load = async () => {
    try {
      setRecords(await getOccurrences())
    } catch {
      setRecords([])
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime('logistics_occurrences', () => load())

  const filtered = records.filter((r) => {
    const t = search.toLowerCase().trim()
    return (
      !t ||
      (r.cliente || '').toLowerCase().includes(t) ||
      (r.entrega || '').toLowerCase().includes(t) ||
      (r.tipo_ocorrencia || '').toLowerCase().includes(t)
    )
  })

  const handleNew = () => {
    setForm({
      situacao: 'Aberta',
      responsavel: (user?.name as string) || '',
      data_hora: new Date().toISOString().slice(0, 16),
    })
    setOpen(true)
  }
  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      await createOccurrence({ ...form, fotos: [], documentos: [], historico: [] })
      toast({ title: 'Ocorrência registrada' })
      setOpen(false)
      load()
    } catch {
      toast({ title: 'Erro', variant: 'destructive' })
    }
    setSubmitting(false)
  }
  const handleStatus = async (id: string, situacao: string) => {
    try {
      await updateOccurrence(id, { situacao })
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
            placeholder="Buscar ocorrência..."
            className="pl-10 focus-visible:ring-[#005B2E]"
          />
        </div>
        <Button
          onClick={handleNew}
          className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
        >
          <Plus className="w-4 h-4 mr-2" /> Nova Ocorrência
        </Button>
      </div>
      <Card className="border-2 border-[#005B2E]/20 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#01361D] text-white">
                <th className="text-left px-3 py-2 font-bold">Entrega</th>
                <th className="text-left px-3 py-2 font-bold">Cliente</th>
                <th className="text-left px-3 py-2 font-bold">Tipo</th>
                <th className="text-left px-3 py-2 font-bold hidden md:table-cell">Data/Hora</th>
                <th className="text-left px-3 py-2 font-bold">Situação</th>
                <th className="text-center px-3 py-2 font-bold">Ação</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-12 text-center text-muted-foreground">
                    <AlertTriangle className="w-10 h-10 mx-auto mb-2 opacity-40" />
                    Nenhuma ocorrência encontrada
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.id} className="border-b border-border hover:bg-[#005B2E]/5">
                    <td className="px-3 py-2 font-mono text-xs">{r.entrega || '—'}</td>
                    <td className="px-3 py-2 font-medium">{r.cliente || '—'}</td>
                    <td className="px-3 py-2">{r.tipo_ocorrencia || '—'}</td>
                    <td className="px-3 py-2 hidden md:table-cell text-xs">
                      {r.data_hora ? new Date(r.data_hora).toLocaleString('pt-BR') : '—'}
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded ${STATUS_COLORS[r.situacao] || 'bg-gray-100'}`}
                      >
                        {r.situacao}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex justify-center">
                        <Select onValueChange={(v) => handleStatus(r.id, v)}>
                          <SelectTrigger className="h-7 w-32 text-xs focus-visible:ring-[#005B2E]">
                            <SelectValue placeholder="Alterar" />
                          </SelectTrigger>
                          <SelectContent>
                            {OCCURRENCE_STATUS.map((s) => (
                              <SelectItem key={s} value={s}>
                                {s}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
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
            <DialogTitle className="text-[#005B2E]">Nova Ocorrência</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
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
                <Label className="text-sm font-semibold">Cliente</Label>
                <Input
                  value={form.cliente || ''}
                  onChange={(e) => setForm({ ...form, cliente: e.target.value })}
                  className="focus-visible:ring-[#005B2E]"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-semibold">Tipo de Ocorrência</Label>
              <Select
                value={form.tipo_ocorrencia}
                onValueChange={(v) => setForm({ ...form, tipo_ocorrencia: v })}
              >
                <SelectTrigger className="focus-visible:ring-[#005B2E]">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {OCCURRENCE_TYPES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
                <Label className="text-sm font-semibold">Data/Hora</Label>
                <Input
                  type="datetime-local"
                  value={form.data_hora || ''}
                  onChange={(e) => setForm({ ...form, data_hora: e.target.value })}
                  className="focus-visible:ring-[#005B2E]"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-sm font-semibold">Responsável</Label>
                <Input
                  value={form.responsavel || ''}
                  onChange={(e) => setForm({ ...form, responsavel: e.target.value })}
                  className="focus-visible:ring-[#005B2E]"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-semibold">Ação Necessária</Label>
              <Input
                value={form.acao_necessaria || ''}
                onChange={(e) => setForm({ ...form, acao_necessaria: e.target.value })}
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
              {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Registrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
