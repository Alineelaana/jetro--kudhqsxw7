import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { ProductTabProps } from '@/lib/product-types'
import { isValidNcm, isValidCest, formatNcm, formatCest } from '@/lib/fiscal-validations'

const ORIGIN_OPTIONS = [
  { value: '0', label: '0 - Nacional, exceto as indicadas nos códigos 3, 4, 5 e 8' },
  { value: '1', label: '1 - Estrangeira - Importação direta, exceto a indicada no código 6' },
  {
    value: '2',
    label: '2 - Estrangeira - Adquirida no mercado interno, exceto a indicada no código 7',
  },
  { value: '3', label: '3 - Nacional, mercadoria com Conteúdo de Importação > 40% e <= 70%' },
  { value: '4', label: '4 - Nacional, produção em conformidade com processos produtivos básicos' },
  { value: '5', label: '5 - Nacional, mercadoria com Conteúdo de Importação <= 40%' },
  { value: '6', label: '6 - Estrangeira - Importação direta sem similar nacional' },
  { value: '7', label: '7 - Estrangeira - Adquirida no mercado interno sem similar nacional' },
  { value: '8', label: '8 - Nacional, mercadoria com Conteúdo de Importação > 70%' },
]

export function ProductTabTax({ form, setField, errors = {} }: ProductTabProps) {
  const ncmValid = isValidNcm(form.ncm)
  const cestValid = isValidCest(form.cest)

  return (
    <div className="space-y-4">
      <div className="p-3 bg-muted/40 rounded-md border border-border">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[#005B2E] mb-1">
          Regras Fiscais Gerais (Parâmetros Padrão do Cadastro)
        </h4>
        <p className="text-xs text-muted-foreground">
          Os dados abaixo servem de referência padrão. Configurações por estabelecimento (ex: Gran
          Romano em SP vs DEC Eldorado no ES) são ajustadas e sobrescritas de forma independente na
          aba <strong>Fiscal por Empresa</strong>.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold">NCM (Nomenclatura Comum Mercosul) *</Label>
            {form.ncm && (
              <span
                className={`text-[11px] font-semibold flex items-center gap-1 ${
                  ncmValid ? 'text-emerald-700' : 'text-amber-700'
                }`}
              >
                {ncmValid ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" /> 8 dígitos válidos
                  </>
                ) : (
                  <>
                    <ShieldAlert className="w-3.5 h-3.5" /> NCM incompleto
                  </>
                )}
              </span>
            )}
          </div>
          <Input
            value={form.ncm}
            onChange={(e) => setField('ncm', formatNcm(e.target.value))}
            placeholder="Ex: 4819.10.00"
            className="focus-visible:ring-[#005B2E] font-mono font-bold"
          />
          <p className="text-[11px] text-muted-foreground">
            Armazenado como texto para preservar códigos que iniciam com zero.
          </p>
          {errors.ncm && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {errors.ncm}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold">CEST (Substituição Tributária)</Label>
            {form.cest && (
              <span
                className={`text-[11px] font-semibold flex items-center gap-1 ${
                  cestValid ? 'text-emerald-700' : 'text-amber-700'
                }`}
              >
                {cestValid ? 'CEST válido' : 'CEST incompleto'}
              </span>
            )}
          </div>
          <Input
            value={form.cest}
            onChange={(e) => setField('cest', formatCest(e.target.value))}
            placeholder="Ex: 28.029.00 (opcional)"
            className="focus-visible:ring-[#005B2E] font-mono"
          />
          <p className="text-[11px] text-muted-foreground">
            Não é exigido para toda mercadoria — preencha apenas se sujeito a ST.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold">Origem da Mercadoria (Tabela A) *</Label>
          <Select value={form.origin || '0'} onValueChange={(v) => setField('origin', v)}>
            <SelectTrigger className="focus-visible:ring-[#005B2E]">
              <SelectValue placeholder="Selecione a origem" />
            </SelectTrigger>
            <SelectContent>
              {ORIGIN_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-semibold">CFOP Padrão de Venda Geral</Label>
          <Input
            value={form.cfop}
            onChange={(e) => setField('cfop', e.target.value)}
            placeholder="Ex: 5102 (revenda) ou 5101 (produção)"
            className="focus-visible:ring-[#005B2E] font-mono"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold">CST / CSOSN Padrão</Label>
          <Input
            value={form.cst_csosn}
            onChange={(e) => setField('cst_csosn', e.target.value)}
            placeholder="Ex: 00, 102, 500"
            className="focus-visible:ring-[#005B2E] font-mono"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold">Alíquota Básica ICMS (%)</Label>
          <Input
            value={form.icms_aliquot}
            onChange={(e) => setField('icms_aliquot', e.target.value)}
            placeholder="Ex: 17.00"
            className="focus-visible:ring-[#005B2E] font-mono"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold">IPI (%)</Label>
          <Input
            value={form.ipi}
            onChange={(e) => setField('ipi', e.target.value)}
            placeholder="Ex: 5.00"
            className="focus-visible:ring-[#005B2E] font-mono"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold">PIS (%)</Label>
          <Input
            value={form.pis}
            onChange={(e) => setField('pis', e.target.value)}
            placeholder="Ex: 0.65"
            className="focus-visible:ring-[#005B2E] font-mono"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold">COFINS (%)</Label>
          <Input
            value={form.cofins}
            onChange={(e) => setField('cofins', e.target.value)}
            placeholder="Ex: 3.00"
            className="focus-visible:ring-[#005B2E] font-mono"
          />
        </div>
      </div>
    </div>
  )
}
