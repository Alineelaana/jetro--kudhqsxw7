import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { AlertCircle, Hash } from 'lucide-react'
import { ProductVariationsSection } from '@/components/product-variations-section'
import type { ProductTabProps, FormVariation } from '@/lib/product-types'

interface Props extends ProductTabProps {
  variations: FormVariation[]
  setVariations: (v: FormVariation[]) => void
}

export function ProductTabGeneral({
  form,
  setField,
  errors = {},
  variations,
  setVariations,
}: Props) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold">Código Interno</Label>
          {form.code ? (
            <div className="flex items-center gap-2 p-2.5 bg-muted/50 rounded-md border border-border">
              <Hash className="w-4 h-4 text-[#C89B3C]" />
              <span className="text-sm font-bold text-[#005B2E]">{form.code}</span>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground italic py-2">
              Será gerado automaticamente ao salvar.
            </p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold">Código de Barras (EAN) *</Label>
          <Input
            value={form.ean}
            onChange={(e) => setField('ean', e.target.value)}
            placeholder="Ex: 7891234567890"
            className="focus-visible:ring-[#005B2E]"
          />
          {errors.ean && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {errors.ean}
            </p>
          )}
        </div>
      </div>
      <div className="space-y-1.5">
        <Label className="text-sm font-semibold">Código do Fabricante</Label>
        <Input
          value={form.manufacturer_code}
          onChange={(e) => setField('manufacturer_code', e.target.value)}
          placeholder="Ex: REF-001"
          className="focus-visible:ring-[#005B2E]"
        />
      </div>
      <div className="space-y-1.5">
        <Label className="text-sm font-semibold">Descrição do Produto *</Label>
        <Input
          value={form.name}
          onChange={(e) => setField('name', e.target.value)}
          placeholder="Ex: Caixa de Papelão 40x30x30"
          className="focus-visible:ring-[#005B2E]"
        />
        {errors.name && (
          <p className="text-sm text-destructive flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            {errors.name}
          </p>
        )}
      </div>
      <div className="space-y-1.5">
        <Label className="text-sm font-semibold">Descrição Resumida *</Label>
        <Textarea
          value={form.description}
          onChange={(e) => setField('description', e.target.value)}
          rows={2}
          placeholder="Descrição resumida do produto"
          className="focus-visible:ring-[#005B2E]"
        />
        {errors.description && (
          <p className="text-sm text-destructive flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            {errors.description}
          </p>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold">Marca</Label>
          <Input
            value={form.brand}
            onChange={(e) => setField('brand', e.target.value)}
            placeholder="Ex: PackLog"
            className="focus-visible:ring-[#005B2E]"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold">Categoria</Label>
          <Input
            value={form.category}
            onChange={(e) => setField('category', e.target.value)}
            placeholder="Ex: Embalagens"
            className="focus-visible:ring-[#005B2E]"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold">Subcategoria</Label>
          <Input
            value={form.subcategory}
            onChange={(e) => setField('subcategory', e.target.value)}
            placeholder="Ex: Caixas"
            className="focus-visible:ring-[#005B2E]"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold">Unidade de Medida</Label>
          <Input
            value={form.unit}
            onChange={(e) => setField('unit', e.target.value)}
            placeholder="Ex: un, kg, cx"
            className="focus-visible:ring-[#005B2E]"
          />
        </div>
        <div className="flex items-center gap-3 pt-6">
          <Switch checked={form.active} onCheckedChange={(v) => setField('active', v)} />
          <Label className="text-sm font-semibold">Ativo</Label>
        </div>
      </div>
      <ProductVariationsSection variations={variations} onChange={setVariations} />
    </div>
  )
}
