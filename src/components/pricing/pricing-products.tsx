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
  getPricingConfigs,
  createPricingConfig,
  updatePricingConfig,
  createPricingHistory,
} from '@/services/pricing'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import {
  parseNum,
  formatCurrency,
  calcPrices,
  calcFinalCost,
  calcTotalTaxes,
  calcTotalExpenses,
  getInitialPricingConfig,
  COST_FIELDS,
  TAX_FIELDS,
  OP_COST_FIELDS,
  type PricingConfig,
  type OpCostType,
} from '@/lib/pricing-types'
import type { Product } from '@/lib/product-types'
import { Search, Save, Loader2, AlertTriangle, TrendingUp, Calculator } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

export function PricingProducts() {
  const { user } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [configs, setConfigs] = useState<PricingConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedProductId, setSelectedProductId] = useState('')
  const [config, setConfig] = useState<Partial<PricingConfig>>(getInitialPricingConfig())
  const [saving, setSaving] = useState(false)
  const [companyFilter, setCompanyFilter] = useState('all')
  const [branchFilter, setBranchFilter] = useState('all')
  const [brandFilter, setBrandFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [supplierFilter, setSupplierFilter] = useState('all')
  const [tableFilter, setTableFilter] = useState('all')

  const loadData = async () => {
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
    loadData()
  }, [])
  useRealtime('pricing_config', () => loadData())

  const brands = useMemo(
    () => [...new Set(products.map((p) => p?.brand).filter(Boolean))].sort(),
    [products],
  )
  const categories = useMemo(
    () => [...new Set(products.map((p) => p?.category).filter(Boolean))].sort(),
    [products],
  )
  const suppliers = useMemo(
    () => [...new Set(products.map((p) => p?.main_supplier).filter(Boolean))].sort(),
    [products],
  )

  const filtered = useMemo(() => {
    const term = search.toLowerCase().trim()
    return products.filter((p) => {
      if (!p) return false
      const matchesSearch =
        !term ||
        p.name?.toLowerCase().includes(term) ||
        p.code?.toLowerCase().includes(term) ||
        p.ean?.toLowerCase().includes(term)
      const matchesBrand = brandFilter === 'all' || p.brand === brandFilter
      const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter
      const matchesSupplier = supplierFilter === 'all' || p.main_supplier === supplierFilter
      return matchesSearch && matchesBrand && matchesCategory && matchesSupplier
    })
  }, [products, search, brandFilter, categoryFilter, supplierFilter])

  const selectedProduct = products.find((p) => p?.id === selectedProductId)
  const existingConfig = configs.find((c) => c?.product_id === selectedProductId)

  useEffect(() => {
    if (existingConfig) {
      setConfig(existingConfig)
    } else if (selectedProduct) {
      setConfig({
        ...getInitialPricingConfig(selectedProduct.id),
        product_code: selectedProduct.code || '',
        product_name: selectedProduct.name || '',
        brand: selectedProduct.brand || '',
        category: selectedProduct.category || '',
        supplier: selectedProduct.main_supplier || '',
        unit: selectedProduct.unit || '',
        active: selectedProduct.active !== false,
        last_purchase_cost: selectedProduct.last_cost || selectedProduct.cost_price || '',
        replacement_cost: selectedProduct.last_cost || selectedProduct.cost_price || '',
        icms: selectedProduct.icms_aliquot || '',
        ipi: selectedProduct.ipi || '',
        pis: selectedProduct.pis || '',
        cofins: selectedProduct.cofins || '',
      })
    }
  }, [selectedProductId, existingConfig, selectedProduct])

  const computed = useMemo(() => calcPrices(config), [config])
  const finalCost = calcFinalCost(config)
  const totalTaxes = calcTotalTaxes(config)
  const totalExpenses = calcTotalExpenses(config, parseNum(computed.suggested_price?.toString()))

  const setField = (field: keyof PricingConfig, value: string | boolean) => {
    setConfig((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    if (!selectedProductId) {
      toast({ title: 'Selecione um produto', variant: 'destructive' })
      return
    }
    setSaving(true)
    try {
      const data: Record<string, unknown> = {
        ...config,
        final_cost: finalCost.toFixed(2),
        total_cost: computed.total_cost.toFixed(2),
        total_taxes: computed.total_taxes.toFixed(2),
        total_expenses: totalExpenses.toFixed(2),
        minimum_price: computed.minimum_price.toFixed(2),
        ideal_price: computed.ideal_price.toFixed(2),
        suggested_price: computed.suggested_price.toFixed(2),
        profit_value: computed.profit_value.toFixed(2),
        profit_percent: computed.profit_percent.toFixed(2),
        markup: computed.markup.toFixed(4),
        expected_profit: computed.expected_profit.toFixed(2),
        price_varejo: computed.suggested_price.toFixed(2),
        price_atacado: (computed.suggested_price * 0.92).toFixed(2),
        price_distribuidor: (computed.suggested_price * 0.88).toFixed(2),
        price_promocional: (computed.suggested_price * 0.95).toFixed(2),
        price_especial: (computed.suggested_price * 0.85).toFixed(2),
      }
      const prevPrice = existingConfig?.suggested_price || ''
      if (existingConfig) {
        await updatePricingConfig(existingConfig.id, data)
      } else {
        await createPricingConfig(data)
      }
      if (prevPrice !== data.suggested_price) {
        await createPricingHistory({
          product_id: selectedProductId,
          product_code: config.product_code || '',
          product_name: config.product_name || '',
          user_name: (user?.name as string) || 'Sistema',
          user_role: (user?.role as string) || '',
          previous_price: prevPrice,
          new_price: data.suggested_price as string,
          change_reason: 'Atualização de precificação',
          field_changed: 'suggested_price',
          previous_value: prevPrice,
          new_value: data.suggested_price as string,
        })
      }
      toast({ title: 'Precificação salva com sucesso' })
      loadData()
    } catch {
      toast({ title: 'Erro ao salvar precificação', variant: 'destructive' })
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
        <CardContent className="py-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <Select value={companyFilter} onValueChange={setCompanyFilter}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="Empresa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
              </SelectContent>
            </Select>
            <Select value={branchFilter} onValueChange={setBranchFilter}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="Filial" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
              </SelectContent>
            </Select>
            <Select value={brandFilter} onValueChange={setBrandFilter}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="Marca" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {brands.map((b) => (
                  <SelectItem key={b} value={b}>
                    {b}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={supplierFilter} onValueChange={setSupplierFilter}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="Fornecedor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {suppliers.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={tableFilter} onValueChange={setTableFilter}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="Tabela" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por código, código de barras ou nome..."
              className="pl-10 focus-visible:ring-[#005B2E]"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-[#005B2E]/20">
        <CardContent className="py-3 max-h-64 overflow-y-auto">
          {filtered.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedProductId(p.id)}
              className={`w-full text-left p-2.5 rounded-lg mb-1 transition-colors ${selectedProductId === p.id ? 'bg-[#005B2E] text-white' : 'hover:bg-[#005B2E]/5'}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{p.name}</span>
                <span className="text-xs font-mono opacity-70">{p.code}</span>
              </div>
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-4">
              Nenhum produto encontrado
            </p>
          )}
        </CardContent>
      </Card>

      {selectedProduct && (
        <>
          <Card className="border-2 border-[#005B2E]/20">
            <CardHeader>
              <CardTitle className="text-base text-[#005B2E]">Informações do Produto</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-sm">
                <div>
                  <span className="text-xs text-muted-foreground">Código</span>
                  <p className="font-bold">{selectedProduct.code || '—'}</p>
                </div>
                <div className="col-span-1 sm:col-span-1">
                  <span className="text-xs text-muted-foreground">Produto</span>
                  <p className="font-bold">{selectedProduct.name || '—'}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Marca</span>
                  <p className="font-bold">{selectedProduct.brand || '—'}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Categoria</span>
                  <p className="font-bold">{selectedProduct.category || '—'}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Fornecedor</span>
                  <p className="font-bold">{selectedProduct.main_supplier || '—'}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Unidade</span>
                  <p className="font-bold">{selectedProduct.unit || '—'}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Situação</span>
                  <p
                    className={`font-bold ${selectedProduct.active !== false ? 'text-emerald-600' : 'text-gray-500'}`}
                  >
                    {selectedProduct.active !== false ? 'Ativo' : 'Inativo'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="border-2 border-[#005B2E]/20">
              <CardHeader>
                <CardTitle className="text-base text-[#005B2E]">Custos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {COST_FIELDS.map((f) => (
                  <div key={f.key} className="flex items-center gap-2">
                    <Label className="text-xs w-44 shrink-0">{f.label}</Label>
                    <Input
                      value={(config[f.key] as string) || ''}
                      onChange={(e) => setField(f.key as keyof PricingConfig, e.target.value)}
                      className="h-8 text-sm focus-visible:ring-[#005B2E]"
                      placeholder="0,00"
                    />
                  </div>
                ))}
                <div className="flex items-center gap-2 pt-2 border-t">
                  <Label className="text-xs w-44 shrink-0 font-bold text-[#005B2E]">
                    Custo Final do Produto
                  </Label>
                  <span className="text-sm font-black text-[#005B2E]">
                    R$ {formatCurrency(finalCost)}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-[#005B2E]/20">
              <CardHeader>
                <CardTitle className="text-base text-[#005B2E]">Impostos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {TAX_FIELDS.map((f) => (
                  <div key={f.key} className="flex items-center gap-2">
                    <Label className="text-xs w-44 shrink-0">{f.label}</Label>
                    <Input
                      value={(config[f.key] as string) || ''}
                      onChange={(e) => setField(f.key as keyof PricingConfig, e.target.value)}
                      className="h-8 text-sm focus-visible:ring-[#005B2E]"
                      placeholder="0,00"
                    />
                  </div>
                ))}
                <div className="flex items-center gap-2 pt-2 border-t">
                  <Label className="text-xs w-44 shrink-0 font-bold text-[#005B2E]">
                    Total de Impostos
                  </Label>
                  <span className="text-sm font-black text-[#005B2E]">
                    R$ {formatCurrency(totalTaxes)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-2 border-[#005B2E]/20">
            <CardHeader>
              <CardTitle className="text-base text-[#005B2E]">Custos Operacionais</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {OP_COST_FIELDS.map((f) => (
                  <div key={f.key} className="space-y-1">
                    <Label className="text-xs">{f.label}</Label>
                    <div className="flex gap-1">
                      <Select
                        value={
                          (config[`${f.key}_type` as keyof PricingConfig] as string) || 'percent'
                        }
                        onValueChange={(v) =>
                          setField(`${f.key}_type` as keyof PricingConfig, v as OpCostType)
                        }
                      >
                        <SelectTrigger className="w-20 h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="percent">%</SelectItem>
                          <SelectItem value="fixed">R$</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        value={(config[`${f.key}_value` as keyof PricingConfig] as string) || ''}
                        onChange={(e) =>
                          setField(`${f.key}_value` as keyof PricingConfig, e.target.value)
                        }
                        className="h-8 text-sm focus-visible:ring-[#005B2E]"
                        placeholder="0,00"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-[#C89B3C]/40 bg-gradient-to-br from-[#005B2E]/5 to-transparent">
            <CardHeader>
              <CardTitle className="text-base text-[#005B2E] flex items-center gap-2">
                <Calculator className="w-4 h-4" /> Formação de Preço
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <Label className="text-xs w-32">Margem Desejada (%)</Label>
                  <Input
                    value={config.desired_margin || ''}
                    onChange={(e) => setField('desired_margin', e.target.value)}
                    className="h-8 text-sm focus-visible:ring-[#005B2E]"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Label className="text-xs w-32">Margem Mínima (%)</Label>
                  <Input
                    value={config.minimum_margin || ''}
                    onChange={(e) => setField('minimum_margin', e.target.value)}
                    className="h-8 text-sm focus-visible:ring-[#005B2E]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 text-sm">
                <div className="p-3 rounded-lg bg-muted/50">
                  <span className="text-xs text-muted-foreground block">Custo Total</span>
                  <span className="font-black">R$ {formatCurrency(computed.total_cost)}</span>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <span className="text-xs text-muted-foreground block">Despesas Totais</span>
                  <span className="font-black">R$ {formatCurrency(totalExpenses)}</span>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <span className="text-xs text-muted-foreground block">Impostos</span>
                  <span className="font-black">R$ {formatCurrency(computed.total_taxes)}</span>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <span className="text-xs text-muted-foreground block">Markup</span>
                  <span className="font-black">{computed.markup.toFixed(2)}x</span>
                </div>
                <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
                  <span className="text-xs text-amber-700 block">Preço Mínimo</span>
                  <span className="font-black text-amber-700">
                    R$ {formatCurrency(computed.minimum_price)}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-[#005B2E]/10 border border-[#005B2E]/20">
                  <span className="text-xs text-[#005B2E] block">Preço Ideal</span>
                  <span className="font-black text-[#005B2E]">
                    R$ {formatCurrency(computed.ideal_price)}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                  <span className="text-xs text-emerald-700 block">Preço Sugerido</span>
                  <span className="font-black text-emerald-700">
                    R$ {formatCurrency(computed.suggested_price)}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <span className="text-xs text-muted-foreground block">Lucro Esperado</span>
                  <span className="font-black">R$ {formatCurrency(computed.expected_profit)}</span>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <span className="text-xs text-muted-foreground block">Lucro em Valor</span>
                  <span className="font-black">R$ {formatCurrency(computed.profit_value)}</span>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <span className="text-xs text-muted-foreground block">Lucro em %</span>
                  <span className="font-black">{formatCurrency(computed.profit_percent)}%</span>
                </div>
              </div>
              {computed.profit_percent < parseNum(config.minimum_margin) && (
                <div className="mt-3 flex items-center gap-2 p-2 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                  <AlertTriangle className="w-4 h-4" /> Atenção: Margem abaixo do mínimo
                  configurado. Alteração requer aprovação.
                </div>
              )}
              <Button
                onClick={handleSave}
                disabled={saving}
                className="mt-4 bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}{' '}
                Salvar Precificação
              </Button>
            </CardContent>
          </Card>
        </>
      )}
      {!selectedProductId && !loading && (
        <Card className="border-2 border-dashed">
          <CardContent className="py-16 text-center">
            <TrendingUp className="w-12 h-12 text-[#005B2E]/30 mx-auto mb-4" />
            <p className="text-lg font-bold">Selecione um produto para iniciar a precificação</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
