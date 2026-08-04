import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import {
  getWmsReceipts,
  getWmsPutawayTasks,
  getWmsSeparations,
  getWmsExpeditionChecks,
  getWmsShippings,
  getWmsOperationalAlerts,
} from '@/services/wms'
import { getStockLocations, getStockInventories } from '@/services/stock'
import { useRealtime } from '@/hooks/use-realtime'
import {
  PackageCheck,
  Forklift,
  ClipboardList,
  Truck,
  AlertTriangle,
  Warehouse,
  Boxes,
  Activity,
} from 'lucide-react'

interface KpiData {
  receiptPending: number
  putawayPending: number
  separationWaiting: number
  expeditionCheckWaiting: number
  shippingWaiting: number
  divergences: number
  inventoryActive: number
  alerts: number
  locations: number
}

export function WmsDashboard() {
  const [kpi, setKpi] = useState<KpiData | null>(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      const [receipts, putaway, seps, expChecks, ships, alerts, locations, invs] =
        await Promise.all([
          getWmsReceipts().catch(() => []),
          getWmsPutawayTasks().catch(() => []),
          getWmsSeparations().catch(() => []),
          getWmsExpeditionChecks().catch(() => []),
          getWmsShippings().catch(() => []),
          getWmsOperationalAlerts().catch(() => []),
          getStockLocations().catch(() => []),
          getStockInventories().catch(() => []),
        ])
      setKpi({
        receiptPending: receipts.filter((r: any) => r.status === 'Pendente').length,
        putawayPending: putaway.filter((r: any) => r.status === 'Pendente').length,
        separationWaiting: seps.filter((r: any) => r.status === 'Aguardando Separação').length,
        expeditionCheckWaiting: expChecks.filter((r: any) => r.status === 'Aguardando Conferência')
          .length,
        shippingWaiting: ships.filter((r: any) => r.status === 'Aguardando Expedição').length,
        divergences: [...expChecks, ...(receipts as any[])].filter(
          (r: any) => r.status === 'Com Divergência',
        ).length,
        inventoryActive: invs.filter((r: any) => !['Finalizado', 'Cancelado'].includes(r.status))
          .length,
        alerts: alerts.filter((r: any) => !r.resolved).length,
        locations: locations.length,
      })
    } catch {
      setKpi(null)
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])
  useRealtime('wms_receipts', () => load())
  useRealtime('wms_putaway_tasks', () => load())
  useRealtime('wms_separations', () => load())
  useRealtime('wms_shippings', () => load())
  useRealtime('wms_operational_alerts', () => load())

  if (loading || !kpi)
    return (
      <div className="flex justify-center py-12">
        <Activity className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )

  const cards = [
    {
      label: 'Recebimentos Aguardando',
      value: kpi.receiptPending,
      icon: PackageCheck,
      color: 'text-amber-600',
    },
    {
      label: 'Aguardando Endereçamento',
      value: kpi.putawayPending,
      icon: Forklift,
      color: 'text-blue-600',
    },
    {
      label: 'Separações Pendentes',
      value: kpi.separationWaiting,
      icon: ClipboardList,
      color: 'text-purple-600',
    },
    {
      label: 'Conf. de Expedição',
      value: kpi.expeditionCheckWaiting,
      icon: ClipboardList,
      color: 'text-cyan-600',
    },
    {
      label: 'Aguardando Expedição',
      value: kpi.shippingWaiting,
      icon: Truck,
      color: 'text-indigo-600',
    },
    { label: 'Divergências', value: kpi.divergences, icon: AlertTriangle, color: 'text-red-600' },
    {
      label: 'Inventários Ativos',
      value: kpi.inventoryActive,
      icon: Boxes,
      color: 'text-emerald-600',
    },
    { label: 'Alertas Ativos', value: kpi.alerts, icon: AlertTriangle, color: 'text-orange-600' },
    { label: 'Localizações', value: kpi.locations, icon: Warehouse, color: 'text-[#005B2E]' },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
              <p className="text-2xl font-black text-foreground">{c.value}</p>
              <p className="text-xs text-muted-foreground font-medium">{c.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
