import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  SERVICE_CHECKLIST_OPTIONS,
  CARGO_TYPE_OPTIONS,
  PAYMENT_OPTIONS,
  DEADLINE_OPTIONS,
} from '@/lib/constants'
import { Package, CheckSquare, DollarSign } from 'lucide-react'

interface BudgetFormExtrasProps {
  values: Record<string, string>
  onChange: (name: string, value: string) => void
}

const NEEDS_CHECKBOXES = [
  { name: 'necessita_seguro', label: 'Necessita seguro?' },
  { name: 'necessita_picking', label: 'Necessita picking?' },
  { name: 'necessita_cross_docking', label: 'Necessita cross docking?' },
  { name: 'necessita_fracionamento', label: 'Necessita fracionamento?' },
  { name: 'necessita_distribuicao', label: 'Necessita distribuição?' },
]

export function BudgetFormExtras({ values, onChange }: BudgetFormExtrasProps) {
  const checkedServices = values.servicos_inclusos
    ? values.servicos_inclusos.split(',').filter(Boolean)
    : []

  const toggleService = (service: string, _checked?: boolean) => {
    const current = values.servicos_inclusos
      ? values.servicos_inclusos.split(',').filter(Boolean)
      : []
    const updated = current.includes(service)
      ? current.filter((s) => s !== service)
      : [...current, service]
    onChange('servicos_inclusos', updated.join(','))
  }

  const toggleCheckbox = (name: string, checked: boolean) => {
    onChange(name, checked ? 'Sim' : 'Não')
  }

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-xl border border-[#005B2E]/20 bg-[#005B2E]/5 space-y-3">
        <div className="flex items-center gap-2">
          <CheckSquare className="w-5 h-5 text-[#005B2E]" />
          <h4 className="text-sm font-bold text-[#005B2E]">Serviços Inclusos na Cotação</h4>
          <span className="text-xs text-muted-foreground">(opcional)</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {SERVICE_CHECKLIST_OPTIONS.map((service) => (
            <div key={service} className="flex items-center gap-2">
              <Checkbox
                id={`svc-${service}`}
                checked={checkedServices.includes(service)}
                onCheckedChange={(v) => toggleService(service, v === true)}
                className="border-border data-[state=checked]:bg-[#005B2E] data-[state=checked]:border-[#005B2E]"
              />
              <label htmlFor={`svc-${service}`} className="text-xs sm:text-sm cursor-pointer">
                {service}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 rounded-xl border border-[#C89B3C]/30 bg-[#C89B3C]/5 space-y-3">
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5 text-[#C89B3C]" />
          <h4 className="text-sm font-bold text-[#005B2E]">Detalhes Operacionais</h4>
          <span className="text-xs text-muted-foreground">(opcional)</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {NEEDS_CHECKBOXES.map((item) => (
            <div key={item.name} className="flex items-center gap-2">
              <Checkbox
                id={item.name}
                checked={values[item.name] === 'Sim'}
                onCheckedChange={(v) => toggleCheckbox(item.name, v === true)}
                className="border-border data-[state=checked]:bg-[#005B2E] data-[state=checked]:border-[#005B2E]"
              />
              <label htmlFor={item.name} className="text-xs sm:text-sm cursor-pointer">
                {item.label}
              </label>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="space-y-1.5">
            <Label className="text-xs sm:text-sm font-semibold">Valor da mercadoria (R$)</Label>
            <Input
              value={values.valor_mercadoria || ''}
              onChange={(e) => onChange('valor_mercadoria', e.target.value)}
              placeholder="Ex: 50.000,00"
              className="focus-visible:ring-[#005B2E]"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs sm:text-sm font-semibold">Tipo de carga</Label>
            <Select
              value={values.tipo_carga || ''}
              onValueChange={(v) => onChange('tipo_carga', v)}
            >
              <SelectTrigger className="focus:ring-[#005B2E] bg-white">
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent className="bg-white z-50">
                {CARGO_TYPE_OPTIONS.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs sm:text-sm font-semibold">Prazo desejado</Label>
            <Select
              value={values.prazo_desejado || ''}
              onValueChange={(v) => onChange('prazo_desejado', v)}
            >
              <SelectTrigger className="focus:ring-[#005B2E] bg-white">
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent className="bg-white z-50">
                {DEADLINE_OPTIONS.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs sm:text-sm font-semibold">Quantidade de volumes</Label>
            <Input
              type="number"
              value={values.quantidade_volumes || ''}
              onChange={(e) => onChange('quantidade_volumes', e.target.value)}
              placeholder="Ex: 150"
              className="focus-visible:ring-[#005B2E]"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs sm:text-sm font-semibold">Peso (kg)</Label>
            <Input
              type="number"
              value={values.peso || ''}
              onChange={(e) => onChange('peso', e.target.value)}
              placeholder="Ex: 1200"
              className="focus-visible:ring-[#005B2E]"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs sm:text-sm font-semibold">Cubagem (m³)</Label>
            <Input
              type="number"
              step="0.01"
              value={values.cubagem || ''}
              onChange={(e) => onChange('cubagem', e.target.value)}
              placeholder="Ex: 2.5"
              className="focus-visible:ring-[#005B2E]"
            />
          </div>
        </div>
      </div>

      <div className="p-4 rounded-xl border border-[#005B2E]/20 bg-[#005B2E]/5 space-y-3">
        <div className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-[#005B2E]" />
          <h4 className="text-sm font-bold text-[#005B2E]">Informações Comerciais</h4>
          <span className="text-xs text-muted-foreground">(opcional)</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs sm:text-sm font-semibold">Valor do seguro (R$)</Label>
            <Input
              value={values.valor_seguro || ''}
              onChange={(e) => onChange('valor_seguro', e.target.value)}
              placeholder="Ex: 500,00"
              className="focus-visible:ring-[#005B2E]"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs sm:text-sm font-semibold">Forma de Pagamento</Label>
            <Select
              value={values.forma_pagamento || ''}
              onValueChange={(v) => onChange('forma_pagamento', v)}
            >
              <SelectTrigger className="focus:ring-[#005B2E] bg-white">
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent className="bg-white z-50">
                {PAYMENT_OPTIONS.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs sm:text-sm font-semibold">Prazo</Label>
            <Input
              value={values.prazo || ''}
              onChange={(e) => onChange('prazo', e.target.value)}
              placeholder="Ex: 15 dias"
              className="focus-visible:ring-[#005B2E]"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
