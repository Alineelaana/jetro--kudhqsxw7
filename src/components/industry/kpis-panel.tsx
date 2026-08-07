import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, BarChart3, TrendingUp, Gauge, Zap, Clock } from 'lucide-react'
import { getKpis } from '@/services/industrial-extended'
import { useRealtime } from '@/hooks/use-realtime'
import type { IndustrialKpi } from '@/lib/industrial-extended-types'

function kpiCard(label: string, value: number | string, suffix: string, icon: any, color: string) {
  const Icon = icon
  return (
    <Card key={label} className="border-2 border-[#005B2E]/10">
      <CardContent className="py-4 flex items-center gap-3">
        {Icon && <Icon className={`w-8 h-8 ${color}`} />}
        <div>
          <p className="text-2xl font-black text-foreground">
            {value}
            {suffix}
          </p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  )
}

export function KpisPanel() {
  const [kpis, setKpis] = useState<IndustrialKpi[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      setKpis(await getKpis())
    } catch {
      /* ignore */
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])
  useRealtime('industrial_kpis', () => load())

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )

  const latest = kpis[0]

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <BarChart3 className="w-6 h-6 text-[#005B2E]" />
        <h2 className="text-xl font-black text-foreground">Indicadores Industriais (KPIs)</h2>
      </div>
      {latest ? (
        <>
          <p className="text-sm text-muted-foreground">Periodo: {latest.period}</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {kpiCard('OEE', latest.oee?.toFixed(1) || '—', '%', Gauge, 'text-[#005B2E]')}
            {kpiCard(
              'Disponibilidade',
              latest.availability?.toFixed(1) || '—',
              '%',
              Zap,
              'text-blue-600',
            )}
            {kpiCard(
              'Performance',
              latest.performance?.toFixed(1) || '—',
              '%',
              TrendingUp,
              'text-emerald-600',
            )}
            {kpiCard(
              'Qualidade',
              latest.quality_rate?.toFixed(1) || '—',
              '%',
              TrendingUp,
              'text-purple-600',
            )}
            {kpiCard(
              'Eficiencia',
              latest.efficiency?.toFixed(1) || '—',
              '%',
              Gauge,
              'text-orange-600',
            )}
            {kpiCard(
              'Produtividade',
              latest.productivity?.toFixed(1) || '—',
              '%',
              TrendingUp,
              'text-cyan-600',
            )}
            {kpiCard('Lead Time', latest.lead_time_minutes || '—', 'min', Clock, 'text-amber-600')}
            {kpiCard('Setup Time', latest.setup_time_minutes || '—', 'min', Clock, 'text-red-600')}
          </div>
          <Card className="border-2 border-[#005B2E]/20">
            <CardContent className="py-4">
              <h3 className="font-bold text-[#005B2E] mb-3">Producao</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Planejado:</span>{' '}
                  <span className="font-bold">{latest.planned_quantity}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Produzido:</span>{' '}
                  <span className="font-bold text-emerald-600">{latest.produced_quantity}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Refugado:</span>{' '}
                  <span className="font-bold text-red-600">{latest.rejected_quantity}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Custo/Unid:</span>{' '}
                  <span className="font-bold">R$ {latest.cost_per_unit || '—'}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card className="border-2 border-dashed border-border">
          <CardContent className="py-12 text-center">
            <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-lg font-bold mb-1">Nenhum KPI registrado</p>
            <p className="text-sm text-muted-foreground">
              Os KPIs sao calculados a partir de apontamentos e ordens de producao
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
