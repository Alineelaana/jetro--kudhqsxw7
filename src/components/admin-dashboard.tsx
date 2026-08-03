import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { NotificationBell } from '@/components/notification-bell'
import { useAuth } from '@/hooks/use-auth'
import { cn } from '@/lib/utils'
import { DashboardsPanel } from '@/components/dashboards/dashboards-panel'
import { BudgetRequestsPanel } from '@/components/budget-requests-panel'
import { ServicesOfferedPanel } from '@/components/services-offered-panel'
import { ContractsOperationsPanel } from '@/components/contracts-operations-panel'
import { PartnerManagement } from '@/components/partner-management'
import { UserManagement } from '@/components/user-management'
import { AdminChatPanel } from '@/components/admin-chat-panel'
import { AiTrainingPanel } from '@/components/ai-training-panel'
import { CmsPanel } from '@/components/cms/cms-panel'
import { AuditPanel } from '@/components/audit-panel'
import { BackupPanel } from '@/components/backup-panel'
import { LogOut, Menu, Shield } from 'lucide-react'

interface MenuOption {
  value: string
  label: string
  adminOnly?: boolean
}

const MENU_OPTIONS: MenuOption[] = [
  { value: 'dashboard', label: 'Visão Geral' },
  { value: 'budgets', label: 'Orçamentos' },
  { value: 'services', label: 'Serviços' },
  { value: 'contracts', label: 'Contratos' },
  { value: 'partners', label: 'Parceiros' },
  { value: 'chat', label: 'Atendimento' },
  { value: 'users', label: 'Usuários', adminOnly: true },
  { value: 'ai', label: 'IA', adminOnly: true },
  { value: 'cms', label: 'CMS', adminOnly: true },
  { value: 'audit', label: 'Auditoria', adminOnly: true },
  { value: 'backups', label: 'Backups', adminOnly: true },
]

export function AdminDashboard() {
  const { user, isAdmin, signOut } = useAuth()
  const [section, setSection] = useState('dashboard')

  const userName = (user?.name as string) || (user?.email as string) || 'Admin'

  const visibleOptions = MENU_OPTIONS.filter((opt) => !opt.adminOnly || isAdmin)

  const currentLabel = MENU_OPTIONS.find((opt) => opt.value === section)?.label ?? 'Visão Geral'

  const renderPanel = () => {
    switch (section) {
      case 'budgets':
        return <BudgetRequestsPanel />
      case 'services':
        return <ServicesOfferedPanel />
      case 'contracts':
        return <ContractsOperationsPanel />
      case 'partners':
        return <PartnerManagement />
      case 'chat':
        return <AdminChatPanel />
      case 'users':
        return isAdmin ? <UserManagement /> : null
      case 'ai':
        return isAdmin ? <AiTrainingPanel /> : null
      case 'cms':
        return isAdmin ? <CmsPanel /> : null
      case 'audit':
        return isAdmin ? <AuditPanel /> : null
      case 'backups':
        return isAdmin ? <BackupPanel /> : null
      default:
        return <DashboardsPanel />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[#005B2E] text-white sticky top-0 z-30 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-[#C89B3C]" />
              <span className="font-black text-lg">VeloraLog — Admin</span>
            </div>
            <div className="flex items-center gap-3">
              <NotificationBell />
              <span className="text-sm hidden sm:inline">{userName}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={signOut}
                className="text-white hover:bg-white/10"
              >
                <LogOut className="w-4 h-4 mr-1" /> Sair
              </Button>
            </div>
          </div>
          <div className="mt-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white text-[#005B2E] border-[#C89B3C] hover:bg-gray-100 font-semibold"
                >
                  <Menu className="w-4 h-4 mr-2" />
                  {currentLabel}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="w-56"
                onCloseAutoFocus={(e) => e.preventDefault()}
              >
                {visibleOptions.map((opt) => (
                  <DropdownMenuItem
                    key={opt.value}
                    onClick={() => setSection(opt.value)}
                    className={cn(
                      'cursor-pointer',
                      section === opt.value && 'bg-[#005B2E]/10 font-semibold text-[#005B2E]',
                    )}
                  >
                    {opt.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">{renderPanel()}</div>
    </div>
  )
}
