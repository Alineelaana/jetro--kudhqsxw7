import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Lock, Calculator } from 'lucide-react'
import type { ProductTabProps } from '@/lib/product-types'

export function ProductTabCommercial({ form, setField }: ProductTabProps) {
  const originLabels: Record<string, string> = {
    fiscal_entry: 'Nota Fiscal de Entrada',
    production: 'Ordem de Produção',
    adjustment: 'Ajuste Autorizado',
    initial: 'Carga Inicial',
  }
  const originText = originLabels[form.cost_origin || ''] || 'Cálculo de Sistema'

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-1">
            <Label className="text-sm font-semibold flex items-center gap-1.5">
              Preço de Custo (R$)
              <Lock className="w-3.5 h-3.5 text-muted-foreground" />
            </Label>
            <Badge
              variant="outline"
              className="bg-emerald-50 text-emerald-800 border-emerald-200 text-[10px] font-medium py-0 px-1.5 flex items-center gap-1"
            >
              <Calculator className="w-3 h-3 text-emerald-600" />
              Calculado pelo sistema ({originText})
            </Badge>
          </div>
          <Input
            value={form.cost_price}
            readOnly
            disabled
            placeholder="0,00"
            className="bg-muted/50 cursor-not-allowed font-medium text-foreground select-none"
          />
          <p className="text-[11px] text-muted-foreground flex items-center gap-1">
            <Lock className="w-3 h-3" /> Bloqueado para edição manual. Atualizado via XML fiscal ou
            produção.
          </p>
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
