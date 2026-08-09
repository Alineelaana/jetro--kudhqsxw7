import { TransporteLayout } from '@/components/transporte/transporte-layout'
import { TransporteDashboard } from '@/components/transporte/transporte-dashboard'
import { TransporteLoadBuilding } from '@/components/transporte/transporte-load-building'
import { TransporteRouting } from '@/components/transporte/transporte-routing'
import { TransporteJourneys } from '@/components/transporte/transporte-journeys'
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
import { LogisticsDriverApp } from '@/components/logistics/logistics-driver-app'
import { LogisticsReports } from '@/components/logistics/logistics-reports'
import { WmsRomaneios } from '@/components/stock/wms-romaneios'

const TITLES: Record<string, string> = {
  dashboard: 'Dashboard Transporte',
  load_building: 'Formação de Cargas',
  routing: 'Roteirização',
  journeys: 'Viagens',
  routes: 'Rotas',
  deliveries: 'Entregas',
  vehicles: 'Veículos',
  drivers: 'Motoristas',
  romaneios: 'Romaneios',
  freights: 'Fretes',
  freight_tables: 'Tabelas de Frete',
  tracking: 'Rastreamento',
  occurrences: 'Ocorrências de Transporte',
  proof: 'Comprovantes de Entrega',
  costs: 'Custos de Transporte',
  driver_app: 'Aplicativo do Motorista',
  reports: 'Relatórios de Transporte',
}

export default function Transporte({ screen }: { screen: string }) {
  const title = TITLES[screen] || 'Transporte'

  const renderScreen = () => {
    switch (screen) {
      case 'dashboard':
        return <TransporteDashboard />
      case 'load_building':
        return <TransporteLoadBuilding />
      case 'routing':
        return <TransporteRouting />
      case 'journeys':
        return <TransporteJourneys />
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
      case 'driver_app':
        return <LogisticsDriverApp />
      case 'reports':
        return <LogisticsReports />
      default:
        return <TransporteDashboard />
    }
  }

  return <TransporteLayout title={title}>{renderScreen()}</TransporteLayout>
}
