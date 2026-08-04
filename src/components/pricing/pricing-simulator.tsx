import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getProducts } from '@/services/products'
import { getPricingConfig, createSimulation } from '@/services/pricing'
import {
  parseNum,
  formatCurrency,
  calcPrices,
  calcFinalCost,
  calcTotalTaxes,
  type PricingConfig,
} from '@/lib/pricing-types'
import type { Product } from '@/lib/product-types'
import { Loader2, FlaskConical, ArrowRight } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

export function PricingSimulator() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState('')
  const [cfg, setCfg] = useState<PricingConfig | null>(null)
  const [newPrice, setNewPrice] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getProducts()
      .then((p) => {
        setProducts(p as unknown as Product[])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (selectedId) {
      getPricingConfig(selectedId)
        .then((c) => setCfg(c as unknown as PricingConfig))
        .catch(() => setCfg(null))
    }
  }, [selectedId])

  const current = useMemo(() => {
    if (!cfg) return null
    const computed = calcPrices(cfg)
    return {
      price: parseNum(cfg.suggested_price),
      cost: computed.total_cost,
      margin: computed.profit_percent,
      profit: computed.profit_value,
      taxes: computed.total_taxes,
      cbs: parseNum(cfg.cbs),
      ibs: parseNum(cfg.ibs),
      selective: parseNum(cfg.selective_tax),
      profitability: computed.profit_percent,
    }
  }, [cfg])

  const simulated = useMemo(() => {
    if (!cfg || !newPrice) return null
    const price = parseNum(newPrice)
    const cost = calcFinalCost(cfg) + calcTotalTaxes(cfg)
    const profit = price - cost
    const margin = price > 0 ? (profit / price) * 100 : 0
    return { price, cost, margin, profit, profitability: margin }
  }, [cfg, newPrice])

  const handleSave = async () => {
    if (!selectedId || !newPrice) {
      toast({ title: 'Selecione produto e preço', variant: 'destructive' })
      return
    }
    setSaving(true)
    try {
      const product = products.find((p) => p.id === selectedId)
      await createSimulation({
        product_id: selectedId,
        product_code: product?.code || '',
        product_name: product?.name || '',
        scenario_name: 'Simulação Comparativa',
        scenario_type: 'personalizado',
        simulated_price: newPrice,
        simulated_cost: simulated?.cost.toFixed(2) || '0',
        simulated_margin: simulated?.margin.toFixed(2) || '0',
        simulated_profit: simulated?.profit.toFixed(2) || '0',
        profit_value: simulated?.profit.toFixed(2) || '0',
        profit_percent: simulated?.margin.toFixed(2) || '0',
        rentability: simulated?.profitability.toFixed(2) || '0',
        notes: 'Simulação antes da alteração oficial',
        created_by: '',
      })
      toast({ title: 'Simulação salva' })
      setNewPrice('')
    } catch {
      toast({ title: 'Erro ao salvar', variant: 'destructive' })
    }
    setSaving(false)
  }

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
      {selectedId && current && (
        <>
          <Card className="border-2 border-[#005B2E]/20">
            <CardHeader>
              <CardTitle className="text-base text-[#005B2E] flex items-center gap-2">
                <FlaskConical className="w-4 h-4" /> Simulador de Precificação
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs">Novo Preço (R$)</Label>
                <Input
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  placeholder="0,00"
                  className="focus-visible:ring-[#005B2E]"
                />
              </div>
              {simulated && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-[#01361D] text-white">
                        <th className="text-left px-3 py-2">Indicador</th>
                        <th className="text-right px-3 py-2">Atual</th>
                        <th className="text-right px-3 py-2">Novo</th>
                        <th className="text-right px-3 py-2">Dif. %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ['Preço', current.price, simulated.price],
                        ['Custo', current.cost, simulated.cost],
                        ['Margem (%)', current.margin, simulated.margin],
                        ['Lucro', current.profit, simulated.profit],
                        ['Impostos', current.taxes, current.taxes],
                        ['CBS', current.cbs, current.cbs],
                        ['IBS', current.ibs, current.ibs],
                        ['Seletivo', current.selective, current.selective],
                        ['Rentab.', current.profitability, simulated.profitability],
                      ].map(([label, curr, newVal], i) => {
                        const diff = curr > 0 ? ((newVal - curr) / curr) * 100 : 0
                        return (
                          <tr key={i} className="border-b border-border">
                            <td className="px-3 py-2 font-medium">{label}</td>
                            <td className="text-right px-3 py-2">
                              {typeof curr === 'number' && label.includes('%')
                                ? `${formatCurrency(curr)}%`
                                : `R$ ${formatCurrency(curr)}`}
                            </td>
                            <td className="text-right px-3 py-2 font-bold text-[#005B2E]">
                              {typeof newVal === 'number' && label.includes('%')
                                ? `${formatCurrency(newVal)}%`
                                : `R$ ${formatCurrency(newVal)}`}
                            </td>
                            <td
                              className={`text-right px-3 py-2 ${diff > 0 ? 'text-emerald-600' : diff < 0 ? 'text-red-600' : ''}`}
                            >
                              {diff > 0 ? '+' : ''}
                              {formatCurrency(diff)}%
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
              <Button
                onClick={handleSave}
                disabled={saving || !newPrice}
                className="bg-[#005B2E] hover:bg-[#01361D] text-white"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <ArrowRight className="w-4 h-4 mr-2" />
                )}{' '}
                Salvar Simulação
              </Button>
            </CardContent>
          </Card>
        </>
      )}
      {selectedId && !current && (
        <Card className="border-2 border-dashed">
          <CardContent className="py-16 text-center">
            <p className="text-lg font-bold">Configure a precificação do produto primeiro</p>
          </CardContent>
        </Card>
      )}
      {!selectedId && (
        <Card className="border-2 border-dashed">
          <CardContent className="py-16 text-center">
            <FlaskConical className="w-12 h-12 text-[#005B2E]/30 mx-auto mb-4" />
            <p className="text-lg font-bold">Selecione um produto para simular</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
