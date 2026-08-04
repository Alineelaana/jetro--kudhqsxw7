import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { RULE_FIELDS, type PriceTableRules } from '@/lib/price-table-types'

interface Props {
  rules: PriceTableRules
  setRules: (rules: PriceTableRules) => void
}

export function PriceTableRulesTab({ rules, setRules }: Props) {
  const setRule = (key: keyof PriceTableRules, value: string) => {
    setRules({ ...rules, [key]: value })
  }

  return (
    <div className="space-y-3">
      <Card className="border-2 border-[#005B2E]/20 bg-[#005B2E]/5">
        <CardContent className="py-3">
          <p className="text-xs text-muted-foreground">
            Informe os valores separados por vírgula. Ex: <strong>Cliente A, Cliente B</strong>.
            Deixe em branco para aplicar a todos. A tabela com maior prioridade será selecionada
            automaticamente conforme o cliente, empresa, filial, canal, região, vendedor e data da
            operação.
          </p>
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {RULE_FIELDS.map((field) => (
          <div key={field.key}>
            <Label className="text-xs mb-1 block">{field.label}</Label>
            <Input
              value={rules[field.key] || ''}
              onChange={(e) => setRule(field.key, e.target.value)}
              placeholder={`Digite os ${field.label.toLowerCase()}...`}
              className="focus-visible:ring-[#005B2E]"
            />
          </div>
        ))}
      </div>
    </div>
  )
}
