import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
          <Label className="text-sm font-semibold">Último Custo (R$)</Label>
          <Input
            value={form.last_cost}
            onChange={(e) => setField('last_cost', e.target.value)}
            placeholder="Ex: 5,20"
            className="focus-visible:ring-[#005B2E]"
          />
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
