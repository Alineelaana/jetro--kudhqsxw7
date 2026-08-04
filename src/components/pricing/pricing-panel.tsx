import { useState } from 'react'
import { cn } from '@/lib/utils'
import { PricingProducts } from '@/components/pricing/pricing-products'
import { PricingSimulations } from '@/components/pricing/pricing-simulations'
import { PricingTables } from '@/components/pricing/pricing-tables'
import { PricingApprovals } from '@/components/pricing/pricing-approvals'
import { PricingDashboard } from '@/components/pricing/pricing-dashboard'
import { PricingIntelligence } from '@/components/pricing/pricing-intelligence'
import { Calculator } from 'lucide-react'

type SubTab = 'products' | 'simulations' | 'tables' | 'approvals' | 'dashboard' | 'intelligence'

const SUB_TABS: { id: SubTab; label: string }[] = [
  { id: 'products', label: 'Precificação de Produtos' },
  { id: 'simulations', label: 'Simulações' },
  { id: 'tables', label: 'Tabelas de Preços' },
  { id: 'approvals', label: 'Aprovações' },
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'intelligence', label: 'Inteligência Comercial' },
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
      default:
        return <PricingProducts />
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
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
