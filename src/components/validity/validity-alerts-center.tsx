import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, Search, Eye, CheckCheck, Clock, XCircle, AlertTriangle } from 'lucide-react'
import { getValidityAlerts, validityAlertAction } from '@/services/validity-alerts'
import { getValidityRules } from '@/services/validity-rules'
import { useRealtime } from '@/hooks/use-realtime'
import { toast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import type { ValidityAlert, ValidityRule } from '@/lib/validity-types'

const CRIT_STYLES: Record<string, string> = {
  Informativo: 'bg-blue-100 text-blue-700',
  Atenção: 'bg-amber-100 text-amber-700',
  Urgente: 'bg-orange-100 text-orange-700',
  Crítico: 'bg-red-100 text-red-700',
  Vencido: 'bg-red-200 text-red-900',
}

export function ValidityAlertsCenter() {
  const [alerts, setAlerts] = useState<ValidityAlert[]>([])
  const [rules, setRules] = useState<Record<string, ValidityRule>>({})
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [fStatus, setFStatus] = useState('all')
  const [fCrit, setFCrit] = useState('all')
  const [fModule, setFModule] = useState('all')
  const [acting, setActing] = useState<string | null>(null)
  const [timelineAlert, setTimelineAlert] = useState<ValidityAlert | null>(null)
  const [snoozeAlert, setSnoozeAlert] = useState<ValidityAlert | null>(null)
  const [ignoreAlert, setIgnoreAlert] = useState<ValidityAlert | null>(null)
  const [snoozeDate, setSnoozeDate] = useState('')
  const [ignoreText, setIgnoreText] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [a, r] = await Promise.all([
        getValidityAlerts({
          status: fStatus !== 'all' ? fStatus : undefined,
          criticidade: fCrit !== 'all' ? fCrit : undefined,
          module: fModule !== 'all' ? fModule : undefined,
          search: search || undefined,
        }),
        getValidityRules(),
      ])
      setAlerts(a)
      const map: Record<string, ValidityRule> = {}
      r.forEach((rule) => {
        map[rule.id] = rule
      })
      setRules(map)
    } catch {
      setAlerts([])
    }
    setLoading(false)
  }, [fStatus, fCrit, fModule, search])

  useEffect(() => {
    load()
  }, [load])
  useRealtime('validity_alerts', () => load())

  const doAction = async (id: string, action: string, just?: string, date?: string) => {
    setActing(id)
    try {
      await validityAlertAction(id, action, just, date)
      toast({ title: 'Ação registrada' })
      load()
    } catch {
      toast({ title: 'Erro', variant: 'destructive' })
    }
    setActing(null)
  }

  return (
    <div className="space-y-4">
      <Card className="border-2 border-[#005B2E]/20 p-4">
        <div className="flex flex-wrap gap-2">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar..."
              className="pl-10 focus-visible:ring-[#005B2E]"
            />
          </div>
          <Select value={fStatus} onValueChange={setFStatus}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {['Novo', 'Visualizado', 'Em Tratamento', 'Resolvido', 'Ignorado', 'Vencido'].map(
                (s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ),
              )}
            </SelectContent>
          </Select>
          <Select value={fCrit} onValueChange={setFCrit}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Criticidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {['Informativo', 'Atenção', 'Urgente', 'Crítico', 'Vencido'].map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={fModule} onValueChange={setFModule}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Módulo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {[
                'estoque',
                'rh',
                'sst',
                'logistica',
                'comercial',
                'administrativo',
                'financeiro',
              ].map((m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
          {alerts.map((a) => (
            <Card
              key={a.id}
              className={cn(
                'border-2 border-[#005B2E]/10',
                a.status === 'Resolvido' || a.status === 'Ignorado' ? 'opacity-60' : '',
              )}
            >
              <CardContent className="py-3 flex items-start gap-3">
                <AlertTriangle
                  className={cn(
                    'w-5 h-5 shrink-0 mt-0.5',
                    a.criticidade === 'Vencido' || a.criticidade === 'Crítico'
                      ? 'text-red-600'
                      : a.criticidade === 'Urgente'
                        ? 'text-orange-600'
                        : 'text-amber-600',
                  )}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className={CRIT_STYLES[a.criticidade] || ''}>{a.criticidade}</Badge>
                    <span className="text-sm font-semibold">{a.entity_name}</span>
                    <Badge variant="outline">{a.module}</Badge>
                    {a.status !== 'Novo' && <Badge variant="outline">{a.status}</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Vencimento:{' '}
                    {a.validity_date ? new Date(a.validity_date).toLocaleDateString('pt-BR') : '—'}{' '}
                    · Dias restantes: {a.days_remaining < 0 ? 'Vencido' : a.days_remaining}
                  </p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setTimelineAlert(a)}
                    className="text-[#005B2E]"
                  >
                    <Eye className="w-3.5 h-3.5 mr-1" />
                    Detalhes
                  </Button>
                  {a.status !== 'Resolvido' && a.status !== 'Ignorado' && (
                    <>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => doAction(a.id, 'view')}
                        disabled={acting === a.id}
                        className="text-blue-600"
                      >
                        <Clock className="w-3.5 h-3.5 mr-1" />
                        Ver
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => doAction(a.id, 'treat')}
                        disabled={acting === a.id}
                        className="text-amber-600"
                      >
                        Tratar
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSnoozeAlert(a)}
                        disabled={acting === a.id}
                        className="text-purple-600"
                      >
                        Adiar
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => doAction(a.id, 'resolve')}
                        disabled={acting === a.id}
                        className="text-green-600"
                      >
                        <CheckCheck className="w-3.5 h-3.5 mr-1" />
                        Resolver
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setIgnoreAlert(a)}
                        disabled={acting === a.id}
                        className="text-red-600"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!timelineAlert} onOpenChange={() => setTimelineAlert(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#005B2E]">
              Linha do Tempo — {timelineAlert?.entity_name}
            </DialogTitle>
          </DialogHeader>
          {timelineAlert && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <strong>Tipo:</strong> {timelineAlert.entity_type}
                </div>
                <div>
                  <strong>Módulo:</strong> {timelineAlert.module}
                </div>
                <div>
                  <strong>Validade:</strong>{' '}
                  {timelineAlert.validity_date
                    ? new Date(timelineAlert.validity_date).toLocaleDateString('pt-BR')
                    : '—'}
                </div>
                <div>
                  <strong>Dias restantes:</strong>{' '}
                  {timelineAlert.days_remaining < 0 ? 'Vencido' : timelineAlert.days_remaining}
                </div>
                <div>
                  <strong>Status:</strong> {timelineAlert.status}
                </div>
                <div>
                  <strong>Criticidade:</strong> {timelineAlert.criticidade}
                </div>
              </div>
              {timelineAlert.metadata && Object.keys(timelineAlert.metadata).length > 0 && (
                <div className="text-sm">
                  <strong>Metadados:</strong> {JSON.stringify(timelineAlert.metadata)}
                </div>
              )}
              <div>
                <h4 className="font-bold text-sm mb-2">Histórico de Ações</h4>
                <div className="space-y-1">
                  {(timelineAlert.timeline || []).map((t, i) => (
                    <div key={i} className="text-xs border-l-2 border-[#005B2E]/30 pl-3 py-1">
                      <span className="font-semibold">{String(t.action || '')}</span> —{' '}
                      {t.user ? String(t.user) : 'Sistema'} ·{' '}
                      {new Date(String(t.timestamp)).toLocaleString('pt-BR')}
                      {t.justification ? (
                        <div className="text-muted-foreground">
                          Justificativa: {String(t.justification)}
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!snoozeAlert}
        onOpenChange={() => {
          setSnoozeAlert(null)
          setSnoozeDate('')
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adiar Alerta</DialogTitle>
          </DialogHeader>
          <Input type="date" value={snoozeDate} onChange={(e) => setSnoozeDate(e.target.value)} />
          <div className="flex gap-2 justify-end mt-2">
            <Button
              variant="outline"
              onClick={() => {
                setSnoozeAlert(null)
                setSnoozeDate('')
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={() => {
                if (snoozeAlert && snoozeDate) {
                  doAction(snoozeAlert.id, 'snooze', undefined, snoozeDate)
                  setSnoozeAlert(null)
                  setSnoozeDate('')
                }
              }}
              className="bg-[#005B2E] hover:bg-[#01361D] text-white"
            >
              Adiar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!ignoreAlert}
        onOpenChange={() => {
          setIgnoreAlert(null)
          setIgnoreText('')
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ignorar Alerta</DialogTitle>
          </DialogHeader>
          <Textarea
            value={ignoreText}
            onChange={(e) => setIgnoreText(e.target.value)}
            placeholder="Justificativa obrigatória..."
            rows={3}
          />
          <div className="flex gap-2 justify-end mt-2">
            <Button
              variant="outline"
              onClick={() => {
                setIgnoreAlert(null)
                setIgnoreText('')
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={() => {
                if (ignoreAlert && ignoreText) {
                  doAction(ignoreAlert.id, 'ignore', ignoreText)
                  setIgnoreAlert(null)
                  setIgnoreText('')
                }
              }}
              disabled={!ignoreText}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Ignorar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
