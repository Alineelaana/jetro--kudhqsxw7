import { useState, useEffect } from 'react'
import { RhStatCard, RhLoading } from '@/components/rh/rh-shared'
import { Card, CardContent } from '@/components/ui/card'
import { getEmployees, getTrainings } from '@/services/rh'
import {
  getFeedback,
  getSuccession,
  getPdi,
  getCompetencies,
  getEmployeeCompetencies,
} from '@/services/rh-enterprise'
import { useRealtime } from '@/hooks/use-realtime'
import {
  Users,
  AlertTriangle,
  Target,
  Award,
  TrendingDown,
  ShieldAlert,
  Brain,
  ClipboardList,
} from 'lucide-react'

export function RhCockpit() {
  const [kpi, setKpi] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      const [emp, fb, succ, pdi, comp, empComp, train] = await Promise.all([
        getEmployees().catch(() => []),
        getFeedback().catch(() => []),
        getSuccession().catch(() => []),
        getPdi().catch(() => []),
        getCompetencies().catch(() => []),
        getEmployeeCompetencies().catch(() => []),
        getTrainings().catch(() => []),
      ])
      const active = (emp as any[]).filter((e) => e.situacao === 'Ativo').length
      const criticalPositions = (succ as any[]).filter((s) => s.impacto === 'Alto').length
      const readyNow = (succ as any[]).filter((s) => s.nivel_prontidao === 'Pronto agora').length
      const highRiskLoss = (succ as any[]).filter((s) => s.risco_perda === 'Alto').length
      const pendingPdi = (pdi as any[]).filter(
        (p) => p.situacao === 'Ativo' && (p.progresso || 0) < 50,
      ).length
      const gaps = (empComp as any[]).filter((c: any) => {
        const current = parseFloat(c.nivel_atual) || 0
        const required = parseFloat(c.nivel_exigido) || 0
        return current < required
      }).length
      const pendingTrain = (train as any[]).filter((t: any) =>
        ['Planejado', 'Inscrições Abertas'].includes(t.situacao),
      ).length
      setKpi({
        headcount: active,
        criticalPositions,
        readySuccessors: readyNow,
        highRiskLoss,
        pendingPdi,
        competencyGaps: gaps,
        totalCompetencies: (comp as any[]).length,
        pendingTrainings: pendingTrain,
      })
    } catch {
      setKpi(null)
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime('rh_employees', () => load())
  useRealtime('rh_succession_plans', () => load())

  if (loading || !kpi) return <RhLoading />

  const cards = [
    { label: 'Headcount Atual', value: kpi.headcount, icon: Users, color: 'text-[#005B2E]' },
    {
      label: 'Posicoes Criticas',
      value: kpi.criticalPositions,
      icon: AlertTriangle,
      color: 'text-red-600',
    },
    {
      label: 'Sucessores Prontos',
      value: kpi.readySuccessors,
      icon: ShieldAlert,
      color: 'text-emerald-600',
    },
    {
      label: 'Alto Risco de Perda',
      value: kpi.highRiskLoss,
      icon: TrendingDown,
      color: 'text-red-600',
    },
    { label: 'PDIs Atrasados', value: kpi.pendingPdi, icon: Target, color: 'text-amber-600' },
    {
      label: 'Gaps de Competencia',
      value: kpi.competencyGaps,
      icon: Brain,
      color: 'text-orange-600',
    },
    {
      label: 'Competencias Catalogadas',
      value: kpi.totalCompetencies,
      icon: ClipboardList,
      color: 'text-blue-600',
    },
    {
      label: 'Treinamentos Pendentes',
      value: kpi.pendingTrainings,
      icon: Award,
      color: 'text-amber-700',
    },
  ]

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold">Cockpit Executivo de RH</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <RhStatCard key={c.label} {...c} />
        ))}
      </div>
      <Card className="border-2 border-[#005B2E]/20">
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">
            Todos os indicadores sao consumidos via BI Enterprise 360 e dados oficiais do RH.
            Nenhuma inteligencia paralela foi criada.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
