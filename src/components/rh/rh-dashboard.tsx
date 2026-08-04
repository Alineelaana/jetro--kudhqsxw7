import { useState, useEffect } from 'react'
import { RhStatCard, RhLoading } from '@/components/rh/rh-shared'
import {
  getEmployees,
  getTimeRecords,
  getVacations,
  getPayroll,
  getTrainings,
  getDocuments,
} from '@/services/rh'
import { useRealtime } from '@/hooks/use-realtime'
import {
  Users,
  UserCheck,
  UserX,
  Calendar,
  UserPlus,
  UserMinus,
  Cake,
  Clock,
  FileWarning,
  AlertCircle,
  FileClock,
  GraduationCap,
  CalendarClock,
} from 'lucide-react'

interface KpiData {
  total: number
  active: number
  away: number
  onVacation: number
  admissions: number
  dismissals: number
  birthdays: number
  upcomingVacations: number
  expiringDocs: number
  pendingTime: number
  overtimeHours: number
  absences: number
  pendingPayroll: number
  pendingTrainings: number
  expiredTrainings: number
}

export function RhDashboard() {
  const [kpi, setKpi] = useState<KpiData | null>(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      const [emp, time, vac, pay, train, docs] = await Promise.all([
        getEmployees().catch(() => []),
        getTimeRecords().catch(() => []),
        getVacations().catch(() => []),
        getPayroll().catch(() => []),
        getTrainings().catch(() => []),
        getDocuments().catch(() => []),
      ])
      const now = new Date()
      const month = now.getMonth()
      const active = emp.filter((e: any) => e.situacao === 'Ativo').length
      const away = emp.filter((e: any) => e.situacao === 'Afastado').length
      const onVac = emp.filter((e: any) => e.situacao === 'Em Férias').length
      const admissions = emp.filter((e: any) => {
        if (!e.data_admissao) return false
        const d = new Date(e.data_admissao)
        return d.getMonth() === month && d.getFullYear() === now.getFullYear()
      }).length
      const dismissals = emp.filter((e: any) => e.situacao === 'Desligado').length
      const birthdays = emp.filter((e: any) => {
        if (!e.data_nascimento) return false
        const d = new Date(e.data_nascimento)
        return d.getMonth() === month
      }).length
      const upcomingVac = vac.filter((v: any) =>
        ['Disponível', 'Programada'].includes(v.situacao),
      ).length
      const expiringDocs = docs.filter(
        (d: any) =>
          d.data_validade && new Date(d.data_validade) <= new Date(Date.now() + 30 * 86400000),
      ).length
      const pendingTime = time.filter((t: any) => t.situacao === 'Pendente').length
      const overtime = time.filter((t: any) => t.horas_extras).length
      const absences = time.filter((t: any) => t.faltas && t.faltas !== '00:00').length
      const pendingPay = pay.filter((p: any) =>
        [
          'Em Preparação',
          'Em Processamento',
          'Aguardando Conferência',
          'Aguardando Aprovação',
        ].includes(p.situacao),
      ).length
      const pendingTrain = train.filter((t: any) =>
        ['Planejado', 'Inscrições Abertas'].includes(t.situacao),
      ).length
      const expiredTrain = train.filter((t: any) => t.situacao === 'Cancelado').length
      setKpi({
        total: emp.length,
        active,
        away,
        onVacation: onVac,
        admissions,
        dismissals,
        birthdays,
        upcomingVacations: upcomingVac,
        expiringDocs,
        pendingTime,
        overtimeHours: overtime,
        absences,
        pendingPayroll: pendingPay,
        pendingTrainings: pendingTrain,
        expiredTrainings: expiredTrain,
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

  if (loading || !kpi) return <RhLoading />

  const cards = [
    { label: 'Total de Colaboradores', value: kpi.total, icon: Users, color: 'text-[#005B2E]' },
    {
      label: 'Colaboradores Ativos',
      value: kpi.active,
      icon: UserCheck,
      color: 'text-emerald-600',
    },
    { label: 'Colaboradores Afastados', value: kpi.away, icon: UserX, color: 'text-amber-600' },
    {
      label: 'Colaboradores em Férias',
      value: kpi.onVacation,
      icon: Calendar,
      color: 'text-cyan-600',
    },
    {
      label: 'Admissões no Período',
      value: kpi.admissions,
      icon: UserPlus,
      color: 'text-blue-600',
    },
    {
      label: 'Desligamentos no Período',
      value: kpi.dismissals,
      icon: UserMinus,
      color: 'text-red-600',
    },
    { label: 'Aniversariantes do Mês', value: kpi.birthdays, icon: Cake, color: 'text-pink-600' },
    {
      label: 'Férias Próximas',
      value: kpi.upcomingVacations,
      icon: CalendarClock,
      color: 'text-purple-600',
    },
    {
      label: 'Documentos Vencendo',
      value: kpi.expiringDocs,
      icon: FileWarning,
      color: 'text-orange-600',
    },
    { label: 'Pendências de Ponto', value: kpi.pendingTime, icon: Clock, color: 'text-amber-700' },
    {
      label: 'Horas Extras',
      value: kpi.overtimeHours,
      icon: AlertCircle,
      color: 'text-orange-600',
    },
    { label: 'Faltas e Atrasos', value: kpi.absences, icon: AlertCircle, color: 'text-red-600' },
    {
      label: 'Folha Aguardando',
      value: kpi.pendingPayroll,
      icon: FileClock,
      color: 'text-amber-700',
    },
    {
      label: 'Treinamentos Pendentes',
      value: kpi.pendingTrainings,
      icon: GraduationCap,
      color: 'text-blue-600',
    },
    {
      label: 'Treinamentos Vencidos',
      value: kpi.expiredTrainings,
      icon: GraduationCap,
      color: 'text-red-600',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {cards.map((c) => (
        <RhStatCard key={c.label} {...c} />
      ))}
    </div>
  )
}
