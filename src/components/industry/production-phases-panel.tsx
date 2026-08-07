import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ListOrdered, Loader2, Play, Pause, Check, RotateCcw, DollarSign } from 'lucide-react'
import { getPhases, getPhaseCosts } from '@/services/industrial-phases'
import { getProductionOrders } from '@/services/production-orders'
import { transitionPhase, feedPhaseCosts, performQualityCheck } from '@/services/industrial-flow'
import { useRealtime } from '@/hooks/use-realtime'
import { toast } from '@/hooks/use-toast'
import type { IndustrialPhase, IndustrialPhaseCost } from '@/lib/industrial-flow-types'
import type { ProductionOrder } from '@/services/production-orders'

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-600',
  in_progress: 'bg-amber-100 text-amber-700',
  paused: 'bg-orange-100 text-orange-700',
  completed: 'bg-emerald-100 text-emerald-700',
  rework: 'bg-red-100 text-red-700',
  skipped: 'bg-blue-100 text-blue-700',
}
const QUALITY_COLORS: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-600',
  approved: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-red-100 text-red-700',
  rework: 'bg-orange-100 text-orange-700',
  conditional: 'bg-amber-100 text-amber-700',
}

export function ProductionPhasesPanel() {
  const [orders, setOrders] = useState<ProductionOrder[]>([])
  const [phases, setPhases] = useState<IndustrialPhase[]>([])
  const [costs, setCosts] = useState<Record<string, IndustrialPhaseCost[]>>({})
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<string>('')

  const load = async () => {
    try {
      const o = await getProductionOrders()
      setOrders(o)
      if (o.length > 0 && !selectedOrder) {
        setSelectedOrder(o[0].id)
        const p = await getPhases(o[0].id)
        setPhases(p)
        for (const ph of p) {
          const c = await getPhaseCosts(ph.id)
          setCosts((prev) => ({ ...prev, [ph.id]: c }))
        }
      } else if (selectedOrder) {
        const p = await getPhases(selectedOrder)
        setPhases(p)
      }
    } catch {
      /* ignore */
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])
  useRealtime('industrial_phases', () => {
    if (selectedOrder) load()
  })

  const handleOrderChange = async (orderId: string) => {
    setSelectedOrder(orderId)
    try {
      const p = await getPhases(orderId)
      setPhases(p)
      setCosts({})
      for (const ph of p) {
        const c = await getPhaseCosts(ph.id)
        setCosts((prev) => ({ ...prev, [ph.id]: c }))
      }
    } catch {
      /* ignore */
    }
  }

  const handleTransition = async (phaseId: string, status: string) => {
    try {
      await transitionPhase(phaseId, status)
      toast({ title: 'Fase atualizada' })
      load()
    } catch {
      toast({ title: 'Erro ao atualizar fase', variant: 'destructive' })
    }
  }

  const handleCostFeed = async (phaseId: string) => {
    try {
      await feedPhaseCosts(phaseId)
      toast({ title: 'Custos alimentados' })
      load()
    } catch {
      toast({ title: 'Erro ao alimentar custos', variant: 'destructive' })
    }
  }

  const handleQuality = async (phaseId: string, result: string) => {
    try {
      await performQualityCheck(phaseId, result)
      toast({ title: 'Qualidade registrada' })
      load()
    } catch {
      toast({ title: 'Erro ao registrar qualidade', variant: 'destructive' })
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
      <div className="flex items-center gap-3">
        <ListOrdered className="w-6 h-6 text-[#005B2E]" />
        <h2 className="text-xl font-black text-foreground">Fases de Produção</h2>
      </div>
      <Select value={selectedOrder} onValueChange={handleOrderChange}>
        <SelectTrigger className="focus-visible:ring-[#005B2E]">
          <SelectValue placeholder="Selecione uma OP..." />
        </SelectTrigger>
        <SelectContent>
          {orders.map((o) => (
            <SelectItem key={o.id} value={o.id}>
              {o.order_number}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="space-y-3">
        {phases.map((ph) => (
          <Card key={ph.id} className="border-2 border-[#005B2E]/20">
            <CardContent className="py-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-mono">
                    #{ph.sequence}
                  </Badge>
                  <span className="font-bold text-sm">{ph.operation_name}</span>
                  {ph.work_center && (
                    <span className="text-xs text-muted-foreground">{ph.work_center}</span>
                  )}
                </div>
                <div className="flex gap-1">
                  <Badge className={STATUS_COLORS[ph.status] || 'bg-gray-100'}>{ph.status}</Badge>
                  <Badge className={QUALITY_COLORS[ph.quality_status] || 'bg-gray-100'}>
                    Q: {ph.quality_status}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs mb-2">
                <div>
                  <span className="text-muted-foreground">Operador:</span>{' '}
                  <span className="font-medium">{ph.operator_name || '—'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Equipe:</span>{' '}
                  <span className="font-medium">{ph.team_name || '—'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Previsto:</span>{' '}
                  <span className="font-medium">{ph.expected_time_minutes || 0}min</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Real:</span>{' '}
                  <span className="font-medium">{ph.actual_time_minutes || 0}min</span>
                </div>
              </div>
              {costs[ph.id] && costs[ph.id].length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {costs[ph.id].map((c) => (
                    <Badge key={c.id} variant="outline" className="text-xs">
                      {c.cost_type}: R$ {c.amount}
                    </Badge>
                  ))}
                </div>
              )}
              <div className="flex flex-wrap gap-1">
                {ph.status === 'pending' && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs"
                    onClick={() => handleTransition(ph.id, 'in_progress')}
                  >
                    <Play className="w-3 h-3 mr-1" />
                    Iniciar
                  </Button>
                )}
                {ph.status === 'in_progress' && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs"
                    onClick={() => handleTransition(ph.id, 'paused')}
                  >
                    <Pause className="w-3 h-3 mr-1" />
                    Pausar
                  </Button>
                )}
                {ph.status === 'in_progress' && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs"
                    onClick={() => handleTransition(ph.id, 'completed')}
                  >
                    <Check className="w-3 h-3 mr-1" />
                    Concluir
                  </Button>
                )}
                {ph.status === 'paused' && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs"
                    onClick={() => handleTransition(ph.id, 'in_progress')}
                  >
                    <Play className="w-3 h-3 mr-1" />
                    Retomar
                  </Button>
                )}
                {ph.status === 'completed' && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs text-red-600"
                    onClick={() => handleTransition(ph.id, 'rework')}
                  >
                    <RotateCcw className="w-3 h-3 mr-1" />
                    Retrabalho
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs"
                  onClick={() => handleCostFeed(ph.id)}
                >
                  <DollarSign className="w-3 h-3 mr-1" />
                  Custos
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs text-emerald-600"
                  onClick={() => handleQuality(ph.id, 'approved')}
                >
                  Aprovar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs text-red-600"
                  onClick={() => handleQuality(ph.id, 'rejected')}
                >
                  Rejeitar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {phases.length === 0 && (
          <p className="text-center py-6 text-muted-foreground">
            Nenhuma fase encontrada para esta OP.
          </p>
        )}
      </div>
    </div>
  )
}
