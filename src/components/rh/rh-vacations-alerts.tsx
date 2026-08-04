import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { getEmployees, getVacations } from '@/services/rh'
import { useRealtime } from '@/hooks/use-realtime'
import { AlertTriangle, CalendarClock, Users, CalendarX } from 'lucide-react'

interface VacationAlert {
  type: string
  message: string
  severity: 'Alta' | 'Média' | 'Baixa'
}

export function RhVacationsAlerts() {
  const [alerts, setAlerts] = useState<VacationAlert[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      const [emp, vac] = await Promise.all([
        getEmployees().catch(() => []),
        getVacations().catch(() => []),
      ])
      const newAlerts: VacationAlert[] = []
      const now = new Date()
      const thirtyDaysFromNow = new Date(now.getTime() + 30 * 86400000)

      for (const v of vac as any[]) {
        if (v.situacao === 'Vencida') {
          newAlerts.push({
            type: 'vencida',
            message: `Férias vencidas: ${v.employee_name}`,
            severity: 'Alta',
          })
        }
        if (v.situacao === 'Disponível' && v.data_prevista) {
          const prev = new Date(v.data_prevista)
          if (prev <= thirtyDaysFromNow && prev >= now) {
            newAlerts.push({
              type: 'proxima',
              message: `Férias próximas do vencimento: ${v.employee_name}`,
              severity: 'Média',
            })
          }
        }
      }

      const byDept = new Map<string, any[]>()
      for (const v of vac as any[]) {
        if (!['Aprovada', 'Em Andamento'].includes(v.situacao)) continue
        const e = (emp as any[]).find((e) => e.nome_completo === v.employee_name)
        const dept = e?.departamento || '—'
        if (!byDept.has(dept)) byDept.set(dept, [])
        byDept.get(dept)!.push(v)
      }
      byDept.forEach((vs, dept) => {
        const active = vs.filter((v) => {
          if (!v.data_inicio || !v.data_fim) return false
          return new Date(v.data_inicio) <= now && new Date(v.data_fim) >= now
        })
        if (active.length > 1) {
          newAlerts.push({
            type: 'conflito',
            message: `Conflito de férias em ${dept}: ${active.length} colaboradores`,
            severity: 'Média',
          })
        }
        const deptEmps = (emp as any[]).filter(
          (e) => e.departamento === dept && e.situacao === 'Ativo',
        )
        const minPeople = Math.ceil(deptEmps.length * 0.5)
        if (active.length >= minPeople && deptEmps.length > 1) {
          newAlerts.push({
            type: 'minimo',
            message: `${dept}: quantidade mínima de pessoas em férias`,
            severity: 'Alta',
          })
        }
      })

      setAlerts(newAlerts)
    } catch {
      setAlerts([])
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime('rh_vacations', () => load())

  if (loading || alerts.length === 0) return null

  const colorMap: Record<string, string> = {
    Alta: 'border-red-300 bg-red-50 text-red-700',
    Média: 'border-amber-300 bg-amber-50 text-amber-700',
    Baixa: 'border-blue-300 bg-blue-50 text-blue-700',
  }
  const iconMap: Record<string, typeof AlertTriangle> = {
    vencida: CalendarX,
    proxima: CalendarClock,
    conflito: Users,
    minimo: AlertTriangle,
  }

  return (
    <Card className="border-2 border-amber-400/30 mb-4">
      <CardContent className="p-4">
        <h4 className="font-bold text-[#005B2E] mb-2 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" /> Alertas de Férias ({alerts.length})
        </h4>
        <div className="space-y-2">
          {alerts.map((a, i) => {
            const Icon = iconMap[a.type] || AlertTriangle
            return (
              <div
                key={i}
                className={`flex items-center gap-2 p-2 rounded border ${colorMap[a.severity]}`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="text-sm">{a.message}</span>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
