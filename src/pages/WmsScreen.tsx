import type { ComponentType } from 'react'
import { StockPageWrapper } from '@/components/stock/stock-page-wrapper'
import { WmsAlertsCenter } from '@/components/stock/wms-alerts-center'
import { WmsReports } from '@/components/stock/wms-reports'
import { WmsPallets } from '@/components/stock/wms-pallets'
import { WmsVolumes } from '@/components/stock/wms-volumes'
import { WmsCollectors } from '@/components/stock/wms-collectors'
import { WmsOperators } from '@/components/stock/wms-operators'
import { WmsManagerialDashboard } from '@/components/stock/wms-managerial-dashboard'

const SCREENS: Record<string, { title: string; component: ComponentType }> = {
  'wms-alerts': { title: 'Alertas Operacionais', component: WmsAlertsCenter },
  'wms-reports': { title: 'Relatórios WMS', component: WmsReports },
  'wms-pallets': { title: 'Gestão de Pallets', component: WmsPallets },
  'wms-volumes': { title: 'Gestão de Volumes', component: WmsVolumes },
  'wms-collectors': { title: 'Gestão de Coletores', component: WmsCollectors },
  'wms-operators': { title: 'Gestão de Operadores', component: WmsOperators },
  'wms-managerial': { title: 'Dashboard Gerencial WMS', component: WmsManagerialDashboard },
}

export default function WmsScreen({ screen }: { screen: string }) {
  const config = SCREENS[screen] || SCREENS['wms-alerts']
  const Comp = config.component
  return (
    <StockPageWrapper title={config.title}>
      <Comp />
    </StockPageWrapper>
  )
}
