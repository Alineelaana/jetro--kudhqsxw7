import { useState, useEffect, useMemo, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { StatCard } from '@/components/dashboards/stat-card'
import { ChartCard } from '@/components/dashboards/chart-card'
import { downloadBarChart, downloadPieChart, downloadStatCard } from '@/lib/chart-export'
import { useAuth } from '@/hooks/use-auth'
import { getBudgetRequests, getAverageResponseTime } from '@/services/budget-requests'
import { useRealtime } from '@/hooks/use-realtime'
import { FileText, CheckCircle, Clock, AlertCircle, Loader2, TrendingUp } from 'lucide-react'
import type { BudgetRecord } from '@/lib/types'
import { HURAM_CHART_COLORS } from '@/lib/huram-charts-theme'

const STATUS_COLOR_HEX: Record<string, string> = {
  PENDENTE: '#F59E0B',
  'EM ANDAMENTO': '#3B82F6',
  'EM CONTATO COM O CLIENTE': '#06b6d4',
  CONCLUÍDO: '#10B981',
  CANCELADO: '#EF4444',
}

export function BudgetProductivityDashboard() {
  const [records, setRecords] = useState<BudgetRecord[]>([])
  const [avgTime, setAvgTime] = useState({ averageMs: 0, count: 0, formatted: '' })
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const userName = (user?.name as string) || (user?.email as string) || 'Usuário'

  const loadData = useCallback(async () => {
    try {
      const [data, time] = await Promise.all([getBudgetRequests(), getAverageResponseTime()])
      setRecords(data as unknown as BudgetRecord[])
      setAvgTime(time)
    } catch {
      /* ignored */
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])
  useRealtime('budget_requests', () => loadData())

  const stats = useMemo(() => {
    const total = records.length
    const withQuote = records.filter((r) => r.quote_created_at).length
    const responseRate = total > 0 ? Math.round((withQuote / total) * 100) : 0
    const byAttendant: Record<string, number> = {}
    for (const r of records) {
      if (r.quote_created_at && r.responsible_email) {
        const key = r.responsible_email.split('@')[0]
        byAttendant[key] = (byAttendant[key] || 0) + 1
      }
    }
    const attendantChart = Object.entries(byAttendant).map(([name, quotes]) => ({ name, quotes }))
    const statusCount: Record<string, number> = {}
    for (const r of records) {
      const s = r.status || 'PENDENTE'
      statusCount[s] = (statusCount[s] || 0) + 1
    }
    const statusChart = Object.entries(statusCount).map(([name, value]) => ({
      name,
      value,
      color: STATUS_COLOR_HEX[name] || '#94a3b8',
    }))
    return { total, withQuote, responseRate, attendantChart, statusChart }
  }, [records])

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 text-[#063D30] animate-spin" />
      </div>
    )
  }

  const chartConfig = { quotes: { label: 'Orçamentos', color: HURAM_CHART_COLORS.primary } }
  const exp =
    (label: string, value: string, color: string, title: string) => (fmt: 'png' | 'jpg') =>
      downloadStatCard(label, value, color, title, userName, fmt)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={FileText}
          value={stats.total}
          label="Solicitações"
          hexColor={HURAM_CHART_COLORS.primary}
          onExport={exp(
            'Solicitações',
            String(stats.total),
            HURAM_CHART_COLORS.primary,
            'Total de Solicitações',
          )}
        />
        <StatCard
          icon={CheckCircle}
          value={stats.withQuote}
          label="Orçamentos enviados"
          hexColor={HURAM_CHART_COLORS.tertiary}
          onExport={exp(
            'Orçamentos enviados',
            String(stats.withQuote),
            HURAM_CHART_COLORS.tertiary,
            'Orçamentos Enviados',
          )}
        />
        <StatCard
          icon={Clock}
          value={avgTime.formatted || '—'}
          label="Tempo médio resposta"
          hexColor={HURAM_CHART_COLORS.primary}
          onExport={exp(
            'Tempo médio resposta',
            avgTime.formatted || '—',
            HURAM_CHART_COLORS.primary,
            'Tempo Médio de Resposta de Orçamentos',
          )}
        />
        <StatCard
          icon={TrendingUp}
          value={`${stats.responseRate}%`}
          label="Taxa de resposta"
          hexColor={HURAM_CHART_COLORS.tertiary}
          onExport={exp(
            'Taxa de resposta',
            `${stats.responseRate}%`,
            HURAM_CHART_COLORS.tertiary,
            'Taxa de Resposta de Orçamentos',
          )}
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {stats.statusChart.length > 0 && (
          <ChartCard
            title="Distribuição por Status"
            hexColor={HURAM_CHART_COLORS.primary}
            onExport={(fmt) =>
              downloadPieChart(stats.statusChart, 'Distribuição por Status', userName, fmt)
            }
          >
            <ChartContainer config={chartConfig} className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.statusChart}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label={(e) => `${e.name}: ${e.value}`}
                  >
                    {stats.statusChart.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </ChartCard>
        )}
        {stats.attendantChart.length > 0 && (
          <ChartCard
            title="Orçamentos por Atendente"
            hexColor={HURAM_CHART_COLORS.tertiary}
            onExport={(fmt) =>
              downloadBarChart(
                stats.attendantChart.map((d) => ({ name: d.name, value: d.quotes })),
                HURAM_CHART_COLORS.tertiary,
                'Orçamentos por Atendente',
                userName,
                fmt,
              )
            }
          >
            <ChartContainer config={chartConfig} className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.attendantChart}>
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: HURAM_CHART_COLORS.axis }}
                    stroke={HURAM_CHART_COLORS.axis}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12, fill: HURAM_CHART_COLORS.axis }}
                    stroke={HURAM_CHART_COLORS.axis}
                    allowDecimals={false}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="quotes" fill={HURAM_CHART_COLORS.tertiary} radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </ChartCard>
        )}
      </div>
      {stats.total === 0 && (
        <Card className="border-2 border-dashed border-border">
          <CardContent className="py-16 text-center">
            <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-bold text-foreground mb-1">
              Nenhuma solicitação registrada ainda.
            </p>
            <p className="text-sm text-muted-foreground">
              Os dados de produtividade de orçamentos aparecerão aqui automaticamente.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
