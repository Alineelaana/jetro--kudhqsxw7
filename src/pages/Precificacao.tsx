import { useParams } from 'react-router-dom'
import { PricingPanel, type PricingSubTab } from '@/components/pricing/pricing-panel'

const ROUTE_TO_TAB: Record<string, PricingSubTab> = {
  aprovacoes: 'approvals',
  produtos: 'products',
  cofre: 'vault',
  comparador: 'comparator',
  dashboard: 'dashboard',
  inteligencia: 'intelligence',
  'linha-tempo': 'timeline',
  riscos: 'risk',
  simulacoes: 'simulations',
  'sugestoes-ia': 'ai',
  tabelas: 'tables',
  versoes: 'versions',
}

interface PrecificacaoProps {
  screen?: string
}

export default function Precificacao({ screen }: PrecificacaoProps) {
  const params = useParams<{ screen?: string }>()
  const resolvedScreen = screen || params.screen || 'produtos'
  const activeTab: PricingSubTab = ROUTE_TO_TAB[resolvedScreen] || 'products'

  return (
    <div className="p-4 sm:p-6">
      <PricingPanel activeTab={activeTab} />
    </div>
  )
}
