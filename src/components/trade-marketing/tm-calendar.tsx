import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  ACTION_STATUS,
  STATUS_COLORS,
  PRIORITY_COLORS,
  type TradeMarketingAction,
  type CalendarView,
} from '@/lib/trade-marketing-types'

interface TmCalendarProps {
  actions: TradeMarketingAction[]
  onEdit: (action: TradeMarketingAction) => void
  initialView?: CalendarView
}

export function TmCalendar({ actions, onEdit, initialView }: TmCalendarProps) {
  const [view, setView] = useState<CalendarView>(initialView || 'month')
  const [currentDate, setCurrentDate] = useState(new Date())

  const viewButtons: Array<{ id: CalendarView; label: string }> = [
    { id: 'month', label: 'Mês' },
    { id: 'week', label: 'Semana' },
    { id: 'list', label: 'Lista' },
    { id: 'kanban', label: 'Kanban' },
  ]

  const getActionsForDate = (dateStr: string) =>
    actions.filter((a) => {
      const start = (a.start_date || '').split(' ')[0]
      const end = (a.end_date || a.start_date || '').split(' ')[0]
      return start <= dateStr && dateStr <= end
    })

  const renderMonth = () => {
    const y = currentDate.getFullYear()
    const m = currentDate.getMonth()
    const firstDay = new Date(y, m, 1).getDay()
    const daysInMonth = new Date(y, m + 1, 0).getDate()
    const cells: Array<number | null> = []
    for (let i = 0; i < firstDay; i++) cells.push(null)
    for (let d = 1; d <= daysInMonth; d++) cells.push(d)
    return (
      <div>
        <div className="flex items-center justify-between mb-2">
          <Button variant="ghost" size="sm" onClick={() => setCurrentDate(new Date(y, m - 1, 1))}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="font-bold text-sm">
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
            const dayActions = day ? getActionsForDate(dateStr) : []
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
                    {dayActions.slice(0, 3).map((a) => (
                      <div
                        key={a.id}
                        onClick={() => onEdit(a)}
                        className={cn(
                          'text-[10px] cursor-pointer rounded px-1 py-0.5 mb-0.5 truncate',
                          STATUS_COLORS[a.status],
                        )}
                      >
                        {a.title}
                      </div>
                    ))}
                    {dayActions.length > 3 && (
                      <div className="text-[10px] text-muted-foreground">
                        +{dayActions.length - 3} mais
                      </div>
                    )}
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const renderWeek = () => {
    const weekStart = new Date(currentDate)
    weekStart.setDate(weekStart.getDate() - weekStart.getDay())
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 6)
    const weekActions = actions.filter((a) => {
      const start = new Date(a.start_date || '')
      return start >= weekStart && start <= weekEnd
    })
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between mb-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const d = new Date(currentDate)
              d.setDate(d.getDate() - 7)
              setCurrentDate(d)
            }}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="font-bold text-sm">
            {weekStart.toLocaleDateString('pt-BR')} - {weekEnd.toLocaleDateString('pt-BR')}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const d = new Date(currentDate)
              d.setDate(d.getDate() + 7)
              setCurrentDate(d)
            }}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        {weekActions.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">
            Nenhuma ação nesta semana.
          </p>
        ) : (
          weekActions.map((a) => (
            <Card
              key={a.id}
              className="border-l-4 border-[#005B2E]/40 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => onEdit(a)}
            >
              <CardContent className="p-3 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm">{a.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {a.start_date} • {a.responsible_name || '—'}
                  </p>
                </div>
                <span className={cn('text-xs px-2 py-1 rounded', STATUS_COLORS[a.status])}>
                  {ACTION_STATUS.find((s) => s.value === a.status)?.label}
                </span>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    )
  }

  const renderList = () => (
    <Card className="border-2 border-[#005B2E]/20 overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-[#01361D] text-white">
            <th className="text-left px-3 py-2">Título</th>
            <th className="text-left px-3 py-2">Tipo</th>
            <th className="text-left px-3 py-2">Status</th>
            <th className="text-left px-3 py-2">Início</th>
            <th className="text-left px-3 py-2">Resp.</th>
            <th className="text-left px-3 py-2">Fornecedor</th>
            <th className="text-left px-3 py-2">Orçamento</th>
          </tr>
        </thead>
        <tbody>
          {actions.length === 0 ? (
            <tr>
              <td colSpan={7} className="text-center py-8 text-muted-foreground">
                Nenhuma ação encontrada.
              </td>
            </tr>
          ) : (
            actions.map((a) => (
              <tr
                key={a.id}
                className="border-b border-border hover:bg-[#005B2E]/5 cursor-pointer"
                onClick={() => onEdit(a)}
              >
                <td className="px-3 py-2 font-medium">{a.title}</td>
                <td className="px-3 py-2 text-xs">{a.action_type}</td>
                <td className="px-3 py-2">
                  <span className={cn('text-xs px-2 py-0.5 rounded', STATUS_COLORS[a.status])}>
                    {ACTION_STATUS.find((s) => s.value === a.status)?.label}
                  </span>
                </td>
                <td className="px-3 py-2 text-xs">{a.start_date}</td>
                <td className="px-3 py-2 text-xs">{a.responsible_name || '—'}</td>
                <td className="px-3 py-2 text-xs">{a.supplier || '—'}</td>
                <td className="px-3 py-2 text-xs">R$ {a.budget_planned || '0'}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </Card>
  )

  const renderKanban = () => {
    const statuses = ACTION_STATUS.filter((s) => s.value !== 'cancelado')
    return (
      <div className="flex gap-2 overflow-x-auto pb-2">
        {statuses.map((s) => {
          const items = actions.filter((a) => a.status === s.value)
          return (
            <div key={s.value} className="min-w-[180px] shrink-0">
              <div
                className={cn('text-xs font-bold px-2 py-1 rounded mb-1', STATUS_COLORS[s.value])}
              >
                {s.label} ({items.length})
              </div>
              <div className="space-y-1">
                {items.map((a) => (
                  <Card
                    key={a.id}
                    className="border rounded p-2 cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => onEdit(a)}
                  >
                    <p className="text-xs font-bold">{a.title}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {a.start_date} • {a.responsible_name || '—'}
                    </p>
                    {a.supplier && <p className="text-[10px] text-[#005B2E]">{a.supplier}</p>}
                  </Card>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-1">
        {viewButtons.map((vb) => (
          <Button
            key={vb.id}
            variant={view === vb.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setView(vb.id)}
            className={cn(view === vb.id && 'bg-[#005B2E] hover:bg-[#01361D]')}
          >
            {vb.label}
          </Button>
        ))}
      </div>
      {view === 'month' && renderMonth()}
      {view === 'week' && renderWeek()}
      {view === 'list' && renderList()}
      {view === 'kanban' && renderKanban()}
    </div>
  )
}
