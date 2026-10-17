import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import {
  Loader2,
  DollarSign,
  TrendingUp,
  Target,
  Users,
  BarChart3,
  AlertCircle,
} from 'lucide-react'
import { getMkCockpitData } from '@/services/marketing'
import { cn } from '@/lib/utils'

export function MarketingCockpit() {
  const [data, setData] = useState<Awaited<ReturnType<typeof getMkCockpitData>> | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMkCockpitData()
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [])

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )
  if (!data)
    return <p className="text-center text-muted-foreground py-6">Erro ao carregar dados.</p>

  const stats = [
    {
      label: 'Investimento Total',
      value: `R$ ${data.totalInvestment.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: 'text-[#005B2E]',
    },
    {
      label: 'Receita Atribuída',
      value: `R$ ${data.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: TrendingUp,
      color: 'text-emerald-600',
    },
    {
      label: 'ROI',
      value: `${data.roi.toFixed(1)}%`,
      icon: BarChart3,
      color: data.roi >= 0 ? 'text-green-600' : 'text-red-600',
    },
    { label: 'Leads Gerados', value: data.totalLeads, icon: Users, color: 'text-blue-600' },
    { label: 'CPL', value: `R$ ${data.cpl.toFixed(2)}`, icon: Target, color: 'text-amber-600' },
    { label: 'CAC', value: `R$ ${data.cac.toFixed(2)}`, icon: Target, color: 'text-purple-600' },
    { label: 'Jobs Atrasados', value: data.lateJobs, icon: AlertCircle, color: 'text-red-600' },
    {
      label: 'Peças Pendentes',
      value: data.pendingApproval,
      icon: AlertCircle,
      color: 'text-orange-600',
    },
  ]

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-[#005B2E]">Cockpit de Marketing</h2>
      <p className="text-xs text-muted-foreground">
        Dados consumidos via BI Enterprise 360 — camada única de analytics
      </p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((s) => (
          <Card key={s.label} className="border-l-4 border-[#005B2E]">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-lg font-bold text-[#005B2E]">{s.value}</p>
              </div>
              <s.icon className={cn('w-7 h-7', s.color)} />
            </CardContent>
          </Card>
        ))}
      </div>
      {data.byChannel.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h3 className="text-sm font-bold text-[#005B2E] mb-3">Investimento por Canal</h3>
            <div className="space-y-2">
              {data.byChannel.map(([channel, value]) => {
                const numVal = Number(value) || 0
                const pct =
                  data.totalInvestment > 0
                    ? Math.min(100, (numVal / data.totalInvestment) * 100)
                    : 0
                return (
                  <div key={channel} className="flex items-center justify-between text-sm">
                    <span className="capitalize">{channel}</span>
                    <div className="flex items-center gap-2 flex-1 max-w-xs ml-4">
                      <div className="flex-1 bg-gray-100 rounded h-2 overflow-hidden">
                        <div className="bg-[#005B2E] h-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="font-semibold text-[#005B2E] text-xs">
                        R$ {numVal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
