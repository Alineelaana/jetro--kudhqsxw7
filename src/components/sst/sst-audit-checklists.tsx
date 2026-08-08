import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { SstLoading, SstTable, SstStatusBadge } from '@/components/sst/sst-shared'
import { sstGetList } from '@/services/sst'
import { useRealtime } from '@/hooks/use-realtime'
import { Search, ClipboardCheck, FileX } from 'lucide-react'

export function SstAuditChecklists() {
  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const load = async () => {
    try {
      const items = await sstGetList('sst_audit_checklists')
      setRecords(items)
    } catch {
      setRecords([])
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime('sst_audit_checklists', () => load())

  const filtered = records.filter((r) => {
    const q = search.toLowerCase().trim()
    if (!q) return true
    return (
      (r.titulo || '').toLowerCase().includes(q) ||
      (r.nr_ref || '').toLowerCase().includes(q) ||
      (r.empresa || '').toLowerCase().includes(q)
    )
  })

  if (loading) return <SstLoading />

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <ClipboardCheck className="w-5 h-5 text-[#005B2E]" />
        <h3 className="text-lg font-bold">Auditorias SST com Checklists Configuráveis</h3>
      </div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar auditoria, NR, empresa..."
          className="pl-10 focus-visible:ring-[#005B2E]"
        />
      </div>
      {filtered.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="py-16 text-center">
            <FileX className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-lg font-bold">Nenhuma auditoria registrada</p>
          </CardContent>
        </Card>
      ) : (
        <SstTable headers={['Título', 'Tipo', 'NR', 'Empresa', 'Data', 'Conformidade', 'Situação']}>
          {filtered.map((r) => (
            <tr key={r.id} className="border-b border-border hover:bg-[#005B2E]/5">
              <td className="px-3 py-3 font-medium">{r.titulo || '—'}</td>
              <td className="px-3 py-3 text-xs">{r.tipo_auditoria || '—'}</td>
              <td className="px-3 py-3 text-xs">{r.nr_ref || '—'}</td>
              <td className="px-3 py-3 text-xs">{r.empresa || '—'}</td>
              <td className="px-3 py-3 text-xs">{r.data_auditoria || '—'}</td>
              <td className="px-3 py-3 text-xs font-bold">
                {r.conformidade_percent ? `${r.conformidade_percent}%` : '—'}
              </td>
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
