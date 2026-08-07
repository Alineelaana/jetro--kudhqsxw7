import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Loader2, Play, Plus, Trash2, Calculator, Lightbulb } from 'lucide-react'
import { simulatePromotions } from '@/services/promotions'
import type { CartItem, SimulationResult } from '@/lib/promotion-types'

interface CartRow extends CartItem {
  uid: string
}

export function PromotionSimulator() {
  const [cart, setCart] = useState<CartRow[]>([
    {
      uid: '1',
      product_id: 'P001',
      product_name: 'Produto A',
      quantity: 10,
      unit_price: 50,
      category: 'Geral',
      brand: 'MarcaX',
      supplier: 'FornA',
    },
  ])
  const [result, setResult] = useState<SimulationResult | null>(null)
  const [loading, setLoading] = useState(false)

  const addItem = () => {
    setCart((prev) => [
      ...prev,
      {
        uid: String(Date.now()),
        product_id: '',
        product_name: '',
        quantity: 1,
        unit_price: 0,
        category: '',
        brand: '',
        supplier: '',
      },
    ])
  }

  const updateItem = (uid: string, field: keyof CartRow, value: string | number) => {
    setCart((prev) => prev.map((r) => (r.uid === uid ? { ...r, [field]: value } : r)))
  }

  const removeItem = (uid: string) => setCart((prev) => prev.filter((r) => r.uid !== uid))

  const handleSimulate = async () => {
    setLoading(true)
    try {
      const cleanCart = cart.map(({ uid: _uid, ...rest }) => rest)
      setResult(await simulatePromotions(cleanCart))
    } catch {
      setResult(null)
    }
    setLoading(false)
  }

  const cartTotal = cart.reduce((s, r) => s + r.quantity * r.unit_price, 0)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Calculator className="w-5 h-5 text-[#005B2E]" />
        <h3 className="text-lg font-bold">Simulador de Promoções</h3>
      </div>
      <Card className="border-2 border-[#005B2E]/20">
        <CardContent className="py-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-[#005B2E]">Carrinho de Teste</span>
            <Button
              size="sm"
              variant="outline"
              onClick={addItem}
              className="border-[#005B2E] text-[#005B2E]"
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Item
            </Button>
          </div>
          {cart.map((row) => (
            <div key={row.uid} className="grid grid-cols-12 gap-2 items-center">
              <Input
                className="col-span-3 h-8 text-xs"
                placeholder="Produto"
                value={row.product_name}
                onChange={(e) => updateItem(row.uid, 'product_name', e.target.value)}
              />
              <Input
                className="col-span-2 h-8 text-xs"
                placeholder="Marca"
                value={row.brand}
                onChange={(e) => updateItem(row.uid, 'brand', e.target.value)}
              />
              <Input
                className="col-span-2 h-8 text-xs"
                placeholder="Categoria"
                value={row.category}
                onChange={(e) => updateItem(row.uid, 'category', e.target.value)}
              />
              <Input
                className="col-span-2 h-8 text-xs"
                type="number"
                placeholder="Qtd"
                value={row.quantity}
                onChange={(e) => updateItem(row.uid, 'quantity', parseFloat(e.target.value) || 0)}
              />
              <Input
                className="col-span-2 h-8 text-xs"
                type="number"
                placeholder="Preço"
                value={row.unit_price}
                onChange={(e) => updateItem(row.uid, 'unit_price', parseFloat(e.target.value) || 0)}
              />
              <Button
                size="sm"
                variant="ghost"
                className="col-span-1 p-0"
                onClick={() => removeItem(row.uid)}
              >
                <Trash2 className="w-3.5 h-3.5 text-red-500" />
              </Button>
            </div>
          ))}
          <div className="flex items-center justify-between pt-2 border-t">
            <span className="text-sm">
              Total: <strong>R$ {cartTotal.toFixed(2)}</strong>
            </span>
            <Button
              size="sm"
              onClick={handleSimulate}
              disabled={loading}
              className="bg-[#005B2E] hover:bg-[#01361D]"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              ) : (
                <Play className="w-4 h-4 mr-1" />
              )}{' '}
              Simular
            </Button>
          </div>
        </CardContent>
      </Card>
      {result && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className="border-2 border-[#005B2E]/20">
              <CardContent className="py-3">
                <p className="text-xs text-muted-foreground">Desconto Total</p>
                <p className="text-lg font-black text-red-600">
                  R$ {result.totalDiscount.toFixed(2)}
                </p>
              </CardContent>
            </Card>
            <Card className="border-2 border-[#005B2E]/20">
              <CardContent className="py-3">
                <p className="text-xs text-muted-foreground">Bonificação</p>
                <p className="text-lg font-black text-[#C89B3C]">
                  R$ {result.totalBonification.toFixed(2)}
                </p>
              </CardContent>
            </Card>
            <Card className="border-2 border-[#005B2E]/20">
              <CardContent className="py-3">
                <p className="text-xs text-muted-foreground">Margem Antes</p>
                <p className="text-lg font-black">R$ {result.marginBefore.toFixed(2)}</p>
              </CardContent>
            </Card>
            <Card className="border-2 border-[#005B2E]/20">
              <CardContent className="py-3">
                <p className="text-xs text-muted-foreground">Margem Depois</p>
                <p
                  className={`text-lg font-black ${result.marginAfter < result.marginBefore * 0.7 ? 'text-red-600' : 'text-[#005B2E]'}`}
                >
                  R$ {result.marginAfter.toFixed(2)}
                </p>
              </CardContent>
            </Card>
          </div>
          {result.activatedRules.length > 0 && (
            <Card className="border-2 border-[#005B2E]/20">
              <CardContent className="py-4">
                <h4 className="font-bold text-[#005B2E] mb-2">Regras Ativadas</h4>
                {result.activatedRules.map((r, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center py-1 border-b border-border text-sm"
                  >
                    <span className="font-medium">{r.promotion_name}</span>
                    <div className="flex gap-2">
                      <Badge variant="outline">Desc: R$ {r.discount_value.toFixed(2)}</Badge>
                      <Badge variant="outline">Bonif: R$ {r.bonification_value.toFixed(2)}</Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
          {result.suggestions.length > 0 && (
            <Card className="border-2 border-[#C89B3C]/30 bg-[#C89B3C]/5">
              <CardContent className="py-4">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="w-4 h-4 text-[#C89B3C]" />
                  <h4 className="font-bold text-[#C89B3C]">Sugestões Comerciais</h4>
                </div>
                {result.suggestions.map((s, i) => (
                  <p key={i} className="text-sm py-0.5">
                    {s}
                  </p>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
