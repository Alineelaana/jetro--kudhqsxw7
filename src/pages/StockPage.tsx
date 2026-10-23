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

import {
  ScreenCentralEstoque,
  ScreenMovimentacoes,
  ScreenInventarioConferencia,
  ScreenLotesValidade,
  ScreenWmsOperacional,
  ScreenWmsGerencial,
} from '@/components/stock/screens'

export default function StockPage({ screen }: { screen: string }) {
  switch (screen) {
    case 'central':
    case 'dashboard':
      return <ScreenCentralEstoque />
    case 'movimentacoes':
    case 'movements':
    case 'transfers':
    case 'ajustes':
    case 'adjustments':
      return <ScreenMovimentacoes />
    case 'inventario':
    case 'inventory':
    case 'conferencia':
    case 'checking':
      return <ScreenInventarioConferencia />
    case 'lotes':
    case 'batches':
    case 'expiry':
    case 'validade':
      return <ScreenLotesValidade />
    case 'wms-operacional':
    case 'locations':
    case 'localizacoes':
    case 'picking':
    case 'separacao':
    case 'expedition':
    case 'expedicao':
    case 'receiving':
    case 'recebimento':
    case 'putaway':
    case 'enderecamento':
    case 'waves':
    case 'ondas':
    case 'replenishment':
    case 'reabastecimento':
      return <ScreenWmsOperacional />
    case 'wms-gerencial':
    case 'wms-managerial':
      return <ScreenWmsGerencial />
    default:
      return <ScreenCentralEstoque />
  }
}
