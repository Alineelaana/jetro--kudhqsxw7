import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { getApprovals, updateApproval } from '@/services/ai-module'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import { canApproveAiActions } from '@/lib/ai-permissions'
import { APPROVAL_STATUS, type AiApproval } from '@/lib/ai-types'
import { Check, X, AlertCircle, Loader2, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'

const STATUS_COLORS: Record<string, string> = {
  Aguardando: 'bg-yellow-100 text-yellow-700',
  Aprovada: 'bg-green-100 text-green-700',
  Reprovada: 'bg-red-100 text-red-700',
  'Ajuste Solicitado': 'bg-orange-100 text-orange-700',
  Executada: 'bg-emerald-100 text-emerald-700',
}

export function AiApprovals() {
  const { user } = useAuth()
  const [items, setItems] = useState<AiApproval[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('Aguardando')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogItem, setDialogItem] = useState<AiApproval | null>(null)
  const [dialogAction, setDialogAction] = useState<'approve' | 'reject' | 'adjust'>('approve')
  const [justification, setJustification] = useState('')

  const load = async () => {
    try {
      setItems(await getApprovals(filter !== 'all' ? `status = "${filter}"` : undefined))
    } catch {
      setItems([])
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [filter])
  useRealtime('ai_approvals', () => load())

  const openDialog = (item: AiApproval, action: 'approve' | 'reject' | 'adjust') => {
    setDialogItem(item)
    setDialogAction(action)
    setJustification('')
    setDialogOpen(true)
  }
  const handleConfirm = async () => {
    if (!dialogItem) return
    if (dialogAction !== 'approve' && !justification.trim()) {
      toast.error('Justificativa obrigatória')
      return
    }
    const status =
      dialogAction === 'approve'
        ? 'Aprovada'
        : dialogAction === 'reject'
          ? 'Reprovada'
          : 'Ajuste Solicitado'
    try {
      await updateApproval(dialogItem.id, { status, approver: user?.name || '', justification })
      toast.success(status)
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

  const filtered = filter === 'all' ? items : items.filter((a) => a.status === filter)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {['Aguardando', 'Aprovada', 'Reprovada', 'Ajuste Solicitado', 'Executada', 'all'].map(
              (s) => (
                <SelectItem key={s} value={s}>
                  {s === 'all' ? 'Todas' : s}
                </SelectItem>
              ),
            )}
          </SelectContent>
        </Select>
      </div>
      {filtered.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="py-16 text-center">
            <ShieldCheck className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-bold">
              Nenhuma aprovação {filter === 'Aguardando' ? 'pendente' : 'encontrada'}.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-2 border-[#005B2E]/20 shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#01361D] text-white">
                  <th className="text-left px-3 py-3 font-bold">Agente</th>
                  <th className="text-left px-3 py-3 font-bold">Ação</th>
                  <th className="text-left px-3 py-3 font-bold hidden md:table-cell">Motivo</th>
                  <th className="text-left px-3 py-3 font-bold">Status</th>
                  <th className="text-center px-3 py-3 font-bold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((a) => (
                  <tr key={a.id} className="border-b border-border hover:bg-[#005B2E]/5">
                    <td className="px-3 py-3 text-xs font-medium">{a.agent_name || '—'}</td>
                    <td className="px-3 py-3">
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-[#C89B3C]/15 text-[#C89B3C]">
                        {a.action_type || '—'}
                      </span>
                      <p className="text-xs text-muted-foreground mt-1 max-w-[200px] truncate">
                        {a.proposed_action}
                      </p>
                    </td>
                    <td className="px-3 py-3 hidden md:table-cell text-xs">{a.reason || '—'}</td>
                    <td className="px-3 py-3">
                      <span
                        className={`text-xs font-bold px-2 py-1 rounded ${STATUS_COLORS[a.status] || ''}`}
                      >
                        {a.status}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      {a.status === 'Aguardando' && canApproveAiActions(user?.role as string) && (
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openDialog(a, 'approve')}
                            className="text-green-600"
                            title="Aprovar"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openDialog(a, 'reject')}
                            className="text-red-600"
                            title="Reprovar"
                          >
                            <X className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openDialog(a, 'adjust')}
                            className="text-amber-600"
                            title="Solicitar Ajuste"
                          >
                            <AlertCircle className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {dialogAction === 'approve'
                ? 'Aprovar Ação'
                : dialogAction === 'reject'
                  ? 'Reprovar Ação'
                  : 'Solicitar Ajuste'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <p className="text-sm">
              <span className="font-bold">Ação:</span> {dialogItem?.action_type}
            </p>
            <p className="text-sm">
              <span className="font-bold">Detalhe:</span> {dialogItem?.proposed_action}
            </p>
            <div>
              <Label className="text-xs">
                {dialogAction === 'approve'
                  ? 'Justificativa (opcional)'
                  : 'Justificativa (obrigatório)'}
              </Label>
              <Textarea
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleConfirm}
              className={
                dialogAction === 'approve'
                  ? 'bg-[#005B2E] hover:bg-[#01361D] text-white'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }
            >
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
