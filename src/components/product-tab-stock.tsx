import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import type { ProductTabProps } from '@/lib/product-types'

export function ProductTabStock({ form, setField }: ProductTabProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold">Estoque Atual</Label>
          <Input
            type="number"
            value={form.stock}
            onChange={(e) => setField('stock', e.target.value)}
            placeholder="0"
            min="0"
            className="focus-visible:ring-[#005B2E]"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold">Estoque Mínimo</Label>
          <Input
            type="number"
            value={form.min_stock}
            onChange={(e) => setField('min_stock', e.target.value)}
            placeholder="0"
            min="0"
            className="focus-visible:ring-[#005B2E]"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold">Estoque Máximo</Label>
          <Input
            type="number"
            value={form.max_stock}
            onChange={(e) => setField('max_stock', e.target.value)}
            placeholder="0"
            min="0"
            className="focus-visible:ring-[#005B2E]"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold">Localização</Label>
          <Input
            value={form.location}
            onChange={(e) => setField('location', e.target.value)}
            placeholder="Ex: Galpão A - Prateleira 3"
            className="focus-visible:ring-[#005B2E]"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold">Lote</Label>
          <Input
            value={form.lot}
            onChange={(e) => setField('lot', e.target.value)}
            placeholder="Ex: L-2026-001"
            className="focus-visible:ring-[#005B2E]"
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label className="text-sm font-semibold">Validade</Label>
        <Input
          type="date"
          value={form.validity}
          onChange={(e) => setField('validity', e.target.value)}
          className="focus-visible:ring-[#005B2E]"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        <div className="flex items-center gap-3">
          <Switch
            checked={form.allow_lot_control}
            onCheckedChange={(v) => setField('allow_lot_control', v)}
          />
          <Label className="text-sm font-semibold">Controle de Lote</Label>
        </div>
        <div className="flex items-center gap-3">
          <Switch
            checked={form.allow_validity_control}
            onCheckedChange={(v) => setField('allow_validity_control', v)}
          />
          <Label className="text-sm font-semibold">Controle de Validade</Label>
        </div>
        <div className="flex items-center gap-3">
          <Switch
            checked={form.allow_serial_number}
            onCheckedChange={(v) => setField('allow_serial_number', v)}
          />
          <Label className="text-sm font-semibold">Número de Série</Label>
        </div>
      </div>
    </div>
  )
}
