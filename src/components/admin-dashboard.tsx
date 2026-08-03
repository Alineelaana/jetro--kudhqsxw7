import { useState } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { NotificationBell } from '@/components/notification-bell'
import { useAuth } from '@/hooks/use-auth'
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
import { LogOut, Shield } from 'lucide-react'

export function AdminDashboard() {
  const { user, isAdmin, signOut } = useAuth()
  const [tab, setTab] = useState('dashboard')

  const userName = (user?.name as string) || (user?.email as string) || 'Admin'

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[#005B2E] text-white sticky top-0 z-30 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
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
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <Tabs value={tab} onValueChange={setTab}>
          <div className="overflow-x-auto pb-2">
            <TabsList className="inline-flex">
              <TabsTrigger value="dashboard">Visão Geral</TabsTrigger>
              <TabsTrigger value="budgets">Orçamentos</TabsTrigger>
              <TabsTrigger value="services">Serviços</TabsTrigger>
              <TabsTrigger value="contracts">Contratos</TabsTrigger>
              <TabsTrigger value="partners">Parceiros</TabsTrigger>
              <TabsTrigger value="chat">Atendimento</TabsTrigger>
              {isAdmin && <TabsTrigger value="users">Usuários</TabsTrigger>}
              {isAdmin && <TabsTrigger value="ai">IA</TabsTrigger>}
              {isAdmin && <TabsTrigger value="cms">CMS</TabsTrigger>}
              {isAdmin && <TabsTrigger value="audit">Auditoria</TabsTrigger>}
              {isAdmin && <TabsTrigger value="backups">Backups</TabsTrigger>}
            </TabsList>
          </div>
          <TabsContent value="dashboard">
            <DashboardsPanel />
          </TabsContent>
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
          {isAdmin && (
            <TabsContent value="users">
              <UserManagement />
            </TabsContent>
          )}
          {isAdmin && (
            <TabsContent value="ai">
              <AiTrainingPanel />
            </TabsContent>
          )}
          {isAdmin && (
            <TabsContent value="cms">
              <CmsPanel />
            </TabsContent>
          )}
          {isAdmin && (
            <TabsContent value="audit">
              <AuditPanel />
            </TabsContent>
          )}
          {isAdmin && (
            <TabsContent value="backups">
              <BackupPanel />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  )
}
