import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getKpis, getScores, getAlerts } from '@/services/performance'
import type { PerformanceKpi, PerformanceScore, PerformanceAlert } from '@/lib/performance-types'
import { MODULE_LABELS } from '@/lib/performance-types'

export function PerformanceCenter({ module }: { module: string }) {
  const [kpis, setKpis] = useState<PerformanceKpi[]>([])
  const [scores, setScores] = useState<PerformanceScore[]>([])
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [k, s, a] = await Promise.all([getKpis(module), getScores(), getAlerts(false)])
        setKpis(k)
        setScores(
          s.filter((sc) => {
            const comps = sc.components as Record<string, unknown>
            return comps?.module === module
          }),
        )
        setAlerts(a.filter((al) => al.module === module))
      } catch {
        /* empty */
      }
      setLoading(false)
    }
    load()
  }, [module])

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )

  const latestScore = scores[0]?.score ?? 0

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-bold text-[#005B2E]">{MODULE_LABELS[module] || module}</h2>
        <Badge
          className={cn(
            latestScore >= 70 ? 'bg-green-500' : latestScore >= 40 ? 'bg-yellow-500' : 'bg-red-500',
            'text-white',
          )}
        >
          Score: {Math.round(latestScore)}
        </Badge>
      </div>

      {scores.length > 0 && (
        <Card className="border-2 border-[#005B2E]/20">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all',
                    latestScore >= 70
                      ? 'bg-green-500'
                      : latestScore >= 40
                        ? 'bg-yellow-500'
                        : 'bg-red-500',
                  )}
                  style={{ width: `${latestScore}%` }}
                />
              </div>
              <span className="text-2xl font-bold text-[#005B2E]">{Math.round(latestScore)}</span>
            </div>
            {scores[0]?.components && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">
                {Object.entries(
                  (scores[0].components as Record<string, Record<string, unknown>>)?.metrics || {},
                ).map(([k, v]) => (
                  <div key={k} className="text-center p-2 rounded bg-muted/50">
                    <p className="text-xs text-muted-foreground">{k}</p>
                    <p className="text-sm font-bold">
                      {typeof v === 'number' ? v.toFixed(2) : String(v)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Indicadores (KPIs)</CardTitle>
        </CardHeader>
        <CardContent>
          {kpis.length === 0 ? (
            <p className="text-xs text-muted-foreground">Nenhum KPI cadastrado para este módulo</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {kpis.map((kpi) => (
                <div
                  key={kpi.id}
                  className="flex items-center justify-between p-2 rounded border border-border"
                >
                  <div>
                    <p className="text-sm font-medium">{kpi.name}</p>
                    <p className="text-xs text-muted-foreground">{kpi.formula_source}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {kpi.unit}
                    </Badge>
                    <Badge
                      variant={kpi.direction === 'higher_is_better' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {kpi.direction === 'higher_is_better' ? '↑' : '↓'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Alertas do Módulo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {alerts.map((a) => (
              <div key={a.id} className="p-2 rounded border border-border">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      'w-2 h-2 rounded-full',
                      a.severity === 'critical'
                        ? 'bg-red-500'
                        : a.severity === 'warning'
                          ? 'bg-yellow-500'
                          : 'bg-blue-500',
                    )}
                  />
                  <p className="text-sm font-medium">{a.message}</p>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{a.reason}</p>
                <p className="text-xs text-[#005B2E] mt-1">→ {a.suggested_action}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
