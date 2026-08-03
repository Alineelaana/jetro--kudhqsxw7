import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { NotificationBell } from '@/components/notification-bell'
import { DashboardsPanel } from '@/components/dashboards/dashboards-panel'
import { BudgetRequestsPanel } from '@/components/budget-requests-panel'
import { ServicesOfferedPanel } from '@/components/services-offered-panel'
import { ProductsPanel } from '@/components/products-panel'
import { ContractsOperationsPanel } from '@/components/contracts-operations-panel'
import { PartnerManagement } from '@/components/partner-management'
import { UserManagement } from '@/components/user-management'
import { AdminChatPanel } from '@/components/admin-chat-panel'
import { AiTrainingPanel } from '@/components/ai-training-panel'
import { CmsPanel } from '@/components/cms/cms-panel'
import { AuditPanel } from '@/components/audit-panel'
import { BackupPanel } from '@/components/backup-panel'
import {
  LayoutDashboard,
  FileText,
  Wrench,
  Package,
  FileSignature,
  Users,
  MessageSquare,
  Bot,
  Layout,
  History,
  Database,
  LogOut,
  UserCog,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type TabId =
  | 'dashboard'
  | 'budgets'
  | 'services'
  | 'products'
  | 'contracts'
  | 'partners'
  | 'chat'
  | 'cms'
  | 'ai'
  | 'users'
  | 'audit'
  | 'backups'

interface MenuItem {
  id: TabId
  label: string
  icon: typeof LayoutDashboard
  sup: boolean
}

const MENU_ITEMS: MenuItem[] = [
  { id: 'dashboard', label: 'Painel', icon: LayoutDashboard, sup: false },
  { id: 'budgets', label: 'Orçamentos', icon: FileText, sup: false },
  { id: 'services', label: 'Serviços', icon: Wrench, sup: false },
  { id: 'products', label: 'Produtos', icon: Package, sup: false },
  { id: 'contracts', label: 'Contratos', icon: FileSignature, sup: false },
  { id: 'partners', label: 'Parceiros', icon: Users, sup: false },
  { id: 'chat', label: 'Chat', icon: MessageSquare, sup: false },
  { id: 'cms', label: 'CMS', icon: Layout, sup: false },
  { id: 'ai', label: 'Treinar IA', icon: Bot, sup: true },
  { id: 'users', label: 'Usuários', icon: UserCog, sup: true },
  { id: 'audit', label: 'Auditoria', icon: History, sup: true },
  { id: 'backups', label: 'Backups', icon: Database, sup: true },
]

export function AdminDashboard() {
  const { user, signOut } = useAuth()
  const [activeTab, setActiveTab] = useState<TabId>('dashboard')

  const isSup = user?.role === 'SUP'
  const visibleItems = MENU_ITEMS.filter((item) => !item.sup || isSup)

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardsPanel />
      case 'budgets':
        return <BudgetRequestsPanel />
      case 'services':
        return <ServicesOfferedPanel />
      case 'products':
        return <ProductsPanel />
      case 'contracts':
        return <ContractsOperationsPanel />
      case 'partners':
        return <PartnerManagement />
      case 'chat':
        return <AdminChatPanel />
      case 'cms':
        return <CmsPanel />
      case 'ai':
        return <AiTrainingPanel />
      case 'users':
        return <UserManagement />
      case 'audit':
        return <AuditPanel />
      case 'backups':
        return <BackupPanel />
      default:
        return <DashboardsPanel />
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <aside className="hidden md:flex w-60 bg-[#01361D] text-white flex-col shrink-0">
        <div className="p-4 border-b border-white/10">
          <p className="text-sm font-bold truncate">{user?.name || 'Admin'}</p>
          <p className="text-xs text-white/60">{user?.role || ''}</p>
        </div>
        <nav className="flex-1 overflow-y-auto p-2 space-y-1">
          {visibleItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  activeTab === item.id
                    ? 'bg-[#005B2E] text-white'
                    : 'text-white/70 hover:bg-white/5 hover:text-white',
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {item.label}
              </button>
            )
          })}
        </nav>
        <div className="p-2 border-t border-white/10">
          <Button
            variant="ghost"
            onClick={signOut}
            className="w-full justify-start text-white/70 hover:bg-white/5 hover:text-white"
          >
            <LogOut className="w-4 h-4 mr-3" /> Sair
          </Button>
        </div>
      </aside>

      <main className="flex-1 overflow-x-auto bg-background">
        <div className="flex items-center justify-between p-3 border-b gap-3">
          <div className="md:hidden flex-1">
            <Select value={activeTab} onValueChange={(v) => setActiveTab(v as TabId)}>
              <SelectTrigger className="w-full focus-visible:ring-[#005B2E]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {visibleItems.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="hidden md:block" />
          <NotificationBell />
        </div>
        <div className="p-4 md:p-6">{renderContent()}</div>
      </main>
    </div>
  )
}
