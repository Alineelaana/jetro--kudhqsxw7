import { LogisticsLayout } from '@/components/logistics/logistics-layout'
import { LogisticsOrchestrationDashboard } from '@/components/logistics/logistics-orchestration-dashboard'
import { LogisticsPlanning } from '@/components/logistics/logistics-planning'
import { LogisticsTransfers } from '@/components/logistics/logistics-transfers'
import { LogisticsCollections } from '@/components/logistics/logistics-collections'
import { LogisticsExceptions } from '@/components/logistics/logistics-exceptions'
import { LogisticsReverseOrchestration } from '@/components/logistics/logistics-reverse-orchestration'
import { LogisticsIndicators } from '@/components/logistics/logistics-indicators'
import { LogisticsReports } from '@/components/logistics/logistics-reports'
import { WmsRomaneios } from '@/components/stock/wms-romaneios'

const TITLES: Record<string, string> = {
  dashboard: 'Dashboard Logístico',
  orchestration_planning: 'Planejamento Logístico',
  romaneios: 'Romaneios',
  transfers: 'Transferências',
  collections: 'Coletas',
  reverse_logistics: 'Devoluções / Logística Reversa',
  exceptions: 'Central de Exceções Logísticas',
  indicators: 'Indicadores Logísticos',
  reports: 'Relatórios Logísticos',
}

export default function Logistics({ screen }: { screen: string }) {
  const title = TITLES[screen] || 'Logística'

  const renderScreen = () => {
    switch (screen) {
      case 'dashboard':
        return <LogisticsOrchestrationDashboard />
      case 'orchestration_planning':
        return <LogisticsPlanning />
      case 'romaneios':
        return <WmsRomaneios />
      case 'transfers':
        return <LogisticsTransfers />
      case 'collections':
        return <LogisticsCollections />
      case 'reverse_logistics':
        return <LogisticsReverseOrchestration />
      case 'exceptions':
        return <LogisticsExceptions />
      case 'indicators':
        return <LogisticsIndicators />
      case 'reports':
        return <LogisticsReports />
      default:
        return <LogisticsOrchestrationDashboard />
    }
  }

  return <LogisticsLayout title={title}>{renderScreen()}</LogisticsLayout>
}
