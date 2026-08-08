import { useState, useEffect } from 'react'
import { RhStatCard, RhLoading } from '@/components/rh/rh-shared'
import { getFeedback, getPdi, getRecognitions } from '@/services/rh-enterprise'
import { getEmployees, getTrainings } from '@/services/rh'
import { useRealtime } from '@/hooks/use-realtime'
import { TrendingUp, Heart, Award, Target, Activity, Users } from 'lucide-react'

export function RhEngajamento() {
  const [kpi, setKpi] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      const [emp, feedback, pdi, rec, train] = await Promise.all([
        getEmployees().catch(() => []),
        getFeedback().catch(() => []),
        getPdi().catch(() => []),
        getRecognitions().catch(() => []),
        getTrainings().catch(() => []),
      ])
      const activeEmp = (emp as any[]).filter((e) => e.situacao === 'Ativo').length
      const positiveFb = (feedback as any[]).filter((f) =>
        ['Positivo', 'Reconhecimento'].includes(f.tipo),
      ).length
      const activePdi = (pdi as any[]).filter((p) => p.situacao === 'Ativo').length
      const recognitions = (rec as any[]).filter((r) => r.situacao === 'Ativo').length
      const completedTrain = (train as any[]).filter((t) => t.situacao === 'Concluído').length
      setKpi({
        activeEmployees: activeEmp,
        positiveFeedback: positiveFb,
        activePdi,
        recognitions,
        completedTrainings: completedTrain,
        engagementScore:
          activeEmp > 0 ? Math.round(((positiveFb + recognitions) / activeEmp) * 100) : 0,
      })
    } catch {
      setKpi(null)
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime('rh_feedback', () => load())
  useRealtime('rh_recognitions', () => load())

  if (loading || !kpi) return <RhLoading />

  const cards = [
    {
      label: 'Colaboradores Ativos',
      value: kpi.activeEmployees,
      icon: Users,
      color: 'text-[#005B2E]',
    },
    {
      label: 'Feedbacks Positivos',
      value: kpi.positiveFeedback,
      icon: Heart,
      color: 'text-pink-600',
    },
    { label: 'PDIs Ativos', value: kpi.activePdi, icon: Target, color: 'text-blue-600' },
    { label: 'Reconhecimentos', value: kpi.recognitions, icon: Award, color: 'text-amber-600' },
    {
      label: 'Treinamentos Concluidos',
      value: kpi.completedTrainings,
      icon: Activity,
      color: 'text-emerald-600',
    },
    {
      label: 'Score de Engajamento',
      value: `${kpi.engagementScore}%`,
      icon: TrendingUp,
      color: 'text-[#C89B3C]',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {cards.map((c) => (
        <RhStatCard key={c.label} {...c} />
      ))}
    </div>
  )
}
