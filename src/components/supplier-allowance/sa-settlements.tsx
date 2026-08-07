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
import { SA_COLLECTIONS, saGetList, saUpdate, settleAllowance } from '@/services/supplier-allowance'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import { canSettle, canApproveSettlement } from '@/lib/supplier-allowance-permissions'
import { SETTLEMENT_TYPES, formatBRL } from '@/lib/supplier-allowance-types'
import { Plus, Search, Loader2, Check, X } from 'lucide-react'
import { toast } from 'sonner'

export function SaSettlements() {
  const { user } = useAuth()
  const [records, setRecords] = useState<any[]>([])
  const [accruals, setAccruals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState({ accrual_id: '', settlement_type: 'credito' })

  const load = async () => {
    try {
      setRecords(await saGetList(SA_COLLECTIONS.settlements))
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
  useRealtime(SA_COLLECTIONS.settlements, () => load())

  const filtered = records.filter((r) => {
    const q = search.toLowerCase().trim()
    return !q || (r.status || '').includes(q)
  })

  const handleSettle = async () => {
    if (!form.accrual_id) {
      toast.error('Selecione uma apuração')
      return
    }
    try {
      await settleAllowance(form.accrual_id, form.settlement_type)
      toast.success('Liquidação criada')
      setDialogOpen(false)
      load()
    } catch {
      toast.error('Erro')
    }
  }

  const handleApprove = async (id: string, approve: boolean) => {
    try {
      await saUpdate(SA_COLLECTIONS.settlements, id, {
        status: approve ? 'liquidado' : 'rejeitado',
      })
      toast.success(approve ? 'Liquidado' : 'Rejeitado')
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
        <h3 className="text-lg font-bold">Liquidações</h3>
        {canSettle(user?.role) && (
          <Button
            onClick={() => setDialogOpen(true)}
            className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
          >
            <Plus className="w-4 h-4 mr-2" /> Nova Liquidação
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
                <th className="text-left px-3 py-3 font-bold">Valor</th>
                <th className="text-left px-3 py-3 font-bold hidden sm:table-cell">Tipo</th>
                <th className="text-left px-3 py-3 font-bold">Status</th>
                <th className="text-center px-3 py-3 font-bold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-muted-foreground">
                    Nenhuma liquidação encontrada
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.id} className="border-b border-border hover:bg-[#005B2E]/5">
                    <td className="px-3 py-3 font-bold text-[#005B2E]">
                      R$ {formatBRL(r.settled_value)}
                    </td>
                    <td className="px-3 py-3 hidden sm:table-cell capitalize">
                      {r.settlement_type || '—'}
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={`text-xs font-bold px-2 py-1 rounded ${r.status === 'liquidado' ? 'bg-emerald-100 text-emerald-700' : r.status === 'rejeitado' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}
                      >
                        {r.status || '—'}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      {r.status === 'pendente' && canApproveSettlement(user?.role) && (
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
            <DialogTitle className="text-[#005B2E]">Nova Liquidação</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Apuração *</Label>
              <select
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
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
              <Label>Tipo de Liquidação</Label>
              <Select
                value={form.settlement_type}
                onValueChange={(v) => setForm({ ...form, settlement_type: v })}
              >
                <SelectTrigger className="focus-visible:ring-[#005B2E]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SETTLEMENT_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSettle} className="bg-[#005B2E] hover:bg-[#01361D] text-white">
              Liquidar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
