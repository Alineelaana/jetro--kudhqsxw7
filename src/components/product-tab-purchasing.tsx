import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Lock, Calculator } from 'lucide-react'
import type { ProductTabProps } from '@/lib/product-types'

export function ProductTabPurchasing({ form, setField }: ProductTabProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold">Fornecedor Principal</Label>
          <Input
            value={form.main_supplier}
            onChange={(e) => setField('main_supplier', e.target.value)}
            placeholder="Ex: PackLog Distribuidora"
            className="focus-visible:ring-[#005B2E]"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold">Código do Produto no Fornecedor</Label>
          <Input
            value={form.supplier_product_code}
            onChange={(e) => setField('supplier_product_code', e.target.value)}
            placeholder="Ex: FORN-001"
            className="focus-visible:ring-[#005B2E]"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-1">
            <Label className="text-sm font-semibold flex items-center gap-1.5">
              Último Custo (R$)
              <Lock className="w-3.5 h-3.5 text-muted-foreground" />
            </Label>
            <Badge
              variant="outline"
              className="bg-emerald-50 text-emerald-800 border-emerald-200 text-[10px] font-medium py-0 px-1.5 flex items-center gap-1"
            >
              <Calculator className="w-3 h-3 text-emerald-600" />
              Calculado pelo sistema
            </Badge>
          </div>
          <Input
            value={form.last_cost}
            readOnly
            disabled
            placeholder="0,00"
            className="bg-muted/50 cursor-not-allowed font-medium text-foreground select-none"
          />
          <p className="text-[11px] text-muted-foreground flex items-center gap-1">
            <Lock className="w-3 h-3" /> Atualizado via conferência de entrada fiscal de compras.
          </p>
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold">Última Compra</Label>
          <Input
            type="date"
            value={form.last_purchase}
            onChange={(e) => setField('last_purchase', e.target.value)}
            className="focus-visible:ring-[#005B2E]"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold">Prazo Médio de Reposição (dias)</Label>
          <Input
            value={form.replenishment_time}
            onChange={(e) => setField('replenishment_time', e.target.value)}
            placeholder="Ex: 15"
            className="focus-visible:ring-[#005B2E]"
          />
        </div>
      </div>
    </div>
  )
}
