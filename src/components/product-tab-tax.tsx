import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { ProductTabProps } from '@/lib/product-types'

const ORIGIN_OPTIONS = [
  '0 - Nacional',
  '1 - Estrangeira - Importação Direta',
  '2 - Estrangeira - Adquirida no Mercado Interno',
  '3 - Nacional com conteúdo estrangeiro superior a 40%',
  '4 - Nacional produzida através de processos produtivos básicos',
  '5 - Nacional com conteúdo estrangeiro inferior a 40%',
  '6 - Estrangeira - Importação Direta sem similar nacional',
  '7 - Estrangeira - Adquirida no Mercado Interno sem similar nacional',
  '8 - Nacional com conteúdo de importação superior a 70%',
]

export function ProductTabTax({ form, setField, errors = {} }: ProductTabProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold">NCM *</Label>
          <Input
            value={form.ncm}
            onChange={(e) => setField('ncm', e.target.value)}
            placeholder="Ex: 4819.10.00"
            className="focus-visible:ring-[#005B2E]"
          />
          {errors.ncm && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {errors.ncm}
            </p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold">CEST</Label>
          <Input
            value={form.cest}
            onChange={(e) => setField('cest', e.target.value)}
            placeholder="Ex: 28.029.00"
            className="focus-visible:ring-[#005B2E]"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold">CFOP Padrão</Label>
          <Input
            value={form.cfop}
            onChange={(e) => setField('cfop', e.target.value)}
            placeholder="Ex: 5102"
            className="focus-visible:ring-[#005B2E]"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold">Origem da Mercadoria</Label>
          <Select value={form.origin} onValueChange={(v) => setField('origin', v)}>
            <SelectTrigger className="focus-visible:ring-[#005B2E]">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {ORIGIN_OPTIONS.map((o) => (
                <SelectItem key={o} value={o}>
                  {o}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold">CST/CSOSN</Label>
          <Input
            value={form.cst_csosn}
            onChange={(e) => setField('cst_csosn', e.target.value)}
            placeholder="Ex: 102"
            className="focus-visible:ring-[#005B2E]"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold">Alíquota de ICMS (%)</Label>
          <Input
            value={form.icms_aliquot}
            onChange={(e) => setField('icms_aliquot', e.target.value)}
            placeholder="Ex: 17"
            className="focus-visible:ring-[#005B2E]"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold">IPI (%)</Label>
          <Input
            value={form.ipi}
            onChange={(e) => setField('ipi', e.target.value)}
            placeholder="Ex: 5"
            className="focus-visible:ring-[#005B2E]"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold">PIS (%)</Label>
          <Input
            value={form.pis}
            onChange={(e) => setField('pis', e.target.value)}
            placeholder="Ex: 0,65"
            className="focus-visible:ring-[#005B2E]"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold">COFINS (%)</Label>
          <Input
            value={form.cofins}
            onChange={(e) => setField('cofins', e.target.value)}
            placeholder="Ex: 3"
            className="focus-visible:ring-[#005B2E]"
          />
        </div>
      </div>
    </div>
  )
}
