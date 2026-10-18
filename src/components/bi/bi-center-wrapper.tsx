import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, Download, Printer } from 'lucide-react'
import { useBIFilters } from './bi-filters'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import { BiStatCard } from './bi-stat-card'
import { BiDrillDown } from './bi-drill-down'
import { exportBIPdf, exportBIPrint } from '@/lib/bi-export'
import type { GenericCenterData, BIFilters } from '@/lib/bi-types'
import { JetroTable, type JetroColumnDef } from '@/components/jetro-table'

interface CenterWrapperProps {
  title: string
  description: string
  loadFunction: (filters: BIFilters) => Promise<GenericCenterData>
  realtimeCollection?: string
}

export function BiCenterWrapper({
  title,
  description,
  loadFunction,
  realtimeCollection,
}: CenterWrapperProps) {
  const { filters } = useBIFilters()
  const { user } = useAuth()
  const [data, setData] = useState<GenericCenterData | null>(null)
  const [loading, setLoading] = useState(true)
  const [drillTarget, setDrillTarget] = useState<string | null>(null)

  const load = async () => {
    try {
      setData(await loadFunction(filters))
    } catch {
      setData(null)
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [filters])

  useEffect(() => {
    if (realtimeCollection) {
      return
    }
  }, [realtimeCollection])

  useRealtime(realtimeCollection || 'bi_reports', () => load())

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )
  if (!data)
    return <p className="text-center py-6 text-muted-foreground">Erro ao carregar dados.</p>

  const userName = (user?.name as string) || 'Usuário'

  const handlePdfExport = () => {
    const sections = data.tables.map((t) => ({
      title: t.title,
      rows: [
        t.columns.map((c) => c.label),
        ...t.rows.map((r) => t.columns.map((c) => String(r[c.key] ?? '—'))),
      ],
    }))
    exportBIPdf(title, userName, sections)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{description}</p>
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={handlePdfExport}>
            <Download className="w-4 h-4 mr-1" /> PDF
          </Button>
          <Button variant="ghost" size="sm" onClick={() => exportBIPrint(title, userName)}>
            <Printer className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {data.stats.map((stat, i) => (
          <button key={i} onClick={() => setDrillTarget(stat.label)} className="text-left">
            <BiStatCard icon={Loader2} label={stat.label} value={stat.value} color={stat.color} />
          </button>
        ))}
      </div>
      {data.tables.map((table, i) => {
        const tableColumns: JetroColumnDef<Record<string, unknown>>[] = table.columns.map(
          (col) => ({
            id: col.key,
            header: col.label,
            accessorKey: col.key,
            dataType: 'text',
            cell: ({ value }) => <span>{String(value ?? '—')}</span>,
          }),
        )
        const screenKey = `bi.center.${title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.${table.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}`
        return (
          <Card key={i} className="border-2 border-[#005B2E]/20">
            <CardContent className="py-4 space-y-3">
              <h3 className="font-bold text-[#005B2E]">{table.title}</h3>
              <JetroTable
                screenId={screenKey}
                columns={tableColumns}
                data={table.rows}
                onRowClick={() => setDrillTarget(table.title)}
                emptyMessage="Sem dados disponíveis."
                exportTitle={`${title} — ${table.title}`}
                exportFilename={`${table.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.xlsx`}
              />
            </CardContent>
          </Card>
        )
      })}
      <BiDrillDown target={drillTarget} onClose={() => setDrillTarget(null)} />
    </div>
  )
}
