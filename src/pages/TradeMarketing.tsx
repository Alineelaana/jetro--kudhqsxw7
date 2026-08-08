import { TmLayout } from '@/components/trade-marketing/tm-layout'
import { TmDashboard } from '@/components/trade-marketing/tm-dashboard'
import { TmCalendar } from '@/components/trade-marketing/tm-calendar'
import { TmMaterials } from '@/components/trade-marketing/tm-materials'
import { TmAccountability } from '@/components/trade-marketing/tm-accountability'
import { TmAdapta } from '@/components/trade-marketing/tm-adapta'
import { TmVerbasFornecedor } from '@/components/trade-marketing/tm-verbas-fornecedor'
import { MkExternalQuotationsPanel } from '@/components/trade-marketing/mk-eq-panel'

interface TradeMarketingProps {
  screen?: string
}

export default function TradeMarketing({ screen = 'dashboard' }: TradeMarketingProps) {
  const renderScreen = () => {
    switch (screen) {
      case 'dashboard':
        return <TmDashboard />
      case 'calendar':
        return <TmCalendar />
      case 'actions':
        return <TmDashboard />
      case 'verbas':
        return <TmVerbasFornecedor />
      case 'materials':
        return <TmMaterials />
      case 'accountability':
        return <TmAccountability />
      case 'annual-plan':
        return <TmDashboard />
      case 'adapta':
        return <TmAdapta />
      case 'cotacoes-externas':
        return <MkExternalQuotationsPanel />
      default:
        return <TmDashboard />
    }
  }

  return <TmLayout>{renderScreen()}</TmLayout>
}
