import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getPricingConfigs, getApprovals, getAlerts } from '@/services/pricing'
import { getProducts } from '@/services/products'
import { useRealtime } from '@/hooks/use-realtime'
import {
  parseNum,
  formatCurrency,
  calcPrices,
  type PricingConfig,
  type PricingApproval,
  type PricingAlert,
} from '@/lib/pricing-types'
import type { Product } from '@/lib/product-types'
import {
  Loader2,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  DollarSign,
  Percent,
  PackageX,
  Clock,
  Bell,
} from 'lucide-react'

export function PricingDashboard() {
  const [configs, setConfigs] = useState<PricingConfig[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [approvals, setApprovals] = useState<PricingApproval[]>([])
  const [alerts, setAlerts] = useState<PricingAlert[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      const [cfgs, prods, apprs, alrts] = await Promise.all([
        getPricingConfigs(),
        getProducts(),
        getApprovals('pending'),
        getAlerts(false),
      ])
      setConfigs(cfgs as unknown as PricingConfig[])
      setProducts(prods as unknown as Product[])
      setApprovals(apprs as unknown as PricingApproval[])
      setAlerts(alrts as unknown as PricingAlert[])
    } catch {
      /* noop */
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime('pricing_config', () => load())
  useRealtime('pricing_approvals', () => load())
  useRealtime('pricing_alerts', () => load())

  const stats = useMemo(() => {
    let negativeMargin = 0,
      belowMinimum = 0,
      aboveIdeal = 0,
      noPrice = 0
    let totalProfit = 0,
      totalMargin = 0,
      count = 0
    for (const c of configs) {
      if (!c) continue
      const computed = calcPrices(c)
      if (computed.profit_percent < 0) negativeMargin++
      if (parseNum(c.suggested_price) < computed.minimum_price) belowMinimum++
      if (computed.profit_percent > parseNum(c.desired_margin) + 20) aboveIdeal++
      if (!c.suggested_price || parseNum(c.suggested_price) === 0) noPrice++
      totalProfit += computed.profit_value
      totalMargin += computed.profit_percent
      count++
    }
    const productsWithoutConfig = products.filter(
      (p) => !configs.some((c) => c.product_id === p.id),
    ).length
    let withoutTax = 0,
      negativeProfitability = 0,
      aboveMaxMargin = 0
    for (const c of configs) {
      if (!c) continue
      const computed = calcPrices(c)
      if (!c.icms && !c.cbs && !c.ibs) withoutTax++
      if (computed.profit_value < 0) negativeProfitability++
      if (parseNum(c.maximum_margin) > 0 && computed.profit_percent > parseNum(c.maximum_margin))
        aboveMaxMargin++
    }
    return {
      negativeMargin,
      belowMinimum,
      aboveIdeal,
      noPrice: noPrice + productsWithoutConfig,
      avgProfit: count > 0 ? totalProfit / count : 0,
      avgMargin: count > 0 ? totalMargin / count : 0,
      pendingApprovals: approvals.length,
      withoutTax,
      negativeProfitability,
      aboveMaxMargin,
    }
  }, [configs, products, approvals])

  const cards = [
    { icon: TrendingDown, label: 'Margem Negativa', value: stats.negativeMargin, color: '#dc2626' },
    {
      icon: AlertTriangle,
      label: 'Abaixo do Preço Mínimo',
      value: stats.belowMinimum,
      color: '#f59e0b',
    },
    { icon: TrendingUp, label: 'Acima da Margem Ideal', value: stats.aboveIdeal, color: '#10b981' },
    {
      icon: DollarSign,
      label: 'Lucro Médio',
      value: `R$ ${formatCurrency(stats.avgProfit)}`,
      color: '#005B2E',
    },
    {
      icon: Percent,
      label: 'Margem Média',
      value: `${formatCurrency(stats.avgMargin)}%`,
      color: '#C89B3C',
    },
    { icon: PackageX, label: 'Produtos sem Preço', value: stats.noPrice, color: '#6b7280' },
    { icon: Clock, label: 'Aguardando Aprovação', value: stats.pendingApprovals, color: '#3b82f6' },
    {
      icon: AlertTriangle,
      label: 'Sem Classificação Fiscal',
      value: stats.withoutTax,
      color: '#8b5cf6',
    },
    {
      icon: TrendingDown,
      label: 'Rentabilidade Negativa',
      value: stats.negativeProfitability,
      color: '#ef4444',
    },
    {
      icon: TrendingUp,
      label: 'Acima da Margem Máxima',
      value: stats.aboveMaxMargin,
      color: '#f97316',
    },
  ]

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {cards.map((c, i) => (
          <Card key={i} className="border-2" style={{ borderColor: `${c.color}33` }}>
            <CardContent className="py-4 px-5 flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${c.color}1A` }}
              >
                <c.icon className="w-5 h-5" style={{ color: c.color }} />
              </div>
              <div>
                <p className="text-xl font-black text-foreground">{c.value}</p>
                <p className="text-xs text-muted-foreground">{c.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {alerts.length > 0 && (
        <Card className="border-2 border-red-200">
          <CardHeader>
            <CardTitle className="text-base text-red-600 flex items-center gap-2">
              <Bell className="w-4 h-4" /> Alertas Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {alerts.slice(0, 10).map((a) => (
                <div
                  key={a.id}
                  className={`flex items-center gap-2 p-2 rounded-lg text-sm ${a.severity === 'critical' ? 'bg-red-50 text-red-700' : a.severity === 'warning' ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'}`}
                >
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span className="font-medium">{a.product_name}:</span>
                  <span>{a.message}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
