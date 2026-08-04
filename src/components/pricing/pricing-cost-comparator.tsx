import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getProducts } from '@/services/products'
import { getPricingConfigs } from '@/services/pricing'
import {
  parseNum,
  formatCurrency,
  calcPrices,
  calcFinalCost,
  calcTotalTaxes,
  type PricingConfig,
} from '@/lib/pricing-types'
import type { Product } from '@/lib/product-types'
import { Loader2, Scale } from 'lucide-react'

export function PricingCostComparator() {
  const [products, setProducts] = useState<Product[]>([])
  const [configs, setConfigs] = useState<PricingConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState('')

  useEffect(() => {
    Promise.all([getProducts(), getPricingConfigs()])
      .then(([p, c]) => {
        setProducts(p as unknown as Product[])
        setConfigs(c as unknown as PricingConfig[])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const cfg = useMemo(
    () => configs.find((c) => c?.product_id === selectedId),
    [configs, selectedId],
  )

  const data = useMemo(() => {
    if (!cfg) return null
    const computed = calcPrices(cfg)
    return {
      lastCost: parseNum(cfg.last_purchase_cost),
      avgCost: parseNum(cfg.average_cost),
      replacementCost: parseNum(cfg.replacement_cost),
      taxCost: calcTotalTaxes(cfg),
      totalCost: computed.total_cost,
      currentPrice: parseNum(cfg.suggested_price),
      suggestedPrice: computed.suggested_price,
      profit: computed.profit_value,
      margin: computed.profit_percent,
      profitability: computed.profit_percent,
    }
  }, [cfg])

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )

  const cards = data
    ? [
        { label: 'Último Custo', value: data.lastCost, color: '#3b82f6' },
        { label: 'Custo Médio', value: data.avgCost, color: '#8b5cf6' },
        { label: 'Custo de Reposição', value: data.replacementCost, color: '#06b6d4' },
        { label: 'Custo Tributário', value: data.taxCost, color: '#f59e0b' },
        { label: 'Custo Total', value: data.totalCost, color: '#dc2626' },
        { label: 'Preço Atual', value: data.currentPrice, color: '#005B2E' },
        { label: 'Preço Sugerido', value: data.suggestedPrice, color: '#10b981' },
        { label: 'Lucro', value: data.profit, color: '#C89B3C' },
        { label: 'Margem (%)', value: data.margin, isPercent: true, color: '#005B2E' },
        {
          label: 'Rentabilidade (%)',
          value: data.profitability,
          isPercent: true,
          color: '#01361D',
        },
      ]
    : []

  return (
    <div className="space-y-4">
      <Card className="border-2 border-[#005B2E]/20">
        <CardContent className="py-4">
          <Select value={selectedId} onValueChange={setSelectedId}>
            <SelectTrigger className="focus-visible:ring-[#005B2E]">
              <SelectValue placeholder="Selecione um produto" />
            </SelectTrigger>
            <SelectContent>
              {products.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name} — {p.code}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
      {selectedId && data && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {cards.map((c, i) => (
            <Card key={i} className="border-2" style={{ borderColor: `${c.color}33` }}>
              <CardContent className="py-3 px-4">
                <p className="text-xs text-muted-foreground">{c.label}</p>
                <p className="text-lg font-black" style={{ color: c.color }}>
                  {c.isPercent ? `${formatCurrency(c.value)}%` : `R$ ${formatCurrency(c.value)}`}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {selectedId && !data && (
        <Card className="border-2 border-dashed">
          <CardContent className="py-16 text-center">
            <Scale className="w-12 h-12 text-[#005B2E]/30 mx-auto mb-4" />
            <p className="text-lg font-bold">Configure a precificação primeiro</p>
          </CardContent>
        </Card>
      )}
      {!selectedId && (
        <Card className="border-2 border-dashed">
          <CardContent className="py-16 text-center">
            <Scale className="w-12 h-12 text-[#005B2E]/30 mx-auto mb-4" />
            <p className="text-lg font-bold">Selecione um produto para comparar custos</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
