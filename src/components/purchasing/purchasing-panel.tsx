import { useState } from 'react'
import { cn } from '@/lib/utils'
import { PurchaseRequestsPanel } from '@/components/purchasing/purchase-requests-panel'
import { QuotationsPanel } from '@/components/purchasing/quotations-panel'
import { PurchaseOrdersPanel } from '@/components/purchasing/purchase-orders-panel'
import { PurchaseApprovalPanel } from '@/components/purchasing/purchase-approval-panel'
import { PurchaseInvoicesPanel } from '@/components/purchasing/purchase-invoices-panel'
import { PurchaseReturnsPanel } from '@/components/purchasing/purchase-returns-panel'
import { PurchasingDashboard } from '@/components/purchasing/purchasing-dashboard'
import { PurchasingReports } from '@/components/purchasing/purchasing-reports'
import { StockReport } from '@/components/purchasing/stock-report'
import { ShoppingCart } from 'lucide-react'
import { PricingSimulations } from '@/components/pricing/pricing-simulations'

type SubTab =
  | 'requests'
  | 'quotations'
  | 'orders'
  | 'approval'
  | 'invoices'
  | 'returns'
  | 'dashboard'
  | 'reports'
  | 'stock_report'
  | 'simulations'

const SUB_TABS: { id: SubTab; label: string }[] = [
  { id: 'requests', label: 'Solicitações de Compra' },
  { id: 'quotations', label: 'Cotações' },
  { id: 'orders', label: 'Pedidos de Compra' },
  { id: 'approval', label: 'Aprovação de Compras' },
  { id: 'invoices', label: 'Entrada de Notas Fiscais' },
  { id: 'returns', label: 'Devoluções ao Fornecedor' },
  { id: 'dashboard', label: 'Dashboard de Compras' },
  { id: 'reports', label: 'Relatórios' },
  { id: 'stock_report', label: 'Relatório de Estoque' },
  { id: 'simulations', label: 'Simulações de Preços' },
]

export function PurchasingPanel() {
  const [activeTab, setActiveTab] = useState<SubTab>('requests')

  const renderContent = () => {
    switch (activeTab) {
      case 'requests':
        return <PurchaseRequestsPanel />
      case 'quotations':
        return <QuotationsPanel />
      case 'orders':
        return <PurchaseOrdersPanel />
      case 'approval':
        return <PurchaseApprovalPanel />
      case 'invoices':
        return <PurchaseInvoicesPanel />
      case 'returns':
        return <PurchaseReturnsPanel />
      case 'dashboard':
        return <PurchasingDashboard />
      case 'reports':
        return <PurchasingReports />
      case 'stock_report':
        return <StockReport />
      case 'simulations':
        return <PricingSimulations />
      default:
        return <PurchaseRequestsPanel />
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <ShoppingCart className="w-5 h-5 text-[#005B2E]" />
        <h2 className="text-xl font-black text-foreground">Gestão de Compras</h2>
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
