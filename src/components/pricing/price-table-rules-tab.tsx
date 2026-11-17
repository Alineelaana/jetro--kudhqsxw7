import { Card, CardContent } from '@/components/ui/card'
import { MultiSelectField } from '@/components/pricing/multi-select-field'
import { useRuleOptions, type SelectOption } from '@/components/pricing/rule-options'
import type { PriceTableRules } from '@/lib/price-table-types'

interface Props {
  rules: PriceTableRules
  setRules: (rules: PriceTableRules) => void
}

/**
 * Regras de Aplicação — todos os campos são seletores multi-seleção que buscam
 * os registros reais cadastrados no sistema. Em branco = aplica a todos; a
 * tabela com maior prioridade é selecionada automaticamente.
 */
export function PriceTableRulesTab({ rules, setRules }: Props) {
  const { options, loading } = useRuleOptions()

  const toggle = (key: keyof PriceTableRules, value: string) => {
    const current = parseField(rules[key])
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value]
    setRules({ ...rules, [key]: next })
  }

  const field = (key: keyof PriceTableRules, label: string) => (
    <MultiSelectField
      label={label}
      options={(options[key] || []) as SelectOption[]}
      selected={parseField(rules[key])}
      onChange={(sel) => setRules({ ...rules, [key]: sel })}
      loading={loading}
    />
  )

  return (
    <div className="space-y-3">
      <Card className="border-2 border-[#005B2E]/20 bg-[#005B2E]/5">
        <CardContent className="py-3">
          <p className="text-xs text-muted-foreground">
            Selecione os registros reais do sistema em cada campo.{' '}
            <strong>Deixe em branco para aplicar a todos</strong>. A tabela com maior prioridade
            será selecionada automaticamente conforme o cliente, empresa, filial, canal, região,
            vendedor e data da operação.
          </p>
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {field('empresas', 'Empresas')}
        {field('filiais', 'Filiais')}
        {field('clientes', 'Clientes')}
        {field('grupos_clientes', 'Grupos de Clientes')}
        {field('regioes', 'Regiões')}
        {field('cidades', 'Cidades')}
        {field('estados', 'Estados')}
        {field('canais', 'Canais de Venda')}
        {field('vendedores', 'Vendedores')}
        {field('representantes', 'Representantes')}
        {field('contratos', 'Contratos')}
        {field('campanhas', 'Campanhas')}
        {field('formas_pagamento', 'Formas de Pagamento')}
        {field('condicoes_pagamento', 'Condições de Pagamento')}
      </div>
    </div>
  )
}

/** Aceita tanto o formato novo (array) quanto antigo (string CSV) já persistidos */
function parseField(v: unknown): string[] {
  if (Array.isArray(v)) return v.map((x) => String(x)).filter(Boolean)
  if (typeof v === 'string' && v.trim()) {
    return v
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
  }
  return []
}
