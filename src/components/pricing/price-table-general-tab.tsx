import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  TABLE_TYPE_OPTIONS,
  TABLE_STATUS_OPTIONS,
  type PriceTableFormState,
} from '@/lib/price-table-types'

interface Props {
  form: PriceTableFormState
  setField: (field: keyof PriceTableFormState, value: string) => void
}

export function PriceTableGeneralTab({ form, setField }: Props) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <Label className="text-xs mb-1 block">Nome da Tabela *</Label>
          <Input
            value={form.table_name}
            onChange={(e) => setField('table_name', e.target.value)}
            placeholder="Ex: Tabela Varejo 2026"
            className="focus-visible:ring-[#005B2E]"
          />
        </div>
        <div>
          <Label className="text-xs mb-1 block">Código</Label>
          <Input
            value={form.code}
            onChange={(e) => setField('code', e.target.value)}
            placeholder="Gerado automaticamente se vazio"
            className="focus-visible:ring-[#005B2E]"
          />
        </div>
      </div>
      <div>
        <Label className="text-xs mb-1 block">Descrição</Label>
        <Textarea
          value={form.description}
          onChange={(e) => setField('description', e.target.value)}
          rows={2}
          placeholder="Descrição da tabela de preços"
          className="focus-visible:ring-[#005B2E]"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <Label className="text-xs mb-1 block">Empresa</Label>
          <Input
            value={form.empresa}
            onChange={(e) => setField('empresa', e.target.value)}
            className="focus-visible:ring-[#005B2E]"
          />
        </div>
        <div>
          <Label className="text-xs mb-1 block">Filial</Label>
          <Input
            value={form.filial}
            onChange={(e) => setField('filial', e.target.value)}
            className="focus-visible:ring-[#005B2E]"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <Label className="text-xs mb-1 block">Tipo da Tabela</Label>
          <Select value={form.table_type} onValueChange={(v) => setField('table_type', v)}>
            <SelectTrigger className="focus-visible:ring-[#005B2E]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TABLE_TYPE_OPTIONS.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs mb-1 block">Moeda</Label>
          <Select value={form.moeda} onValueChange={(v) => setField('moeda', v)}>
            <SelectTrigger className="focus-visible:ring-[#005B2E]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="BRL">Real (R$)</SelectItem>
              <SelectItem value="USD">Dólar ($)</SelectItem>
              <SelectItem value="EUR">Euro (€)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <Label className="text-xs mb-1 block">Data Inicial</Label>
          <Input
            type="date"
            value={form.data_inicial}
            onChange={(e) => setField('data_inicial', e.target.value)}
            className="focus-visible:ring-[#005B2E]"
          />
        </div>
        <div>
          <Label className="text-xs mb-1 block">Data Final</Label>
          <Input
            type="date"
            value={form.data_final}
            onChange={(e) => setField('data_final', e.target.value)}
            className="focus-visible:ring-[#005B2E]"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <Label className="text-xs mb-1 block">Prioridade</Label>
          <Input
            type="number"
            value={form.prioridade}
            onChange={(e) => setField('prioridade', e.target.value)}
            className="focus-visible:ring-[#005B2E]"
          />
        </div>
        <div>
          <Label className="text-xs mb-1 block">Tabela Base</Label>
          <Input
            value={form.tabela_base}
            onChange={(e) => setField('tabela_base', e.target.value)}
            placeholder="ID da tabela base (opcional)"
            className="focus-visible:ring-[#005B2E]"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <Label className="text-xs mb-1 block">% Ajuste sobre Tabela Base</Label>
          <Input
            value={form.percentual_ajuste}
            onChange={(e) => setField('percentual_ajuste', e.target.value)}
            placeholder="Ex: 10 ou -5"
            className="focus-visible:ring-[#005B2E]"
          />
        </div>
        <div>
          <Label className="text-xs mb-1 block">Situação</Label>
          <Select value={form.status} onValueChange={(v) => setField('status', v)}>
            <SelectTrigger className="focus-visible:ring-[#005B2E]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TABLE_STATUS_OPTIONS.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label className="text-xs mb-1 block">Observações</Label>
        <Textarea
          value={form.observacoes}
          onChange={(e) => setField('observacoes', e.target.value)}
          rows={2}
          className="focus-visible:ring-[#005B2E]"
        />
      </div>
    </div>
  )
}
