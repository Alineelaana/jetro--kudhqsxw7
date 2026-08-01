import { useState, useEffect, useMemo, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { getBudgetRequests, getAverageResponseTime } from '@/services/budget-requests'
import { useRealtime } from '@/hooks/use-realtime'
import { FileText, CheckCircle, Clock, AlertCircle, Loader2, TrendingUp } from 'lucide-react'
import type { BudgetRecord } from '@/lib/types'

const STATUS_COLOR_HEX: Record<string, string> = {
  PENDENTE: '#f59e0b',
  'EM ANDAMENTO': '#3b82f6',
  'EM CONTATO COM O CLIENTE': '#06b6d4',
  CONCLUÍDO: '#22c55e',
  CANCELADO: '#ef4444',
}

export function BudgetProductivityDashboard() {
  const [records, setRecords] = useState<BudgetRecord[]>([])
  const [avgTime, setAvgTime] = useState({ averageMs: 0, count: 0, formatted: '' })
  const [loading, setLoading] = useState(true)

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
    const pending = records.filter((r) => r.status === 'PENDENTE').length
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

    return { total, withQuote, pending, responseRate, attendantChart, statusChart }
  }, [records])

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )
  }

  const chartConfig = {
    quotes: { label: 'Orçamentos', color: '#005B2E' },
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-2 border-[#005B2E]/20">
          <CardContent className="py-4 px-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#005B2E]/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-[#005B2E]" />
            </div>
            <div>
              <p className="text-xl font-black text-foreground">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Solicitações</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-2 border-[#C89B3C]/30">
          <CardContent className="py-4 px-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#C89B3C]/10 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-[#C89B3C]" />
            </div>
            <div>
              <p className="text-xl font-black text-foreground">{stats.withQuote}</p>
              <p className="text-xs text-muted-foreground">Orçamentos enviados</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-2 border-[#005B2E]/20">
          <CardContent className="py-4 px-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#005B2E]/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-[#005B2E]" />
            </div>
            <div>
              <p className="text-xl font-black text-foreground">{avgTime.formatted || '—'}</p>
              <p className="text-xs text-muted-foreground">Tempo médio resposta</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-2 border-[#C89B3C]/30">
          <CardContent className="py-4 px-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#C89B3C]/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-[#C89B3C]" />
            </div>
            <div>
              <p className="text-xl font-black text-foreground">{stats.responseRate}%</p>
              <p className="text-xs text-muted-foreground">Taxa de resposta</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {stats.statusChart.length > 0 && (
          <Card className="border-2 border-[#005B2E]/20">
            <CardHeader>
              <CardTitle className="text-base">Distribuição por Status</CardTitle>
            </CardHeader>
            <CardContent>
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
                      label={(entry) => `${entry.name}: ${entry.value}`}
                    >
                      {stats.statusChart.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        )}

        {stats.attendantChart.length > 0 && (
          <Card className="border-2 border-[#C89B3C]/30">
            <CardHeader>
              <CardTitle className="text-base">Orçamentos por Atendente</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.attendantChart}>
                    <XAxis
                      dataKey="name"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 12 }}
                      allowDecimals={false}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="quotes" fill="#C89B3C" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
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
