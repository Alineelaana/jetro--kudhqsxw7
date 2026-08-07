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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  SA_COLLECTIONS,
  saGetList,
  saUpdate,
  accrueAllowances,
} from '@/services/supplier-allowance'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import { canAccrue, canApproveAccrual } from '@/lib/supplier-allowance-permissions'
import { ACCRUAL_STATUS, formatBRL } from '@/lib/supplier-allowance-types'
import { Calculator, Search, Loader2, Check, X } from 'lucide-react'
import { toast } from 'sonner'

export function SaAccruals() {
  const { user } = useAuth()
  const [records, setRecords] = useState<any[]>([])
  const [agreements, setAgreements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [accruing, setAccruing] = useState(false)
  const [form, setForm] = useState({ agreement_id: '', competence_period: '' })

  const load = async () => {
    try {
      setRecords(await saGetList(SA_COLLECTIONS.accruals))
      setAgreements(await saGetList(SA_COLLECTIONS.agreements))
    } catch {
      setRecords([])
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime(SA_COLLECTIONS.accruals, () => load())

  const filtered = records.filter((r) => {
    const q = search.toLowerCase().trim()
    return !q || (r.competence_period || '').includes(q) || (r.status || '').includes(q)
  })

  const handleAccrue = async () => {
    if (!form.agreement_id || !form.competence_period) {
      toast.error('Preencha os campos')
      return
    }
    setAccruing(true)
    try {
      const result = await accrueAllowances(form.agreement_id, form.competence_period)
      toast.success(`Apuração: R$ ${formatBRL(result.earned_value)}`)
      setDialogOpen(false)
      load()
    } catch {
      toast.error('Erro ao apurar')
    }
    setAccruing(false)
  }

  const handleApprove = async (id: string, approve: boolean) => {
    try {
      await saUpdate(SA_COLLECTIONS.accruals, id, {
        status: approve ? 'aprovado' : 'rejeitado',
        approved_by: user?.name || '',
        approved_at: new Date().toISOString(),
      })
      toast.success(approve ? 'Aprovado' : 'Rejeitado')
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
        <h3 className="text-lg font-bold">Apurações</h3>
        {canAccrue(user?.role) && (
          <Button
            onClick={() => setDialogOpen(true)}
            className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
          >
            <Calculator className="w-4 h-4 mr-2" /> Executar Apuração
          </Button>
        )}
      </div>
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar apurações..."
          className="pl-10 focus-visible:ring-[#005B2E]"
        />
      </div>
      <Card className="border-2 border-[#005B2E]/20 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#01361D] text-white">
                <th className="text-left px-3 py-3 font-bold">Competência</th>
                <th className="text-left px-3 py-3 font-bold hidden sm:table-cell">Volume</th>
                <th className="text-left px-3 py-3 font-bold">Valor Apurado</th>
                <th className="text-left px-3 py-3 font-bold">Status</th>
                <th className="text-center px-3 py-3 font-bold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-muted-foreground">
                    Nenhuma apuração encontrada
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.id} className="border-b border-border hover:bg-[#005B2E]/5">
                    <td className="px-3 py-3 font-medium">{r.competence_period || '—'}</td>
                    <td className="px-3 py-3 hidden sm:table-cell">R$ {formatBRL(r.volume)}</td>
                    <td className="px-3 py-3 font-bold text-[#005B2E]">
                      R$ {formatBRL(r.earned_value)}
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={`text-xs font-bold px-2 py-1 rounded ${r.status === 'aprovado' ? 'bg-emerald-100 text-emerald-700' : r.status === 'rejeitado' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}
                      >
                        {r.status || '—'}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      {r.status === 'pendente' && canApproveAccrual(user?.role) && (
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleApprove(r.id, true)}
                            className="text-emerald-600"
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleApprove(r.id, false)}
                            className="text-red-600"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
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
            <DialogTitle className="text-[#005B2E]">Executar Apuração</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Acordo *</Label>
              <Select
                value={form.agreement_id}
                onValueChange={(v) => setForm({ ...form, agreement_id: v })}
              >
                <SelectTrigger className="focus-visible:ring-[#005B2E]">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {agreements.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.agreement_type || '—'} — {a.id.substring(0, 8)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Período de Competência *</Label>
              <Input
                type="month"
                value={form.competence_period}
                onChange={(e) => setForm({ ...form, competence_period: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleAccrue}
              disabled={accruing}
              className="bg-[#005B2E] hover:bg-[#01361D] text-white"
            >
              {accruing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Apurar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
