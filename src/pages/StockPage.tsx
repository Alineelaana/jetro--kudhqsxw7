import { StockPageWrapper } from '@/components/stock/stock-page-wrapper'
import { StockDashboard } from '@/components/stock/stock-dashboard'
import { StockMovements } from '@/components/stock/stock-movements'
import { StockInventory } from '@/components/stock/stock-inventory'
import { StockTransfers } from '@/components/stock/stock-transfers'
import { StockAdjustments } from '@/components/stock/stock-adjustments'
import { StockBatches } from '@/components/stock/stock-batches'
import { StockExpiry } from '@/components/stock/stock-expiry'
import { StockLocations } from '@/components/stock/stock-locations'
import { StockPicking } from '@/components/stock/stock-picking'
import { StockChecking } from '@/components/stock/stock-checking'
import { StockExpedition } from '@/components/stock/stock-expedition'
import { WmsReceiving } from '@/components/stock/wms-receiving'
import { WmsPutaway } from '@/components/stock/wms-putaway'
import { WmsWaves } from '@/components/stock/wms-waves'
import { WmsReplenishment } from '@/components/stock/wms-replenishment'

const TITLES: Record<string, string> = {
  dashboard: 'Dashboard de Estoque',
  movements: 'Movimentações',
  inventory: 'Inventário',
  transfers: 'Transferências',
  adjustments: 'Ajustes de Estoque',
  batches: 'Controle de Lotes',
  expiry: 'Controle de Validade',
  locations: 'Localizações',
  picking: 'Separação',
  checking: 'Conferência',
  expedition: 'Expedição',
  receiving: 'Recebimento WMS',
  putaway: 'Endereçamento',
  waves: 'Ondas de Separação',
  replenishment: 'Reabastecimento',
}

export default function StockPage({ screen }: { screen: string }) {
  const title = TITLES[screen] || 'Estoque'

  const renderScreen = () => {
    switch (screen) {
      case 'dashboard':
        return <StockDashboard />
      case 'movements':
        return <StockMovements />
      case 'inventory':
        return <StockInventory />
      case 'transfers':
        return <StockTransfers />
      case 'adjustments':
        return <StockAdjustments />
      case 'batches':
        return <StockBatches />
      case 'expiry':
        return <StockExpiry />
      case 'locations':
        return <StockLocations />
      case 'picking':
        return <StockPicking />
      case 'checking':
        return <StockChecking />
      case 'expedition':
        return <StockExpedition />
      case 'receiving':
        return <WmsReceiving />
      case 'putaway':
        return <WmsPutaway />
      case 'waves':
        return <WmsWaves />
      case 'replenishment':
        return <WmsReplenishment />
      default:
        return <StockDashboard />
    }
  }

  return <StockPageWrapper title={title}>{renderScreen()}</StockPageWrapper>
}
