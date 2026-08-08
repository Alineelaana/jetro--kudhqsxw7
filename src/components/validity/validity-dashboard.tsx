import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, AlertTriangle, CalendarClock, CalendarX } from 'lucide-react'
import { getValidityDashboardStats, getValidityAlerts } from '@/services/validity-alerts'
import { useRealtime } from '@/hooks/use-realtime'
import { cn } from '@/lib/utils'
import type { ValidityAlert } from '@/lib/validity-types'

const RANGES = [
  { key: 'expired', label: 'Vencidos', color: '#dc2626', icon: CalendarX },
  { key: 'today', label: 'Hoje', color: '#ea580c', icon: CalendarClock },
  { key: 'days7', label: '7 dias', color: '#f59e0b', icon: CalendarClock },
  { key: 'days15', label: '15 dias', color: '#eab308', icon: CalendarClock },
  { key: 'days30', label: '30 dias', color: '#84cc16', icon: CalendarClock },
  { key: 'days60', label: '60 dias', color: '#22c55e', icon: CalendarClock },
  { key: 'days90', label: '90 dias', color: '#3b82f6', icon: CalendarClock },
]

export function ValidityDashboard() {
  const [stats, setStats] = useState<Record<string, number>>({})
  const [drillDown, setDrillDown] = useState<string | null>(null)
  const [drillAlerts, setDrillAlerts] = useState<ValidityAlert[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setStats(await getValidityDashboardStats())
    } catch {
      setStats({})
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])
  useRealtime('validity_alerts', () => load())

  const handleDrillDown = async (range: string) => {
    if (drillDown === range) {
      setDrillDown(null)
      return
    }
    setDrillDown(range)
    try {
      const all = await getValidityAlerts()
      const filtered = all.filter((a) => {
        const d = a.days_remaining
        if (range === 'expired') return d < 0
        if (range === 'today') return d === 0
        if (range === 'days7') return d > 0 && d <= 7
        if (range === 'days15') return d > 7 && d <= 15
        if (range === 'days30') return d > 15 && d <= 30
        if (range === 'days60') return d > 30 && d <= 60
        if (range === 'days90') return d > 60 && d <= 90
        return false
      })
      setDrillAlerts(filtered)
    } catch {
      setDrillAlerts([])
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
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
        {RANGES.map((r) => {
          const Icon = r.icon
          return (
            <Card
              key={r.key}
              className="border-2 cursor-pointer hover:shadow-lg transition-shadow"
              style={{ borderColor: `${r.color}33` }}
              onClick={() => handleDrillDown(r.key)}
            >
              <CardContent className="pt-4 text-center">
                <Icon className="w-5 h-5 mx-auto mb-1" style={{ color: r.color }} />
                <p className="text-2xl font-black" style={{ color: r.color }}>
                  {stats[r.key] || 0}
                </p>
                <p className="text-[10px] text-muted-foreground">{r.label}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card className="border-2 border-[#005B2E]/20">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-[#005B2E]">Total de Alertas Ativos</h3>
            <span className="text-2xl font-black text-[#005B2E]">{stats.total || 0}</span>
          </div>
        </CardContent>
      </Card>

      {drillDown && (
        <Card className="border-2 border-[#005B2E]/20">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-[#005B2E]">
                Detalhe: {RANGES.find((r) => r.key === drillDown)?.label}
              </h3>
              <Button size="sm" variant="ghost" onClick={() => setDrillDown(null)}>
                Fechar
              </Button>
            </div>
            {drillAlerts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhum alerta neste intervalo.
              </p>
            ) : (
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {drillAlerts.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center gap-2 p-2 rounded border border-border"
                  >
                    <AlertTriangle
                      className={cn(
                        'w-4 h-4 shrink-0',
                        a.criticidade === 'Vencido' ? 'text-red-600' : 'text-amber-600',
                      )}
                    />
                    <span className="text-sm font-medium flex-1">{a.entity_name}</span>
                    <Badge variant="outline">{a.module}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {a.days_remaining < 0 ? 'Vencido' : `${a.days_remaining}d`}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
