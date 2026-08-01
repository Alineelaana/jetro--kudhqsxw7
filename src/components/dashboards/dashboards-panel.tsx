import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ChatProductivityDashboard } from '@/components/dashboards/chat-productivity-dashboard'
import { BudgetProductivityDashboard } from '@/components/dashboards/budget-productivity-dashboard'
import { ChatDashboard } from '@/components/chat-dashboard'

export function DashboardsPanel() {
  return (
    <Tabs defaultValue="chat">
      <TabsList className="mb-6 flex flex-wrap h-auto">
        <TabsTrigger value="chat">Produtividade do Chat</TabsTrigger>
        <TabsTrigger value="budget">Produtividade de Orçamentos</TabsTrigger>
        <TabsTrigger value="ratings">Avaliações e Ranking</TabsTrigger>
      </TabsList>
      <TabsContent value="chat">
        <ChatProductivityDashboard />
      </TabsContent>
      <TabsContent value="budget">
        <BudgetProductivityDashboard />
      </TabsContent>
      <TabsContent value="ratings">
        <ChatDashboard />
      </TabsContent>
    </Tabs>
  )
}
