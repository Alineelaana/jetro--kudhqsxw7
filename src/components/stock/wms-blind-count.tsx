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
import { getWmsBlindCounts, createWmsBlindCount, updateWmsBlindCount } from '@/services/wms'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import { toast } from '@/hooks/use-toast'
import { type WmsBlindCount } from '@/lib/wms-types'
import { Plus, Loader2, Search, EyeOff } from 'lucide-react'

const STATUS_COLORS: Record<string, string> = {
  Programado: 'bg-gray-100 text-gray-700',
  'Em Contagem': 'bg-blue-100 text-blue-700',
  'Aguardando Recontagem': 'bg-amber-100 text-amber-700',
  'Aguardando Aprovação': 'bg-purple-100 text-purple-700',
  Finalizado: 'bg-emerald-100 text-emerald-700',
  Cancelado: 'bg-red-100 text-red-700',
}

export function WmsBlindCount() {
  const { user } = useAuth()
  const userName = (user?.name as string) || 'Sistema'
  const [records, setRecords] = useState<WmsBlindCount[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [countOpen, setCountOpen] = useState(false)
  const [countRec, setCountRec] = useState<WmsBlindCount | null>(null)
  const [countValue, setCountValue] = useState('')

  const load = async () => {
    try {
      setRecords((await getWmsBlindCounts()) as WmsBlindCount[])
    } catch {
      setRecords([])
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime('wms_blind_counts', () => load())

  const filtered = records.filter((r) => {
    const t = search.toLowerCase().trim()
    return (
      !t ||
      (r.numero_contagem || '').toLowerCase().includes(t) ||
      (r.produto_nome || '').toLowerCase().includes(t)
    )
  })

  const handleNew = () => {
    setForm({
      numero_contagem: `CC-${Date.now().toString(36).toUpperCase().slice(-6)}`,
      status: 'Programado',
    })
    setOpen(true)
  }
  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      await createWmsBlindCount({
        ...form,
        divergencia: false,
        primeira_contagem: 0,
        segunda_contagem: 0,
      })
      toast({ title: 'Contagem criada' })
      setOpen(false)
      load()
    } catch {
      toast({ title: 'Erro', variant: 'destructive' })
    }
    setSubmitting(false)
  }
  const openCount = (r: WmsBlindCount) => {
    setCountRec(r)
    setCountValue('')
    setCountOpen(true)
  }
  const submitCount = async () => {
    if (!countRec) return
    try {
      const val = parseInt(countValue) || 0
      const isFirst = !countRec.primeira_contagem
      const updates: Record<string, unknown> = isFirst
        ? { primeira_contagem: val, operador_primeira: userName, status: 'Aguardando Recontagem' }
        : {
            segunda_contagem: val,
            operador_segunda: userName,
            status: countRec.primeira_contagem !== val ? 'Aguardando Aprovação' : 'Finalizado',
            divergencia: countRec.primeira_contagem !== val,
          }
      await updateWmsBlindCount(countRec.id, updates)
      toast({ title: 'Contagem registrada' })
      setCountOpen(false)
      load()
    } catch {
      toast({ title: 'Erro', variant: 'destructive' })
    }
  }
  const handleStatus = async (id: string, status: string) => {
    try {
      await updateWmsBlindCount(id, { status })
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
      <Card className="border-2 border-[#C89B3C]/40 bg-[#C89B3C]/5">
        <div className="p-3 flex items-center gap-2">
          <EyeOff className="w-5 h-5 text-[#8F6A1E]" />
          <span className="text-sm font-semibold text-[#8F6A1E]">
            Contagem Cega — a quantidade do sistema não é exibida para o operador
          </span>
        </div>
      </Card>
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar contagem..."
            className="pl-10 focus-visible:ring-[#005B2E]"
          />
        </div>
        <Button
          onClick={handleNew}
          className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
        >
          <Plus className="w-4 h-4 mr-2" /> Nova Contagem
        </Button>
      </div>
      <Card className="border-2 border-[#005B2E]/20 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#01361D] text-white">
                <th className="text-left px-3 py-2 font-bold">Número</th>
                <th className="text-left px-3 py-2 font-bold">Produto</th>
                <th className="text-left px-3 py-2 font-bold hidden md:table-cell">Localização</th>
                <th className="text-left px-3 py-2 font-bold hidden md:table-cell">1ª Contagem</th>
                <th className="text-left px-3 py-2 font-bold hidden md:table-cell">2ª Contagem</th>
                <th className="text-left px-3 py-2 font-bold">Status</th>
                <th className="text-center px-3 py-2 font-bold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-b border-border hover:bg-[#005B2E]/5">
                  <td className="px-3 py-2 font-mono font-bold text-[#C89B3C]">
                    {r.numero_contagem}
                  </td>
                  <td className="px-3 py-2 font-medium">{r.produto_nome || '—'}</td>
                  <td className="px-3 py-2 text-xs hidden md:table-cell">{r.localizacao || '—'}</td>
                  <td className="px-3 py-2 text-xs hidden md:table-cell">
                    {r.primeira_contagem || '—'}
                  </td>
                  <td className="px-3 py-2 text-xs hidden md:table-cell">
                    {r.segunda_contagem || '—'}
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded ${STATUS_COLORS[r.status] || 'bg-gray-100'}`}
                    >
                      {r.status}
                      {r.divergencia ? ' ⚠' : ''}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex justify-center gap-1">
                      {(r.status === 'Programado' || r.status === 'Aguardando Recontagem') && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openCount(r)}
                          className="text-blue-600 h-7 text-xs"
                        >
                          Contar
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
            <DialogTitle className="text-[#005B2E]">Nova Contagem Cega</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-sm font-semibold">Número</Label>
              <Input
                value={form.numero_contagem || ''}
                disabled
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-semibold">Produto</Label>
              <Input
                value={form.produto_nome || ''}
                onChange={(e) => setForm({ ...form, produto_nome: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-sm font-semibold">Localização</Label>
                <Input
                  value={form.localizacao || ''}
                  onChange={(e) => setForm({ ...form, localizacao: e.target.value })}
                  className="focus-visible:ring-[#005B2E]"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-sm font-semibold">Lote</Label>
                <Input
                  value={form.lote || ''}
                  onChange={(e) => setForm({ ...form, lote: e.target.value })}
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
      <Dialog open={countOpen} onOpenChange={setCountOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-[#005B2E]">Contagem Cega</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <span className="text-xs text-muted-foreground">Produto:</span>{' '}
              <span className="font-medium">{countRec?.produto_nome}</span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Localização:</span>{' '}
              <span className="font-medium">{countRec?.localizacao || '—'}</span>
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-semibold">Quantidade Contada</Label>
              <Input
                type="number"
                value={countValue}
                onChange={(e) => setCountValue(e.target.value)}
                autoFocus
                className="focus-visible:ring-[#005B2E] text-lg"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCountOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={submitCount}
              className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
            >
              Registrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
