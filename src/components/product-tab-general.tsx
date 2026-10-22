import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AlertCircle, Hash, Barcode, ShieldAlert, Sparkles } from 'lucide-react'
import { ProductVariationsSection } from '@/components/product-variations-section'
import type { ProductTabProps, FormVariation } from '@/lib/product-types'
import { isValidGtin } from '@/lib/fiscal-validations'

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
  const gtinInvalid =
    !form.sem_gtin && form.ean && form.ean.trim() !== '' && !isValidGtin(form.ean, false)

  return (
    <div className="space-y-4">
      {/* Linha Código Interno e Tipo/Finalidade */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
          <Label className="text-sm font-semibold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#005B2E]" /> Tipo / Finalidade Fiscal *
          </Label>
          <Select
            value={form.tipo_finalidade || 'revenda'}
            onValueChange={(v: any) => setField('tipo_finalidade', v)}
          >
            <SelectTrigger className="focus-visible:ring-[#005B2E]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="revenda">Revenda de Mercadorias</SelectItem>
              <SelectItem value="fabricacao_propria">
                Fabricação Própria (Industrialização)
              </SelectItem>
              <SelectItem value="materia_prima">Matéria-Prima (Insumo Gran)</SelectItem>
              <SelectItem value="embalagem">Material de Embalagem</SelectItem>
              <SelectItem value="ativo_imobilizado">Ativo Imobilizado</SelectItem>
              <SelectItem value="uso_consumo">Uso e Consumo</SelectItem>
              <SelectItem value="outro">Outro / Diversos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-semibold">Referência Externa / Legado</Label>
          <Input
            value={form.external_reference || ''}
            onChange={(e) => setField('external_reference', e.target.value)}
            placeholder="Ex: Cód Sankhya / Cód Antigo"
            className="focus-visible:ring-[#005B2E]"
          />
        </div>
      </div>

      {/* Linha GTIN / EAN com Tratamento Sem GTIN estrito */}
      <div className="p-3 bg-muted/30 rounded-md border border-border space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <Label className="text-sm font-semibold flex items-center gap-1.5">
            <Barcode className="w-4 h-4 text-[#005B2E]" /> Código de Barras (GTIN / EAN)
          </Label>
          <div className="flex items-center gap-2">
            <Switch
              checked={form.sem_gtin}
              onCheckedChange={(checked) => {
                setField('sem_gtin', checked)
                if (checked) {
                  setField('ean', 'SEM GTIN')
                } else if (form.ean === 'SEM GTIN') {
                  setField('ean', '')
                }
              }}
            />
            <Label className="text-xs font-semibold cursor-pointer">
              Produto Sem GTIN (Comercializado sem código de barras)
            </Label>
          </div>
        </div>

        <Input
          value={form.sem_gtin ? 'SEM GTIN' : form.ean}
          onChange={(e) => setField('ean', e.target.value)}
          disabled={form.sem_gtin}
          placeholder="Ex: 7891234567890 (8, 12, 13 ou 14 dígitos)"
          className={`focus-visible:ring-[#005B2E] font-mono ${
            gtinInvalid ? 'border-destructive focus-visible:ring-destructive' : ''
          }`}
        />

        {gtinInvalid && (
          <p className="text-xs text-destructive flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            GTIN inválido: o dígito verificador não confere com o padrão GS1. Marque "Produto Sem
            GTIN" se o produto não possuir código oficial.
          </p>
        )}

        {errors.ean && (
          <p className="text-sm text-destructive flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            {errors.ean}
          </p>
        )}
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
          placeholder="Ex: Caixa de Papelão Ondulado 40x30x30"
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

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
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
          <Label className="text-sm font-semibold">Grupo de Produtos</Label>
          <Input
            value={form.product_group || ''}
            onChange={(e) => setField('product_group', e.target.value)}
            placeholder="Ex: Embalagens Industriais"
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
          <Label className="text-sm font-semibold">Unidade de Medida Base *</Label>
          <Input
            value={form.unit}
            onChange={(e) => setField('unit', e.target.value.toUpperCase())}
            placeholder="Ex: UN, KG, CX, M"
            className="focus-visible:ring-[#005B2E] font-mono uppercase"
          />
          <p className="text-[11px] text-muted-foreground">
            A unidade base usada para controle de estoque e conversões.
          </p>
        </div>
        <div className="flex items-center gap-3 pt-6">
          <Switch checked={form.active} onCheckedChange={(v) => setField('active', v)} />
          <Label className="text-sm font-semibold">Produto Ativo</Label>
        </div>
      </div>

      <ProductVariationsSection variations={variations} onChange={setVariations} />
    </div>
  )
}
