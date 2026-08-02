import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { BudgetRequestsPanel } from '@/components/budget-requests-panel'
import { ServicesOfferedPanel } from '@/components/services-offered-panel'
import { ContractsOperationsPanel } from '@/components/contracts-operations-panel'
import { PartnerManagement } from '@/components/partner-management'
import { UserManagement } from '@/components/user-management'
import { AdminChatPanel } from '@/components/admin-chat-panel'
import { AiTrainingPanel } from '@/components/ai-training-panel'
import { DashboardsPanel } from '@/components/dashboards/dashboards-panel'
import { CmsPanel } from '@/components/cms/cms-panel'
import { AuditPanel } from '@/components/audit-panel'
import {
  LogOut,
  FileText,
  Package,
  Users,
  MessageSquare,
  Bot,
  BarChart3,
  LayoutDashboard,
  ClipboardList,
  ScrollText,
} from 'lucide-react'

export function AdminDashboard() {
  const { user, signOut, userRole } = useAuth()
  const [activeTab, setActiveTab] = useState('budgets')

  const tabItems = [
    { value: 'budgets', label: 'Orçamentos', icon: FileText },
    { value: 'services', label: 'Serviços', icon: Package },
    { value: 'contracts', label: 'Contratos/Operações', icon: ClipboardList },
    { value: 'partners', label: 'Parceiros', icon: Users },
    { value: 'chat', label: 'Chat', icon: MessageSquare },
    { value: 'users', label: 'Usuários', icon: Users },
    { value: 'ai', label: 'IA', icon: Bot },
    { value: 'dashboards', label: 'Dashboards', icon: BarChart3 },
    { value: 'cms', label: 'CMS', icon: LayoutDashboard },
    { value: 'audit', label: 'Auditoria', icon: ScrollText },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[#01361D] text-white px-4 py-3 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-lg font-bold">Painel Administrativo</h1>
          <div className="flex items-center gap-3">
            <span className="text-sm hidden sm:block">
              {user?.name || user?.email || 'Admin'} · {userRole}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={signOut}
              className="bg-transparent border-white/30 text-white hover:bg-white/10"
            >
              <LogOut className="w-4 h-4 mr-1" /> Sair
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="flex flex-wrap h-auto gap-1 mb-4 bg-white border">
            {tabItems.map((tab) => {
              const Icon = tab.icon
              return (
                <TabsTrigger key={tab.value} value={tab.value} className="gap-1.5">
                  <Icon className="w-4 h-4" /> {tab.label}
                </TabsTrigger>
              )
            })}
          </TabsList>

          <TabsContent value="budgets">
            <BudgetRequestsPanel />
          </TabsContent>
          <TabsContent value="services">
            <ServicesOfferedPanel />
          </TabsContent>
          <TabsContent value="contracts">
            <ContractsOperationsPanel />
          </TabsContent>
          <TabsContent value="partners">
            <PartnerManagement />
          </TabsContent>
          <TabsContent value="chat">
            <AdminChatPanel />
          </TabsContent>
          <TabsContent value="users">
            <UserManagement />
          </TabsContent>
          <TabsContent value="ai">
            <AiTrainingPanel />
          </TabsContent>
          <TabsContent value="dashboards">
            <DashboardsPanel />
          </TabsContent>
          <TabsContent value="cms">
            <CmsPanel />
          </TabsContent>
          <TabsContent value="audit">
            <AuditPanel />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
