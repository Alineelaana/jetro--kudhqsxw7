import { useState } from 'react'
import { cn } from '@/lib/utils'
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

type SubTab =
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

const SUB_TABS: { id: SubTab; label: string }[] = [
  { id: 'products', label: 'Central de Preços' },
  { id: 'simulations', label: 'Simulações' },
  { id: 'tables', label: 'Tabelas de Preços' },
  { id: 'approvals', label: 'Aprovações' },
  { id: 'versions', label: 'Versões' },
  { id: 'timeline', label: 'Linha do Tempo' },
  { id: 'vault', label: 'Cofre de Preços' },
  { id: 'risk', label: 'Monitor de Riscos' },
  { id: 'comparator', label: 'Comparador de Custos' },
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'intelligence', label: 'Inteligência Comercial' },
  { id: 'ai', label: 'Sugestões IA' },
]

export function PricingPanel() {
  const [activeTab, setActiveTab] = useState<SubTab>('products')

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
        <h2 className="text-xl font-black text-foreground">Precificação</h2>
      </div>
      <div className="flex flex-wrap gap-2">
        {SUB_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
              activeTab === tab.id
                ? 'bg-[#005B2E] text-white'
                : 'bg-muted text-muted-foreground hover:bg-muted/80',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {renderContent()}
    </div>
  )
}
