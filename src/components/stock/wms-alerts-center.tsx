import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, AlertTriangle, CheckCheck, RefreshCw, ShieldAlert } from 'lucide-react'
import { getWmsOperationalAlerts, updateWmsOperationalAlert, scanWmsAlerts } from '@/services/wms'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import { toast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

const ALERT_TYPES = [
  'receipt_delayed',
  'putaway_pending',
  'picking_below_min',
  'separation_delayed',
  'receiving_divergence',
  'expedition_divergence',
  'product_expired',
  'product_expiring',
  'lot_blocked',
  'location_full',
  'inventory_pending',
  'task_stopped',
  'collector_offline',
]

const SEVERITY_STYLES: Record<string, { badge: string; icon: string }> = {
  info: { badge: 'bg-blue-100 text-blue-700', icon: 'text-blue-600' },
  warning: { badge: 'bg-amber-100 text-amber-700', icon: 'text-amber-600' },
  critical: { badge: 'bg-red-100 text-red-700', icon: 'text-red-600' },
}

export function WmsAlertsCenter() {
  const { user } = useAuth()
  const [alerts, setAlerts] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)
  const [resolving, setResolving] = useState<string | null>(null)
  const [filterType, setFilterType] = useState('all')
  const [filterSeverity, setFilterSeverity] = useState('all')
  const [filterStatus, setFilterStatus] = useState('open')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const parts: string[] = []
      if (filterType !== 'all') parts.push(`tipo = "${filterType}"`)
      if (filterSeverity !== 'all') parts.push(`severidade = "${filterSeverity}"`)
      if (filterStatus === 'open') parts.push('resolved = false')
      if (filterStatus === 'resolved') parts.push('resolved = true')
      if (startDate) parts.push(`created >= "${startDate}"`)
      if (endDate) parts.push(`created <= "${endDate}"`)
      const filter = parts.length > 0 ? parts.join(' && ') : undefined
      setAlerts(await getWmsOperationalAlerts(filter))
    } catch {
      setAlerts([])
    }
    setLoading(false)
  }, [filterType, filterSeverity, filterStatus, startDate, endDate])

  useEffect(() => {
    load()
  }, [load])
  useRealtime('wms_operational_alerts', () => load())

  const handleResolve = async (id: string) => {
    setResolving(id)
    try {
      const resolverName = (user?.name as string) || 'Usuário'
      await updateWmsOperationalAlert(id, {
        resolved: true,
        resolved_by: resolverName,
        resolved_at: new Date().toISOString(),
      })
      toast({ title: 'Alerta resolvido' })
      load()
    } catch {
      toast({ title: 'Erro ao resolver alerta', variant: 'destructive' })
    }
    setResolving(null)
  }

  const handleMarkRead = async (id: string) => {
    try {
      await updateWmsOperationalAlert(id, { read: true })
      load()
    } catch {
      /* noop */
    }
  }

  const handleScan = async () => {
    try {
      await scanWmsAlerts()
      toast({ title: 'Varredura de alertas concluída' })
      load()
    } catch {
      toast({ title: 'Erro na varredura', variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-xl font-black text-foreground flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-[#005B2E]" /> Alertas Operacionais WMS
        </h2>
        <Button
          onClick={handleScan}
          size="sm"
          className="bg-[#005B2E] hover:bg-[#01361D] text-white"
        >
          <RefreshCw className="w-4 h-4 mr-1" /> Escanear Alertas
        </Button>
      </div>

      <Card className="border-2 border-[#005B2E]/20 p-4">
        <div className="flex flex-wrap gap-2">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              {ALERT_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterSeverity} onValueChange={setFilterSeverity}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Severidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="info">Info</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="open">Em aberto</SelectItem>
              <SelectItem value="resolved">Resolvidos</SelectItem>
            </SelectContent>
          </Select>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-40"
          />
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-40"
          />
        </div>
      </Card>

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
            const sev = SEVERITY_STYLES[alert.severidade as string] || SEVERITY_STYLES.warning
            return (
              <Card
                key={alert.id as string}
                className={cn('border-2 border-[#005B2E]/10', alert.resolved ? 'opacity-60' : '')}
              >
                <CardContent className="py-3 flex items-start gap-3">
                  <AlertTriangle className={cn('w-5 h-5 shrink-0 mt-0.5', sev.icon)} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={sev.badge}>{alert.severidade as string}</Badge>
                      <span className="text-sm font-semibold">{alert.tipo as string}</span>
                      {alert.resolved && (
                        <Badge variant="outline" className="text-green-600">
                          Resolvido
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{alert.mensagem as string}</p>
                    <div className="text-xs text-muted-foreground mt-1">
                      {new Date(alert.created as string).toLocaleString('pt-BR')}
                      {alert.resolved_by && ` · Resolvido por: ${alert.resolved_by}`}
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {!alert.read && !alert.resolved && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleMarkRead(alert.id as string)}
                        className="text-blue-600"
                      >
                        Marcar lido
                      </Button>
                    )}
                    {!alert.resolved && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleResolve(alert.id as string)}
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
