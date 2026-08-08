import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SstLoading, SstTable, SstStatusBadge } from '@/components/sst/sst-shared'
import { getConsolidatedObligations, type CalendarObligation } from '@/services/sst-calendar'
import { useRealtime } from '@/hooks/use-realtime'
import { CalendarClock, AlertTriangle, CheckCircle, Clock, Filter } from 'lucide-react'
import { cn } from '@/lib/utils'

const CATEGORIES = [
  'Obrigação',
  'Exames',
  'PGR',
  'LTCAT',
  'CIPA',
  'Treinamentos',
  'Inspeções',
  'Documentos',
  'Simulados',
] as const

export function SstObligationsCalendar() {
  const [records, setRecords] = useState<CalendarObligation[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')

  const load = async () => {
    try {
      const items = await getConsolidatedObligations()
      setRecords(items)
    } catch {
      setRecords([])
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime('sst_obligations', () => load())

  const filtered = useMemo(
    () => (filter === 'all' ? records : records.filter((r) => r.categoria === filter)),
    [records, filter],
  )

  if (loading) return <SstLoading />

  const now = new Date()
  const isDone = (s: string) => s === 'Concluída' || s === 'Concluído'
  const overdue = filtered.filter(
    (r) => r.data_prevista && new Date(r.data_prevista) < now && !isDone(r.situacao),
  )
  const upcoming = filtered.filter((r) => {
    if (!r.data_prevista || isDone(r.situacao)) return false
    const d = new Date(r.data_prevista)
    return d >= now && d <= new Date(now.getTime() + 30 * 86400000)
  })
  const done = filtered.filter((r) => isDone(r.situacao))
  const pending = filtered.filter((r) =>
    ['Pendente', 'Agendada', 'Planejada', 'Planejado'].includes(r.situacao),
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <CalendarClock className="w-5 h-5 text-[#005B2E]" />
        <h3 className="text-lg font-bold">Calendário de Obrigações SST</h3>
        <span className="text-xs text-muted-foreground ml-2">
          ({filtered.length} itens consolidados)
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Atrasadas', value: overdue.length, icon: AlertTriangle, color: 'text-red-600' },
          { label: 'Próximas (30d)', value: upcoming.length, icon: Clock, color: 'text-amber-600' },
          { label: 'Pendentes', value: pending.length, icon: Clock, color: 'text-blue-600' },
          { label: 'Concluídas', value: done.length, icon: CheckCircle, color: 'text-emerald-600' },
        ].map((s) => {
          const Icon = s.icon
          return (
            <Card key={s.label} className="border-2 border-[#005B2E]/20">
              <CardContent className="flex items-center gap-2 p-3">
                <Icon className={cn('w-5 h-5', s.color)} />
                <div>
                  <p className="text-lg font-black">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
          className={cn(filter === 'all' && 'bg-[#005B2E] hover:bg-[#01361D]')}
        >
          <Filter className="w-3 h-3 mr-1" /> Todas
        </Button>
        {CATEGORIES.map((cat) => (
          <Button
            key={cat}
            variant={filter === cat ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(cat)}
            className={cn(filter === cat && 'bg-[#005B2E] hover:bg-[#01361D]')}
          >
            {cat}
          </Button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="py-16 text-center">
            <CalendarClock className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-lg font-bold">Nenhuma obrigação encontrada</p>
            <p className="text-sm text-muted-foreground mt-1">
              Dados de exames, PGR, LTCAT, CIPA, treinamentos, inspeções, documentos e simulados
              aparecerão aqui.
            </p>
          </CardContent>
        </Card>
      ) : (
        <SstTable
          headers={[
            'Título',
            'Categoria',
            'Tipo',
            'NR',
            'Data Prevista',
            'Responsável',
            'Situação',
          ]}
        >
          {filtered
            .sort(
              (a, b) =>
                new Date(a.data_prevista || '').getTime() -
                new Date(b.data_prevista || '').getTime(),
            )
            .map((r) => {
              const isOverdue =
                r.data_prevista && new Date(r.data_prevista) < now && !isDone(r.situacao)
              return (
                <tr
                  key={r.id}
                  className={cn(
                    'border-b border-border hover:bg-[#005B2E]/5',
                    isOverdue && 'bg-red-50/30 hover:bg-red-50',
                  )}
                >
                  <td className="px-3 py-3 font-medium">{r.titulo}</td>
                  <td className="px-3 py-3">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-[#005B2E]/10 text-[#005B2E]">
                      {r.categoria}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-xs">{r.tipo || '—'}</td>
                  <td className="px-3 py-3 text-xs">{r.nr_ref || '—'}</td>
                  <td className="px-3 py-3 text-xs font-medium">{r.data_prevista || '—'}</td>
                  <td className="px-3 py-3 text-xs">{r.responsavel || '—'}</td>
                  <td className="px-3 py-3">
                    <SstStatusBadge status={r.situacao} />
                  </td>
                </tr>
              )
            })}
        </SstTable>
      )}
    </div>
  )
}
