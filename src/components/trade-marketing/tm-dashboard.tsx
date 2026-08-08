import { Card, CardContent } from '@/components/ui/card'
import {
  ACTION_STATUS,
  STATUS_COLORS,
  type TradeMarketingAction,
} from '@/lib/trade-marketing-types'
import { TrendingUp, Activity, DollarSign, Target, AlertCircle, Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TmDashboardProps {
  actions: TradeMarketingAction[]
}

export function TmDashboard({ actions }: TmDashboardProps) {
  const total = actions.length
  const inExecution = actions.filter((a) => a.status === 'execucao').length
  const totalInvestment = actions.reduce((s, a) => s + (parseFloat(a.budget_planned) || 0), 0)
  const realized = actions.reduce((s, a) => s + (parseFloat(a.cost_actual) || 0), 0)

  const bySupplier = Object.entries(
    actions.reduce(
      (acc, a) => {
        const k = a.supplier || '—'
        acc[k] = (acc[k] || 0) + (parseFloat(a.budget_planned) || 0)
        return acc
      },
      {} as Record<string, number>,
    ),
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  const byBrand = Object.entries(
    actions.reduce(
      (acc, a) => {
        const k = a.brand || '—'
        acc[k] = (acc[k] || 0) + (parseFloat(a.budget_planned) || 0)
        return acc
      },
      {} as Record<string, number>,
    ),
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  const byStatus = ACTION_STATUS.map((s) => ({
    ...s,
    count: actions.filter((a) => a.status === s.value).length,
  })).filter((s) => s.count > 0)

  const stats = [
    { label: 'Total de Ações', value: total, icon: Activity, color: 'text-[#005B2E]' },
    { label: 'Em Execução', value: inExecution, icon: TrendingUp, color: 'text-orange-600' },
    {
      label: 'Investimento Total',
      value: `R$ ${totalInvestment.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: 'text-[#005B2E]',
    },
    {
      label: 'Valor Realizado',
      value: `R$ ${realized.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: Target,
      color: 'text-blue-600',
    },
  ]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((s) => (
          <Card key={s.label} className="border-l-4 border-[#005B2E]">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-xl font-bold text-[#005B2E]">{s.value}</p>
              </div>
              <s.icon className={cn('w-8 h-8', s.color)} />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <h3 className="text-sm font-bold text-[#005B2E] mb-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> Ações por Status
            </h3>
            <div className="space-y-1.5">
              {byStatus.map((s) => (
                <div key={s.value} className="flex items-center justify-between">
                  <span className={cn('text-xs px-2 py-0.5 rounded', STATUS_COLORS[s.value])}>
                    {s.label}
                  </span>
                  <span className="text-sm font-semibold">{s.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <h3 className="text-sm font-bold text-[#005B2E] mb-3 flex items-center gap-2">
              <Trophy className="w-4 h-4" /> Top Fornecedores
            </h3>
            <div className="space-y-1.5">
              {bySupplier.map(([name, value]) => (
                <div key={name} className="flex items-center justify-between text-xs">
                  <span className="truncate max-w-[60%]">{name}</span>
                  <span className="font-semibold text-[#005B2E]">
                    R$ {value.toLocaleString('pt-BR')}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <h3 className="text-sm font-bold text-[#005B2E] mb-3">Marcas com Maior Investimento</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {byBrand.map(([name, value]) => (
              <div
                key={name}
                className="flex items-center justify-between bg-[#005B2E]/5 rounded px-3 py-1.5"
              >
                <span className="text-xs truncate">{name}</span>
                <span className="text-xs font-semibold text-[#005B2E]">
                  R$ {value.toLocaleString('pt-BR')}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
