import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { RhTable, RhEmptyState, RhLoading, RhStatusBadge } from '@/components/rh/rh-shared'
import { getTalentReview } from '@/services/rh-enterprise'
import { useRealtime } from '@/hooks/use-realtime'
import { Search } from 'lucide-react'

export function RhTalentReview() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const load = async () => {
    try {
      setData(await getTalentReview())
    } catch {
      setData([])
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime('rh_performance_evaluations', () => load())

  const filtered = data.filter((r) => {
    const q = search.toLowerCase().trim()
    return (
      !q ||
      (r.employee_name || '').toLowerCase().includes(q) ||
      (r.departamento || '').toLowerCase().includes(q)
    )
  })

  if (loading) return <RhLoading />

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold">Talent Review</h3>
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por colaborador ou area..."
          className="pl-10 focus-visible:ring-[#005B2E]"
        />
      </div>
      {filtered.length === 0 ? (
        <RhEmptyState message="Nenhum talento encontrado" />
      ) : (
        <RhTable headers={['Colaborador', 'Cargo', 'Area', 'Nota', 'Prontidao', 'PDI', 'Status']}>
          {filtered.map((r) => (
            <tr key={r.id} className="border-b border-border hover:bg-[#005B2E]/5">
              <td className="px-3 py-3 font-medium">{r.employee_name || '—'}</td>
              <td className="px-3 py-3 text-xs">{r.cargo || '—'}</td>
              <td className="px-3 py-3 text-xs">{r.departamento || '—'}</td>
              <td className="px-3 py-3 font-bold text-[#005B2E]">{r.nota_final || '—'}</td>
              <td className="px-3 py-3 text-xs">{r.succession?.nivel_prontidao || '—'}</td>
              <td className="px-3 py-3 text-xs">{r.pdi ? `${r.pdi.progresso || 0}%` : '—'}</td>
              <td className="px-3 py-3">
                <RhStatusBadge status={r.situacao} />
              </td>
            </tr>
          ))}
        </RhTable>
      )}
    </div>
  )
}
