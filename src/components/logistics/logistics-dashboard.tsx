import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import {
  getDeliveries,
  getVehicles,
  getDrivers,
  getFreights,
  getOccurrences,
} from '@/services/logistics'
import { useRealtime } from '@/hooks/use-realtime'
import {
  Package,
  Truck,
  User,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  Activity,
  MapPin,
} from 'lucide-react'

interface KpiData {
  programmed: number
  inTransit: number
  delivered: number
  delayed: number
  withOccurrence: number
  vehiclesInOp: number
  vehiclesAvailable: number
  driversOnRoute: number
  totalFreightCost: number
  avgCostPerDelivery: number
  onTimeRate: number
  returns: number
}

export function LogisticsDashboard() {
  const [kpi, setKpi] = useState<KpiData | null>(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      const [deliveries, vehicles, drivers, freights, occurrences] = await Promise.all([
        getDeliveries().catch(() => []),
        getVehicles().catch(() => []),
        getDrivers().catch(() => []),
        getFreights().catch(() => []),
        getOccurrences().catch(() => []),
      ])
      const today = new Date().toISOString().split('T')[0]
      const programmed = deliveries.filter(
        (d) => d.data_prevista?.startsWith(today) || d.status === 'Programada',
      ).length
      const inTransit = deliveries.filter((d) =>
        ['Em Trânsito', 'Saiu para Entrega'].includes(d.status),
      ).length
      const delivered = deliveries.filter((d) => d.status === 'Entregue').length
      const delayed = deliveries.filter((d) => {
        if (['Entregue', 'Cancelada'].includes(d.status)) return false
        return d.data_prevista && d.data_prevista < today
      }).length
      const withOccurrence = occurrences.filter(
        (o: any) => o.situacao === 'Aberta' || o.situacao === 'Em Análise',
      ).length
      const vehiclesInOp = vehicles.filter((v) => v.situacao === 'Em Rota').length
      const vehiclesAvailable = vehicles.filter((v) => v.situacao === 'Disponível').length
      const driversOnRoute = drivers.filter((d) => d.situacao === 'Em Rota').length
      const totalFreightCost = (freights as any[]).reduce(
        (sum: number, f: any) => sum + parseFloat(f.valor_total || '0'),
        0,
      )
      const deliveredCount = Math.max(delivered, 1)
      const returns = deliveries.filter((d) => d.status === 'Devolvida').length
      const onTime =
        delivered > 0 ? Math.round((delivered / Math.max(delivered + delayed, 1)) * 100) : 0
      setKpi({
        programmed,
        inTransit,
        delivered,
        delayed,
        withOccurrence,
        vehiclesInOp,
        vehiclesAvailable,
        driversOnRoute,
        totalFreightCost,
        avgCostPerDelivery: totalFreightCost / deliveredCount,
        onTimeRate: onTime,
        returns,
      })
    } catch {
      setKpi(null)
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])
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
    { label: 'Entregas Programadas', value: kpi.programmed, icon: Package, color: 'text-blue-600' },
    { label: 'Em Trânsito', value: kpi.inTransit, icon: MapPin, color: 'text-cyan-600' },
    { label: 'Entregues', value: kpi.delivered, icon: CheckCircle, color: 'text-emerald-600' },
    { label: 'Atrasadas', value: kpi.delayed, icon: Clock, color: 'text-red-600' },
    {
      label: 'Com Ocorrência',
      value: kpi.withOccurrence,
      icon: AlertTriangle,
      color: 'text-orange-600',
    },
    {
      label: 'Veículos em Operação',
      value: kpi.vehiclesInOp,
      icon: Truck,
      color: 'text-indigo-600',
    },
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
      label: '% no Prazo',
      value: `${kpi.onTimeRate}%`,
      icon: CheckCircle,
      color: 'text-emerald-700',
    },
    { label: 'Devoluções', value: kpi.returns, icon: XCircle, color: 'text-red-700' },
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
