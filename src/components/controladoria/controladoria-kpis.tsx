import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2 } from 'lucide-react'
import { getKPIs } from '@/services/controladoria'
import { useRealtime } from '@/hooks/use-realtime'
import { KPI_CATEGORIES, STATUS_COLORS, type KPIDefinition } from '@/lib/controladoria-types'
import { cn } from '@/lib/utils'

const CATEGORY_LABELS: Record<string, string> = {
  rentabilidade: 'Rentabilidade',
  liquidez: 'Liquidez',
  eficiencia: 'Eficiência',
  crescimento: 'Crescimento',
  estrutura: 'Estrutura',
  capital_giro: 'Capital de Giro',
}

const CRITICALITY_COLORS: Record<string, string> = {
  baixa: 'bg-gray-100 text-gray-600',
  media: 'bg-blue-100 text-blue-700',
  alta: 'bg-amber-100 text-amber-700',
  critica: 'bg-red-100 text-red-700',
}

export function ControladoriaKPIs() {
  const [kpis, setKpis] = useState<KPIDefinition[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')

  const load = async () => {
    try {
      setKpis((await getKPIs()) as KPIDefinition[])
    } catch {
      /* ignore */
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime('controladoria_kpis', () => load())

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )

  const filtered = filter === 'all' ? kpis : kpis.filter((k) => k.category === filter)

  return (
    <div className="space-y-4">
      <Card className="border-2 border-[#005B2E]/20">
        <CardContent className="py-2 flex items-center gap-2 flex-wrap">
          <span className="text-xs font-medium text-[#005B2E]">Categoria:</span>
          <button
            onClick={() => setFilter('all')}
            className={cn(
              'text-xs px-3 py-1 rounded-full',
              filter === 'all' ? 'bg-[#005B2E] text-white' : 'bg-muted',
            )}
          >
            Todas
          </button>
          {KPI_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={cn(
                'text-xs px-3 py-1 rounded-full',
                filter === cat ? 'bg-[#005B2E] text-white' : 'bg-muted',
              )}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((kpi) => (
          <Card
            key={kpi.id}
            className="border-2 border-[#005B2E]/20 hover:shadow-lg transition-shadow"
          >
            <CardContent className="py-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-bold text-sm text-foreground">{kpi.name}</h3>
                  <Badge variant="outline" className="text-xs mt-1">
                    {CATEGORY_LABELS[kpi.category] || kpi.category}
                  </Badge>
                </div>
                <span
                  className={cn(
                    'text-xs px-2 py-0.5 rounded-full',
                    CRITICALITY_COLORS[kpi.criticality] || 'bg-gray-100',
                  )}
                >
                  {kpi.criticality}
                </span>
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between border-b border-border py-0.5">
                  <span className="text-muted-foreground">Fórmula</span>
                  <span className="font-mono text-right max-w-[60%] truncate" title={kpi.formula}>
                    {kpi.formula}
                  </span>
                </div>
                <div className="flex justify-between border-b border-border py-0.5">
                  <span className="text-muted-foreground">Descrição</span>
                  <span className="text-right">{kpi.formula_description || '—'}</span>
                </div>
                <div className="flex justify-between border-b border-border py-0.5">
                  <span className="text-muted-foreground">Meta</span>
                  <span className="font-medium">
                    {kpi.target} {kpi.unit}
                  </span>
                </div>
                <div className="flex justify-between border-b border-border py-0.5">
                  <span className="text-muted-foreground">Periodicidade</span>
                  <span>{kpi.periodicity}</span>
                </div>
                <div className="flex justify-between border-b border-border py-0.5">
                  <span className="text-muted-foreground">Responsável</span>
                  <span>{kpi.responsible || '—'}</span>
                </div>
                <div className="flex justify-between border-b border-border py-0.5">
                  <span className="text-muted-foreground">Limites</span>
                  <span>
                    {kpi.lower_limit || '—'} a {kpi.upper_limit || '—'}
                  </span>
                </div>
                <div className="flex justify-between border-b border-border py-0.5">
                  <span className="text-muted-foreground">Tendência</span>
                  <span>{kpi.trend || '—'}</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-muted-foreground">Origem dos Dados</span>
                  <span className="text-[#005B2E] font-medium">{kpi.data_source}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {filtered.length === 0 && (
        <p className="text-center py-6 text-muted-foreground">Nenhum KPI encontrado.</p>
      )}
    </div>
  )
}
