import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Loader2,
  Activity,
  Gauge,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Factory,
  Users,
  Wrench,
  Clock,
  Zap,
  Target,
} from 'lucide-react'
import { getExecutivePanel } from '@/services/industrial-intelligence'
import { getProductionOrders } from '@/services/production-orders'
import { getApontamentos } from '@/services/industrial-extended'
import { useRealtime } from '@/hooks/use-realtime'
import { AnalyzeInBiButton } from '@/components/industry/analyze-in-bi-button'
import type { ExecutivePanelData } from '@/lib/industrial-intelligence-types'

function CockpitCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
  children,
}: {
  icon: any
  label: string
  value: string | number
  sub?: string
  color: string
  children?: React.ReactNode
}) {
  return (
    <Card className="border-2 border-[#005B2E]/15">
      <CardContent className="py-3">
        <div className="flex items-center gap-2 mb-2">
          <Icon className={`w-5 h-5 ${color}`} />
          <span className="text-xs font-bold text-muted-foreground">{label}</span>
        </div>
        <p className="text-2xl font-black text-foreground">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
        {children}
      </CardContent>
    </Card>
  )
}

export function FactoryCockpit() {
  const [panel, setPanel] = useState<ExecutivePanelData | null>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [apontamentos, setApontamentos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      const [p, o, a] = await Promise.all([
        getExecutivePanel(),
        getProductionOrders(),
        getApontamentos(),
      ])
      setPanel(p)
      setOrders(o)
      setApontamentos(a)
    } catch {
      /* ignore */
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])
  useRealtime('production_orders', () => load())
  useRealtime('industrial_apontamentos', () => load())
  useRealtime('industrial_phases', () => load())

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )
  if (!panel)
    return <p className="text-center py-6 text-muted-foreground">Erro ao carregar cockpit.</p>

  const activeOrders = orders.filter(
    (o) =>
      o.status === 'em_producao' ||
      o.status === 'liberada' ||
      o.status === 'setup' ||
      o.status === 'qualidade',
  )
  const todayApont = apontamentos.filter(
    (a) => a.created?.substring(0, 10) === new Date().toISOString().substring(0, 10),
  )
  const totalProducedToday = todayApont
    .filter((a) => a.type === 'producao')
    .reduce((sum, a) => sum + (a.quantity_produced || 0), 0)
  const totalRejectedToday = todayApont
    .filter((a) => a.type === 'refugo' || a.type === 'perda')
    .reduce((sum, a) => sum + (a.quantity_rejected || 0), 0)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Factory className="w-6 h-6 text-[#005B2E]" />
          <div>
            <h2 className="text-xl font-black text-foreground">Cockpit de Fábrica</h2>
            <p className="text-sm text-muted-foreground">Visão operacional em tempo real</p>
          </div>
        </div>
        <AnalyzeInBiButton context={{ module: 'industrial' }} label="Analisar no BI" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <CockpitCard
          icon={Activity}
          label="OPs Ativas"
          value={activeOrders.length}
          sub={`${panel.geral.total_orders} total`}
          color="text-blue-600"
        />
        <CockpitCard
          icon={Zap}
          label="Produzido Hoje"
          value={totalProducedToday}
          sub={`${todayApont.filter((a) => a.type === 'producao').length} apontamentos`}
          color="text-emerald-600"
        />
        <CockpitCard
          icon={TrendingDown}
          label="Refugo/Perda Hoje"
          value={totalRejectedToday}
          color="text-red-600"
        />
        <CockpitCard
          icon={AlertTriangle}
          label="OPs Atrasadas"
          value={panel.geral.late_orders}
          color="text-red-600"
        />
        <CockpitCard
          icon={Gauge}
          label="OEE Estimado"
          value={`${panel.eficiencia.oee_estimate || 0}%`}
          color="text-[#005B2E]"
        />
        <CockpitCard
          icon={Users}
          label="Operadores Ativos"
          value={panel.producao_hoje.active_operators}
          color="text-purple-600"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-2 border-[#005B2E]/20">
          <CardContent className="py-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-[#005B2E] flex items-center gap-2">
                <Wrench className="w-4 h-4" /> Máquinas
              </h3>
              <AnalyzeInBiButton
                context={{ module: 'industrial', resource: 'machines' }}
                label="BI"
              />
            </div>
            <div className="grid grid-cols-4 gap-2 text-center text-sm">
              <div>
                <p className="text-xl font-black text-emerald-600">{panel.maquinas.active}</p>
                <p className="text-xs text-muted-foreground">Ativas</p>
              </div>
              <div>
                <p className="text-xl font-black text-gray-500">{panel.maquinas.idle}</p>
                <p className="text-xs text-muted-foreground">Ociosas</p>
              </div>
              <div>
                <p className="text-xl font-black text-red-600">{panel.maquinas.overloaded}</p>
                <p className="text-xs text-muted-foreground">Sobrecarga</p>
              </div>
              <div>
                <p className="text-xl font-black text-amber-600">
                  {panel.maquinas.maintenance || 0}
                </p>
                <p className="text-xs text-muted-foreground">Manut.</p>
              </div>
            </div>
            {panel.maquinas.list?.length > 0 && (
              <div className="mt-3 space-y-1">
                {panel.maquinas.list.slice(0, 5).map((m, i) => (
                  <div key={i} className="flex justify-between text-xs border-b border-border py-1">
                    <span className="font-medium">{m.name}</span>
                    <Badge
                      className={
                        m.status === 'active'
                          ? 'bg-emerald-100 text-emerald-700'
                          : m.status === 'overloaded'
                            ? 'bg-red-100 text-red-700'
                            : m.status === 'maintenance'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-gray-100 text-gray-600'
                      }
                    >
                      {m.status} ({m.load})
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-2 border-[#005B2E]/20">
          <CardContent className="py-4">
            <h3 className="font-bold text-[#005B2E] flex items-center gap-2 mb-3">
              <Target className="w-4 h-4" /> Gargalos
            </h3>
            {panel.gargalos.length > 0 ? (
              <div className="space-y-1">
                {panel.gargalos.slice(0, 5).map((g, i) => (
                  <div key={i} className="flex justify-between text-sm border-b border-border py-1">
                    <span>{g.resource_name || '—'}</span>
                    <Badge variant="outline" className="text-xs">
                      {g.scheduled_ops} ops
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Sem gargalos detectados</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-2 border-[#005B2E]/20">
          <CardContent className="py-4">
            <h3 className="font-bold text-[#005B2E] flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4" /> Ordens Críticas
            </h3>
            {panel.ordens_criticas.length > 0 ? (
              <div className="space-y-1">
                {panel.ordens_criticas.slice(0, 5).map((o, i) => (
                  <div key={i} className="flex justify-between text-xs border-b border-border py-1">
                    <span className="font-medium">{o.order_number}</span>
                    <span className={o.days_late > 0 ? 'text-red-600 font-bold' : 'text-amber-600'}>
                      {o.days_late > 0 ? `${o.days_late}d atraso` : 'Em risco'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Sem ordens críticas</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-2 border-[#005B2E]/20">
          <CardContent className="py-4">
            <h3 className="font-bold text-[#005B2E] flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4" /> Eficiência
            </h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Produtividade média</span>
                <span className="font-bold">{panel.eficiencia.avg_productivity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Melhor operador</span>
                <span className="font-medium">{panel.eficiencia.best_operator || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Melhor equipe</span>
                <span className="font-medium">{panel.eficiencia.best_team || '—'}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-2 border-[#005B2E]/20">
          <CardContent className="py-4">
            <h3 className="font-bold text-[#005B2E] flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4" /> Qualidade
            </h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Inspeções pendentes</span>
                <span className="font-bold text-amber-600">
                  {panel.qualidade.pending_inspections}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Retrabalhos</span>
                <span className="font-bold text-red-600">{panel.qualidade.rework_count}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Taxa de rejeição</span>
                <span className="font-bold">{panel.qualidade.rejection_rate}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-2 border-[#005B2E]/20">
          <CardContent className="py-4">
            <h3 className="font-bold text-[#005B2E] flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4" /> Entregas
            </h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">No prazo</span>
                <span className="font-bold text-emerald-600">{panel.entregas.on_time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Atrasadas</span>
                <span className="font-bold text-red-600">{panel.entregas.delayed}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Em risco</span>
                <span className="font-bold text-amber-600">{panel.entregas.at_risk}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {panel.alertas && panel.alertas.length > 0 && (
        <Card className="border-2 border-red-200 bg-red-50/30">
          <CardContent className="py-4">
            <h3 className="font-bold text-red-700 flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4" /> Alertas Ativos ({panel.alertas.length})
            </h3>
            <div className="space-y-1">
              {panel.alertas.slice(0, 5).map((a, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span>{a.title}</span>
                  <Badge
                    className={
                      a.severity === 'critical'
                        ? 'bg-red-100 text-red-700'
                        : a.severity === 'warning'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-blue-100 text-blue-700'
                    }
                  >
                    {a.severity}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
