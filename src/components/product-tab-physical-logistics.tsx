import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Ruler, Package, Layers, Truck, Calculator } from 'lucide-react'
import type { ProductTabProps } from '@/lib/product-types'

export function ProductTabPhysicalLogistics({ form, setField }: ProductTabProps) {
  // Cálculos automáticos de paletização
  const boxesPerLayer = parseFloat(form.pallet_boxes_per_layer) || 0
  const layersPerPallet = parseFloat(form.pallet_layers_per_pallet) || 0
  const totalBoxesPerPallet = boxesPerLayer * layersPerPallet

  const unitsPerBox = parseFloat(form.master_units_per_box) || 0
  const totalUnitsPerPallet = totalBoxesPerPallet * unitsPerBox

  const boxGrossWeight = parseFloat(form.master_weight_gross) || 0
  const palletEmptyWeight = parseFloat(form.pallet_empty_weight) || 0
  const totalPalletWeight = totalBoxesPerPallet * boxGrossWeight + palletEmptyWeight

  // Volume unitário m3 aproximado se dim_unit for mm/cm
  const l = parseFloat(form.dim_length) || 0
  const w = parseFloat(form.dim_width) || 0
  const h = parseFloat(form.dim_height) || 0
  let volumeM3 = 0
  if (l > 0 && w > 0 && h > 0) {
    if (form.dim_unit === 'mm') {
      volumeM3 = (l / 1000) * (w / 1000) * (h / 1000)
    } else if (form.dim_unit === 'cm') {
      volumeM3 = (l / 100) * (w / 100) * (h / 100)
    } else {
      volumeM3 = l * w * h
    }
  }

  return (
    <div className="space-y-6">
      {/* 1. Características Dimensionais do Item Unitário */}
      <Card className="border border-border">
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#005B2E] flex items-center gap-1.5">
              <Ruler className="w-4 h-4" /> 1. Dimensões e Pesos Unitários (Global)
            </h4>
            <span className="text-[11px] text-muted-foreground font-medium">
              Válido para todas as empresas
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Comprimento</Label>
              <Input
                value={form.dim_length}
                onChange={(e) => setField('dim_length', e.target.value)}
                placeholder="0.00"
                className="h-8 text-xs focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Largura</Label>
              <Input
                value={form.dim_width}
                onChange={(e) => setField('dim_width', e.target.value)}
                placeholder="0.00"
                className="h-8 text-xs focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Altura</Label>
              <Input
                value={form.dim_height}
                onChange={(e) => setField('dim_height', e.target.value)}
                placeholder="0.00"
                className="h-8 text-xs focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Profundidade</Label>
              <Input
                value={form.dim_depth}
                onChange={(e) => setField('dim_depth', e.target.value)}
                placeholder="0.00"
                className="h-8 text-xs focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Unid. Medida</Label>
              <Select value={form.dim_unit || 'mm'} onValueChange={(v) => setField('dim_unit', v)}>
                <SelectTrigger className="h-8 text-xs focus-visible:ring-[#005B2E]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mm">Milímetros (mm)</SelectItem>
                  <SelectItem value="cm">Centímetros (cm)</SelectItem>
                  <SelectItem value="m">Metros (m)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Peso Líquido</Label>
              <Input
                value={form.weight_net}
                onChange={(e) => setField('weight_net', e.target.value)}
                placeholder="0.000"
                className="h-8 text-xs focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Peso Bruto</Label>
              <Input
                value={form.weight_gross}
                onChange={(e) => setField('weight_gross', e.target.value)}
                placeholder="0.000"
                className="h-8 text-xs focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Unidade de Peso</Label>
              <Select
                value={form.weight_unit || 'kg'}
                onValueChange={(v) => setField('weight_unit', v)}
              >
                <SelectTrigger className="h-8 text-xs focus-visible:ring-[#005B2E]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kg">Quilogramas (kg)</SelectItem>
                  <SelectItem value="g">Gramas (g)</SelectItem>
                  <SelectItem value="ton">Toneladas (ton)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1 bg-muted/40 p-2 rounded border border-border/60">
              <Label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                <Calculator className="w-3 h-3 text-[#005B2E]" /> Volume Estimado
              </Label>
              <p className="text-xs font-bold text-foreground font-mono">
                {volumeM3 > 0 ? `${volumeM3.toFixed(4)} m³` : '—'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Embalagem Secundária / Caixa Master */}
      <Card className="border border-border">
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#005B2E] flex items-center gap-1.5">
              <Package className="w-4 h-4" /> 2. Embalagem / Caixa Master (DUN-14)
            </h4>
            <span className="text-[11px] text-muted-foreground font-medium">
              Agrupamento para expedição
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Unidades por Caixa *</Label>
              <Input
                value={form.master_units_per_box}
                onChange={(e) => setField('master_units_per_box', e.target.value)}
                placeholder="Ex: 12"
                className="h-8 text-xs focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <Label className="text-xs font-semibold">Código DUN-14 da Caixa</Label>
              <Input
                value={form.master_dun14}
                onChange={(e) => setField('master_dun14', e.target.value)}
                placeholder="Ex: 17891234567897 (14 dígitos)"
                className="h-8 text-xs font-mono focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Tipo de Embalagem</Label>
              <Input
                value={form.packaging_type}
                onChange={(e) => setField('packaging_type', e.target.value)}
                placeholder="Ex: Caixa Papelão Onda C"
                className="h-8 text-xs focus-visible:ring-[#005B2E]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Comprimento CX</Label>
              <Input
                value={form.master_dim_length}
                onChange={(e) => setField('master_dim_length', e.target.value)}
                placeholder="mm"
                className="h-8 text-xs focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Largura CX</Label>
              <Input
                value={form.master_dim_width}
                onChange={(e) => setField('master_dim_width', e.target.value)}
                placeholder="mm"
                className="h-8 text-xs focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Altura CX</Label>
              <Input
                value={form.master_dim_height}
                onChange={(e) => setField('master_dim_height', e.target.value)}
                placeholder="mm"
                className="h-8 text-xs focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Peso Líquido CX (kg)</Label>
              <Input
                value={form.master_weight_net}
                onChange={(e) => setField('master_weight_net', e.target.value)}
                placeholder="0.00"
                className="h-8 text-xs focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Peso Bruto CX (kg)</Label>
              <Input
                value={form.master_weight_gross}
                onChange={(e) => setField('master_weight_gross', e.target.value)}
                placeholder="0.00"
                className="h-8 text-xs focus-visible:ring-[#005B2E]"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. Lastro e Paletização com Cálculos Automáticos */}
      <Card className="border border-border">
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#005B2E] flex items-center gap-1.5">
              <Layers className="w-4 h-4" /> 3. Lastro e Paletização (Cálculos Automáticos)
            </h4>
            <span className="text-[11px] text-muted-foreground font-medium">
              Padrão PBR / Euro / Exportação
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Caixas por Camada (Lastro)</Label>
              <Input
                value={form.pallet_boxes_per_layer}
                onChange={(e) => setField('pallet_boxes_per_layer', e.target.value)}
                placeholder="Ex: 8"
                className="h-8 text-xs focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Camadas por Palete (Altura)</Label>
              <Input
                value={form.pallet_layers_per_pallet}
                onChange={(e) => setField('pallet_layers_per_pallet', e.target.value)}
                placeholder="Ex: 5"
                className="h-8 text-xs focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Tipo do Palete</Label>
              <Select
                value={form.pallet_type || 'pbr'}
                onValueChange={(v) => setField('pallet_type', v)}
              >
                <SelectTrigger className="h-8 text-xs focus-visible:ring-[#005B2E]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pbr">PBR Padrão (1,00m x 1,20m)</SelectItem>
                  <SelectItem value="euro">Euro Pallet (0,80m x 1,20m)</SelectItem>
                  <SelectItem value="descartavel">One-Way / Descartável</SelectItem>
                  <SelectItem value="plastico">Plástico Higienizável</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Tara do Palete Vazio (kg)</Label>
              <Input
                value={form.pallet_empty_weight}
                onChange={(e) => setField('pallet_empty_weight', e.target.value)}
                placeholder="Ex: 25"
                className="h-8 text-xs focus-visible:ring-[#005B2E]"
              />
            </div>
          </div>

          {/* Painel Calculado de Rendimento do Palete */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-muted/40 rounded-lg border border-border">
            <div className="space-y-0.5">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                Total Caixas / Palete
              </p>
              <p className="text-base font-extrabold text-[#005B2E]">
                {totalBoxesPerPallet > 0 ? `${totalBoxesPerPallet} cx` : '—'}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {boxesPerLayer} caixas × {layersPerPallet} camadas
              </p>
            </div>
            <div className="space-y-0.5">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                Total Unidades / Palete
              </p>
              <p className="text-base font-extrabold text-[#005B2E]">
                {totalUnitsPerPallet > 0 ? `${totalUnitsPerPallet.toLocaleString()} un` : '—'}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {totalBoxesPerPallet} cx × {unitsPerBox} un/cx
              </p>
            </div>
            <div className="space-y-0.5">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                Peso Bruto Palete Fechado
              </p>
              <p className="text-base font-extrabold text-[#005B2E]">
                {totalPalletWeight > 0 ? `${totalPalletWeight.toFixed(2)} kg` : '—'}
              </p>
              <p className="text-[10px] text-muted-foreground">
                Carga + tara do palete ({palletEmptyWeight || 0} kg)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 4. Restrições e Cuidados Logísticos */}
      <Card className="border border-border">
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#005B2E] flex items-center gap-1.5">
              <Truck className="w-4 h-4" /> 4. Armazenagem e Transporte Especial
            </h4>
            <span className="text-[11px] text-muted-foreground font-medium">
              Controle de empilhamento e perecibilidade
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Empilhamento Máximo</Label>
              <Input
                value={form.max_stacking}
                onChange={(e) => setField('max_stacking', e.target.value)}
                placeholder="Ex: 5 caixas ou 2 paletes"
                className="h-8 text-xs focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Temperatura Armazenagem</Label>
              <Input
                value={form.storage_temperature}
                onChange={(e) => setField('storage_temperature', e.target.value)}
                placeholder="Ex: 15°C a 25°C ou Ambiente"
                className="h-8 text-xs focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Shelf Life (dias)</Label>
              <Input
                value={form.shelf_life_days}
                onChange={(e) => setField('shelf_life_days', e.target.value)}
                placeholder="Ex: 365"
                className="h-8 text-xs focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Restrições de Transporte</Label>
              <Input
                value={form.transport_restrictions}
                onChange={(e) => setField('transport_restrictions', e.target.value)}
                placeholder="Ex: Não molhar, manter na vertical"
                className="h-8 text-xs focus-visible:ring-[#005B2E]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="flex items-center gap-3 p-2 bg-muted/20 rounded border border-border/60">
              <Switch checked={form.fragile} onCheckedChange={(v) => setField('fragile', v)} />
              <div>
                <Label className="text-xs font-semibold cursor-pointer">Carga Frágil</Label>
                <p className="text-[11px] text-muted-foreground">
                  Alerta para separadores e transportadoras no romaneio.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-2 bg-muted/20 rounded border border-border/60">
              <Switch
                checked={form.special_storage}
                onCheckedChange={(v) => setField('special_storage', v)}
              />
              <div>
                <Label className="text-xs font-semibold cursor-pointer">
                  Armazenamento Especial Requerido
                </Label>
                <p className="text-[11px] text-muted-foreground">
                  Exige controle térmico, câmara fria ou área confinada.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
