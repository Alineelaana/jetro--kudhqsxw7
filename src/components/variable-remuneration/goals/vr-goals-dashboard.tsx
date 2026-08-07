import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getGoals, getAwards } from '@/services/variable-remuneration'
import { useRealtime } from '@/hooks/use-realtime'
import {
  parseNum,
  formatCurrency,
  getGoalStatusVisual,
  calcProjection,
} from '@/lib/variable-remuneration-types'
import { Loader2, Target, TrendingUp, Calendar, Award, AlertTriangle } from 'lucide-react'

export function VrGoalsDashboard() {
  const [goals, setGoals] = useState<any[]>([])
  const [awards, setAwards] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      const [g, a] = await Promise.all([getGoals(), getAwards()])
      setGoals(g)
      setAwards(a)
    } catch {
      setGoals([])
      setAwards([])
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime('sales_goals', () => load())
  useRealtime('goal_awards', () => load())

  const stats = useMemo(() => {
    const now = new Date()
    let totalTarget = 0,
      totalRealized = 0,
      totalProjected = 0
    let atRisk = 0,
      aboveGoal = 0
    goals
      .filter((g) => g.status === 'ativa')
      .forEach((g) => {
        const target = parseNum(g.target_value)
        const realized = parseNum(g.realized_value)
        const end = new Date(g.end_date || now)
        const start = new Date(g.start_date || now)
        const totalDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / 86400000))
        const daysRemaining = Math.max(0, Math.ceil((end.getTime() - now.getTime()) / 86400000))
        const daysElapsed = totalDays - daysRemaining
        const proj = calcProjection(realized, daysElapsed, daysRemaining)
        totalTarget += target
        totalRealized += realized
        totalProjected += proj.projected
        const pct = target > 0 ? (realized / target) * 100 : 0
        const timePct = totalDays > 0 ? ((totalDays - daysRemaining) / totalDays) * 100 : 100
        if (pct < timePct * 0.7) atRisk++
        if (pct >= 100) aboveGoal++
      })
    const totalAwardPrevisto = awards.reduce((s, a) => s + parseNum(a.previsto), 0)
    const totalAwardConquistado = awards.reduce((s, a) => s + parseNum(a.conquistado), 0)
    const totalAwardPago = awards.reduce((s, a) => s + parseNum(a.pago), 0)
    return {
      totalTarget,
      totalRealized,
      totalProjected,
      atRisk,
      aboveGoal,
      totalAwardPrevisto,
      totalAwardConquistado,
      totalAwardPago,
      premiados: awards.length,
    }
  }, [goals, awards])

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )

  const pct = stats.totalTarget > 0 ? (stats.totalRealized / stats.totalTarget) * 100 : 0
  const cards = [
    {
      label: 'Meta Total',
      value: `R$ ${formatCurrency(stats.totalTarget)}`,
      icon: Target,
      color: '#005B2E',
    },
    {
      label: 'Realizado',
      value: `R$ ${formatCurrency(stats.totalRealized)}`,
      icon: TrendingUp,
      color: '#C89B3C',
    },
    { label: '% Atingido', value: `${pct.toFixed(1)}%`, icon: TrendingUp, color: '#22c55e' },
    {
      label: 'Projeção',
      value: `R$ ${formatCurrency(stats.totalProjected)}`,
      icon: Calendar,
      color: '#3b82f6',
    },
    {
      label: 'Premiação Prevista',
      value: `R$ ${formatCurrency(stats.totalAwardPrevisto)}`,
      icon: Award,
      color: '#8b5cf6',
    },
    {
      label: 'Premiação Conquistada',
      value: `R$ ${formatCurrency(stats.totalAwardConquistado)}`,
      icon: Award,
      color: '#f59e0b',
    },
    { label: 'Vendedores em Risco', value: stats.atRisk, icon: AlertTriangle, color: '#ef4444' },
    { label: 'Acima da Meta', value: stats.aboveGoal, icon: TrendingUp, color: '#10b981' },
  ]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {cards.map((c, i) => (
          <Card key={i} className="border-2" style={{ borderColor: `${c.color}33` }}>
            <CardContent className="py-3 px-4 flex items-center gap-2">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${c.color}1A` }}
              >
                <c.icon className="w-4 h-4" style={{ color: c.color }} />
              </div>
              <div className="min-w-0">
                <p className="text-base font-black text-foreground truncate">{c.value}</p>
                <p className="text-[10px] text-muted-foreground">{c.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="border-2 border-[#005B2E]/30">
        <CardHeader>
          <CardTitle className="text-base">Metas Ativas — Status</CardTitle>
        </CardHeader>
        <CardContent>
          {goals.filter((g) => g.status === 'ativa').length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">Nenhuma meta ativa</p>
          ) : (
            <div className="space-y-3">
              {goals
                .filter((g) => g.status === 'ativa')
                .map((g) => {
                  const target = parseNum(g.target_value)
                  const realized = parseNum(g.realized_value)
                  const pct = target > 0 ? (realized / target) * 100 : 0
                  const now = new Date()
                  const end = new Date(g.end_date || now)
                  const start = new Date(g.start_date || now)
                  const totalDays = Math.max(
                    1,
                    Math.ceil((end.getTime() - start.getTime()) / 86400000),
                  )
                  const daysRemaining = Math.max(
                    0,
                    Math.ceil((end.getTime() - now.getTime()) / 86400000),
                  )
                  const daysElapsed = totalDays - daysRemaining
                  const proj = calcProjection(realized, daysElapsed, daysRemaining)
                  const visual = getGoalStatusVisual(target, realized, daysRemaining, totalDays)
                  const dailyNeeded = daysRemaining > 0 ? (target - realized) / daysRemaining : 0
                  return (
                    <div key={g.id} className="p-3 rounded-lg border border-border">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-sm">{g.name}</span>
                        <span className={`text-sm ${visual.color}`}>
                          {visual.icon} {visual.label}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                        <span>
                          Meta: <strong>R$ {formatCurrency(target)}</strong>
                        </span>
                        <span>
                          Realizado: <strong>R$ {formatCurrency(realized)}</strong>
                        </span>
                        <span>
                          Projeção: <strong>R$ {formatCurrency(proj.projected)}</strong>
                        </span>
                        <span>{daysRemaining} dias restantes</span>
                        <span>
                          Média diária: <strong>R$ {formatCurrency(proj.dailyAvg)}</strong>
                        </span>
                        <span>
                          Necessário/dia: <strong>R$ {formatCurrency(dailyNeeded)}</strong>
                        </span>
                        <span>{pct.toFixed(1)}% atingido</span>
                        <span>
                          Faltam:{' '}
                          <strong>R$ {formatCurrency(Math.max(0, target - realized))}</strong>
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden mt-2">
                        <div
                          className={`h-full rounded-full ${pct >= 100 ? 'bg-emerald-500' : pct >= 50 ? 'bg-[#005B2E]' : 'bg-amber-500'}`}
                          style={{ width: `${Math.min(100, pct)}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
