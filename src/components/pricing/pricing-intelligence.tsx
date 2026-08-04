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
import { getPricingHistory, getPricingConfigs } from '@/services/pricing'
import {
  parseNum,
  formatCurrency,
  type PricingHistory,
  type PricingConfig,
} from '@/lib/pricing-types'
import type { Product } from '@/lib/product-types'
import { Loader2, Brain, TrendingUp, Lightbulb } from 'lucide-react'

export function PricingIntelligence() {
  const [products, setProducts] = useState<Product[]>([])
  const [configs, setConfigs] = useState<PricingConfig[]>([])
  const [history, setHistory] = useState<PricingHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProductId, setSelectedProductId] = useState('')

  const load = async () => {
    try {
      const [prods, cfgs] = await Promise.all([getProducts(), getPricingConfigs()])
      setProducts(prods as unknown as Product[])
      setConfigs(cfgs as unknown as PricingConfig[])
    } catch {
      /* noop */
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])

  useEffect(() => {
    if (selectedProductId) {
      getPricingHistory(selectedProductId)
        .then((h) => setHistory(h as unknown as PricingHistory[]))
        .catch(() => setHistory([]))
    }
  }, [selectedProductId])

  const selectedProduct = products.find((p) => p?.id === selectedProductId)
  const selectedConfig = configs.find((c) => c?.product_id === selectedProductId)

  const intel = useMemo(() => {
    if (!history.length) return null
    const prices = history.map((h) => parseNum(h.new_price)).filter((p) => p > 0)
    const margins = history.map((h) => {
      const cost = parseNum(selectedConfig?.total_cost)
      const price = parseNum(h.new_price)
      return cost > 0 ? ((price - cost) / price) * 100 : 0
    })
    const lastPrice = prices[0] || 0
    const lowestPrice = prices.length > 0 ? Math.min(...prices) : 0
    const highestPrice = prices.length > 0 ? Math.max(...prices) : 0
    const avgMargin = margins.length > 0 ? margins.reduce((a, b) => a + b, 0) / margins.length : 0
    const giro = history.length
    const currentCost = parseNum(selectedConfig?.total_cost)
    const rentability =
      lastPrice > 0 && currentCost > 0 ? ((lastPrice - currentCost) / lastPrice) * 100 : 0
    const suggestedAdjustment =
      avgMargin > 0 && currentCost > 0 ? currentCost / (1 - avgMargin / 100) - lastPrice : 0
    return {
      lastPrice,
      lowestPrice,
      highestPrice,
      avgMargin,
      giro,
      rentability,
      suggestedAdjustment,
    }
  }, [history, selectedConfig])

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )

  return (
    <div className="space-y-4">
      <Card className="border-2 border-[#005B2E]/20">
        <CardContent className="py-4">
          <Select value={selectedProductId} onValueChange={setSelectedProductId}>
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

      {selectedProductId && intel && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Card className="border-2 border-[#005B2E]/20">
              <CardContent className="py-3 px-4">
                <p className="text-xs text-muted-foreground">Último Preço Praticado</p>
                <p className="text-lg font-black text-[#005B2E]">
                  R$ {formatCurrency(intel.lastPrice)}
                </p>
              </CardContent>
            </Card>
            <Card className="border-2 border-[#005B2E]/20">
              <CardContent className="py-3 px-4">
                <p className="text-xs text-muted-foreground">Menor Preço Vendido</p>
                <p className="text-lg font-black text-red-600">
                  R$ {formatCurrency(intel.lowestPrice)}
                </p>
              </CardContent>
            </Card>
            <Card className="border-2 border-[#005B2E]/20">
              <CardContent className="py-3 px-4">
                <p className="text-xs text-muted-foreground">Maior Preço Vendido</p>
                <p className="text-lg font-black text-emerald-600">
                  R$ {formatCurrency(intel.highestPrice)}
                </p>
              </CardContent>
            </Card>
            <Card className="border-2 border-[#005B2E]/20">
              <CardContent className="py-3 px-4">
                <p className="text-xs text-muted-foreground">Margem Média Histórica</p>
                <p className="text-lg font-black text-[#C89B3C]">
                  {formatCurrency(intel.avgMargin)}%
                </p>
              </CardContent>
            </Card>
            <Card className="border-2 border-[#005B2E]/20">
              <CardContent className="py-3 px-4">
                <p className="text-xs text-muted-foreground">Giro do Produto</p>
                <p className="text-lg font-black">{intel.giro} alterações</p>
              </CardContent>
            </Card>
            <Card className="border-2 border-[#005B2E]/20">
              <CardContent className="py-3 px-4">
                <p className="text-xs text-muted-foreground">Rentabilidade</p>
                <p className="text-lg font-black text-[#005B2E]">
                  {formatCurrency(intel.rentability)}%
                </p>
              </CardContent>
            </Card>
            <Card className="border-2 border-[#005B2E]/20">
              <CardContent className="py-3 px-4">
                <p className="text-xs text-muted-foreground">Preço Médio Concorrência</p>
                <p className="text-lg font-black text-muted-foreground">N/D</p>
              </CardContent>
            </Card>
            <Card
              className={`border-2 ${intel.suggestedAdjustment > 0 ? 'border-emerald-200' : 'border-amber-200'}`}
            >
              <CardContent className="py-3 px-4">
                <p className="text-xs text-muted-foreground">Sugestão de Reajuste</p>
                <p
                  className={`text-lg font-black ${intel.suggestedAdjustment > 0 ? 'text-emerald-600' : 'text-amber-600'}`}
                >
                  {intel.suggestedAdjustment > 0 ? '+' : ''}R${' '}
                  {formatCurrency(intel.suggestedAdjustment)}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-2 border-[#C89B3C]/40">
            <CardHeader>
              <CardTitle className="text-base text-[#005B2E] flex items-center gap-2">
                <Lightbulb className="w-4 h-4" /> Sugestão de Reajuste
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                {intel.suggestedAdjustment > 0
                  ? `Com base no histórico de margens (${formatCurrency(intel.avgMargin)}%) e no custo atual (R$ ${formatCurrency(selectedConfig?.total_cost || '0')}), sugere-se um reajuste de +R$ ${formatCurrency(intel.suggestedAdjustment)} no preço de venda.`
                  : intel.suggestedAdjustment < 0
                    ? `O preço atual está acima do sugerido pela margem histórica. Considere reduzir em R$ ${formatCurrency(Math.abs(intel.suggestedAdjustment))} para manter a competitividade.`
                    : 'O preço atual está alinhado com a margem histórica. Nenhum reajuste necessário.'}
              </p>
            </CardContent>
          </Card>
        </>
      )}
      {selectedProductId && !intel && (
        <Card className="border-2 border-dashed">
          <CardContent className="py-16 text-center">
            <Brain className="w-12 h-12 text-[#005B2E]/30 mx-auto mb-4" />
            <p className="text-lg font-bold">Sem dados históricos suficientes</p>
            <p className="text-sm text-muted-foreground mt-1">
              Realize alterações de precificação para gerar inteligência comercial.
            </p>
          </CardContent>
        </Card>
      )}
      {!selectedProductId && (
        <Card className="border-2 border-dashed">
          <CardContent className="py-16 text-center">
            <TrendingUp className="w-12 h-12 text-[#005B2E]/30 mx-auto mb-4" />
            <p className="text-lg font-bold">
              Selecione um produto para ver a inteligência comercial
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
