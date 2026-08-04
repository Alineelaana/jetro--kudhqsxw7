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
import { getProducts } from '@/services/products'
import {
  getSimulations,
  createSimulation,
  updateSimulation,
  deleteSimulation,
  getPricingConfig,
} from '@/services/pricing'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import { extractFieldErrors, type FieldErrors } from '@/lib/pocketbase/errors'
import {
  parseNum,
  formatCurrency,
  calcFinalCost,
  calcTotalTaxes,
  type PricingConfig,
  type PricingSimulation,
} from '@/lib/pricing-types'
import type { Product } from '@/lib/product-types'
import { Plus, Trash2, Loader2, FlaskConical, TrendingUp, Pencil, Save, X } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

const SCENARIO_TYPES = [
  { value: 'a_vista', label: 'Venda à Vista' },
  { value: 'pix', label: 'Venda no PIX' },
  { value: 'cartao', label: 'Venda no Cartão' },
  { value: 'atacado', label: 'Venda para Atacado' },
  { value: 'varejo', label: 'Venda para Varejo' },
  { value: 'promocional', label: 'Venda Promocional' },
  { value: 'personalizado', label: 'Personalizado' },
]

function formatDate(iso: string): string {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return '—'
  }
}

export function PricingSimulations() {
  const { user } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [simulations, setSimulations] = useState<PricingSimulation[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProductId, setSelectedProductId] = useState('')
  const [simPrice, setSimPrice] = useState('')
  const [scenarioName, setScenarioName] = useState('')
  const [scenarioType, setScenarioType] = useState('a_vista')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [pricingCfg, setPricingCfg] = useState<PricingConfig | null>(null)
  const [editId, setEditId] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  const load = async () => {
    try {
      const [prods, sims] = await Promise.all([
        getProducts(),
        getSimulations(selectedProductId || undefined),
      ])
      setProducts(prods as unknown as Product[])
      setSimulations(sims as unknown as PricingSimulation[])
    } catch {
      /* noop */
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [selectedProductId])
  useRealtime('pricing_simulations', () => load())

  useEffect(() => {
    if (selectedProductId) {
      getPricingConfig(selectedProductId)
        .then((cfg) => setPricingCfg(cfg as unknown as PricingConfig))
        .catch(() => setPricingCfg(null))
    }
  }, [selectedProductId])

  const selectedProduct = products.find((p) => p?.id === selectedProductId)
  const cost = pricingCfg
    ? calcFinalCost(pricingCfg) + calcTotalTaxes(pricingCfg)
    : parseNum(selectedProduct?.cost_price)

  const simResult = useMemo(() => {
    const price = parseNum(simPrice)
    const profit = price - cost
    const margin = cost > 0 ? (profit / price) * 100 : 0
    const profitPercent = cost > 0 ? (profit / cost) * 100 : 0
    const rentability = price > 0 ? (profit / price) * 100 : 0
    return { profit, margin, profitPercent, rentability }
  }, [simPrice, cost])

  const resetForm = () => {
    setEditId(null)
    setSimPrice('')
    setScenarioName('')
    setScenarioType('a_vista')
    setNotes('')
    setFieldErrors({})
  }

  const handleSave = async () => {
    if (!selectedProductId || !simPrice) {
      toast({ title: 'Selecione um produto e informe o preço', variant: 'destructive' })
      return
    }
    setSaving(true)
    setFieldErrors({})
    try {
      const data = {
        product_id: selectedProductId,
        product_code: selectedProduct?.code || '',
        product_name: selectedProduct?.name || '',
        scenario_name:
          scenarioName ||
          SCENARIO_TYPES.find((s) => s.value === scenarioType)?.label ||
          'Simulação',
        scenario_type: scenarioType,
        simulated_price: simPrice,
        simulated_cost: cost.toFixed(2),
        simulated_margin: simResult.margin.toFixed(2),
        simulated_profit: simResult.profit.toFixed(2),
        profit_value: simResult.profit.toFixed(2),
        profit_percent: simResult.profitPercent.toFixed(2),
        rentability: simResult.rentability.toFixed(2),
        notes,
        created_by: (user?.name as string) || '',
      }
      if (editId) {
        await updateSimulation(editId, data)
        toast({ title: 'Simulação atualizada' })
      } else {
        await createSimulation(data)
        toast({ title: 'Simulação criada' })
      }
      resetForm()
      load()
    } catch (err) {
      const errors = extractFieldErrors(err)
      setFieldErrors(errors)
      const errorMsg = Object.values(errors).join(' ') || 'Erro ao salvar simulação'
      toast({ title: errorMsg, variant: 'destructive' })
    }
    setSaving(false)
  }

  const handleEdit = (s: PricingSimulation) => {
    setEditId(s.id)
    setSelectedProductId(s.product_id)
    setScenarioName(s.scenario_name)
    setScenarioType(s.scenario_type)
    setSimPrice(s.simulated_price)
    setNotes(s.notes || '')
    setFieldErrors({})
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteSimulation(id)
      toast({ title: 'Simulação removida' })
      load()
    } catch {
      toast({ title: 'Erro ao remover', variant: 'destructive' })
    }
  }

  const productSims = simulations.filter((s) => s?.product_id === selectedProductId)
  const userName = (user?.name as string) || ''

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
          {fieldErrors.product_id && (
            <p className="text-xs text-red-500 mt-1">{fieldErrors.product_id}</p>
          )}
        </CardContent>
      </Card>

      {selectedProductId && (
        <>
          <Card className="border-2 border-[#005B2E]/20">
            <CardHeader>
              <CardTitle className="text-base text-[#005B2E] flex items-center gap-2">
                <FlaskConical className="w-4 h-4" />{' '}
                {editId ? 'Editar Simulação' : 'Nova Simulação'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Tipo de Cenário</Label>
                  <Select value={scenarioType} onValueChange={setScenarioType}>
                    <SelectTrigger className="focus-visible:ring-[#005B2E]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SCENARIO_TYPES.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldErrors.scenario_type && (
                    <p className="text-xs text-red-500">{fieldErrors.scenario_type}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Nome do Cenário</Label>
                  <Input
                    value={scenarioName}
                    onChange={(e) => setScenarioName(e.target.value)}
                    placeholder="Ex: Promoção Black Friday"
                    className="focus-visible:ring-[#005B2E]"
                  />
                  {fieldErrors.scenario_name && (
                    <p className="text-xs text-red-500">{fieldErrors.scenario_name}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Preço Simulado (R$)</Label>
                  <Input
                    value={simPrice}
                    onChange={(e) => setSimPrice(e.target.value)}
                    placeholder="0,00"
                    className="focus-visible:ring-[#005B2E]"
                  />
                  {fieldErrors.simulated_price && (
                    <p className="text-xs text-red-500">{fieldErrors.simulated_price}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Custo Base</Label>
                  <Input value={cost.toFixed(2)} disabled className="bg-muted" />
                </div>
              </div>
              {simPrice && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-2 rounded bg-muted/50">
                    <span className="text-xs text-muted-foreground block">Lucro</span>
                    <span className="font-bold text-sm">R$ {formatCurrency(simResult.profit)}</span>
                  </div>
                  <div className="p-2 rounded bg-muted/50">
                    <span className="text-xs text-muted-foreground block">Margem (%)</span>
                    <span className="font-bold text-sm">{formatCurrency(simResult.margin)}%</span>
                  </div>
                  <div className="p-2 rounded bg-muted/50">
                    <span className="text-xs text-muted-foreground block">Lucro %</span>
                    <span className="font-bold text-sm">
                      {formatCurrency(simResult.profitPercent)}%
                    </span>
                  </div>
                  <div className="p-2 rounded bg-muted/50">
                    <span className="text-xs text-muted-foreground block">Rentabilidade</span>
                    <span className="font-bold text-sm">
                      {formatCurrency(simResult.rentability)}%
                    </span>
                  </div>
                </div>
              )}
              <div className="space-y-1">
                <Label className="text-xs">Observações</Label>
                <Input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Notas sobre a simulação..."
                  className="focus-visible:ring-[#005B2E]"
                />
                {fieldErrors.notes && <p className="text-xs text-red-500">{fieldErrors.notes}</p>}
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-[#005B2E] hover:bg-[#01361D] text-white"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : editId ? (
                    <Save className="w-4 h-4 mr-2" />
                  ) : (
                    <Plus className="w-4 h-4 mr-2" />
                  )}
                  {editId ? 'Atualizar Simulação' : 'Criar Simulação'}
                </Button>
                {editId && (
                  <Button variant="outline" onClick={resetForm}>
                    <X className="w-4 h-4 mr-2" />
                    Cancelar
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-[#005B2E]/20">
            <CardHeader>
              <CardTitle className="text-base text-[#005B2E]">Simulações Salvas</CardTitle>
            </CardHeader>
            <CardContent>
              {productSims.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-4">
                  Nenhuma simulação para este produto.
                </p>
              ) : (
                <div className="space-y-2">
                  {productSims.map((s) => {
                    const isOwner = !!userName && s.created_by === userName
                    return (
                      <div
                        key={s.id}
                        className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-[#005B2E]/5"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-sm">{s.scenario_name}</span>
                            <span className="text-xs px-1.5 py-0.5 rounded bg-[#005B2E]/10 text-[#005B2E]">
                              {SCENARIO_TYPES.find((t) => t.value === s.scenario_type)?.label ||
                                s.scenario_type}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            Por {s.created_by || '—'} em {formatDate(s.created)}
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1 text-xs">
                            <span>
                              Preço: <strong>R$ {formatCurrency(s.simulated_price)}</strong>
                            </span>
                            <span>
                              Lucro: <strong>R$ {formatCurrency(s.profit_value)}</strong>
                            </span>
                            <span>
                              Margem: <strong>{formatCurrency(s.simulated_margin)}%</strong>
                            </span>
                            <span>
                              Rentab.: <strong>{formatCurrency(s.rentability)}%</strong>
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {isOwner && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEdit(s)}
                              className="text-[#005B2E] hover:bg-[#005B2E]/10"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                          )}
                          {isOwner && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(s.id)}
                              className="text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
      {!selectedProductId && (
        <Card className="border-2 border-dashed">
          <CardContent className="py-16 text-center">
            <TrendingUp className="w-12 h-12 text-[#005B2E]/30 mx-auto mb-4" />
            <p className="text-lg font-bold">Selecione um produto para criar simulações</p>
            <p className="text-sm text-muted-foreground mt-1">
              As simulações não alteram o preço oficial do produto.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
