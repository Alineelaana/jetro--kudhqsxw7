import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Play, Sparkles } from 'lucide-react'
import { getSimulations, ctrlCreate } from '@/services/controladoria'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import { SCENARIO_TYPES, SIMULATION_LABELS, type SimulationRecord } from '@/lib/controladoria-types'
import { getExecutiveAnalytics } from '@/services/bi-analytics-extended'

export function ControladoriaSimulator() {
  const { user } = useAuth()
  const [simulations, setSimulations] = useState<SimulationRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [scenarioType, setScenarioType] = useState('price_increase')
  const [param1, setParam1] = useState('10')
  const [running, setRunning] = useState(false)
  const [baseRevenue, setBaseRevenue] = useState(0)

  const load = async () => {
    try {
      setSimulations((await getSimulations()) as SimulationRecord[])
      const exec = await getExecutiveAnalytics({}).catch(() => null)
      if (exec) setBaseRevenue(exec.faturamento)
    } catch {
      /* ignore */
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime('controladoria_simulations', () => load())

  const runSimulation = async () => {
    setRunning(true)
    const pct = parseFloat(param1) || 0
    let projectedRevenue = baseRevenue
    let projectedCost = baseRevenue * 0.7
    let projectedMargin = 0
    switch (scenarioType) {
      case 'price_increase':
        projectedRevenue = baseRevenue * (1 + pct / 100)
        break
      case 'cost_reduction':
        projectedCost = projectedCost * (1 - pct / 100)
        break
      case 'sales_increase':
        projectedRevenue = baseRevenue * (1 + pct / 100)
        break
      case 'expense_reduction':
        projectedCost = projectedCost * (1 - pct / 100)
        break
      default:
        projectedRevenue = baseRevenue * (1 + pct / 100)
    }
    projectedMargin =
      projectedRevenue > 0 ? ((projectedRevenue - projectedCost) / projectedRevenue) * 100 : 0

    const userName = (user?.name as string) || 'Usuário'
    await ctrlCreate('controladoria_simulations', {
      scenario_name: `${SIMULATION_LABELS[scenarioType]} ${pct}%`,
      scenario_type: scenarioType,
      parameters: JSON.stringify({ percentual: pct, base_revenue: baseRevenue }),
      results: JSON.stringify({
        projected_revenue: projectedRevenue,
        projected_cost: projectedCost,
        projected_margin: projectedMargin,
        revenue_delta: projectedRevenue - baseRevenue,
        margin_delta:
          projectedMargin -
          (baseRevenue > 0 ? ((baseRevenue - baseRevenue * 0.7) / baseRevenue) * 100 : 0),
      }),
      base_version: 'atual',
      status: 'completed',
      user_name: userName,
      company: '',
      branch: '',
    })
    setRunning(false)
    load()
  }

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )

  return (
    <div className="space-y-4">
      <Card className="border-2 border-[#005B2E]/20">
        <CardContent className="py-4">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-[#C89B3C]" />
            <h3 className="font-bold text-[#005B2E] text-sm">Simulador Corporativo</h3>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            Cenários rodam sobre dados oficiais — resultados claramente marcados como SIMULADO.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
            <div className="space-y-1">
              <Label className="text-xs">Cenário</Label>
              <select
                value={scenarioType}
                onChange={(e) => setScenarioType(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
              >
                {SCENARIO_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {SIMULATION_LABELS[t]}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Parâmetro (%)</Label>
              <Input
                type="number"
                value={param1}
                onChange={(e) => setParam1(e.target.value)}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <Button
              className="bg-[#005B2E] hover:bg-[#01361D]"
              onClick={runSimulation}
              disabled={running}
            >
              {running ? (
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              ) : (
                <Play className="w-4 h-4 mr-1" />
              )}
              Simular
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {simulations.map((sim) => {
          const results = (sim.results as Record<string, number>) || {}
          return (
            <Card key={sim.id} className="border-2 border-[#005B2E]/20">
              <CardContent className="py-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-sm">{sim.scenario_name}</h4>
                  <Badge variant="outline" className="text-xs">
                    {SIMULATION_LABELS[sim.scenario_type] || sim.scenario_type}
                  </Badge>
                </div>
                <div className="space-y-1 text-xs">
                  {results.projected_revenue !== undefined && (
                    <div className="flex justify-between border-b border-border py-0.5">
                      <span className="text-muted-foreground">Receita Projetada</span>
                      <span className="font-medium">
                        R${' '}
                        {results.projected_revenue.toLocaleString('pt-BR', {
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  )}
                  {results.projected_cost !== undefined && (
                    <div className="flex justify-between border-b border-border py-0.5">
                      <span className="text-muted-foreground">Custo Projetado</span>
                      <span className="font-medium">
                        R${' '}
                        {results.projected_cost.toLocaleString('pt-BR', {
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  )}
                  {results.projected_margin !== undefined && (
                    <div className="flex justify-between border-b border-border py-0.5">
                      <span className="text-muted-foreground">Margem Projetada</span>
                      <span className="font-bold text-[#005B2E]">
                        {results.projected_margin.toFixed(2)}%
                      </span>
                    </div>
                  )}
                  {results.revenue_delta !== undefined && (
                    <div className="flex justify-between py-0.5">
                      <span className="text-muted-foreground">Δ Receita</span>
                      <span
                        className={results.revenue_delta >= 0 ? 'text-emerald-600' : 'text-red-600'}
                      >
                        R${' '}
                        {results.revenue_delta.toLocaleString('pt-BR', {
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  )}
                </div>
                <p className="text-xs text-amber-600 mt-2">
                  ⚠️ Resultado simulado — não é valor realizado
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>
      {simulations.length === 0 && (
        <p className="text-center py-6 text-muted-foreground">Nenhuma simulação executada.</p>
      )}
    </div>
  )
}
