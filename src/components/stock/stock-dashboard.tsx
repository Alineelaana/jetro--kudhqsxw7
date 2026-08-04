import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts'
import { getProductsForStock, getStockMovements, getStockBatches } from '@/services/stock'
import { useRealtime } from '@/hooks/use-realtime'
import { daysUntilExpiry } from '@/lib/stock-types'
import { Loader2, Package, AlertTriangle, Boxes, TrendingDown, Ban, Clock } from 'lucide-react'

interface ProductStock {
  id: string
  name: string
  code: string
  stock: number
  min_stock: number
  max_stock: number
  price: string
  cost_price: string
  estoque_reservado: number
  estoque_separacao: number
  estoque_conferencia: number
  estoque_transito: number
  estoque_bloqueado: number
  estoque_avariado: number
  category: string
  brand: string
}

export function StockDashboard() {
  const [products, setProducts] = useState<ProductStock[]>([])
  const [movements, setMovements] = useState<unknown[]>([])
  const [batches, setBatches] = useState<unknown[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      const [p, m, b] = await Promise.all([
        getProductsForStock(),
        getStockMovements(),
        getStockBatches(),
      ])
      setProducts(p as ProductStock[])
      setMovements(m)
      setBatches(b)
    } catch {
      setProducts([])
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime('products', () => load())
  useRealtime('stock_movements', () => load())
  useRealtime('stock_batches', () => load())

  const stats = useMemo(() => {
    const totalProducts = products.length
    const totalStockValue = products.reduce(
      (s, p) => s + (parseFloat(p.price?.replace(',', '.') || '0') || 0) * (p.stock || 0),
      0,
    )
    const noStock = products.filter((p) => !p.stock || p.stock === 0).length
    const lowStock = products.filter((p) => p.min_stock > 0 && p.stock < p.min_stock).length
    const overStock = products.filter((p) => p.max_stock > 0 && p.stock > p.max_stock).length
    const reserved = products.reduce((s, p) => s + (p.estoque_reservado || 0), 0)
    const picking = products.reduce((s, p) => s + (p.estoque_separacao || 0), 0)
    const checking = products.reduce((s, p) => s + (p.estoque_conferencia || 0), 0)
    const blocked = products.reduce((s, p) => s + (p.estoque_bloqueado || 0), 0)
    const todayMov = movements.filter((m: Record<string, unknown>) => {
      const d = new Date(m.created as string)
      return d.toDateString() === new Date().toDateString()
    }).length
    const allBatches = batches as Array<{ data_validade: string; situacao: string }>
    const nearExpiry = allBatches.filter((b) => {
      const days = daysUntilExpiry(b.data_validade)
      return days >= 0 && days <= 30
    }).length
    const expired = allBatches.filter((b) => {
      const days = daysUntilExpiry(b.data_validade)
      return days < 0
    }).length
    const blockedLots = allBatches.filter((b) => b.situacao === 'Bloqueado').length
    return {
      totalProducts,
      totalStockValue,
      noStock,
      lowStock,
      overStock,
      reserved,
      picking,
      checking,
      blocked,
      todayMov,
      nearExpiry,
      expired,
      blockedLots,
    }
  }, [products, movements, batches])

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )

  const chartConfig = { value: { label: 'Quantidade', color: '#005B2E' } }
  const cards = [
    { icon: Package, label: 'Total de Produtos', value: stats.totalProducts, color: '#005B2E' },
    {
      icon: TrendingDown,
      label: 'Valor em Estoque',
      value: `R$ ${stats.totalStockValue.toFixed(2)}`,
      color: '#C89B3C',
    },
    { icon: Ban, label: 'Sem Estoque', value: stats.noStock, color: '#ef4444' },
    { icon: AlertTriangle, label: 'Estoque Baixo', value: stats.lowStock, color: '#f59e0b' },
    { icon: Boxes, label: 'Acima do Máximo', value: stats.overStock, color: '#3b82f6' },
    { icon: Clock, label: 'Reservado', value: stats.reserved, color: '#8b5cf6' },
    { icon: Clock, label: 'Em Separação', value: stats.picking, color: '#06b6d4' },
    { icon: Clock, label: 'Em Conferência', value: stats.checking, color: '#ec4899' },
    { icon: Ban, label: 'Bloqueado', value: stats.blocked, color: '#ef4444' },
    { icon: AlertTriangle, label: 'Próx. Vencimento', value: stats.nearExpiry, color: '#f59e0b' },
    { icon: Ban, label: 'Vencidos', value: stats.expired, color: '#ef4444' },
    { icon: Ban, label: 'Lotes Bloqueados', value: stats.blockedLots, color: '#ef4444' },
    { icon: Boxes, label: 'Mov. Hoje', value: stats.todayMov, color: '#22c55e' },
  ]

  const categoryChart = Object.entries(
    products.reduce<Record<string, number>>((acc, p) => {
      const cat = p.category || 'Sem Categoria'
      acc[cat] = (acc[cat] || 0) + (p.stock || 0)
      return acc
    }, {}),
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, value]) => ({ name, value }))

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
      <Card className="border-2 border-[#005B2E]/30">
        <CardHeader>
          <CardTitle className="text-base">Estoque por Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryChart}>
                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="value" fill="#005B2E" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
