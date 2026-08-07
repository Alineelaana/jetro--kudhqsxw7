import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, Factory, CheckCircle, Clock, AlertTriangle, Percent } from 'lucide-react'
import { getIndustrialAnalytics } from '@/services/bi-analytics'
import { logBIAudit } from '@/services/bi'
import { useBIFilters } from './bi-filters'
import { BiStatCard } from './bi-stat-card'
import { useRealtime } from '@/hooks/use-realtime'
import type { IndustrialAnalyticsData } from '@/lib/bi-types'

function fmt(v: number): string {
  return v.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
}

export function BiIndustrial() {
  const { filters } = useBIFilters()
  const [data, setData] = useState<IndustrialAnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      setData(await getIndustrialAnalytics(filters))
    } catch {
      /* ignore */
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [filters])
  useEffect(() => {
    logBIAudit('view', '', 'Visualizacao: Analytics Industrial')
  }, [])
  useRealtime('production_orders', () => load())

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )
  if (!data)
    return <p className="text-center py-6 text-muted-foreground">Erro ao carregar dados.</p>

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <BiStatCard
          icon={Factory}
          label="Total de Ordens"
          value={String(data.total)}
          color="text-blue-600"
        />
        <BiStatCard
          icon={CheckCircle}
          label="Concluídas"
          value={String(data.completed)}
          color="text-emerald-600"
        />
        <BiStatCard
          icon={Clock}
          label="Em Produção"
          value={String(data.inProgress)}
          color="text-cyan-600"
        />
        <BiStatCard
          icon={AlertTriangle}
          label="Atrasadas"
          value={String(data.late)}
          color="text-red-600"
        />
        <BiStatCard
          icon={Percent}
          label="Taxa de Pontualidade"
          value={`${fmt(data.onTimeRate)}%`}
          color="text-[#005B2E]"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-2 border-[#005B2E]/20">
          <CardContent className="py-4">
            <h3 className="font-bold text-[#005B2E] mb-3">Capacidade de Produção</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between border-b border-border py-1">
                <span className="text-muted-foreground">Ordens Ativas</span>
                <span className="font-medium">{data.inProgress}</span>
              </div>
              <div className="flex justify-between border-b border-border py-1">
                <span className="text-muted-foreground">Ordens Concluídas</span>
                <span className="font-medium text-emerald-600">{data.completed}</span>
              </div>
              <div className="flex justify-between border-b border-border py-1">
                <span className="text-muted-foreground">Total de Ordens</span>
                <span className="font-medium">{data.total}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-2 border-[#005B2E]/20">
          <CardContent className="py-4">
            <h3 className="font-bold text-[#005B2E] mb-3">Prazos de Entrega</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between border-b border-border py-1">
                <span className="text-muted-foreground">Ordens Atrasadas</span>
                <span className="font-medium text-red-600">{data.late}</span>
              </div>
              <div className="flex justify-between border-b border-border py-1">
                <span className="text-muted-foreground">Ordens no Prazo</span>
                <span className="font-medium text-emerald-600">{data.total - data.late}</span>
              </div>
              <div className="flex justify-between border-b border-border py-1">
                <span className="text-muted-foreground">Taxa de Pontualidade</span>
                <span className="font-bold text-[#005B2E]">{fmt(data.onTimeRate)}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
