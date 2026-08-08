import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { SstLoading, SstTable, SstStatusBadge } from '@/components/sst/sst-shared'
import { useRealtime } from '@/hooks/use-realtime'
import { getEsocialSSTEvents, getEsocialSSTStats } from '@/services/sst-enterprise'
import { Search, FileCheck, AlertCircle, Send, CheckCircle, XCircle } from 'lucide-react'

const EVENT_LABELS: Record<string, string> = {
  'S-2210': 'CAT - Comunicação de Acidente de Trabalho',
  'S-2220': 'Monitoramento da Saúde do Trabalhador',
  'S-2221': 'Exame Toxicológico do Motorista Profissional',
  'S-2240': 'Condições Ambientais do Trabalho - Agentes Nocivos',
}

export function SstEsocialMonitor() {
  const [records, setRecords] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')

  const load = async () => {
    try {
      const [events, s] = await Promise.all([getEsocialSSTEvents(), getEsocialSSTStats()])
      setRecords(events)
      setStats(s)
    } catch {
      setRecords([])
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [typeFilter])
  useRealtime('sst_esocial_sst_events', () => load())

  const filtered = records.filter((r) => {
    if (typeFilter && r.tipo_evento !== typeFilter) return false
    const q = search.toLowerCase().trim()
    if (!q) return true
    return (
      (r.employee_name || '').toLowerCase().includes(q) ||
      (r.tipo_evento || '').toLowerCase().includes(q) ||
      (r.protocolo || '').toLowerCase().includes(q)
    )
  })

  if (loading) return <SstLoading />

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold">Monitor eSocial SST — S-2210 / S-2220 / S-2221 / S-2240</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Object.entries(EVENT_LABELS).map(([evt, label]) => {
          const key = evt.toLowerCase().replace('s-', 's')
          const s = stats?.[key] || {}
          return (
            <Card key={evt} className="border-2 border-[#005B2E]/20">
              <CardContent className="p-3">
                <p className="text-sm font-bold text-[#005B2E]">{evt}</p>
                <p className="text-xs text-muted-foreground mb-2 truncate">{label}</p>
                <div className="flex flex-wrap gap-1 text-xs">
                  <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">
                    P:{s.pending || 0}
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">
                    E:{s.sent || 0}
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">
                    A:{s.accepted || 0}
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-700">
                    R:{s.rejected || 0}
                  </span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar evento, colaborador, protocolo..."
            className="pl-10 focus-visible:ring-[#005B2E]"
          />
        </div>
        <Input
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          placeholder="Filtrar tipo (S-2210)..."
          className="w-48 focus-visible:ring-[#005B2E]"
        />
      </div>
      {filtered.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="py-16 text-center">
            <FileCheck className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-lg font-bold">Nenhum evento eSocial SST encontrado</p>
          </CardContent>
        </Card>
      ) : (
        <SstTable
          headers={[
            'Evento',
            'Colaborador',
            'Competência',
            'Protocolo',
            'Recibo',
            'Status',
            'Situação',
          ]}
        >
          {filtered.map((r) => (
            <tr key={r.id} className="border-b border-border hover:bg-[#005B2E]/5">
              <td className="px-3 py-3 font-medium">
                {r.tipo_evento}
                <p className="text-xs text-muted-foreground">{EVENT_LABELS[r.tipo_evento] || ''}</p>
              </td>
              <td className="px-3 py-3 text-xs">{r.employee_name || '—'}</td>
              <td className="px-3 py-3 text-xs">{r.competencia || '—'}</td>
              <td className="px-3 py-3 text-xs font-mono">{r.protocolo || '—'}</td>
              <td className="px-3 py-3 text-xs font-mono">{r.recibo || '—'}</td>
              <td className="px-3 py-3 text-xs">{r.status_retorno || '—'}</td>
              <td className="px-3 py-3">
                <SstStatusBadge status={r.situacao} />
              </td>
            </tr>
          ))}
        </SstTable>
      )}
    </div>
  )
}
