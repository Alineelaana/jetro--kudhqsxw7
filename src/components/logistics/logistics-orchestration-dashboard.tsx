import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { getConsolidatedDashboard } from '@/services/logistics-orchestration'
import { useRealtime } from '@/hooks/use-realtime'
import {
  PackageCheck,
  ClipboardList,
  Truck,
  CheckCircle,
  Clock,
  AlertTriangle,
  Activity,
  DollarSign,
  Container,
  Boxes,
} from 'lucide-react'

interface KpiData {
  pendingReceipts: number
  pendingSeparations: number
  pendingExpedition: number
  inTransitDeliveries: number
  deliveredToday: number
  delayedDeliveries: number
  activeOccurrences: number
  wmsAlertsCount: number
  activeJourneys: number
  totalCost: number
  vehiclesAvailable: number
  vehiclesInOp: number
}

export function LogisticsOrchestrationDashboard() {
  const [kpi, setKpi] = useState<KpiData | null>(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      setKpi((await getConsolidatedDashboard()) as KpiData)
    } catch {
      setKpi(null)
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])
  useRealtime('wms_receipts', () => load())
  useRealtime('wms_separations', () => load())
  useRealtime('wms_shippings', () => load())
  useRealtime('logistics_deliveries', () => load())
  useRealtime('transport_journeys', () => load())
  useRealtime('logistics_occurrences', () => load())
  useRealtime('wms_operational_alerts', () => load())

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
      label: 'Recebimentos Pendentes',
      value: kpi.pendingReceipts,
      icon: PackageCheck,
      color: 'text-amber-600',
    },
    {
      label: 'Separações Pendentes',
      value: kpi.pendingSeparations,
      icon: ClipboardList,
      color: 'text-purple-600',
    },
    {
      label: 'Aguardando Expedição',
      value: kpi.pendingExpedition,
      icon: Boxes,
      color: 'text-indigo-600',
    },
    { label: 'Viagens Ativas', value: kpi.activeJourneys, icon: Container, color: 'text-blue-600' },
    { label: 'Em Trânsito', value: kpi.inTransitDeliveries, icon: Truck, color: 'text-cyan-600' },
    {
      label: 'Entregues Hoje',
      value: kpi.deliveredToday,
      icon: CheckCircle,
      color: 'text-emerald-600',
    },
    {
      label: 'Entregas Atrasadas',
      value: kpi.delayedDeliveries,
      icon: Clock,
      color: 'text-red-600',
    },
    {
      label: 'Ocorrências Ativas',
      value: kpi.activeOccurrences,
      icon: AlertTriangle,
      color: 'text-orange-600',
    },
    { label: 'Alertas WMS', value: kpi.wmsAlertsCount, icon: AlertTriangle, color: 'text-red-700' },
    {
      label: 'Custo Total Logístico',
      value: fmtCurrency(kpi.totalCost),
      icon: DollarSign,
      color: 'text-amber-700',
    },
    {
      label: 'Veículos Disponíveis',
      value: kpi.vehiclesAvailable,
      icon: Truck,
      color: 'text-[#005B2E]',
    },
    { label: 'Veículos em Operação', value: kpi.vehiclesInOp, icon: Truck, color: 'text-blue-700' },
  ]

  return (
    <div className="space-y-4">
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
    </div>
  )
}
