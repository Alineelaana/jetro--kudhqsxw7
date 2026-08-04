import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { ProductTabProps } from '@/lib/product-types'

export function ProductTabCommercial({ form, setField }: ProductTabProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold">Preço de Custo (R$)</Label>
          <Input
            value={form.cost_price}
            onChange={(e) => setField('cost_price', e.target.value)}
            placeholder="Ex: 5,50"
            className="focus-visible:ring-[#005B2E]"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold">Preço de Venda (R$)</Label>
          <Input
            value={form.price}
            onChange={(e) => setField('price', e.target.value)}
            placeholder="Ex: 8,50"
            className="focus-visible:ring-[#005B2E]"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold">Margem de Lucro (%)</Label>
          <Input
            value={form.profit_margin}
            onChange={(e) => setField('profit_margin', e.target.value)}
            placeholder="Ex: 55"
            className="focus-visible:ring-[#005B2E]"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold">Comissão (%)</Label>
          <Input
            value={form.commission}
            onChange={(e) => setField('commission', e.target.value)}
            placeholder="Ex: 5"
            className="focus-visible:ring-[#005B2E]"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold">Desconto Máximo (%)</Label>
          <Input
            value={form.max_discount}
            onChange={(e) => setField('max_discount', e.target.value)}
            placeholder="Ex: 10"
            className="focus-visible:ring-[#005B2E]"
          />
        </div>
      </div>
    </div>
  )
}
