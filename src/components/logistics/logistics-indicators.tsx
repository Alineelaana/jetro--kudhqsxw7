import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { ChartContainer, type ChartConfig } from '@/components/ui/chart'
import { getDeliveries, getOccurrences, getCosts, getFreights } from '@/services/logistics'
import { useRealtime } from '@/hooks/use-realtime'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell, Tooltip } from 'recharts'
import {
  Loader2,
  Activity,
  TrendingUp,
  DollarSign,
  CheckCircle,
  Clock,
  AlertTriangle,
} from 'lucide-react'

const STATUS_COLORS: Record<string, string> = {
  Programada: '#3b82f6',
  'Em Trânsito': '#06b6d4',
  'Saiu para Entrega': '#6366f1',
  Entregue: '#10b981',
  Cancelada: '#ef4444',
  Devolvida: '#f97316',
}

const COST_COLORS = [
  '#005B2E',
  '#C89B3C',
  '#06b6d4',
  '#6366f1',
  '#10b981',
  '#f97316',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
  '#14b8a6',
  '#f59e0b',
  '#64748b',
  '#a855f7',
]

const chartConfig = {
  deliveries: { label: 'Entregas', color: 'hsl(var(--chart-1))' },
  costs: { label: 'Custos', color: 'hsl(var(--chart-2))' },
} satisfies ChartConfig

export function LogisticsIndicators() {
  const [data, setData] = useState<Record<string, unknown[]>>({
    deliveries: [],
    occurrences: [],
    costs: [],
    freights: [],
  })
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      const [del, occ, cst, frt] = await Promise.all([
        getDeliveries().catch(() => []),
        getOccurrences().catch(() => []),
        getCosts().catch(() => []),
        getFreights().catch(() => []),
      ])
      setData({
        deliveries: del as unknown[],
        occurrences: occ as unknown[],
        costs: cst,
        freights: frt as unknown[],
      })
    } catch {
      /* noop */
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime('logistics_deliveries', () => load())

  const kpis = useMemo(() => {
    const d = data.deliveries as Array<Record<string, unknown>>
    const delivered = d.filter((x) => x.status === 'Entregue').length
    const today = new Date().toISOString().split('T')[0]
    const delayed = d.filter((x) => {
      if (['Entregue', 'Cancelada'].includes(x.status as string)) return false
      return x.data_prevista && (x.data_prevista as string) < today
    }).length
    const onTimeRate =
      delivered > 0 ? Math.round((delivered / Math.max(delivered + delayed, 1)) * 100) : 0
    const totalCost = data.costs.reduce(
      (s: number, c: Record<string, unknown>) => s + parseFloat((c.valor as string) || '0'),
      0,
    )
    const totalFreight = (data.freights as Array<Record<string, unknown>>).reduce(
      (s: number, f: Record<string, unknown>) => s + parseFloat((f.valor_total as string) || '0'),
      0,
    )
    const avgCost = (delivered as number) > 0 ? (totalCost as number) / (delivered as number) : 0
    const occ = (data.occurrences as Array<Record<string, unknown>>).filter(
      (o) => o.situacao === 'Aberta' || o.situacao === 'Em Análise',
    ).length
    const returns = d.filter((x) => x.status === 'Devolvida').length
    return {
      delivered,
      delayed,
      onTimeRate,
      totalCost,
      totalFreight,
      avgCost,
      occ,
      returns,
      total: d.length,
    }
  }, [data])

  const statusChart = useMemo(() => {
    const counts: Record<string, number> = {}
    ;(data.deliveries as Array<Record<string, unknown>>).forEach((d) => {
      const s = (d.status as string) || '—'
      counts[s] = (counts[s] || 0) + 1
    })
    return Object.entries(counts).map(([name, value]) => ({ name, value }))
  }, [data])

  const costChart = useMemo(() => {
    const counts: Record<string, number> = {}
    ;(data.costs as Array<Record<string, unknown>>).forEach((c) => {
      const t = (c.tipo_custo as string) || 'Outros'
      counts[t] = (counts[t] || 0) + parseFloat((c.valor as string) || '0')
    })
    return Object.entries(counts).map(([name, value]) => ({
      name,
      value: Math.round(value * 100) / 100,
    }))
  }, [data])

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )

  const fmtCurrency = (v: number) =>
    v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  const cards = [
    { label: 'Total de Entregas', value: kpis.total, icon: Activity, color: 'text-blue-600' },
    { label: 'Entregues', value: kpis.delivered, icon: CheckCircle, color: 'text-emerald-600' },
    { label: 'Atrasadas', value: kpis.delayed, icon: Clock, color: 'text-red-600' },
    {
      label: '% no Prazo',
      value: `${kpis.onTimeRate}%`,
      icon: TrendingUp,
      color: 'text-emerald-700',
    },
    {
      label: 'Custo Total',
      value: fmtCurrency(kpis.totalCost + kpis.totalFreight),
      icon: DollarSign,
      color: 'text-amber-600',
    },
    {
      label: 'Custo/Entrega',
      value: fmtCurrency(kpis.avgCost),
      icon: DollarSign,
      color: 'text-amber-700',
    },
    { label: 'Ocorrências Ativas', value: kpis.occ, icon: AlertTriangle, color: 'text-orange-600' },
    { label: 'Devoluções', value: kpis.returns, icon: AlertTriangle, color: 'text-red-700' },
  ]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {cards.map((c) => (
          <Card key={c.label} className="border-2 border-[#005B2E]/20 shadow-md">
            <CardContent className="flex items-center gap-3 p-3">
              <div className="w-10 h-10 rounded-lg bg-[#005B2E]/10 flex items-center justify-center shrink-0">
                <c.icon className={`w-5 h-5 ${c.color}`} />
              </div>
              <div>
                <p className="text-lg font-black">{c.value}</p>
                <p className="text-xs text-muted-foreground">{c.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border-2 border-[#005B2E]/20 shadow-md">
          <CardContent className="p-4">
            <h3 className="font-bold text-[#005B2E] mb-3">Entregas por Status</h3>
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
              <BarChart data={statusChart}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 9 }}
                  angle={-20}
                  textAnchor="end"
                  height={60}
                />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="value" radius={4}>
                  {statusChart.map((entry, i) => (
                    <Cell key={i} fill={STATUS_COLORS[entry.name] || '#005B2E'} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="border-2 border-[#005B2E]/20 shadow-md">
          <CardContent className="p-4">
            <h3 className="font-bold text-[#005B2E] mb-3">Custos por Tipo</h3>
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
              <PieChart>
                <Pie
                  data={costChart}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={((entry: any) => String(entry?.name ?? '')) as any}
                  labelLine={false}
                >
                  {costChart.map((_, i) => (
                    <Cell key={i} fill={COST_COLORS[i % COST_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => fmtCurrency(v)} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
