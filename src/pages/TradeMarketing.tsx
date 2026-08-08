import { useState, useEffect } from 'react'
import { TmLayout } from '@/components/trade-marketing/tm-layout'
import { TmDashboard } from '@/components/trade-marketing/tm-dashboard'
import { TmCalendar } from '@/components/trade-marketing/tm-calendar'
import { TmMaterials } from '@/components/trade-marketing/tm-materials'
import { TmAccountability } from '@/components/trade-marketing/tm-accountability'
import { TmAdapta } from '@/components/trade-marketing/tm-adapta'
import { TmVerbasFornecedor } from '@/components/trade-marketing/tm-verbas-fornecedor'
import { MkExternalQuotationsPanel } from '@/components/trade-marketing/mk-eq-panel'
import type { TmFilters, TradeMarketingAction } from '@/lib/trade-marketing-types'
import pb from '@/lib/pocketbase/client'

const DEFAULT_FILTERS: TmFilters = {
  scope: 'corporate',
  tipo: '',
  status: '',
  priority: '',
  supplier: '',
  campaign: '',
  startDate: '',
  endDate: '',
}

interface TradeMarketingProps {
  screen?: string
}

export default function TradeMarketing({ screen = 'dashboard' }: TradeMarketingProps) {
  const [activeTab, setActiveTab] = useState('cockpit')
  const [filters, setFilters] = useState<TmFilters>(DEFAULT_FILTERS)
  const [actions, setActions] = useState<TradeMarketingAction[]>([])

  useEffect(() => {
    pb.collection('trade_marketing_actions')
      .getFullList({ sort: '-created' })
      .then((data) => setActions(data as TradeMarketingAction[]))
      .catch(() => setActions([]))
  }, [])

  const handleNew = () => {
    // Placeholder for new action creation flow
  }

  const handlePrint = () => {
    window.print()
  }

  const renderScreen = () => {
    switch (screen) {
      case 'dashboard':
        return <TmDashboard actions={actions} />
      case 'calendar':
        return <TmCalendar />
      case 'actions':
        return <TmDashboard actions={actions} />
      case 'verbas':
        return <TmVerbasFornecedor />
      case 'materials':
        return <TmMaterials />
      case 'accountability':
        return <TmAccountability />
      case 'annual-plan':
        return <TmDashboard actions={actions} />
      case 'adapta':
        return <TmAdapta />
      case 'cotacoes-externas':
        return <MkExternalQuotationsPanel />
      default:
        return <TmDashboard actions={actions} />
    }
  }

  return (
    <TmLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onNew={handleNew}
      onPrint={handlePrint}
      filters={filters}
      onFiltersChange={setFilters}
    >
      {renderScreen()}
    </TmLayout>
  )
}
