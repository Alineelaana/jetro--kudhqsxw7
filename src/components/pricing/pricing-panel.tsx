import { PricingProducts } from '@/components/pricing/pricing-products'
import { PricingSimulations } from '@/components/pricing/pricing-simulations'
import { PricingTables } from '@/components/pricing/pricing-tables'
import { PricingApprovals } from '@/components/pricing/pricing-approvals'
import { PricingDashboard } from '@/components/pricing/pricing-dashboard'
import { PricingIntelligence } from '@/components/pricing/pricing-intelligence'
import { PricingVersions } from '@/components/pricing/pricing-versions'
import { PricingTimeline } from '@/components/pricing/pricing-timeline'
import { PricingVault } from '@/components/pricing/pricing-vault'
import { PricingRiskMonitor } from '@/components/pricing/pricing-risk-monitor'
import { PricingCostComparator } from '@/components/pricing/pricing-cost-comparator'
import { PricingAISuggestions } from '@/components/pricing/pricing-ai-suggestions'
import { Calculator } from 'lucide-react'
import { AdminBackButton } from '@/components/admin-back-button'

export type PricingSubTab =
  | 'products'
  | 'simulations'
  | 'tables'
  | 'approvals'
  | 'dashboard'
  | 'intelligence'
  | 'versions'
  | 'timeline'
  | 'vault'
  | 'risk'
  | 'comparator'
  | 'ai'

const TAB_TITLES: Record<PricingSubTab, string> = {
  products: 'Central de Preços',
  simulations: 'Simulações de Preços',
  tables: 'Tabelas de Preços',
  approvals: 'Aprovações de Preços',
  dashboard: 'Dashboard de Precificação',
  intelligence: 'Inteligência Comercial de Precificação',
  versions: 'Versões de Preços',
  timeline: 'Linha do Tempo de Preços',
  vault: 'Cofre de Preços',
  risk: 'Monitor de Riscos de Precificação',
  comparator: 'Comparador de Custos',
  ai: 'Sugestões IA de Precificação',
}

interface PricingPanelProps {
  activeTab?: PricingSubTab
}

export function PricingPanel({ activeTab = 'products' }: PricingPanelProps) {
  const title = TAB_TITLES[activeTab] || 'Precificação'

  const renderContent = () => {
    switch (activeTab) {
      case 'products':
        return <PricingProducts />
      case 'simulations':
        return <PricingSimulations />
      case 'tables':
        return <PricingTables />
      case 'approvals':
        return <PricingApprovals />
      case 'dashboard':
        return <PricingDashboard />
      case 'intelligence':
        return <PricingIntelligence />
      case 'versions':
        return <PricingVersions />
      case 'timeline':
        return <PricingTimeline />
      case 'vault':
        return <PricingVault />
      case 'risk':
        return <PricingRiskMonitor />
      case 'comparator':
        return <PricingCostComparator />
      case 'ai':
        return <PricingAISuggestions />
      default:
        return <PricingProducts />
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <AdminBackButton fallback="/admin" />
        <Calculator className="w-5 h-5 text-[#005B2E]" />
        <h2 className="text-xl font-black text-foreground">{title}</h2>
      </div>
      {renderContent()}
    </div>
  )
}
