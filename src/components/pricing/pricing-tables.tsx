import { useState, useEffect } from 'react'
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
  getPriceTables,
  createPriceTable,
  updatePriceTable,
  deletePriceTable,
  getPricingConfig,
} from '@/services/pricing'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import {
  parseNum,
  formatCurrency,
  TABLE_TYPES,
  type PriceTable,
  type PricingConfig,
} from '@/lib/pricing-types'
import type { Product } from '@/lib/product-types'
import { Loader2, Save, Trash2, RefreshCw, Table2 } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

export function PricingTables() {
  const { user } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [tables, setTables] = useState<PriceTable[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProductId, setSelectedProductId] = useState('')
  const [saving, setSaving] = useState(false)

  const load = async () => {
    try {
      const [prods, tbls] = await Promise.all([getProducts(), getPriceTables()])
      setProducts(prods as unknown as Product[])
      setTables(tbls as unknown as PriceTable[])
    } catch {
      /* noop */
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime('price_tables', () => load())

  const selectedProduct = products.find((p) => p?.id === selectedProductId)
  const productTables = tables.filter((t) => t?.product_id === selectedProductId)

  const handleGenerateAll = async () => {
    if (!selectedProductId || !selectedProduct) return
    setSaving(true)
    try {
      const cfg = (await getPricingConfig(selectedProductId)) as unknown as PricingConfig
      if (!cfg) {
        toast({ title: 'Configure a precificação primeiro', variant: 'destructive' })
        setSaving(false)
        return
      }
      const base = parseNum(cfg.suggested_price)
      const prices: Record<string, number> = {
        varejo: base,
        atacado: base * 0.92,
        distribuidor: base * 0.88,
        promocional: base * 0.95,
        especial: base * 0.85,
      }
      for (const t of TABLE_TYPES) {
        const existing = productTables.find((pt) => pt.table_type === t.value)
        const data = {
          table_name: t.label,
          table_type: t.value,
          product_id: selectedProductId,
          product_code: selectedProduct.code || '',
          product_name: selectedProduct.name || '',
          price: base.toFixed(2),
          discount_percent: ((1 - prices[t.value] / base) * 100).toFixed(2),
          final_price: prices[t.value].toFixed(2),
          active: true,
        }
        if (existing) await updatePriceTable(existing.id, data)
        else await createPriceTable(data)
      }
      toast({ title: 'Tabelas de preço geradas' })
      load()
    } catch {
      toast({ title: 'Erro ao gerar tabelas', variant: 'destructive' })
    }
    setSaving(false)
  }

  const handleUpdateSingle = async (tableId: string, field: string, value: string) => {
    try {
      const tbl = productTables.find((t) => t.id === tableId)
      if (!tbl) return
      const data: Record<string, unknown> = { [field]: value }
      if (field === 'discount_percent') {
        const base = parseNum(tbl.price)
        const disc = parseNum(value)
        data.final_price = (base * (1 - disc / 100)).toFixed(2)
      }
      if (field === 'final_price') {
        const base = parseNum(tbl.price)
        const final = parseNum(value)
        data.discount_percent = base > 0 ? ((1 - final / base) * 100).toFixed(2) : '0'
      }
      await updatePriceTable(tableId, data)
      load()
    } catch {
      toast({ title: 'Erro ao atualizar', variant: 'destructive' })
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deletePriceTable(id)
      toast({ title: 'Tabela removida' })
      load()
    } catch {
      toast({ title: 'Erro ao remover', variant: 'destructive' })
    }
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
        <CardContent className="py-4 flex flex-col sm:flex-row gap-3 items-end">
          <div className="flex-1 w-full">
            <Label className="text-xs mb-1 block">Produto</Label>
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
          </div>
          <Button
            onClick={handleGenerateAll}
            disabled={saving || !selectedProductId}
            className="bg-[#005B2E] hover:bg-[#01361D] text-white"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}{' '}
            Gerar Todas as Tabelas
          </Button>
        </CardContent>
      </Card>

      {selectedProductId && (
        <Card className="border-2 border-[#005B2E]/20">
          <CardHeader>
            <CardTitle className="text-base text-[#005B2E]">
              Tabelas de Preço — {selectedProduct?.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {productTables.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-4">
                Nenhuma tabela gerada. Clique em "Gerar Todas as Tabelas".
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#01361D] text-white">
                      <th className="text-left px-3 py-2 font-bold">Tabela</th>
                      <th className="text-left px-3 py-2 font-bold">Preço Base</th>
                      <th className="text-left px-3 py-2 font-bold">Desconto (%)</th>
                      <th className="text-left px-3 py-2 font-bold">Preço Final</th>
                      <th className="text-center px-3 py-2 font-bold">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {TABLE_TYPES.map((tt) => {
                      const tbl = productTables.find((t) => t.table_type === tt.value)
                      return (
                        <tr key={tt.value} className="border-b border-border hover:bg-[#005B2E]/5">
                          <td className="px-3 py-2 font-medium">{tt.label}</td>
                          <td className="px-3 py-2">
                            {tbl ? `R$ ${formatCurrency(tbl.price)}` : '—'}
                          </td>
                          <td className="px-3 py-2">
                            {tbl ? (
                              <Input
                                value={tbl.discount_percent || ''}
                                onChange={(e) =>
                                  handleUpdateSingle(tbl.id, 'discount_percent', e.target.value)
                                }
                                className="h-8 w-20 text-sm focus-visible:ring-[#005B2E]"
                              />
                            ) : (
                              '—'
                            )}
                          </td>
                          <td className="px-3 py-2">
                            {tbl ? (
                              <Input
                                value={tbl.final_price || ''}
                                onChange={(e) =>
                                  handleUpdateSingle(tbl.id, 'final_price', e.target.value)
                                }
                                className="h-8 w-24 text-sm focus-visible:ring-[#005B2E]"
                              />
                            ) : (
                              '—'
                            )}
                          </td>
                          <td className="px-3 py-2 text-center">
                            {tbl && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDelete(tbl.id)}
                                className="text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      {!selectedProductId && (
        <Card className="border-2 border-dashed">
          <CardContent className="py-16 text-center">
            <Table2 className="w-12 h-12 text-[#005B2E]/30 mx-auto mb-4" />
            <p className="text-lg font-bold">
              Selecione um produto para gerenciar tabelas de preço
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
