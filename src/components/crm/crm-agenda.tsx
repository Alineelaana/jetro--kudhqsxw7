import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getActivities, updateActivity } from '@/services/crm'
import { useRealtime } from '@/hooks/use-realtime'
import { AGENDA_VIEWS, ACTIVITY_TYPES, type CrmActivity } from '@/lib/crm-types'
import { Plus, Loader2, Clock, MapPin } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { CrmActivityDialog } from '@/components/crm/crm-activity-dialog'
import { cn } from '@/lib/utils'

const TYPE_COLORS: Record<string, string> = {
  Ligação: 'border-blue-400',
  Reunião: 'border-purple-400',
  Visita: 'border-green-400',
  'E-mail': 'border-cyan-400',
  WhatsApp: 'border-emerald-400',
  'Follow-up': 'border-amber-400',
}

export function CrmAgenda() {
  const [records, setRecords] = useState<CrmActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('Diária')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<CrmActivity | null>(null)

  const load = async () => {
    try {
      setRecords(await getActivities())
    } catch {
      setRecords([])
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime('crm_activities', () => load())

  const today = new Date().toISOString().split('T')[0]
  const weekStart = new Date()
  weekStart.setDate(weekStart.getDate() - weekStart.getDay())
  const weekStartStr = weekStart.toISOString().split('T')[0]
  const monthStr = selectedDate.substring(0, 7)

  const filtered = records
    .filter((r) => {
      if (!r.scheduled_date) return false
      if (view === 'Diária') return r.scheduled_date === selectedDate
      if (view === 'Semanal')
        return r.scheduled_date >= weekStartStr && r.scheduled_date <= selectedDate
      if (view === 'Mensal') return r.scheduled_date.startsWith(monthStr)
      return true
    })
    .sort((a, b) =>
      (a.scheduled_date + (a.scheduled_time || '')).localeCompare(
        b.scheduled_date + (b.scheduled_time || ''),
      ),
    )

  const grouped: Record<string, CrmActivity[]> = {}
  filtered.forEach((r) => {
    const key = view === 'Por Responsável' ? r.responsible_name || '—' : r.scheduled_date || '—'
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(r)
  })

  const handleConclude = async (r: CrmActivity) => {
    setEditing(r)
    setDialogOpen(true)
  }

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Select value={view} onValueChange={setView}>
            <SelectTrigger className="w-40 focus-visible:ring-[#005B2E]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {AGENDA_VIEWS.map((v) => (
                <SelectItem key={v} value={v}>
                  {v}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {view !== 'Por Responsável' && view !== 'Por Equipe' && (
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="h-9 rounded-md border border-input px-3 text-sm focus-visible:ring-[#005B2E]"
            />
          )}
        </div>
        <Button
          onClick={() => {
            setEditing(null)
            setDialogOpen(true)
          }}
          className="bg-[#005B2E] hover:bg-[#01361D] text-white"
        >
          <Plus className="w-4 h-4 mr-2" /> Nova Atividade
        </Button>
      </div>
      {Object.keys(grouped).length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="py-16 text-center">
            <Clock className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-lg font-bold">Nenhuma atividade para esta vista.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([group, items]) => (
            <div key={group}>
              <h3 className="text-sm font-bold text-[#005B2E] mb-2 sticky top-0 bg-background py-1">
                {view === 'Por Responsável' || view === 'Por Equipe'
                  ? group
                  : new Date(group + 'T00:00').toLocaleDateString('pt-BR', {
                      weekday: 'long',
                      day: '2-digit',
                      month: '2-digit',
                    })}
                <span className="ml-2 text-xs text-muted-foreground font-normal">
                  {items.length} atividade(s)
                </span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {items.map((r) => (
                  <Card
                    key={r.id}
                    className={cn(
                      'border-l-4 cursor-pointer hover:shadow-md transition-shadow',
                      TYPE_COLORS[r.type] || 'border-gray-300',
                    )}
                    onClick={() => handleConclude(r)}
                  >
                    <CardContent className="p-3 space-y-1">
                      <div className="flex items-start justify-between">
                        <p className="font-bold text-sm">{r.title}</p>
                        <span className="text-xs text-muted-foreground">
                          {r.scheduled_time || ''}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {r.type} • {r.client_name || '—'}
                      </p>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">{r.responsible_name || '—'}</span>
                        <span
                          className={cn(
                            'font-bold',
                            r.status === 'Concluída'
                              ? 'text-green-600'
                              : r.status === 'Cancelada'
                                ? 'text-red-600'
                                : 'text-blue-600',
                          )}
                        >
                          {r.status}
                        </span>
                      </div>
                      {r.priority === 'Urgente' && (
                        <span className="text-xs text-red-500 font-bold">⚠ Urgente</span>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      <CrmActivityDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        activity={editing}
        onSuccess={load}
      />
    </div>
  )
}
