import { useState, type ComponentType } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { NotificationBell } from '@/components/notification-bell'
import { AdminSidebar } from '@/components/admin-sidebar'
import { DashboardsPanel } from '@/components/dashboards/dashboards-panel'
import { BudgetRequestsPanel } from '@/components/budget-requests-panel'
import { ServicesOfferedPanel } from '@/components/services-offered-panel'
import { PartnerManagement } from '@/components/partner-management'
import { UserManagement } from '@/components/user-management'
import { AdminChatPanel } from '@/components/admin-chat-panel'
import { AiTrainingPanel } from '@/components/ai-training-panel'
import { CmsPanel } from '@/components/cms/cms-panel'
import { AuditPanel } from '@/components/audit-panel'
import { BackupPanel } from '@/components/backup-panel'
import { PurchasingPanel } from '@/components/purchasing/purchasing-panel'
import { PricingPanel } from '@/components/pricing/pricing-panel'
import { ContractsOperationsPanel } from '@/components/contracts-operations-panel'
import { cn } from '@/lib/utils'
import { useSidebarMode } from '@/hooks/use-sidebar-mode'
import { LogOut, Menu, X, PanelLeftClose, PanelLeftOpen } from 'lucide-react'

const PANELS: Record<string, ComponentType> = {
  dashboard: DashboardsPanel,
  budgets: BudgetRequestsPanel,
  services: ServicesOfferedPanel,
  chat: AdminChatPanel,
  partners: PartnerManagement,
  users: UserManagement,
  cms: CmsPanel,
  audit: AuditPanel,
  backups: BackupPanel,
  purchasing: PurchasingPanel,
  pricing: PricingPanel,
  contracts: ContractsOperationsPanel,
  ai: AiTrainingPanel,
}

const TAB_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  budgets: 'Orçamentos',
  services: 'Serviços',
  chat: 'Chat',
  partners: 'Parceiros',
  users: 'Usuários',
  cms: 'CMS',
  audit: 'Auditoria',
  backups: 'Backups',
  purchasing: 'Compras',
  pricing: 'Precificação',
  contracts: 'Contratos',
  ai: 'Treinamento IA',
}

export function AdminDashboard() {
  const { user, signOut } = useAuth()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [mobileOpen, setMobileOpen] = useState(false)
  const { collapsed, toggle } = useSidebarMode(user?.id as string)

  const ActivePanel = PANELS[activeTab] ?? DashboardsPanel

  return (
    <div className="flex">
      <aside
        className={cn(
          'hidden lg:flex flex-col bg-white border-r shrink-0 self-start sticky top-0 h-screen',
          collapsed ? 'w-16 overflow-visible' : 'w-64 overflow-y-auto',
        )}
      >
        <div className={cn('border-b', collapsed ? 'p-2' : 'p-4')}>
          <div
            className={cn('flex items-center', collapsed ? 'justify-center' : 'justify-between')}
          >
            {!collapsed && (
              <div>
                <h1 className="text-xl font-bold text-[#005B2E]">VeloraLog</h1>
                <p className="text-xs text-gray-500 mt-0.5">{user?.name}</p>
              </div>
            )}
            {collapsed && <span className="text-xl font-bold text-[#005B2E]">V</span>}
            <button
              onClick={toggle}
              className={cn(
                'text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100 transition-colors',
                collapsed && 'mt-2',
              )}
              title={collapsed ? 'Expandir menu' : 'Recolher menu'}
            >
              {collapsed ? (
                <PanelLeftOpen className="w-4 h-4" />
              ) : (
                <PanelLeftClose className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
        <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} collapsed={collapsed} />
      </aside>

      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/50"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="absolute left-0 top-0 bottom-0 w-64 bg-white overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b flex items-center justify-between">
              <h1 className="text-xl font-bold text-[#005B2E]">VeloraLog</h1>
              <button onClick={() => setMobileOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <AdminSidebar
              activeTab={activeTab}
              onTabChange={(t) => {
                setActiveTab(t)
                setMobileOpen(false)
              }}
              onNavigate={() => setMobileOpen(false)}
            />
          </div>
        </div>
      )}

      <main className="flex-1 p-4 lg:p-6 min-w-0">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button className="lg:hidden" onClick={() => setMobileOpen(true)}>
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-semibold text-gray-800">
              {TAB_LABELS[activeTab] ?? 'Dashboard'}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <NotificationBell />
            <button onClick={signOut} className="text-gray-500 hover:text-red-500" title="Sair">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
        <ActivePanel />
      </main>
    </div>
  )
}
