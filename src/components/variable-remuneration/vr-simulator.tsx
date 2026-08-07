import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getRules, createSimulation } from '@/services/variable-remuneration'
import { useAuth } from '@/hooks/use-auth'
import { parseNum, formatCurrency, CALC_TYPES } from '@/lib/variable-remuneration-types'
import { Loader2, FlaskConical, TrendingUp, Users, Package, Factory } from 'lucide-react'
import { toast } from 'sonner'

const SCENARIOS = [
  {
    id: 'mais_vendas',
    label: 'Se eu vender mais R$',
    icon: TrendingUp,
    param: 'valor_extra',
    paramLabel: 'Valor Extra (R$)',
  },
  {
    id: 'mais_positivacao',
    label: 'Se eu positivar mais',
    icon: Users,
    param: 'clientes_extra',
    paramLabel: 'Clientes Extras',
  },
  {
    id: 'mais_mix',
    label: 'Se eu aumentar meu mix',
    icon: Package,
    param: 'skus_extra',
    paramLabel: 'SKUs Extras',
  },
  {
    id: 'mais_industria',
    label: 'Se eu vender mais da indústria',
    icon: Factory,
    param: 'valor_industria',
    paramLabel: 'Valor Indústria (R$)',
  },
]

export function VrSimulator() {
  const { user } = useAuth()
  const [rules, setRules] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [scenario, setScenario] = useState('mais_vendas')
  const [paramValue, setParamValue] = useState('')

  useEffect(() => {
    getRules()
      .then((r) => {
        setRules(r)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const activeRules = useMemo(() => rules.filter((r) => r.status === 'ativa'), [rules])

  const result = useMemo(() => {
    const extra = parseNum(paramValue)
    let total = 0
    for (const rule of activeRules) {
      const val = parseNum(rule.value)
      if (scenario === 'mais_vendas') {
        if (rule.calc_type === 'percent') total += (extra * val) / 100
        else if (rule.calc_type === 'fixed') total += val
      } else if (scenario === 'mais_positivacao') {
        if (rule.calc_type === 'positivation') total += extra * val
      } else if (scenario === 'mais_mix') {
        if (rule.calc_type === 'mix') total += extra * val
      } else if (scenario === 'mais_industria') {
        if (rule.calc_type === 'industry' || rule.calc_type === 'percent')
          total += (extra * val) / 100
      }
    }
    return total
  }, [activeRules, scenario, paramValue])

  const handleSave = async () => {
    try {
      await createSimulation({
        vendedor_id: user?.id || '',
        vendedor_name: user?.name || '',
        scenario_name: SCENARIOS.find((s) => s.id === scenario)?.label || scenario,
        scenario_type: scenario,
        params: { [SCENARIOS.find((s) => s.id === scenario)?.param || '']: paramValue },
        result_value: result.toFixed(2),
      })
      toast.success('Simulação salva')
    } catch {
      toast.error('Erro ao salvar')
    }
  }

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )

  const currentScenario = SCENARIOS.find((s) => s.id === scenario)!

  return (
    <div className="space-y-4">
      <Card className="border-2 border-[#005B2E]/20">
        <CardHeader>
          <CardTitle className="text-base text-[#005B2E] flex items-center gap-2">
            <FlaskConical className="w-4 h-4" /> Simulador de Comissão
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {SCENARIOS.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setScenario(s.id)
                  setParamValue('')
                }}
                className={`flex items-center gap-2 p-3 rounded-lg border-2 text-sm font-medium transition-colors ${scenario === s.id ? 'border-[#005B2E] bg-[#005B2E]/5 text-[#005B2E]' : 'border-border text-muted-foreground hover:border-[#005B2E]/30'}`}
              >
                <s.icon className="w-4 h-4" /> {s.label}
              </button>
            ))}
          </div>
          <div className="space-y-1 max-w-sm">
            <Label className="text-xs">{currentScenario.paramLabel}</Label>
            <Input
              type="number"
              value={paramValue}
              onChange={(e) => setParamValue(e.target.value)}
              placeholder="0,00"
              className="focus-visible:ring-[#005B2E]"
            />
          </div>
          {paramValue && (
            <Card className="border-2 border-[#C89B3C]/30 bg-[#C89B3C]/5">
              <CardContent className="py-4 text-center">
                <p className="text-sm text-muted-foreground">
                  Comissão estimada para este cenário:
                </p>
                <p className="text-3xl font-black text-[#005B2E]">R$ {formatCurrency(result)}</p>
              </CardContent>
            </Card>
          )}
          <Button
            onClick={handleSave}
            disabled={!paramValue}
            className="bg-[#005B2E] hover:bg-[#01361D] text-white"
          >
            Salvar Simulação
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
