import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts'
import { getProductsForStock, getStockMovements, getStockBatches } from '@/services/stock'
import { useRealtime } from '@/hooks/use-realtime'
import { daysUntilExpiry } from '@/lib/stock-types'
import { StockFilterBar, EMPTY_FILTERS, type StockFilterValues } from './stock-filter-bar'
import { Loader2, Package, AlertTriangle, Boxes, TrendingDown, Ban, Clock } from 'lucide-react'

export function StockDashboard() {
  const [products, setProducts] = useState<any[]>([])
  const [movements, setMovements] = useState<any[]>([])
  const [batches, setBatches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<StockFilterValues>(EMPTY_FILTERS)

  const load = async () => {
    try {
      const [p, m, b] = await Promise.all([
        getProductsForStock(),
        getStockMovements(),
        getStockBatches(),
      ])
      setProducts(p as any[])
      setMovements(m as any[])
      setBatches(b as any[])
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

  const f = useMemo(() => {
    const term = filters.produto.toLowerCase().trim()
    const cat = filters.categoria.toLowerCase().trim()
    const mar = filters.marca.toLowerCase().trim()
    const emp = filters.empresa.toLowerCase().trim()
    const fil = filters.filial.toLowerCase().trim()
    const dep = filters.deposito.toLowerCase().trim()
    const loc = filters.localizacao.toLowerCase().trim()
    const lote = filters.lote.toLowerCase().trim()

    const fp = products.filter((p) => {
      if (term && !(p.name?.toLowerCase().includes(term) || p.code?.toLowerCase().includes(term)))
        return false
      if (cat && !p.category?.toLowerCase().includes(cat)) return false
      if (mar && !p.brand?.toLowerCase().includes(mar)) return false
      return true
    })
    const fm = movements.filter((m) => {
      if (emp && !m.empresa?.toLowerCase().includes(emp)) return false
      if (fil && !m.filial?.toLowerCase().includes(fil)) return false
      if (dep && !m.deposito?.toLowerCase().includes(dep)) return false
      if (loc && !m.localizacao?.toLowerCase().includes(loc)) return false
      if (lote && !m.lote?.toLowerCase().includes(lote)) return false
      if (filters.dataInicio && new Date(m.created) < new Date(filters.dataInicio)) return false
      if (filters.dataFim && new Date(m.created) > new Date(filters.dataFim + 'T23:59:59'))
        return false
      return true
    })
    const fb = batches.filter((b) => {
      if (lote && !b.numero_lote?.toLowerCase().includes(lote)) return false
      if (emp && !b.empresa?.toLowerCase().includes(emp)) return false
      if (loc && !b.localizacao?.toLowerCase().includes(loc)) return false
      return true
    })
    return { fp, fm, fb }
  }, [products, movements, batches, filters])

  const stats = useMemo(() => {
    const totalProducts = f.fp.length
    const totalStockValue = f.fp.reduce(
      (s, p) => s + (parseFloat(String(p.price || '0').replace(',', '.')) || 0) * (p.stock || 0),
      0,
    )
    const noStock = f.fp.filter((p) => !p.stock || p.stock === 0).length
    const lowStock = f.fp.filter((p) => p.min_stock > 0 && p.stock < p.min_stock).length
    const overStock = f.fp.filter((p) => p.max_stock > 0 && p.stock > p.max_stock).length
    const reserved = f.fp.reduce((s, p) => s + (p.estoque_reservado || 0), 0)
    const picking = f.fp.reduce((s, p) => s + (p.estoque_separacao || 0), 0)
    const checking = f.fp.reduce((s, p) => s + (p.estoque_conferencia || 0), 0)
    const blocked = f.fp.reduce((s, p) => s + (p.estoque_bloqueado || 0), 0)
    const todayMov = f.fm.filter(
      (m) => new Date(m.created).toDateString() === new Date().toDateString(),
    ).length
    const nearExpiry = f.fb.filter((b) => {
      const d = daysUntilExpiry(b.data_validade)
      return d >= 0 && d <= 30
    }).length
    const expired = f.fb.filter((b) => daysUntilExpiry(b.data_validade) < 0).length
    const blockedLots = f.fb.filter((b) => b.situacao === 'Bloqueado').length
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
  }, [f])

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
    f.fp.reduce<Record<string, number>>((acc, p) => {
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
      <StockFilterBar
        filters={filters}
        onChange={setFilters}
        onClear={() => setFilters(EMPTY_FILTERS)}
      />
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
