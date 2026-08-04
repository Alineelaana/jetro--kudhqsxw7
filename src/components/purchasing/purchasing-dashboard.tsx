import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { getPurchaseOrders } from '@/services/purchasing'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import { type PurchaseOrder } from '@/lib/purchasing-types'
import { Loader2, ShoppingCart, TrendingUp, Clock, AlertCircle, DollarSign } from 'lucide-react'

const COLORS = [
  '#005B2E',
  '#C89B3C',
  '#3b82f6',
  '#22c55e',
  '#f59e0b',
  '#8b5cf6',
  '#ec4899',
  '#06b6d4',
]

export function PurchasingDashboard() {
  const [orders, setOrders] = useState<PurchaseOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    company: '',
    branch: '',
    buyer: '',
    supplier: '',
    period: '',
  })
  const { user } = useAuth()

  const load = async () => {
    try {
      setOrders((await getPurchaseOrders()) as unknown as PurchaseOrder[])
    } catch {
      setOrders([])
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime('purchase_orders', () => load())

  const filtered = useMemo(
    () =>
      orders.filter((o) => {
        if (filters.company && o.company !== filters.company) return false
        if (filters.branch && o.branch !== filters.branch) return false
        if (filters.buyer && o.buyer !== filters.buyer) return false
        if (filters.supplier && o.supplier_name !== filters.supplier) return false
        if (filters.period) {
          const d = new Date(o.created)
          const now = new Date()
          if (
            filters.period === 'month' &&
            (d.getMonth() !== now.getMonth() || d.getFullYear() !== now.getFullYear())
          )
            return false
          if (filters.period === 'week') {
            const diff = (now.getTime() - d.getTime()) / 86400000
            if (diff > 7) return false
          }
          if (filters.period === 'quarter') {
            const diff = (now.getTime() - d.getTime()) / 86400000
            if (diff > 90) return false
          }
        }
        return true
      }),
    [orders, filters],
  )

  const stats = useMemo(() => {
    const now = new Date()
    const monthOrders = filtered.filter((o) => {
      const d = new Date(o.created)
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    })
    const monthTotal = monthOrders.reduce((s, o) => s + (parseFloat(o.total_value) || 0), 0)
    const avgValue =
      filtered.length > 0
        ? filtered.reduce((s, o) => s + (parseFloat(o.total_value) || 0), 0) / filtered.length
        : 0
    const open = filtered.filter(
      (o) => !['Recebido Totalmente', 'Cancelado'].includes(o.status),
    ).length
    const pending = filtered.filter((o) => o.status === 'Aguardando Aprovação').length
    const overdue = filtered.filter(
      (o) =>
        o.delivery_forecast &&
        new Date(o.delivery_forecast) < now &&
        !['Recebido Totalmente', 'Cancelado'].includes(o.status),
    ).length
    const bySupplier: Record<string, number> = {}
    filtered.forEach((o) => {
      if (o.supplier_name)
        bySupplier[o.supplier_name] =
          (bySupplier[o.supplier_name] || 0) + (parseFloat(o.total_value) || 0)
    })
    const byBuyer: Record<string, number> = {}
    filtered.forEach((o) => {
      if (o.buyer) byBuyer[o.buyer] = (byBuyer[o.buyer] || 0) + (parseFloat(o.total_value) || 0)
    })
    const byCategory: Record<string, number> = {}
    filtered.forEach((o) =>
      o.items?.forEach((it) => {
        const cat = it.product || 'Sem categoria'
        byCategory[cat] = (byCategory[cat] || 0) + (parseFloat(it.total) || 0)
      }),
    )
    const topProducts: Record<string, number> = {}
    filtered.forEach((o) =>
      o.items?.forEach((it) => {
        if (it.product)
          topProducts[it.product] = (topProducts[it.product] || 0) + (parseFloat(it.quantity) || 0)
      }),
    )
    return {
      monthTotal,
      avgValue,
      open,
      pending,
      overdue,
      supplierChart: Object.entries(bySupplier)
        .slice(0, 8)
        .map(([name, value]) => ({ name, value })),
      buyerChart: Object.entries(byBuyer).map(([name, value]) => ({ name, value })),
      categoryChart: Object.entries(byCategory)
        .slice(0, 6)
        .map(([name, value], i) => ({ name, value, color: COLORS[i % COLORS.length] })),
      topProducts: Object.entries(topProducts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, value]) => ({ name, value })),
    }
  }, [filtered])

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )

  const chartConfig = { value: { label: 'Valor', color: '#005B2E' } }
  const companies = [...new Set(orders.map((o) => o.company).filter(Boolean))]
  const branches = [...new Set(orders.map((o) => o.branch).filter(Boolean))]
  const buyers = [...new Set(orders.map((o) => o.buyer).filter(Boolean))]
  const suppliersList = [...new Set(orders.map((o) => o.supplier_name).filter(Boolean))]

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold">Dashboard de Compras</h3>
      <Card className="border-2 border-[#005B2E]/20">
        <CardContent className="py-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <div>
              <Label className="text-xs">Empresa</Label>
              <Select
                value={filters.company}
                onValueChange={(v) => setFilters({ ...filters, company: v === 'all' ? '' : v })}
              >
                <SelectTrigger className="focus-visible:ring-[#005B2E]">
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {companies.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Filial</Label>
              <Select
                value={filters.branch}
                onValueChange={(v) => setFilters({ ...filters, branch: v === 'all' ? '' : v })}
              >
                <SelectTrigger className="focus-visible:ring-[#005B2E]">
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {branches.map((b) => (
                    <SelectItem key={b} value={b}>
                      {b}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Período</Label>
              <Select
                value={filters.period}
                onValueChange={(v) => setFilters({ ...filters, period: v === 'all' ? '' : v })}
              >
                <SelectTrigger className="focus-visible:ring-[#005B2E]">
                  <SelectValue placeholder="Todo período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todo período</SelectItem>
                  <SelectItem value="week">Última semana</SelectItem>
                  <SelectItem value="month">Este mês</SelectItem>
                  <SelectItem value="quarter">Últimos 90 dias</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Comprador</Label>
              <Select
                value={filters.buyer}
                onValueChange={(v) => setFilters({ ...filters, buyer: v === 'all' ? '' : v })}
              >
                <SelectTrigger className="focus-visible:ring-[#005B2E]">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {buyers.map((b) => (
                    <SelectItem key={b} value={b}>
                      {b}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Fornecedor</Label>
              <Select
                value={filters.supplier}
                onValueChange={(v) => setFilters({ ...filters, supplier: v === 'all' ? '' : v })}
              >
                <SelectTrigger className="focus-visible:ring-[#005B2E]">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {suppliersList.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          {
            icon: ShoppingCart,
            label: 'Compras do Mês',
            value: `R$ ${stats.monthTotal.toFixed(2)}`,
            color: '#005B2E',
          },
          {
            icon: DollarSign,
            label: 'Valor Médio',
            value: `R$ ${stats.avgValue.toFixed(2)}`,
            color: '#C89B3C',
          },
          { icon: Clock, label: 'Pedidos em Aberto', value: stats.open, color: '#3b82f6' },
          {
            icon: AlertCircle,
            label: 'Aguardando Aprovação',
            value: stats.pending,
            color: '#f59e0b',
          },
          { icon: TrendingUp, label: 'Pedidos em Atraso', value: stats.overdue, color: '#ef4444' },
        ].map((s, i) => (
          <Card key={i} className="border-2" style={{ borderColor: `${s.color}33` }}>
            <CardContent className="py-4 px-4 flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${s.color}1A` }}
              >
                <s.icon className="w-5 h-5" style={{ color: s.color }} />
              </div>
              <div>
                <p className="text-lg font-black text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-2 border-[#005B2E]/30">
          <CardHeader>
            <CardTitle className="text-base">Compras por Fornecedor</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.supplierChart}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label={(e) => `${e.name}: R$ ${(e.value || 0).toFixed(0)}`}
                  >
                    {stats.supplierChart.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="border-2 border-[#C89B3C]/30">
          <CardHeader>
            <CardTitle className="text-base">Compras por Comprador</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.buyerChart}>
                  <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="value" fill="#C89B3C" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
      <Card className="border-2 border-[#005B2E]/30">
        <CardHeader>
          <CardTitle className="text-base">Produtos Mais Comprados</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.topProducts} layout="vertical">
                <XAxis type="number" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                <YAxis
                  type="category"
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11 }}
                  width={120}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="value" fill="#005B2E" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
