import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SstLoading, SstTable, SstStatusBadge } from '@/components/sst/sst-shared'
import { sstGetList } from '@/services/sst'
import { useRealtime } from '@/hooks/use-realtime'
import { Search, SearchX, Microscope } from 'lucide-react'

const METHODOLOGIES = [
  '5 Porquês',
  'Ishikawa (Espinha de Peixe)',
  'Árvore de Causas',
  'Análise Causal',
  'Causa Imediata/Básica',
  'Análise Sistemática',
]

export function SstInvestigations() {
  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [methodFilter, setMethodFilter] = useState('')

  const load = async () => {
    try {
      const items = await sstGetList('sst_investigations')
      setRecords(items)
    } catch {
      setRecords([])
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime('sst_investigations', () => load())

  const filtered = records.filter((r) => {
    if (methodFilter && r.metodologia !== methodFilter) return false
    const q = search.toLowerCase().trim()
    if (!q) return true
    return (
      (r.titulo || '').toLowerCase().includes(q) ||
      (r.employee_name || '').toLowerCase().includes(q)
    )
  })

  if (loading) return <SstLoading />

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Microscope className="w-5 h-5 text-[#005B2E]" />
        <h3 className="text-lg font-bold">Investigações de Acidentes e Incidentes</h3>
      </div>
      <Card className="border-2 border-[#005B2E]/20">
        <CardContent className="py-3">
          <p className="text-xs text-muted-foreground mb-2">Metodologias configuráveis:</p>
          <div className="flex flex-wrap gap-1">
            {METHODOLOGIES.map((m) => (
              <span
                key={m}
                className="text-xs px-2 py-0.5 rounded bg-[#005B2E]/10 text-[#005B2E] font-medium"
              >
                {m}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>
      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar investigação, colaborador..."
            className="pl-10 focus-visible:ring-[#005B2E]"
          />
        </div>
        <Input
          value={methodFilter}
          onChange={(e) => setMethodFilter(e.target.value)}
          placeholder="Filtrar metodologia..."
          className="w-56 focus-visible:ring-[#005B2E]"
        />
      </div>
      {filtered.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="py-16 text-center">
            <SearchX className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-lg font-bold">Nenhuma investigação encontrada</p>
          </CardContent>
        </Card>
      ) : (
        <SstTable
          headers={[
            'Título',
            'Colaborador',
            'Tipo Evento',
            'Data',
            'Metodologia',
            'Status',
            'Situação',
          ]}
        >
          {filtered.map((r) => (
            <tr key={r.id} className="border-b border-border hover:bg-[#005B2E]/5">
              <td className="px-3 py-3 font-medium">{r.titulo || '—'}</td>
              <td className="px-3 py-3 text-xs">{r.employee_name || '—'}</td>
              <td className="px-3 py-3 text-xs">{r.tipo_evento || '—'}</td>
              <td className="px-3 py-3 text-xs">{r.data_evento || '—'}</td>
              <td className="px-3 py-3 text-xs">{r.metodologia || '—'}</td>
              <td className="px-3 py-3 text-xs">{r.status_investigacao || '—'}</td>
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
