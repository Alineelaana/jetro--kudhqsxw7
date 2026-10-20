import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer } from '@/components/ui/chart'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { getCrmDashboardData } from '@/services/crm'
import { CrmErpIntegrationPanel } from '@/components/crm/crm-erp-integration-panel'
import { useRealtime } from '@/hooks/use-realtime'
import { HURAM_CHART_COLORS, HURAM_CHART_SEQUENCE } from '@/lib/huram-charts-theme'
import {
  Users,
  Target,
  Activity,
  CheckCircle,
  XCircle,
  Briefcase,
  DollarSign,
  Percent,
  TrendingUp,
  Clock,
  FileText,
} from 'lucide-react'

export function CrmDashboard() {
  const [data, setData] = useState<Record<string, unknown> | null>(null)
  const load = async () => setData(await getCrmDashboardData())
  useEffect(() => {
    load()
  }, [])
  useRealtime('crm_leads', () => load())
  useRealtime('crm_opportunities', () => load())
  useRealtime('crm_proposals', () => load())

  if (!data)
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-[#063D30] border-t-transparent rounded-full animate-spin" />
      </div>
    )

  const cards = [
    { label: 'Total de Leads', value: data.totalLeads as number, icon: Users, color: '#3b82f6' },
    { label: 'Leads Novos', value: data.newLeads as number, icon: Target, color: '#06b6d4' },
    {
      label: 'Em Atendimento',
      value: data.inAttendance as number,
      icon: Activity,
      color: '#f59e0b',
    },
    {
      label: 'Convertidos',
      value: data.convertedLeads as number,
      icon: CheckCircle,
      color: '#10b981',
    },
    { label: 'Perdidos', value: data.lostLeads as number, icon: XCircle, color: '#ef4444' },
    {
      label: 'Oport. em Aberto',
      value: data.openOpps as number,
      icon: Briefcase,
      color: '#8b5cf6',
    },
    {
      label: 'Valor do Funil',
      value: `R$ ${(data.funnelValue as number).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: '#22c55e',
    },
    {
      label: 'Taxa de Conversão',
      value: `${(data.conversionRate as number).toFixed(1)}%`,
      icon: Percent,
      color: '#ec4899',
    },
    {
      label: 'Ticket Médio',
      value: `R$ ${(data.avgTicket as number).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: TrendingUp,
      color: '#f97316',
    },
    {
      label: 'Ativ. Atrasadas',
      value: data.overdueActivities as number,
      icon: Clock,
      color: '#ef4444',
    },
    {
      label: 'Prop. Enviadas',
      value: data.sentProposals as number,
      icon: FileText,
      color: '#3b82f6',
    },
    {
      label: 'Prop. Aprovadas',
      value: data.approvedProposals as number,
      icon: CheckCircle,
      color: '#22c55e',
    },
  ]
  const oppsByStage = (data.oppsByStage as Array<Record<string, unknown>>) || []
  const salesByResponsible = (data.salesByResponsible as Array<Record<string, unknown>>) || []

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {cards.map((c) => (
          <Card key={c.label} className="border-2" style={{ borderColor: `${c.color}33` }}>
            <CardContent className="py-3 px-4 flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${c.color}1A` }}
              >
                <c.icon className="w-4 h-4" style={{ color: c.color }} />
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
        <Card className="border-2 border-[#063D30]/20">
          <CardHeader>
            <CardTitle className="text-base text-[#063D30]">Oportunidades por Etapa</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={oppsByStage}>
                  <XAxis
                    dataKey="stage"
                    tick={{ fontSize: 10, fill: HURAM_CHART_COLORS.axis }}
                    stroke={HURAM_CHART_COLORS.axis}
                    angle={-20}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: HURAM_CHART_COLORS.axis }}
                    stroke={HURAM_CHART_COLORS.axis}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '8px',
                      border: `1px solid ${HURAM_CHART_COLORS.grid}`,
                      fontSize: '11px',
                    }}
                  />
                  <Bar dataKey="count" fill={HURAM_CHART_COLORS.primary} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="border-2 border-[#063D30]/20">
          <CardHeader>
            <CardTitle className="text-base text-[#063D30]">Vendas por Responsável</CardTitle>
          </CardHeader>
          <CardContent>
            {salesByResponsible.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">Nenhuma venda realizada.</p>
            ) : (
              <ChartContainer config={{}} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={salesByResponsible}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {salesByResponsible.map((_: Record<string, unknown>, i: number) => (
                        <Cell
                          key={i}
                          fill={HURAM_CHART_SEQUENCE[i % HURAM_CHART_SEQUENCE.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: '8px',
                        border: `1px solid ${HURAM_CHART_COLORS.grid}`,
                        fontSize: '11px',
                      }}
                      formatter={(v: number) =>
                        `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                      }
                    />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>
      <CrmErpIntegrationPanel />
    </div>
  )
}
