import { useState } from 'react'
import { LogisticsLayout } from '@/components/logistics/logistics-layout'
import { LogisticsDashboard } from '@/components/logistics/logistics-dashboard'
import { LogisticsRoutes } from '@/components/logistics/logistics-routes'
import { LogisticsDeliveries } from '@/components/logistics/logistics-deliveries'
import { LogisticsVehicles } from '@/components/logistics/logistics-vehicles'
import { LogisticsDrivers } from '@/components/logistics/logistics-drivers'
import { LogisticsFreights } from '@/components/logistics/logistics-freights'
import { LogisticsFreightTables } from '@/components/logistics/logistics-freight-tables'
import { LogisticsTracking } from '@/components/logistics/logistics-tracking'
import { LogisticsOccurrences } from '@/components/logistics/logistics-occurrences'
import { LogisticsProofDelivery } from '@/components/logistics/logistics-proof-delivery'
import { LogisticsCosts } from '@/components/logistics/logistics-costs'
import { LogisticsReports } from '@/components/logistics/logistics-reports'
import { LogisticsRoutePlanning } from '@/components/logistics/logistics-route-planning'
import { LogisticsIndicators } from '@/components/logistics/logistics-indicators'
import { LogisticsReverseLogistics } from '@/components/logistics/logistics-reverse-logistics'
import { LogisticsDriverApp } from '@/components/logistics/logistics-driver-app'
import { WmsRomaneios } from '@/components/stock/wms-romaneios'

const TITLES: Record<string, string> = {
  dashboard: 'Dashboard Logístico',
  routes: 'Rotas',
  deliveries: 'Entregas',
  vehicles: 'Veículos',
  drivers: 'Motoristas',
  romaneios: 'Romaneios',
  freights: 'Fretes',
  freight_tables: 'Tabelas de Frete',
  tracking: 'Rastreamento',
  occurrences: 'Ocorrências',
  proof: 'Comprovantes de Entrega',
  costs: 'Custos Logísticos',
  reports: 'Relatórios Logísticos',
  route_planning: 'Planejamento de Rotas',
  indicators: 'Indicadores de Desempenho',
  reverse_logistics: 'Logística Reversa',
  driver_app: 'Aplicativo do Motorista',
}

export default function Logistics({ screen }: { screen: string }) {
  const title = TITLES[screen] || 'Logística'

  const renderScreen = () => {
    switch (screen) {
      case 'dashboard':
        return <LogisticsDashboard />
      case 'routes':
        return <LogisticsRoutes />
      case 'deliveries':
        return <LogisticsDeliveries />
      case 'vehicles':
        return <LogisticsVehicles />
      case 'drivers':
        return <LogisticsDrivers />
      case 'romaneios':
        return <WmsRomaneios />
      case 'freights':
        return <LogisticsFreights />
      case 'freight_tables':
        return <LogisticsFreightTables />
      case 'tracking':
        return <LogisticsTracking />
      case 'occurrences':
        return <LogisticsOccurrences />
      case 'proof':
        return <LogisticsProofDelivery />
      case 'costs':
        return <LogisticsCosts />
      case 'reports':
        return <LogisticsReports />
      case 'route_planning':
        return <LogisticsRoutePlanning />
      case 'indicators':
        return <LogisticsIndicators />
      case 'reverse_logistics':
        return <LogisticsReverseLogistics />
      case 'driver_app':
        return <LogisticsDriverApp />
      default:
        return <LogisticsDashboard />
    }
  }

  return <LogisticsLayout title={title}>{renderScreen()}</LogisticsLayout>
}
