import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, Lock, Unlock, CheckCircle, Clock } from 'lucide-react'
import {
  getClosings,
  ctrlUpdate,
  ctrlCreate,
  createSnapshot,
  logControladoriaAudit,
} from '@/services/controladoria'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import {
  canManageClosing,
  canApproveClosing,
  canReopenPeriod,
} from '@/lib/controladoria-permissions'
import { CLOSING_STATUS, STATUS_COLORS, type ClosingRecord } from '@/lib/controladoria-types'
import { computeDRE } from '@/services/controladoria-analytics'
import { cn } from '@/lib/utils'

const STATUS_LABELS: Record<string, string> = {
  open: 'Aberto',
  in_review: 'Em Revisão',
  pending_approval: 'Pendente Aprovação',
  approved: 'Aprovado',
  closed: 'Fechado',
  reopened: 'Reaberto',
}

const CHECKLIST_ITEMS = [
  'Lançamentos contábeis conferidos',
  'Conciliações bancárias realizadas',
  'Reclassificações gerenciais aprovadas',
  'Provisões calculadas',
  'DRE gerada e validada',
  'KPIs atualizados',
  'Variações analisadas',
  'Comentários da controladoria revisados',
]

export function ControladoriaClosing() {
  const { user, userRole } = useAuth()
  const [closings, setClosings] = useState<ClosingRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [newPeriod, setNewPeriod] = useState(new Date().toISOString().substring(0, 7))

  const load = async () => {
    try {
      setClosings((await getClosings()) as ClosingRecord[])
    } catch {
      /* ignore */
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime('controladoria_closing', () => load())

  const handleCreate = async () => {
    const userName = (user?.name as string) || 'Usuário'
    await ctrlCreate('controladoria_closing', {
      period: newPeriod,
      company: '',
      branch: '',
      status: 'open',
      responsible: userName,
      checklist: JSON.stringify(
        CHECKLIST_ITEMS.reduce((acc, item) => ({ ...acc, [item]: false }), {}),
      ),
      timeline: JSON.stringify([
        { action: 'created', user: userName, date: new Date().toISOString() },
      ]),
      snapshot_id: '',
      closing_date: '',
      justification: '',
      reopen_reason: '',
    })
    logControladoriaAudit('create', newPeriod, `Fechamento criado: ${newPeriod}`)
    load()
  }

  const handleAdvance = async (record: ClosingRecord, newStatus: string) => {
    const userName = (user?.name as string) || 'Usuário'
    const timeline = [
      ...(record.timeline || []),
      { action: newStatus, user: userName, date: new Date().toISOString() },
    ]
    let snapshotId = record.snapshot_id
    if (newStatus === 'closed' && !snapshotId) {
      const dre = await computeDRE(record.period, 'oficial')
      const snap = await createSnapshot(record.id, record.period, { dre })
      snapshotId = snap.id
    }
    await ctrlUpdate('controladoria_closing', record.id, {
      status: newStatus,
      timeline: JSON.stringify(timeline),
      snapshot_id: snapshotId,
      closing_date: newStatus === 'closed' ? new Date().toISOString() : record.closing_date,
    })
    logControladoriaAudit(
      'update',
      record.id,
      `Fechamento ${record.period}: ${STATUS_LABELS[newStatus]}`,
    )
    load()
  }

  const handleReopen = async (record: ClosingRecord, reason: string) => {
    if (!canReopenPeriod(userRole)) return
    const userName = (user?.name as string) || 'Usuário'
    const timeline = [
      ...(record.timeline || []),
      { action: 'reopened', user: userName, date: new Date().toISOString(), reason },
    ]
    await ctrlUpdate('controladoria_closing', record.id, {
      status: 'reopened',
      timeline: JSON.stringify(timeline),
      reopen_reason: reason,
    })
    logControladoriaAudit(
      'reopen',
      record.id,
      `Período reaberto: ${record.period}. Motivo: ${reason}`,
    )
    load()
  }

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )

  return (
    <div className="space-y-4">
      <Card className="border-2 border-[#005B2E]/20">
        <CardContent className="py-3 flex items-end gap-3">
          <div className="space-y-1 flex-1">
            <label className="text-xs font-medium">Novo Fechamento</label>
            <input
              type="month"
              value={newPeriod}
              onChange={(e) => setNewPeriod(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm w-40"
            />
          </div>
          {canManageClosing(userRole) && (
            <Button size="sm" className="bg-[#005B2E] hover:bg-[#01361D]" onClick={handleCreate}>
              Iniciar Fechamento
            </Button>
          )}
        </CardContent>
      </Card>

      {closings.map((c) => (
        <Card key={c.id} className="border-2 border-[#005B2E]/20">
          <CardContent className="py-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                {c.status === 'closed' ? (
                  <Lock className="w-5 h-5 text-[#005B2E]" />
                ) : (
                  <Unlock className="w-5 h-5 text-amber-500" />
                )}
                <div>
                  <h3 className="font-bold text-sm">Fechamento: {c.period}</h3>
                  <p className="text-xs text-muted-foreground">Responsável: {c.responsible}</p>
                </div>
              </div>
              <Badge className={cn('text-xs', STATUS_COLORS[c.status] || 'bg-gray-100')}>
                {STATUS_LABELS[c.status] || c.status}
              </Badge>
            </div>

            {c.checklist && typeof c.checklist === 'object' && (
              <div className="mb-3">
                <p className="text-xs font-medium text-[#005B2E] mb-1">Checklist:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                  {Object.entries(c.checklist as Record<string, unknown>).map(([item, done]) => (
                    <div key={item} className="flex items-center gap-2 text-xs">
                      {done ? (
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                      )}
                      <span className={done ? 'line-through text-muted-foreground' : ''}>
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {c.timeline && c.timeline.length > 0 && (
              <div className="mb-3">
                <p className="text-xs font-medium text-[#005B2E] mb-1">Timeline:</p>
                <div className="space-y-1">
                  {c.timeline.slice(-3).map((t, i) => (
                    <div key={i} className="text-xs flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#005B2E]" />
                      <span className="text-muted-foreground">
                        {new Date(t.date as string).toLocaleString('pt-BR')}
                      </span>
                      <span>
                        — {t.action} por {t.user}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {c.snapshot_id && (
              <div className="mb-3 p-2 rounded-md bg-[#005B2E]/5 border border-[#005B2E]/20">
                <p className="text-xs font-medium text-[#005B2E]">📸 Snapshot Oficial Imutável</p>
                <p className="text-xs text-muted-foreground">ID: {c.snapshot_id}</p>
              </div>
            )}

            <div className="flex gap-2">
              {c.status === 'open' && canManageClosing(userRole) && (
                <Button size="sm" variant="outline" onClick={() => handleAdvance(c, 'in_review')}>
                  Enviar para Revisão
                </Button>
              )}
              {c.status === 'in_review' && canManageClosing(userRole) && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleAdvance(c, 'pending_approval')}
                >
                  Enviar para Aprovação
                </Button>
              )}
              {c.status === 'pending_approval' && canApproveClosing(userRole) && (
                <Button
                  size="sm"
                  className="bg-[#005B2E] hover:bg-[#01361D]"
                  onClick={() => handleAdvance(c, 'closed')}
                >
                  <Lock className="w-3.5 h-3.5 mr-1" /> Fechar Período
                </Button>
              )}
              {c.status === 'closed' && canReopenPeriod(userRole) && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    const r = prompt('Justifique a reabertura:')
                    if (r) handleReopen(c, r)
                  }}
                >
                  <Unlock className="w-3.5 h-3.5 mr-1" /> Reabrir
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
      {closings.length === 0 && (
        <p className="text-center py-6 text-muted-foreground">Nenhum fechamento iniciado.</p>
      )}
    </div>
  )
}
