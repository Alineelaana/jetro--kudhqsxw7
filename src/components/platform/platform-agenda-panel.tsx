import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, Calendar, Plus, MapPin, Clock } from 'lucide-react'
import { getUpcomingEvents, createAgendaEvent } from '@/services/platform-agenda'
import type { PlatformAgendaEvent } from '@/lib/platform-layer-types'
import { useRealtime } from '@/hooks/use-realtime'
import { toast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

const EVENT_TYPE_LABELS: Record<string, string> = {
  meeting: 'Reunião',
  visit: 'Visita',
  training: 'Treinamento',
  maintenance: 'Manutenção',
  production: 'Produção',
  approval: 'Aprovação',
  commitment: 'Compromisso',
  fiscal_deadline: 'Prazo Fiscal',
  rh_event: 'Evento RH',
  crm_activity: 'Atividade CRM',
  financial_deadline: 'Prazo Financeiro',
  project_milestone: 'Marco do Projeto',
  other: 'Outro',
}

const PRIORITY_COLORS: Record<string, string> = {
  low: 'bg-gray-100 text-gray-600',
  medium: 'bg-blue-100 text-blue-600',
  high: 'bg-amber-100 text-amber-600',
  critical: 'bg-red-100 text-red-600',
}

export function PlatformAgendaPanel() {
  const [events, setEvents] = useState<PlatformAgendaEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [startDate, setStartDate] = useState('')

  const load = useCallback(async () => {
    try {
      setEvents(await getUpcomingEvents(14))
    } catch {
      /* noop */
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])
  useRealtime('platform_agenda_events', () => load())

  const handleCreate = async () => {
    if (!title.trim() || !startDate) return
    try {
      await createAgendaEvent({
        title: title.trim(),
        event_type: 'other',
        module_origin: 'platform',
        start_date: startDate,
      })
      toast({ title: 'Evento criado' })
      setTitle('')
      setStartDate('')
      setShowForm(false)
      load()
    } catch {
      toast({ title: 'Erro ao criar evento', variant: 'destructive' })
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-[#005B2E]" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-[#005B2E]" />
          <h2 className="text-xl font-bold text-foreground">Agenda Corporativa</h2>
        </div>
        <Button
          size="sm"
          className="bg-[#005B2E] hover:bg-[#004524]"
          onClick={() => setShowForm(!showForm)}
        >
          <Plus className="w-4 h-4 mr-1" /> Novo Evento
        </Button>
      </div>

      {showForm && (
        <Card className="border-2 border-[#005B2E]/20">
          <CardContent className="p-3 space-y-2">
            <Input
              placeholder="Título do evento"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <Input
              type="datetime-local"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <Button size="sm" className="bg-[#005B2E] hover:bg-[#004524]" onClick={handleCreate}>
              Criar
            </Button>
          </CardContent>
        </Card>
      )}

      {events.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            Nenhum evento próximo.
          </CardContent>
        </Card>
      ) : (
        events.map((event) => (
          <Card key={event.id} className="border-l-4 border-[#005B2E]/30">
            <CardContent className="p-3 flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-sm">{event.title}</p>
                  <Badge variant="outline" className="text-xs">
                    {EVENT_TYPE_LABELS[event.event_type] || event.event_type}
                  </Badge>
                  {event.priority && event.priority !== 'low' && (
                    <Badge className={cn('text-xs', PRIORITY_COLORS[event.priority])}>
                      {event.priority}
                    </Badge>
                  )}
                </div>
                {event.description && (
                  <p className="text-xs text-muted-foreground mt-1">{event.description}</p>
                )}
                <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(event.start_date).toLocaleString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  {event.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {event.location}
                    </span>
                  )}
                  {event.assigned_name && <span>• {event.assigned_name}</span>}
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}
