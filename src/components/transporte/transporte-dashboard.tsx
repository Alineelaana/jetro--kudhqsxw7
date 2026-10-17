import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import {
  getDeliveries,
  getVehicles,
  getDrivers,
  getFreights,
  getOccurrences,
  getTracking,
} from '@/services/logistics'
import { getJourneys } from '@/services/transport-journeys'
import { useRealtime } from '@/hooks/use-realtime'
import {
  Container,
  Truck,
  User,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  Activity,
  Route,
  Package,
  Navigation,
} from 'lucide-react'

interface KpiData {
  activeJourneys: number
  inTransit: number
  delivered: number
  delayed: number
  withOccurrence: number
  vehiclesInOp: number
  vehiclesAvailable: number
  driversOnRoute: number
  totalFreightCost: number
  avgCostPerDelivery: number
  routesActive: number
  onTimeRate: number
  cargasFormacao: number
  rastreamentoAtivo: number
}

export function TransporteDashboard() {
  const [kpi, setKpi] = useState<KpiData | null>(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      const [journeys, deliveries, vehicles, drivers, freights, occurrences, tracking] =
        await Promise.all([
          getJourneys().catch(() => []),
          getDeliveries().catch(() => []),
          getVehicles().catch(() => []),
          getDrivers().catch(() => []),
          getFreights().catch(() => []),
          getOccurrences().catch(() => []),
          getTracking().catch(() => []),
        ])
      const today = new Date().toISOString().split('T')[0]
      setKpi({
        activeJourneys: journeys.filter((j) => !['Finalizada', 'Cancelada'].includes(j.status))
          .length,
        inTransit: deliveries.filter((d) => ['Em Trânsito', 'Saiu para Entrega'].includes(d.status))
          .length,
        delivered: deliveries.filter((d) => d.status === 'Entregue').length,
        delayed: deliveries.filter((d) => {
          if (['Entregue', 'Cancelada'].includes(d.status)) return false
          return d.data_prevista && d.data_prevista < today
        }).length,
        withOccurrence: occurrences.filter((o) => ['Aberta', 'Em Análise'].includes(o.situacao))
          .length,
        vehiclesInOp: vehicles.filter((v) => v.situacao === 'Em Rota').length,
        vehiclesAvailable: vehicles.filter((v) => v.situacao === 'Disponível').length,
        driversOnRoute: drivers.filter((d) => d.situacao === 'Em Rota').length,
        totalFreightCost: freights.reduce<number>(
          (sum, f) => sum + (parseFloat(f.valor_total || '0') || 0),
          0,
        ),
        avgCostPerDelivery:
          freights.reduce<number>((sum, f) => sum + (parseFloat(f.valor_total || '0') || 0), 0) /
          Math.max(deliveries.length, 1),
        routesActive: 0,
        onTimeRate:
          deliveries.length > 0
            ? Math.round(
                (deliveries.filter((d) => d.status === 'Entregue').length /
                  Math.max(deliveries.length, 1)) *
                  100,
              )
            : 0,
        cargasFormacao: journeys.filter((j) =>
          ['Planejada', 'Aguardando Carregamento', 'Em Carregamento'].includes(j.status),
        ).length,
        rastreamentoAtivo: tracking.filter((t) =>
          ['Em Trânsito', 'Saiu para Entrega'].includes(String(t.status || '')),
        ).length,
      })
    } catch {
      setKpi(null)
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])
  useRealtime('transport_journeys', () => load())
  useRealtime('logistics_deliveries', () => load())
  useRealtime('logistics_vehicles', () => load())
  useRealtime('logistics_occurrences', () => load())

  if (loading || !kpi)
    return (
      <div className="flex justify-center py-12">
        <Activity className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )

  const fmtCurrency = (v: number) =>
    v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  const cards = [
    {
      label: 'Viagens Ativas',
      value: kpi.activeJourneys,
      icon: Container,
      color: 'text-indigo-600',
    },
    {
      label: 'Cargas em Formação',
      value: kpi.cargasFormacao,
      icon: Package,
      color: 'text-purple-600',
    },
    { label: 'Em Trânsito', value: kpi.inTransit, icon: MapPin, color: 'text-cyan-600' },
    {
      label: 'Rastreamento Ativo',
      value: kpi.rastreamentoAtivo,
      icon: Navigation,
      color: 'text-teal-600',
    },
    { label: 'Entregues', value: kpi.delivered, icon: CheckCircle, color: 'text-emerald-600' },
    { label: 'Atrasadas', value: kpi.delayed, icon: Clock, color: 'text-red-600' },
    {
      label: 'Com Ocorrência',
      value: kpi.withOccurrence,
      icon: AlertTriangle,
      color: 'text-orange-600',
    },
    { label: 'Veículos em Operação', value: kpi.vehiclesInOp, icon: Truck, color: 'text-blue-600' },
    {
      label: 'Veículos Disponíveis',
      value: kpi.vehiclesAvailable,
      icon: Truck,
      color: 'text-[#005B2E]',
    },
    {
      label: 'Motoristas em Rota',
      value: kpi.driversOnRoute,
      icon: User,
      color: 'text-purple-600',
    },
    {
      label: 'Custo Total Fretes',
      value: fmtCurrency(kpi.totalFreightCost),
      icon: DollarSign,
      color: 'text-amber-600',
    },
    {
      label: 'Custo Médio/Entrega',
      value: fmtCurrency(kpi.avgCostPerDelivery),
      icon: DollarSign,
      color: 'text-amber-700',
    },
    {
      label: '% no Prazo (OTIF)',
      value: `${kpi.onTimeRate}%`,
      icon: CheckCircle,
      color: 'text-emerald-700',
    },
    { label: 'Rotas Ativas', value: kpi.routesActive, icon: Route, color: 'text-teal-600' },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {cards.map((c) => (
        <Card
          key={c.label}
          className="border-2 border-[#005B2E]/20 shadow-md hover:shadow-lg transition-shadow"
        >
          <CardContent className="flex items-center gap-4 p-4">
            <div className="w-12 h-12 rounded-lg bg-[#005B2E]/10 flex items-center justify-center shrink-0">
              <c.icon className={`w-6 h-6 ${c.color}`} />
            </div>
            <div>
              <p className="text-xl font-black text-foreground">{c.value}</p>
              <p className="text-xs text-muted-foreground font-medium">{c.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
