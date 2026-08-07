import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts'
import { getApurations } from '@/services/variable-remuneration'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import { parseNum, formatCurrency } from '@/lib/variable-remuneration-types'
import {
  Loader2,
  DollarSign,
  TrendingUp,
  Clock,
  AlertCircle,
  CheckCircle,
  Ban,
  FileClock,
} from 'lucide-react'

const COLORS = ['#005B2E', '#C89B3C', '#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6']

export function VrDashboard() {
  const { user } = useAuth()
  const [apurations, setApurations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<'mes' | 'trimestre' | 'semestre' | 'ano'>('mes')

  const load = async () => {
    try {
      setApurations(await getApurations())
    } catch {
      setApurations([])
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime('commission_apurations', () => load())

  const stats = useMemo(() => {
    const now = new Date()
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    const monthApurations = apurations.filter((a) => a.competencia?.startsWith(monthKey))
    const previstos = monthApurations.reduce((s, a) => s + parseNum(a.commission_value), 0)
    const apurados = monthApurations
      .filter((a) => a.situacao === 'apurada')
      .reduce((s, a) => s + parseNum(a.commission_value), 0)
    const pagos = monthApurations
      .filter((a) => a.situacao === 'paga')
      .reduce((s, a) => s + parseNum(a.commission_value), 0)
    const pendentes = monthApurations
      .filter((a) => a.situacao === 'pendente')
      .reduce((s, a) => s + parseNum(a.commission_value), 0)
    const bloqueados = monthApurations
      .filter((a) => a.situacao === 'bloqueada')
      .reduce((s, a) => s + parseNum(a.commission_value), 0)
    const emAprovacao = monthApurations
      .filter((a) => a.situacao === 'apurada')
      .reduce((s, a) => s + parseNum(a.commission_value), 0)
    const byVendedor: Record<string, number> = {}
    monthApurations.forEach((a) => {
      if (a.vendedor_name)
        byVendedor[a.vendedor_name] =
          (byVendedor[a.vendedor_name] || 0) + parseNum(a.commission_value)
    })
    return { previstos, apurados, pagos, pendentes, bloqueados, emAprovacao, byVendedor }
  }, [apurations, period])

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )

  const cards = [
    { label: 'Comissão Prevista', value: stats.previstos, icon: DollarSign, color: '#005B2E' },
    { label: 'Comissão Apurada', value: stats.apurados, icon: TrendingUp, color: '#C89B3C' },
    { label: 'Comissão Paga', value: stats.pagos, icon: CheckCircle, color: '#22c55e' },
    { label: 'Comissão Pendente', value: stats.pendentes, icon: Clock, color: '#f59e0b' },
    { label: 'Comissão Bloqueada', value: stats.bloqueados, icon: Ban, color: '#ef4444' },
    { label: 'Em Aprovação', value: stats.emAprovacao, icon: FileClock, color: '#3b82f6' },
  ]
  const chartConfig = { value: { label: 'Valor', color: '#005B2E' } }
  const vendedorChart = Object.entries(stats.byVendedor)
    .slice(0, 10)
    .map(([name, value]) => ({ name, value }))
  const indicators = [
    { label: 'Comissão x Faturamento', value: formatCurrency(stats.previstos) },
    { label: 'Comissão x Margem', value: formatCurrency(stats.apurados) },
    { label: 'Comissão x Positivação', value: formatCurrency(stats.pagos) },
    { label: 'Comissão x Mix', value: formatCurrency(stats.pendentes) },
    { label: 'Comissão x Ticket Médio', value: formatCurrency(stats.bloqueados) },
    { label: 'Comissão x Volume', value: formatCurrency(stats.emAprovacao) },
  ]

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {(['mes', 'trimestre', 'semestre', 'ano'] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${period === p ? 'bg-[#005B2E] text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
          >
            {p === 'mes'
              ? 'Mês'
              : p === 'trimestre'
                ? 'Trimestre'
                : p === 'semestre'
                  ? 'Semestre'
                  : 'Ano'}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {cards.map((c, i) => (
          <Card key={i} className="border-2" style={{ borderColor: `${c.color}33` }}>
            <CardContent className="py-3 px-4 flex items-center gap-2">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${c.color}1A` }}
              >
                <c.icon className="w-4 h-4" style={{ color: c.color }} />
              </div>
              <div className="min-w-0">
                <p className="text-base font-black text-foreground truncate">
                  R$ {formatCurrency(c.value)}
                </p>
                <p className="text-[10px] text-muted-foreground">{c.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {indicators.map((ind, i) => (
          <Card key={i} className="border-2 border-[#005B2E]/20">
            <CardContent className="py-2 px-3">
              <p className="text-xs text-muted-foreground">{ind.label}</p>
              <p className="text-sm font-bold">R$ {ind.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-2 border-[#005B2E]/30">
          <CardHeader>
            <CardTitle className="text-base">Comissão por Vendedor</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={vendedorChart}>
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 10 }}
                    angle={-20}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="value" fill="#005B2E" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="border-2 border-[#C89B3C]/30">
          <CardHeader>
            <CardTitle className="text-base">Distribuição por Situação</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Pago', value: stats.pagos },
                      { name: 'Pendente', value: stats.pendentes },
                      { name: 'Bloqueado', value: stats.bloqueados },
                      { name: 'Apurado', value: stats.apurados },
                    ]}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={(e) => e.name}
                  >
                    {COLORS.map((c, i) => (
                      <Cell key={i} fill={c} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
