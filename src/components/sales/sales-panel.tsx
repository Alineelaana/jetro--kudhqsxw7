import { useState } from 'react'
import { cn } from '@/lib/utils'
import { SalesDashboard } from '@/components/sales/sales-dashboard'
import { SalesOrdersPanel } from '@/components/sales/sales-orders-panel'
import { InvoicingPanel } from '@/components/sales/invoicing-panel'
import { NfePanel } from '@/components/sales/nfe-panel'
import { NfcePanel } from '@/components/sales/nfce-panel'
import { ContractsOperationsPanel } from '@/components/contracts-operations-panel'
import { SalesReturnsPanel } from '@/components/sales/sales-returns-panel'
import { SalesHistoryPanel } from '@/components/sales/sales-history-panel'
import { SalesReports } from '@/components/sales/sales-reports'
import { ShoppingCart } from 'lucide-react'

type Tab =
  | 'dashboard'
  | 'orders'
  | 'invoicing'
  | 'nfe'
  | 'nfce'
  | 'contracts'
  | 'returns'
  | 'history'
  | 'reports'

const TABS: { id: Tab; label: string }[] = [
  { id: 'dashboard', label: 'Dashboard de Vendas' },
  { id: 'orders', label: 'Pedidos de Venda' },
  { id: 'invoicing', label: 'Faturamento' },
  { id: 'nfe', label: 'Emissão de NF-e' },
  { id: 'nfce', label: 'Emissão de NFC-e' },
  { id: 'contracts', label: 'Contratos' },
  { id: 'returns', label: 'Devoluções' },
  { id: 'history', label: 'Histórico de Vendas' },
  { id: 'reports', label: 'Relatórios' },
]

export function SalesPanel() {
  const [tab, setTab] = useState<Tab>('dashboard')

  const render = () => {
    switch (tab) {
      case 'dashboard':
        return <SalesDashboard />
      case 'orders':
        return <SalesOrdersPanel />
      case 'invoicing':
        return <InvoicingPanel />
      case 'nfe':
        return <NfePanel />
      case 'nfce':
        return <NfcePanel />
      case 'contracts':
        return <ContractsOperationsPanel />
      case 'returns':
        return <SalesReturnsPanel />
      case 'history':
        return <SalesHistoryPanel />
      case 'reports':
        return <SalesReports />
      default:
        return <SalesDashboard />
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <ShoppingCart className="w-5 h-5 text-[#005B2E]" />
        <h2 className="text-xl font-black text-foreground">Vendas</h2>
      </div>
      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
              tab === t.id
                ? 'bg-[#005B2E] text-white'
                : 'bg-muted text-muted-foreground hover:bg-muted/80',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      {render()}
    </div>
  )
}
