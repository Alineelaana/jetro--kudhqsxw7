import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Loader2, CheckCircle, XCircle, ArrowRight, Ban } from 'lucide-react'
import { getWorkflows, advanceWorkflow, cancelWorkflow } from '@/services/platform-workflow'
import type { PlatformWorkflow, WorkflowStep } from '@/lib/platform-layer-types'
import { useRealtime } from '@/hooks/use-realtime'
import { toast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

const STATUS_CONFIG: Record<string, { color: string; label: string }> = {
  pending: { color: 'bg-gray-100 text-gray-700', label: 'Pendente' },
  in_progress: { color: 'bg-blue-100 text-blue-700', label: 'Em Andamento' },
  approved: { color: 'bg-green-100 text-green-700', label: 'Aprovado' },
  rejected: { color: 'bg-red-100 text-red-700', label: 'Rejeitado' },
  cancelled: { color: 'bg-gray-100 text-gray-500', label: 'Cancelado' },
  completed: { color: 'bg-green-100 text-green-700', label: 'Concluído' },
}

export function PlatformWorkflowPanel() {
  const [workflows, setWorkflows] = useState<PlatformWorkflow[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setWorkflows(await getWorkflows())
    } catch {
      /* noop */
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])
  useRealtime('platform_workflows', () => load())

  const handleAdvance = async (id: string, action: 'approve' | 'reject' | 'execute' | 'close') => {
    setBusy(id)
    try {
      await advanceWorkflow(id, action)
      toast({ title: 'Workflow atualizado' })
      load()
    } catch {
      toast({ title: 'Erro ao atualizar workflow', variant: 'destructive' })
    }
    setBusy(null)
  }

  const handleCancel = async (id: string) => {
    setBusy(id)
    try {
      await cancelWorkflow(id, 'Cancelado pelo usuário')
      toast({ title: 'Workflow cancelado' })
      load()
    } catch {
      toast({ title: 'Erro ao cancelar', variant: 'destructive' })
    }
    setBusy(null)
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-[#005B2E]" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-foreground">Workflow Engine Corporativo</h2>
      {workflows.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            Nenhum workflow ativo.
          </CardContent>
        </Card>
      ) : (
        workflows.map((wf) => {
          const cfg = STATUS_CONFIG[wf.status] || STATUS_CONFIG.pending
          const steps = wf.steps as WorkflowStep[]
          const currentIdx = steps.findIndex((s) => s.key === wf.current_step)
          return (
            <Card key={wf.id} className="border-2 border-[#005B2E]/15">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{wf.entity_summary || wf.entity_type}</CardTitle>
                  <Badge className={cn('text-xs', cfg.color)}>{cfg.label}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {wf.entity_type} {wf.entity_number && `• ${wf.entity_number}`} •{' '}
                  {wf.module_origin}
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-1 flex-wrap">
                  {steps.map((step, idx) => {
                    const isCompleted = idx < currentIdx || wf.status === 'completed'
                    const isCurrent = idx === currentIdx && wf.status === 'in_progress'
                    return (
                      <div key={step.key} className="flex items-center">
                        <div
                          className={cn(
                            'flex items-center gap-1 px-2 py-1 rounded text-xs font-medium',
                            isCompleted && 'bg-green-100 text-green-700',
                            isCurrent && 'bg-[#005B2E] text-white',
                            !isCompleted && !isCurrent && 'bg-gray-100 text-gray-500',
                          )}
                        >
                          {isCompleted && <CheckCircle className="w-3 h-3" />}
                          {step.label}
                        </div>
                        {idx < steps.length - 1 && (
                          <ArrowRight className="w-3 h-3 mx-0.5 text-gray-400" />
                        )}
                      </div>
                    )
                  })}
                </div>
                {wf.status === 'in_progress' && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="bg-[#005B2E] hover:bg-[#004524]"
                      disabled={busy === wf.id}
                      onClick={() =>
                        handleAdvance(
                          wf.id,
                          steps[currentIdx]?.action === 'close' ? 'close' : 'approve',
                        )
                      }
                    >
                      {busy === wf.id ? (
                        <Loader2 className="w-3 h-3 animate-spin mr-1" />
                      ) : (
                        <CheckCircle className="w-3 h-3 mr-1" />
                      )}
                      Avançar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-300 text-red-600"
                      disabled={busy === wf.id}
                      onClick={() => handleAdvance(wf.id, 'reject')}
                    >
                      <XCircle className="w-3 h-3 mr-1" /> Rejeitar
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={busy === wf.id}
                      onClick={() => handleCancel(wf.id)}
                    >
                      <Ban className="w-3 h-3 mr-1" /> Cancelar
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })
      )}
    </div>
  )
}
