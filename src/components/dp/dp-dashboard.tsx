import { useState, useEffect } from 'react'
import { DpStatCard, DpLoading } from '@/components/dp/dp-shared'
import { getEmployees, getTimeRecords, getVacations, getPayroll } from '@/services/rh'
import { useRealtime } from '@/hooks/use-realtime'
import {
  Users,
  UserPlus,
  Calendar,
  Clock,
  FileClock,
  AlertCircle,
  Wallet,
  FileCheck,
} from 'lucide-react'

export function DpDashboard() {
  const [kpi, setKpi] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      const [emp, time, vac, pay] = await Promise.all([
        getEmployees().catch(() => []),
        getTimeRecords().catch(() => []),
        getVacations().catch(() => []),
        getPayroll().catch(() => []),
      ])
      const now = new Date()
      setKpi({
        total: emp.length,
        active: emp.filter((e: any) => e.situacao === 'Ativo').length,
        admissions: emp.filter(
          (e: any) => e.data_admissao && new Date(e.data_admissao).getMonth() === now.getMonth(),
        ).length,
        onVacation: emp.filter((e: any) => e.situacao === 'Em Férias').length,
        pendingTime: time.filter((t: any) => t.situacao === 'Pendente').length,
        overtime: time.filter((t: any) => t.horas_extras && t.horas_extras !== '00:00').length,
        pendingPay: pay.filter((p: any) =>
          ['Em Preparação', 'Em Processamento', 'Aguardando Aprovação'].includes(p.situacao),
        ).length,
        overdueVac: vac.filter((v: any) => v.situacao === 'Vencida').length,
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
  useRealtime('rh_time_records', () => load())

  if (loading || !kpi) return <DpLoading />

  const cards = [
    { label: 'Total de Colaboradores', value: kpi.total, icon: Users, color: 'text-[#005B2E]' },
    {
      label: 'Colaboradores Ativos',
      value: kpi.active,
      icon: FileCheck,
      color: 'text-emerald-600',
    },
    { label: 'Admissões do Mês', value: kpi.admissions, icon: UserPlus, color: 'text-blue-600' },
    { label: 'Em Férias', value: kpi.onVacation, icon: Calendar, color: 'text-cyan-600' },
    { label: 'Pendências de Ponto', value: kpi.pendingTime, icon: Clock, color: 'text-amber-700' },
    { label: 'Horas Extras', value: kpi.overtime, icon: AlertCircle, color: 'text-orange-600' },
    { label: 'Folha Aguardando', value: kpi.pendingPay, icon: FileClock, color: 'text-amber-700' },
    { label: 'Férias Vencidas', value: kpi.overdueVac, icon: Wallet, color: 'text-red-600' },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {cards.map((c) => (
        <DpStatCard key={c.label} {...c} />
      ))}
    </div>
  )
}
