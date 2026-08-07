import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Loader2,
  RefreshCw,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  HelpCircle,
} from 'lucide-react'
import {
  getMonitoringEntries,
  getMonitoringSummary,
  type SummaryData,
} from '@/services/platform-monitoring'
import type { PlatformMonitoringEntry } from '@/lib/platform-layer-types'
import { useRealtime } from '@/hooks/use-realtime'
import { cn } from '@/lib/utils'

type SummaryData = Awaited<ReturnType<typeof getMonitoringSummary>>

const STATUS_CONFIG = {
  healthy: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', label: 'Saudável' },
  degraded: { icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50', label: 'Degradado' },
  down: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', label: 'Indisponível' },
  unknown: { icon: HelpCircle, color: 'text-gray-500', bg: 'bg-gray-50', label: 'Desconhecido' },
}

const TYPE_LABELS: Record<string, string> = {
  cron: 'Cron Jobs',
  job: 'Jobs',
  queue: 'Filas',
  integration: 'Integrações',
  webhook: 'Webhooks',
  ai: 'IA',
  bi: 'BI',
  cache: 'Cache',
  workflow: 'Workflows',
  notification: 'Notificações',
  scheduler: 'Agendador',
}

export function PlatformMonitoringPanel() {
  const [entries, setEntries] = useState<PlatformMonitoringEntry[]>([])
  const [summary, setSummary] = useState<SummaryData | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const [e, s] = await Promise.all([getMonitoringEntries(), getMonitoringSummary()])
      setEntries(e)
      setSummary(s)
    } catch {
      /* noop */
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])
  useRealtime('platform_monitoring', () => load())

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-[#005B2E]" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-[#005B2E]" />
          <h2 className="text-xl font-bold text-foreground">Monitoramento da Plataforma</h2>
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

      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <Card className="border-2 border-[#005B2E]/20">
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-[#005B2E]">{summary.total}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </CardContent>
          </Card>
          <Card className="border-2 border-green-200">
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-green-600">{summary.healthy}</p>
              <p className="text-xs text-muted-foreground">Saudáveis</p>
            </CardContent>
          </Card>
          <Card className="border-2 border-amber-200">
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-amber-600">{summary.degraded}</p>
              <p className="text-xs text-muted-foreground">Degradados</p>
            </CardContent>
          </Card>
          <Card className="border-2 border-red-200">
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-red-600">{summary.down}</p>
              <p className="text-xs text-muted-foreground">Indisponíveis</p>
            </CardContent>
          </Card>
          <Card className="border-2 border-gray-200">
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-gray-500">{summary.unknown}</p>
              <p className="text-xs text-muted-foreground">Desconhecidos</p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="space-y-2">
        {entries.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              Nenhum serviço monitorado registrado.
            </CardContent>
          </Card>
        ) : (
          entries.map((entry) => {
            const cfg = STATUS_CONFIG[entry.status] || STATUS_CONFIG.unknown
            const Icon = cfg.icon
            return (
              <Card
                key={entry.id}
                className={cn('border-l-4', cfg.bg)}
                style={{
                  borderLeftColor:
                    entry.status === 'healthy'
                      ? '#16a34a'
                      : entry.status === 'degraded'
                        ? '#d97706'
                        : entry.status === 'down'
                          ? '#dc2626'
                          : '#9ca3af',
                }}
              >
                <CardContent className="p-3 flex items-center gap-3">
                  <Icon className={cn('w-5 h-5 shrink-0', cfg.color)} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm truncate">{entry.service_name}</p>
                      <Badge variant="outline" className="text-xs">
                        {TYPE_LABELS[entry.service_type] || entry.service_type}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {entry.last_run_at
                        ? `Última execução: ${new Date(entry.last_run_at).toLocaleString('pt-BR')}`
                        : 'Sem execução registrada'}
                      {entry.next_run_at
                        ? ` | Próxima: ${new Date(entry.next_run_at).toLocaleString('pt-BR')}`
                        : ''}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <Badge className={cn('text-xs', cfg.color)} variant="secondary">
                      {cfg.label}
                    </Badge>
                    {entry.error_count > 0 && (
                      <p className="text-xs text-red-500 mt-1">{entry.error_count} erros</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
