import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Crown,
  Loader2,
  TrendingUp,
  AlertTriangle,
  Package,
  Users,
  Wrench,
  Clock,
  DollarSign,
  Gauge,
} from 'lucide-react'
import { getExecutiveDashboard } from '@/services/industrial-flow'
import { useRealtime } from '@/hooks/use-realtime'
import type { ExecutiveDashboardData } from '@/lib/industrial-flow-types'

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: any
  label: string
  value: string
  sub?: string
  color: string
}) {
  return (
    <Card className="border-2 border-[#005B2E]/10">
      <CardContent className="py-3 flex items-center gap-3">
        <Icon className={`w-7 h-7 ${color}`} />
        <div>
          <p className="text-lg font-black text-foreground">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
          {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  )
}

export function ExecutiveDashboard() {
  const [data, setData] = useState<ExecutiveDashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      setData(await getExecutiveDashboard())
    } catch {
      /* ignore */
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])
  useRealtime('industrial_apontamentos', () => load())
  useRealtime('production_orders', () => load())

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )
  if (!data)
    return <p className="text-center py-6 text-muted-foreground">Erro ao carregar dashboard.</p>

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Crown className="w-6 h-6 text-[#005B2E]" />
        <h2 className="text-xl font-black text-foreground">Visão Executiva</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          icon={Package}
          label="Total de Ordens"
          value={String(data.total_orders)}
          color="text-blue-600"
        />
        <StatCard
          icon={Wrench}
          label="Total de Fases"
          value={String(data.total_phases)}
          color="text-[#005B2E]"
        />
        <StatCard
          icon={TrendingUp}
          label="Demandas"
          value={String(data.total_demand)}
          color="text-purple-600"
        />
        <StatCard
          icon={AlertTriangle}
          label="Ordens Atrasadas"
          value={String(data.late_orders.length)}
          color="text-red-600"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.maintenance_impact && data.maintenance_impact.machines_under_maintenance > 0 && (
          <Card className="border-2 border-amber-200">
            <CardContent className="py-4">
              <h3 className="font-bold text-amber-700 mb-3 flex items-center gap-2">
                <Gauge className="w-4 h-4" /> Impacto de Manutenção
              </h3>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-2xl font-black text-amber-600">
                    {data.maintenance_impact.machines_under_maintenance}
                  </p>
                  <p className="text-xs text-muted-foreground">Máquinas indisponíveis</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-amber-600">
                    {data.maintenance_impact.estimated_downtime_hours}h
                  </p>
                  <p className="text-xs text-muted-foreground">Tempo parado</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-amber-600">
                    {data.maintenance_impact.affected_resources.length}
                  </p>
                  <p className="text-xs text-muted-foreground">Recursos afetados</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        <Card className="border-2 border-[#005B2E]/20">
          <CardContent className="py-4">
            <h3 className="font-bold text-[#005B2E] mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4" /> Ordens Atrasadas
            </h3>{' '}
            {data.most_productive_machine ? (
              <div>
                <p className="text-lg font-black">{data.most_productive_machine.name}</p>
                <p className="text-sm text-muted-foreground">
                  {data.most_productive_machine.total_produced} unidades produzidas
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Sem dados</p>
            )}
          </CardContent>
        </Card>
        <Card className="border-2 border-[#005B2E]/20">
          <CardContent className="py-4">
            <h3 className="font-bold text-[#005B2E] mb-3 flex items-center gap-2">
              <Users className="w-4 h-4" /> Operador Mais Produtivo
            </h3>
            {data.highest_operator_productivity ? (
              <div>
                <p className="text-lg font-black">
                  {data.highest_operator_productivity.operator_name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {data.highest_operator_productivity.total_produced} unidades produzidas
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Sem dados</p>
            )}
          </CardContent>
        </Card>
        <Card className="border-2 border-[#005B2E]/20">
          <CardContent className="py-4">
            <h3 className="font-bold text-[#005B2E] mb-3 flex items-center gap-2">
              <DollarSign className="w-4 h-4" /> Produto de Maior Custo
            </h3>
            {data.highest_cost_product ? (
              <div>
                <p className="text-lg font-black">{data.highest_cost_product.name}</p>
                <p className="text-sm text-muted-foreground">
                  R$ {data.highest_cost_product.total_cost}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Sem dados</p>
            )}
          </CardContent>
        </Card>
        <Card className="border-2 border-[#005B2E]/20">
          <CardContent className="py-4">
            <h3 className="font-bold text-[#005B2E] mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> Gargalos
            </h3>
            {data.bottlenecks.length > 0 ? (
              <div className="space-y-1">
                {data.bottlenecks.slice(0, 3).map((b, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span>{b.resource_name || '—'}</span>
                    <Badge variant="outline">{b.scheduled_ops} ops</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Sem gargalos</p>
            )}
          </CardContent>
        </Card>
      </div>
      <Card className="border-2 border-[#005B2E]/20">
        <CardContent className="py-4">
          <h3 className="font-bold text-[#005B2E] mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4" /> Ordens Atrasadas
          </h3>
          {data.late_orders.length > 0 ? (
            <div className="space-y-1">
              {data.late_orders.slice(0, 10).map((o, i) => (
                <div key={i} className="flex justify-between text-sm border-b border-border py-1">
                  <span className="font-medium">{o.order_number}</span>
                  <span className="text-red-600">{o.days_late} dia(s) de atraso</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Nenhuma ordem atrasada</p>
          )}
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-2 border-[#005B2E]/20">
          <CardContent className="py-4">
            <h3 className="font-bold text-[#005B2E] mb-2">Fase com Maior Perda</h3>
            {data.highest_loss_phase ? (
              <p className="text-sm">
                {data.highest_loss_phase.operation_name}: {data.highest_loss_phase.total_losses}{' '}
                unidades
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">Sem perdas registradas</p>
            )}
          </CardContent>
        </Card>
        <Card className="border-2 border-[#005B2E]/20">
          <CardContent className="py-4">
            <h3 className="font-bold text-[#005B2E] mb-2">Fase com Mais Retrabalho</h3>
            {data.highest_rework_phase ? (
              <p className="text-sm">
                {data.highest_rework_phase.operation_name}: {data.highest_rework_phase.rework_count}{' '}
                ocorrência(s)
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">Sem retrabalhos</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
