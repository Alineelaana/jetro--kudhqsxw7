import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getAtendimentoStats } from '@/services/atendimento'
import { useRealtime } from '@/hooks/use-realtime'
import {
  Loader2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  TrendingUp,
  FileText,
  Users,
  Activity,
} from 'lucide-react'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts'

const STATUS_COLORS: Record<string, string> = {
  Aberto: '#3b82f6',
  'Em Atendimento': '#f59e0b',
  'Aguardando Cliente': '#a855f7',
  Resolvido: '#10b981',
  Finalizado: '#059669',
  Cancelado: '#ef4444',
}

const PIE_COLORS = ['#005B2E', '#01361D', '#C9A227', '#f59e0b', '#ef4444', '#a855f7']

export function AtendimentoRelatorios() {
  const [stats, setStats] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      const data = await getAtendimentoStats()
      setStats(data as Record<string, unknown>)
    } catch {
      /* noop */
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime('atendimento_records', () => load())

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )

  const total = (stats?.total as number) || 0
  const abertos = (stats?.abertos as number) || 0
  const emAtendimento = (stats?.em_atendimento as number) || 0
  const finalizados = (stats?.finalizados as number) || 0
  const cancelados = (stats?.cancelados as number) || 0
  const slaCumprido = (stats?.sla_cumprido as number) || 0
  const slaTotal = (stats?.sla_total as number) || 0
  const slaPercent = slaTotal > 0 ? Math.round((slaCumprido / slaTotal) * 100) : 0

  const statusData = [
    { name: 'Aberto', value: abertos },
    { name: 'Em Atendimento', value: emAtendimento },
    { name: 'Finalizado', value: finalizados },
    { name: 'Cancelado', value: cancelados },
  ].filter((d) => d.value > 0)

  const origemData = (stats?.por_origem as Array<{ name: string; value: number }>) || []
  const tipoData = (stats?.por_tipo as Array<{ name: string; value: number }>) || []

  const cards = [
    {
      label: 'Total de Atendimentos',
      value: total,
      icon: FileText,
      color: 'text-[#005B2E]',
      bg: 'bg-[#005B2E]/10',
    },
    {
      label: 'Em Aberto',
      value: abertos,
      icon: Clock,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Em Atendimento',
      value: emAtendimento,
      icon: Activity,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      label: 'Finalizados',
      value: finalizados,
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      label: 'Cancelados',
      value: cancelados,
      icon: AlertTriangle,
      color: 'text-red-600',
      bg: 'bg-red-50',
    },
    {
      label: 'SLA Cumprido',
      value: `${slaPercent}%`,
      icon: TrendingUp,
      color: 'text-[#C9A227]',
      bg: 'bg-[#C9A227]/10',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {cards.map((c) => (
          <Card key={c.label} className="border-2 border-[#005B2E]/10">
            <CardContent className="p-4">
              <div className={`w-10 h-10 rounded-lg ${c.bg} flex items-center justify-center mb-2`}>
                <c.icon className={`w-5 h-5 ${c.color}`} />
              </div>
              <p className="text-2xl font-bold text-foreground">{c.value}</p>
              <p className="text-xs text-muted-foreground">{c.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {statusData.length > 0 && (
          <Card className="border-2 border-[#005B2E]/10">
            <CardHeader>
              <CardTitle className="text-[#005B2E] text-base">Por Status</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className="mx-auto aspect-square max-h-[280px]">
                <PieChart>
                  <Pie
                    data={statusData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={2}
                  >
                    {statusData.map((entry, i) => (
                      <Cell
                        key={entry.name}
                        fill={STATUS_COLORS[entry.name] || PIE_COLORS[i % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>
        )}

        {origemData.length > 0 && (
          <Card className="border-2 border-[#005B2E]/10">
            <CardHeader>
              <CardTitle className="text-[#005B2E] text-base">Por Origem</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className="aspect-[4/3] max-h-[280px]">
                <BarChart data={origemData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="value" fill="#005B2E" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {tipoData.length > 0 && (
        <Card className="border-2 border-[#005B2E]/10">
          <CardHeader>
            <CardTitle className="text-[#005B2E] text-base">Por Tipo</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="aspect-[16/5] max-h-[300px]">
              <BarChart data={tipoData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
                <XAxis
                  type="number"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  width={100}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="value" fill="#01361D" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      )}

      {total === 0 && (
        <Card className="border-2 border-dashed border-[#005B2E]/20">
          <CardContent className="py-12 text-center">
            <Users className="w-12 h-12 mx-auto mb-3 text-[#005B2E]/30" />
            <p className="text-muted-foreground">
              Sem dados de atendimento para exibir relatórios ainda.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end">
        <Button
          variant="outline"
          onClick={() => load()}
          className="border-[#005B2E]/30 text-[#005B2E] hover:bg-[#005B2E]/5"
        >
          Atualizar
        </Button>
      </div>
    </div>
  )
}
