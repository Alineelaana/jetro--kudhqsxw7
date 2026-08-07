import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { SA_COLLECTIONS, saGetList, appropriateAllowance } from '@/services/supplier-allowance'
import { useRealtime } from '@/hooks/use-realtime'
import { canAppropriate } from '@/lib/supplier-allowance-permissions'
import { formatBRL } from '@/lib/supplier-allowance-types'
import { Plus, Search, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export function SaAppropriations() {
  const [records, setRecords] = useState<any[]>([])
  const [accruals, setAccruals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState({ accrual_id: '', allocated_value: '', reason: '' })

  const load = async () => {
    try {
      setRecords(await saGetList(SA_COLLECTIONS.appropriations))
      setAccruals(
        (await saGetList(SA_COLLECTIONS.accruals)).filter((a: any) => a.status === 'aprovado'),
      )
    } catch {
      setRecords([])
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime(SA_COLLECTIONS.appropriations, () => load())

  const filtered = records.filter((r) => {
    const q = search.toLowerCase().trim()
    return !q || (r.reason || '').toLowerCase().includes(q)
  })

  const handleSave = async () => {
    if (!form.accrual_id || !form.allocated_value) {
      toast.error('Preencha os campos')
      return
    }
    try {
      await appropriateAllowance(form)
      toast.success('Apropriação criada')
      setDialogOpen(false)
      load()
    } catch {
      toast.error('Erro')
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
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h3 className="text-lg font-bold">Apropriações</h3>
        {canAppropriate(undefined) && (
          <Button
            onClick={() => setDialogOpen(true)}
            className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
          >
            <Plus className="w-4 h-4 mr-2" /> Nova Apropriação
          </Button>
        )}
      </div>
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar..."
          className="pl-10 focus-visible:ring-[#005B2E]"
        />
      </div>
      <Card className="border-2 border-[#005B2E]/20 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#01361D] text-white">
                <th className="text-left px-3 py-3 font-bold">Valor Alocado</th>
                <th className="text-left px-3 py-3 font-bold hidden sm:table-cell">Motivo</th>
                <th className="text-left px-3 py-3 font-bold">Status</th>
                <th className="text-left px-3 py-3 font-bold hidden sm:table-cell">Data</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-muted-foreground">
                    Nenhuma apropriação encontrada
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.id} className="border-b border-border hover:bg-[#005B2E]/5">
                    <td className="px-3 py-3 font-bold text-[#005B2E]">
                      R$ {formatBRL(r.allocated_value)}
                    </td>
                    <td className="px-3 py-3 hidden sm:table-cell">{r.reason || '—'}</td>
                    <td className="px-3 py-3">
                      <span className="text-xs font-bold px-2 py-1 rounded bg-amber-100 text-amber-700">
                        {r.status || '—'}
                      </span>
                    </td>
                    <td className="px-3 py-3 hidden sm:table-cell text-xs">
                      {r.created ? new Date(r.created).toLocaleDateString('pt-BR') : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#005B2E]">Nova Apropriação</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Apuração *</Label>
              <select
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus-visible:ring-[#005B2E]"
                value={form.accrual_id}
                onChange={(e) => setForm({ ...form, accrual_id: e.target.value })}
              >
                <option value="">Selecione</option>
                {accruals.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.competence_period} — R$ {formatBRL(a.earned_value)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Valor (R$) *</Label>
              <Input
                type="number"
                value={form.allocated_value}
                onChange={(e) => setForm({ ...form, allocated_value: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div>
              <Label>Motivo</Label>
              <Input
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} className="bg-[#005B2E] hover:bg-[#01361D] text-white">
              Criar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
