import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { RefreshCw, Loader2 } from 'lucide-react'
import { getHealthCheck } from '@/services/cop'
import { useRealtime } from '@/hooks/use-realtime'
import { cn } from '@/lib/utils'
import type { CopHealthResult } from '@/lib/cop-types'

const STATUS_STYLES = {
  healthy: { color: 'text-green-600', bg: 'bg-green-50', label: 'Saudável' },
  degraded: { color: 'text-amber-600', bg: 'bg-amber-50', label: 'Degradado' },
  down: { color: 'text-red-600', bg: 'bg-red-50', label: 'Indisponível' },
}

export function CopCockpit() {
  const [health, setHealth] = useState<CopHealthResult | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      setHealth(await getHealthCheck())
    } catch {
      /* noop */
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])
  useRealtime('audit_logs', () => load())
  useRealtime('audit_alerts', () => load())
  useRealtime('backups', () => load())

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )
  if (!health)
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Falha ao carregar dados de saúde.
        </CardContent>
      </Card>
    )

  const overallKey =
    health.overall === 'Saudável' ? 'healthy' : health.overall === 'Degradado' ? 'degraded' : 'down'
  const overallStyle = STATUS_STYLES[overallKey]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-black">Cockpit TI</h2>
          <Badge className={cn('text-sm', overallStyle.color)} variant="secondary">
            {overallStyle.label}
          </Badge>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={load}
          className="border-[#005B2E] text-[#005B2E]"
        >
          <RefreshCw className="w-4 h-4 mr-1" /> Atualizar
        </Button>
      </div>

      <Card className={cn('border-2', overallStyle.bg)}>
        <CardContent className="py-4">
          <p className="text-sm text-muted-foreground">Status Geral da Plataforma</p>
          <p className={cn('text-3xl font-black mt-1', overallStyle.color)}>{health.overall}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Atualizado: {new Date(health.timestamp).toLocaleString('pt-BR')}
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {Object.entries(health.metrics).map(([key, metric]) => {
          const style =
            STATUS_STYLES[metric.status as keyof typeof STATUS_STYLES] || STATUS_STYLES.healthy
          const borderColor =
            metric.status === 'healthy'
              ? '#16a34a'
              : metric.status === 'degraded'
                ? '#d97706'
                : '#dc2626'
          return (
            <Card
              key={key}
              className={cn('border-l-4', style.bg)}
              style={{ borderLeftColor: borderColor }}
            >
              <CardContent className="p-3">
                <p className="text-xs text-muted-foreground">{metric.label}</p>
                <p className={cn('text-lg font-bold mt-0.5', style.color)}>
                  {metric.value || metric.error || '—'}
                </p>
                <Badge className={cn('text-xs mt-1', style.color)} variant="secondary">
                  {style.label}
                </Badge>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {Object.keys(health.summary).length > 0 && (
        <Card className="border-2 border-[#005B2E]/20">
          <CardHeader>
            <CardTitle className="text-sm">Resumo Executivo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
              {Object.entries(health.summary).map(([key, val]) => (
                <div key={key} className="text-center p-2 rounded bg-muted/30">
                  <p className="text-lg font-bold text-[#005B2E]">{val}</p>
                  <p className="text-xs text-muted-foreground">{key.replace(/_/g, ' ')}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
