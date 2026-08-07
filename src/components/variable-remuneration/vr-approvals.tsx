import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getApprovals, updateApproval } from '@/services/variable-remuneration'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import {
  canApproveGestor,
  canApproveFinanceiro,
  canReleasePayment,
} from '@/lib/variable-remuneration-permissions'
import { formatCurrency } from '@/lib/variable-remuneration-types'
import { Check, X, Loader2, Clock } from 'lucide-react'
import { toast } from 'sonner'

export function VrApprovals() {
  const { user } = useAuth()
  const [approvals, setApprovals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('pendente')
  const [obsMap, setObsMap] = useState<Record<string, string>>({})

  const load = async () => {
    try {
      setApprovals(await getApprovals())
    } catch {
      setApprovals([])
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime('commission_approvals', () => load())

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    const item = approvals.find((a) => a.id === id)
    if (!item) return
    let nextStep = item.step
    if (action === 'approve') {
      if (item.step === 'gestor') nextStep = 'financeiro'
      else if (item.step === 'financeiro') nextStep = 'liberado'
    }
    try {
      await updateApproval(id, {
        status: action === 'approve' ? 'aprovado' : 'rejeitado',
        approver_name: user?.name || '',
        approval_date: new Date().toISOString(),
        observacao: obsMap[id] || '',
        step: nextStep,
      })
      toast.success(action === 'approve' ? 'Aprovado' : 'Rejeitado')
      load()
    } catch {
      toast.error('Erro')
    }
  }

  const handleBatch = async (action: 'approve' | 'reject') => {
    const pending = approvals.filter((a) => a.status === 'pendente')
    for (const a of pending) {
      await handleAction(a.id, action)
    }
  }

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )

  const filtered = filter === 'all' ? approvals : approvals.filter((a) => a.status === filter)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-48 focus-visible:ring-[#005B2E]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pendente">Pendentes</SelectItem>
            <SelectItem value="aprovado">Aprovados</SelectItem>
            <SelectItem value="rejeitado">Rejeitados</SelectItem>
            <SelectItem value="all">Todos</SelectItem>
          </SelectContent>
        </Select>
        <Button
          onClick={() => handleBatch('approve')}
          className="bg-[#005B2E] hover:bg-[#01361D] text-white"
        >
          Aprovar Lote
        </Button>
      </div>
      {filtered.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="py-16 text-center">
            <Clock className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-lg font-bold">Nenhuma aprovação encontrada</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((a) => {
            const canAct =
              a.step === 'gestor'
                ? canApproveGestor(user?.role)
                : a.step === 'financeiro'
                  ? canApproveFinanceiro(user?.role)
                  : a.step === 'liberado'
                    ? canReleasePayment(user?.role)
                    : false
            return (
              <Card key={a.id} className="border-2 border-[#005B2E]/20">
                <CardContent className="py-3 px-4 space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <span className="font-bold">{a.vendedor_name || '—'}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        {a.competencia || ''}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#005B2E]">R$ {formatCurrency(a.value)}</span>
                      <span
                        className={`text-xs font-bold px-2 py-1 rounded ${a.status === 'pendente' ? 'bg-amber-100 text-amber-700' : a.status === 'aprovado' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}
                      >
                        {a.step} / {a.status}
                      </span>
                    </div>
                  </div>
                  {canAct && a.status === 'pendente' && (
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Textarea
                        value={obsMap[a.id] || ''}
                        onChange={(e) => setObsMap({ ...obsMap, [a.id]: e.target.value })}
                        placeholder="Observação..."
                        rows={1}
                        className="focus-visible:ring-[#005B2E]"
                      />
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          onClick={() => handleAction(a.id, 'approve')}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          <Check className="w-3.5 h-3.5 mr-1" /> Aprovar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAction(a.id, 'reject')}
                          className="text-red-600"
                        >
                          <X className="w-3.5 h-3.5 mr-1" /> Rejeitar
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
