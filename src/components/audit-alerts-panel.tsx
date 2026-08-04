import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, AlertTriangle, CheckCheck, Eye, ShieldAlert } from 'lucide-react'
import { getAuditAlerts, resolveAuditAlert, type AuditAlert } from '@/services/audit-alerts'
import { useRealtime } from '@/hooks/use-realtime'
import { toast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

interface Props {
  onViewLog: (logId: string) => void
}

const SEVERITY_STYLES: Record<string, { badge: string; bg: string }> = {
  info: { badge: 'bg-blue-100 text-blue-700', bg: 'bg-blue-50/50' },
  warning: { badge: 'bg-amber-100 text-amber-700', bg: 'bg-amber-50/50' },
  critical: { badge: 'bg-red-100 text-red-700', bg: 'bg-red-50/50' },
}

export function AuditAlertsPanel({ onViewLog }: Props) {
  const [alerts, setAlerts] = useState<AuditAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [resolving, setResolving] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'open' | 'resolved'>('open')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const resolved = filter === 'open' ? false : filter === 'resolved' ? true : undefined
      setAlerts(await getAuditAlerts(resolved))
    } catch {
      setAlerts([])
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => {
    load()
  }, [load])
  useRealtime('audit_alerts', () => load())

  const handleResolve = async (id: string) => {
    setResolving(id)
    try {
      await resolveAuditAlert(id)
      toast({ title: 'Alerta resolvido' })
      load()
    } catch {
      toast({ title: 'Erro ao resolver alerta', variant: 'destructive' })
    }
    setResolving(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black text-foreground flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-[#005B2E]" /> Central de Alertas
        </h2>
        <div className="flex gap-1">
          {(['open', 'resolved', 'all'] as const).map((f) => (
            <Button
              key={f}
              size="sm"
              variant={filter === f ? 'default' : 'outline'}
              onClick={() => setFilter(f)}
              className={
                filter === f ? 'bg-[#005B2E] hover:bg-[#01361D] text-white' : 'border-[#005B2E]/30'
              }
            >
              {f === 'open' ? 'Em aberto' : f === 'resolved' ? 'Resolvidos' : 'Todos'}
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
        </div>
      ) : alerts.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="py-12 text-center text-muted-foreground">
            Nenhum alerta encontrado.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {alerts.map((alert) => {
            const sev = SEVERITY_STYLES[alert.severity] || SEVERITY_STYLES.warning
            return (
              <Card key={alert.id} className={cn('border-2 border-[#005B2E]/10', sev.bg)}>
                <CardContent className="py-3 flex items-start gap-3">
                  <AlertTriangle
                    className={cn(
                      'w-5 h-5 shrink-0 mt-0.5',
                      alert.severity === 'critical'
                        ? 'text-red-600'
                        : alert.severity === 'warning'
                          ? 'text-amber-600'
                          : 'text-blue-600',
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={sev.badge}>{alert.severity}</Badge>
                      <span className="text-sm font-semibold">{alert.alert_type}</span>
                      {alert.resolved && (
                        <Badge variant="outline" className="text-green-600">
                          Resolvido
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{alert.description}</p>
                    <div className="text-xs text-muted-foreground mt-1">
                      {new Date(alert.created).toLocaleString('pt-BR')}
                      {alert.resolved_by && ` · Resolvido por: ${alert.resolved_by}`}
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {alert.audit_log_id && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onViewLog(alert.audit_log_id)}
                        className="border-[#005B2E] text-[#005B2E]"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" /> Analisar
                      </Button>
                    )}
                    {!alert.resolved && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleResolve(alert.id)}
                        disabled={resolving === alert.id}
                        className="text-green-600 hover:bg-green-50"
                      >
                        {resolving === alert.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <CheckCheck className="w-3.5 h-3.5 mr-1" />
                        )}
                        Resolver
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
