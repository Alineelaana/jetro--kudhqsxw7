import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { getSalesOrders, getSalesInvoices } from '@/services/sales'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import type { SalesOrder } from '@/lib/sales-types'
import {
  Loader2,
  DollarSign,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  Percent,
} from 'lucide-react'

import { HURAM_CHART_COLORS, HURAM_CHART_SEQUENCE } from '@/lib/huram-charts-theme'

const COLORS = HURAM_CHART_SEQUENCE

export function SalesDashboard() {
  const [orders, setOrders] = useState<SalesOrder[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  const load = async () => {
    try {
      setOrders(await getSalesOrders())
    } catch {
      setOrders([])
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime('sales_orders', () => load())

  const stats = useMemo(() => {
    const now = new Date()
    const todayOrders = orders.filter((o) => {
      const d = new Date(o.created)
      return d.toDateString() === now.toDateString()
    })
    const monthOrders = orders.filter((o) => {
      const d = new Date(o.created)
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    })
    const sumVal = (arr: SalesOrder[]) =>
      arr.reduce((s, o) => s + (parseFloat(o.total_value) || 0), 0)
    const todayTotal = sumVal(todayOrders)
    const monthTotal = sumVal(monthOrders)
    const invoiced = orders.filter((o) =>
      ['Faturado Totalmente', 'Faturado Parcialmente'].includes(o.status),
    )
    const invoicedTotal = sumVal(invoiced)
    const pendingApproval = orders.filter((o) => o.status === 'Aguardando Aprovação').length
    const pendingInvoicing = orders.filter((o) =>
      ['Estoque Reservado', 'Aguardando Faturamento'].includes(o.status),
    ).length
    const canceled = orders.filter((o) => o.status === 'Cancelado').length
    const avgTicket = orders.length > 0 ? sumVal(orders) / orders.length : 0
    const bySalesperson: Record<string, number> = {}
    orders.forEach((o) => {
      if (o.salesperson_name)
        bySalesperson[o.salesperson_name] =
          (bySalesperson[o.salesperson_name] || 0) + (parseFloat(o.total_value) || 0)
    })
    const byClient: Record<string, number> = {}
    orders.forEach((o) => {
      if (o.client_name)
        byClient[o.client_name] = (byClient[o.client_name] || 0) + (parseFloat(o.total_value) || 0)
    })
    const byProduct: Record<string, number> = {}
    orders.forEach((o) =>
      o.items?.forEach((it) => {
        if (it.product)
          byProduct[it.product] = (byProduct[it.product] || 0) + (parseFloat(it.quantity) || 0)
      }),
    )
    return {
      todayTotal,
      monthTotal,
      invoicedTotal,
      totalOrders: orders.length,
      pendingApproval,
      pendingInvoicing,
      invoicedCount: invoiced.length,
      canceled,
      avgTicket,
      salespersonChart: Object.entries(bySalesperson).map(([name, value]) => ({ name, value })),
      clientChart: Object.entries(byClient)
        .slice(0, 8)
        .map(([name, value]) => ({ name, value })),
      productChart: Object.entries(byProduct)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, value]) => ({ name, value })),
    }
  }, [orders])

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#063D30] animate-spin" />
      </div>
    )

  const chartConfig = { value: { label: 'Valor', color: HURAM_CHART_COLORS.primary } }
  const cards = [
    {
      icon: DollarSign,
      label: 'Vendas do Dia',
      value: `R$ ${stats.todayTotal.toFixed(2)}`,
      color: HURAM_CHART_COLORS.primary,
    },
    {
      icon: TrendingUp,
      label: 'Vendas do Mês',
      value: `R$ ${stats.monthTotal.toFixed(2)}`,
      color: HURAM_CHART_COLORS.tertiary,
    },
    {
      icon: CheckCircle,
      label: 'Valor Faturado',
      value: `R$ ${stats.invoicedTotal.toFixed(2)}`,
      color: HURAM_CHART_COLORS.secondary,
    },
    {
      icon: FileText,
      label: 'Qtd. Pedidos',
      value: stats.totalOrders,
      color: HURAM_CHART_COLORS.quaternary,
    },
    {
      icon: Clock,
      label: 'Aguard. Aprovação',
      value: stats.pendingApproval,
      color: HURAM_CHART_COLORS.warning,
    },
    { icon: Clock, label: 'Aguard. Faturamento', value: stats.pendingInvoicing, color: '#06b6d4' },
    {
      icon: CheckCircle,
      label: 'Faturados',
      value: stats.invoicedCount,
      color: HURAM_CHART_COLORS.success,
    },
    { icon: XCircle, label: 'Cancelados', value: stats.canceled, color: HURAM_CHART_COLORS.danger },
    {
      icon: Percent,
      label: 'Ticket Médio',
      value: `R$ ${stats.avgTicket.toFixed(2)}`,
      color: '#8b5cf6',
    },
  ]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
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
                <p className="text-base font-black text-foreground truncate">{c.value}</p>
                <p className="text-[10px] text-muted-foreground">{c.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-2 border-[#063D30]/20">
          <CardHeader>
            <CardTitle className="text-base text-[#063D30]">Vendas por Vendedor</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.salespersonChart}>
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
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="value" fill={HURAM_CHART_COLORS.primary} radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="border-2 border-[#C69B45]/20">
          <CardHeader>
            <CardTitle className="text-base text-[#063D30]">Clientes que Mais Compraram</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.clientChart}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={(e) => e.name}
                  >
                    {stats.clientChart.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
      <Card className="border-2 border-[#063D30]/20">
        <CardHeader>
          <CardTitle className="text-base text-[#063D30]">Produtos Mais Vendidos</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.productChart} layout="vertical">
                <XAxis
                  type="number"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: HURAM_CHART_COLORS.axis }}
                  stroke={HURAM_CHART_COLORS.axis}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: HURAM_CHART_COLORS.axis }}
                  stroke={HURAM_CHART_COLORS.axis}
                  width={120}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="value" fill={HURAM_CHART_COLORS.secondary} radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
