import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2 } from 'lucide-react'
import { getDrivers } from '@/services/controladoria'
import { useRealtime } from '@/hooks/use-realtime'
import { DRIVER_TYPES, type DriverDefinition } from '@/lib/controladoria-types'
import { cn } from '@/lib/utils'

const TYPE_LABELS: Record<string, string> = {
  financial: 'Financeiro',
  operational: 'Operacional',
}

const TYPE_COLORS: Record<string, string> = {
  financial: 'bg-emerald-100 text-emerald-700',
  operational: 'bg-blue-100 text-blue-700',
}

export function ControladoriaDrivers() {
  const [drivers, setDrivers] = useState<DriverDefinition[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')

  const load = async () => {
    try {
      setDrivers((await getDrivers()) as unknown as DriverDefinition[])
    } catch {
      /* ignore */
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime('controladoria_drivers', () => load())

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )

  const filtered = filter === 'all' ? drivers : drivers.filter((d) => d.type === filter)

  return (
    <div className="space-y-4">
      <Card className="border-2 border-[#005B2E]/20">
        <CardContent className="py-2 flex items-center gap-2">
          <span className="text-xs font-medium text-[#005B2E]">Tipo:</span>
          <button
            onClick={() => setFilter('all')}
            className={cn(
              'text-xs px-3 py-1 rounded-full',
              filter === 'all' ? 'bg-[#005B2E] text-white' : 'bg-muted',
            )}
          >
            Todos
          </button>
          {DRIVER_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={cn(
                'text-xs px-3 py-1 rounded-full',
                filter === t ? 'bg-[#005B2E] text-white' : 'bg-muted',
              )}
            >
              {TYPE_LABELS[t]}
            </button>
          ))}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((d) => (
          <Card key={d.id} className="border-2 border-[#005B2E]/20">
            <CardContent className="py-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-bold text-sm">{d.name}</h3>
                <Badge className={cn('text-xs', TYPE_COLORS[d.type] || 'bg-gray-100')}>
                  {TYPE_LABELS[d.type]}
                </Badge>
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between border-b border-border py-0.5">
                  <span className="text-muted-foreground">Categoria</span>
                  <span>{d.category}</span>
                </div>
                <div className="flex justify-between border-b border-border py-0.5">
                  <span className="text-muted-foreground">Fórmula</span>
                  <span className="font-mono text-right max-w-[60%] truncate" title={d.formula}>
                    {d.formula}
                  </span>
                </div>
                <div className="flex justify-between border-b border-border py-0.5">
                  <span className="text-muted-foreground">Unidade</span>
                  <span>{d.unit}</span>
                </div>
                <div className="flex justify-between border-b border-border py-0.5">
                  <span className="text-muted-foreground">Origem</span>
                  <span className="text-[#005B2E] font-medium">{d.data_source}</span>
                </div>
                {d.description && <p className="text-muted-foreground pt-1">{d.description}</p>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {filtered.length === 0 && (
        <p className="text-center py-6 text-muted-foreground">Nenhum driver encontrado.</p>
      )}
    </div>
  )
}
