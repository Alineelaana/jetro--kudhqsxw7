import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import { getUpcomingEvents } from '@/services/platform-agenda'
import { getMkSocialPosts } from '@/services/marketing'
import type { PlatformAgendaEvent } from '@/lib/platform-layer-types'
import { cn } from '@/lib/utils'

export function MarketingEditorialCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState<PlatformAgendaEvent[]>([])
  const [posts, setPosts] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const [ev, sp] = await Promise.all([
        getUpcomingEvents(90).catch(() => []),
        getMkSocialPosts().catch(() => []),
      ])
      setEvents(ev)
      setPosts(sp)
    } catch {
      setEvents([])
      setPosts([])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const y = currentDate.getFullYear()
  const m = currentDate.getMonth()
  const firstDay = new Date(y, m, 1).getDay()
  const daysInMonth = new Date(y, m + 1, 0).getDate()
  const cells: Array<number | null> = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  const getItemsForDate = (dateStr: string) => {
    const evs = events.filter((e) => (e.start_date || '').split('T')[0] === dateStr)
    const sps = posts.filter((p) => ((p.planned_date as string) || '').split('T')[0] === dateStr)
    return { evs, sps }
  }

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Calendar className="w-8 h-8 text-[#005B2E] animate-pulse" />
      </div>
    )

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-[#005B2E]">Calendário Editorial</h2>
        <span className="text-xs text-muted-foreground">
          Reutiliza a Agenda Corporativa — sem calendário paralelo
        </span>
      </div>
      <div className="flex items-center justify-between mb-2">
        <Button variant="ghost" size="sm" onClick={() => setCurrentDate(new Date(y, m - 1, 1))}>
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <span className="font-bold text-sm capitalize">
          {currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
        </span>
        <Button variant="ghost" size="sm" onClick={() => setCurrentDate(new Date(y, m + 1, 1))}>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((d) => (
          <div key={d} className="text-center text-xs font-bold p-1">
            {d}
          </div>
        ))}
        {cells.map((day, i) => {
          const dateStr = day
            ? `${y}-${String(m + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
            : ''
          const { evs, sps } = day ? getItemsForDate(dateStr) : { evs: [], sps: [] }
          return (
            <div key={i} className={cn('min-h-[70px] border rounded p-1', !day && 'bg-muted/30')}>
              {day && (
                <>
                  <div
                    className={cn(
                      'text-xs font-bold',
                      dateStr === new Date().toISOString().split('T')[0] && 'text-[#005B2E]',
                    )}
                  >
                    {day}
                  </div>
                  {evs.slice(0, 2).map((e) => (
                    <div
                      key={e.id}
                      className="text-[10px] bg-blue-100 text-blue-700 rounded px-1 py-0.5 mb-0.5 truncate"
                    >
                      {e.title}
                    </div>
                  ))}
                  {sps.slice(0, 2).map((s, si) => (
                    <div
                      key={si}
                      className="text-[10px] bg-purple-100 text-purple-700 rounded px-1 py-0.5 mb-0.5 truncate"
                    >
                      {(s.channel as string) || 'Social'}
                    </div>
                  ))}
                  {evs.length + sps.length > 4 && (
                    <div className="text-[10px] text-muted-foreground">
                      +{evs.length + sps.length - 4} mais
                    </div>
                  )}
                </>
              )}
            </div>
          )
        })}
      </div>
      <Card>
        <CardContent className="p-3 text-xs text-muted-foreground">
          <span className="inline-block w-3 h-3 bg-blue-100 rounded mr-1" /> Agenda Corporativa
        </CardContent>
      </Card>
    </div>
  )
}
