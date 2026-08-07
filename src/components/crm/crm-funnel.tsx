import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getOpportunities, getFunnelStages, moveOpportunityStage } from '@/services/crm'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import { type CrmOpportunity, type CrmFunnelStage } from '@/lib/crm-types'
import { Loader2, AlertTriangle, Plus } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { CrmOpportunityDialog } from '@/components/crm/crm-opportunity-dialog'

function getTimeInStage(stageEnteredAt: string): string {
  if (!stageEnteredAt) return '—'
  const diff = Date.now() - new Date(stageEnteredAt).getTime()
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(hours / 24)
  if (days > 0) return `${days}d ${hours % 24}h`
  if (hours > 0) return `${hours}h`
  return 'agora'
}

function isOverdue(stageEnteredAt: string, slaDays: number): boolean {
  if (!stageEnteredAt || !slaDays) return false
  return Date.now() - new Date(stageEnteredAt).getTime() > slaDays * 86400000
}

export function CrmFunnel() {
  const { user } = useAuth()
  const [stages, setStages] = useState<CrmFunnelStage[]>([])
  const [opps, setOpps] = useState<CrmOpportunity[]>([])
  const [loading, setLoading] = useState(true)
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<CrmOpportunity | null>(null)
  const [funnelFilter, setFunnelFilter] = useState('all')

  const load = async () => {
    try {
      const [s, o] = await Promise.all([getFunnelStages(), getOpportunities()])
      setStages(s)
      setOpps(o)
    } catch {
      /* noop */
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime('crm_opportunities', () => load())
  useRealtime('crm_funnel_stages', () => load())

  const handleDrop = async (stageId: string) => {
    if (!draggedId) return
    const opp = opps.find((o) => o.id === draggedId)
    if (!opp || opp.stage_id === stageId) {
      setDraggedId(null)
      return
    }
    try {
      await moveOpportunityStage(
        opp.id,
        stageId,
        opp.stage_id || '',
        opp.stage_entered_at || '',
        (user?.name as string) || 'Sistema',
      )
      toast({ title: 'Oportunidade movida' })
      load()
    } catch {
      toast({ title: 'Erro ao mover', variant: 'destructive' })
    }
    setDraggedId(null)
  }

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )

  const filteredStages =
    funnelFilter === 'all'
      ? stages
      : stages.filter((s) => !s.funnel_type || s.funnel_type === funnelFilter)
  const activeOpps = opps.filter((o) => !['Ganha', 'Perdida', 'Cancelada'].includes(o.status))

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Select value={funnelFilter} onValueChange={setFunnelFilter}>
          <SelectTrigger className="w-48 focus-visible:ring-[#005B2E]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Funis</SelectItem>
            <SelectItem value="geral">Geral</SelectItem>
            <SelectItem value="empresa">Por Empresa</SelectItem>
            <SelectItem value="equipe">Por Equipe</SelectItem>
            <SelectItem value="segmento">Por Segmento</SelectItem>
          </SelectContent>
        </Select>
        <Button
          onClick={() => {
            setEditing(null)
            setDialogOpen(true)
          }}
          className="bg-[#005B2E] hover:bg-[#01361D] text-white"
        >
          <Plus className="w-4 h-4 mr-2" /> Nova Oportunidade
        </Button>
      </div>
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-3 min-w-max">
          {filteredStages.map((stage) => {
            const stageOpps = activeOpps.filter((o) => o.stage_id === stage.id)
            const stageValue = stageOpps.reduce(
              (s, o) => s + (parseFloat(o.estimated_value) || 0),
              0,
            )
            return (
              <div
                key={stage.id}
                className="w-72 shrink-0"
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(stage.id)}
              >
                <div
                  className="rounded-t-lg px-3 py-2 text-white"
                  style={{ backgroundColor: stage.color || '#005B2E' }}
                >
                  <p className="font-bold text-sm">{stage.name}</p>
                  <p className="text-xs opacity-90">
                    {stageOpps.length} • R${' '}
                    {stageValue.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                  </p>
                </div>
                <div className="bg-muted/30 rounded-b-lg p-2 space-y-2 min-h-[200px]">
                  {stageOpps.map((opp) => {
                    const overdue = isOverdue(opp.stage_entered_at, stage.sla_days)
                    return (
                      <Card
                        key={opp.id}
                        draggable
                        onDragStart={() => setDraggedId(opp.id)}
                        onDragEnd={() => setDraggedId(null)}
                        className={cn(
                          'cursor-grab active:cursor-grabbing border-2 transition-shadow hover:shadow-md',
                          overdue ? 'border-red-300' : 'border-border',
                          draggedId === opp.id && 'opacity-50',
                        )}
                        onClick={() => {
                          setEditing(opp)
                          setDialogOpen(true)
                        }}
                      >
                        <CardContent className="p-3 space-y-1">
                          <div className="flex items-start justify-between gap-1">
                            <p className="font-bold text-sm leading-tight">
                              {opp.client_name || '—'}
                            </p>
                            {overdue && <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />}
                          </div>
                          <p className="text-xs text-muted-foreground">{opp.title}</p>
                          <p className="text-sm font-bold text-[#005B2E]">
                            R${' '}
                            {(parseFloat(opp.estimated_value) || 0).toLocaleString('pt-BR', {
                              minimumFractionDigits: 2,
                            })}
                          </p>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{opp.responsible_name || '—'}</span>
                            <span>{opp.probability}%</span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">
                              {opp.expected_close_date || '—'}
                            </span>
                            <span
                              className={cn(
                                'font-semibold',
                                overdue ? 'text-red-500' : 'text-muted-foreground',
                              )}
                            >
                              {getTimeInStage(opp.stage_entered_at)}
                            </span>
                          </div>
                          {opp.next_action && (
                            <p className="text-xs text-blue-600 truncate">→ {opp.next_action}</p>
                          )}
                        </CardContent>
                      </Card>
                    )
                  })}
                  {stageOpps.length === 0 && (
                    <p className="text-center text-xs text-muted-foreground py-8">Vazio</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
      <CrmOpportunityDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        opportunity={editing}
        onSuccess={load}
      />
    </div>
  )
}
