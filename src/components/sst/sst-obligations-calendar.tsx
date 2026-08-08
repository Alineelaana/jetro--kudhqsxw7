import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { SstLoading, SstTable, SstStatusBadge } from '@/components/sst/sst-shared'
import { sstGetList, sstUpdate } from '@/services/sst'
import { useRealtime } from '@/hooks/use-realtime'
import { CalendarClock, AlertTriangle, CheckCircle, Clock } from 'lucide-react'

export function SstObligationsCalendar() {
  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      const items = await sstGetList('sst_obligations')
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

  if (loading) return <SstLoading />

  const now = new Date()
  const overdue = records.filter(
    (r) => r.data_prevista && new Date(r.data_prevista) < now && r.situacao !== 'Concluída',
  )
  const upcoming = records.filter((r) => {
    if (!r.data_prevista || r.situacao === 'Concluída') return false
    const d = new Date(r.data_prevista)
    const thirty = new Date(now.getTime() + 30 * 86400000)
    return d >= now && d <= thirty
  })
  const done = records.filter((r) => r.situacao === 'Concluída')
  const pending = records.filter((r) => r.situacao === 'Pendente' || r.situacao === 'Agendada')

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <CalendarClock className="w-5 h-5 text-[#005B2E]" />
        <h3 className="text-lg font-bold">Calendário de Obrigações SST</h3>
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
                <Icon className={`w-5 h-5 ${s.color}`} />
                <div>
                  <p className="text-lg font-black">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
      {records.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="py-16 text-center">
            <CalendarClock className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-lg font-bold">Nenhuma obrigação cadastrada</p>
          </CardContent>
        </Card>
      ) : (
        <SstTable
          headers={[
            'Obrigação',
            'Tipo',
            'NR',
            'Data Prevista',
            'Periodicidade',
            'Responsável',
            'Situação',
          ]}
        >
          {records
            .sort(
              (a, b) =>
                new Date(a.data_prevista || '').getTime() -
                new Date(b.data_prevista || '').getTime(),
            )
            .map((r) => {
              const isOverdue =
                r.data_prevista && new Date(r.data_prevista) < now && r.situacao !== 'Concluída'
              return (
                <tr
                  key={r.id}
                  className={
                    isOverdue
                      ? 'border-b border-border hover:bg-red-50 bg-red-50/30'
                      : 'border-b border-border hover:bg-[#005B2E]/5'
                  }
                >
                  <td className="px-3 py-3 font-medium">{r.titulo || '—'}</td>
                  <td className="px-3 py-3 text-xs">{r.tipo_obrigacao || '—'}</td>
                  <td className="px-3 py-3 text-xs">{r.nr_ref || '—'}</td>
                  <td className="px-3 py-3 text-xs font-medium">{r.data_prevista || '—'}</td>
                  <td className="px-3 py-3 text-xs">{r.periodicidade || '—'}</td>
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
