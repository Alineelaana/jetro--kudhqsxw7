import { VrLayout } from '@/components/variable-remuneration/vr-layout'
import { VrDashboard } from '@/components/variable-remuneration/vr-dashboard'
import { VrRules } from '@/components/variable-remuneration/vr-rules'
import { VrApuration } from '@/components/variable-remuneration/vr-apuration'
import { VrSimulator } from '@/components/variable-remuneration/vr-simulator'
import { VrApprovals } from '@/components/variable-remuneration/vr-approvals'
import { VrHistory } from '@/components/variable-remuneration/vr-history'
import { VrContests } from '@/components/variable-remuneration/vr-contests'
import { VrCampaigns } from '@/components/variable-remuneration/vr-campaigns'
import { VrRanking } from '@/components/variable-remuneration/vr-ranking'
import { VrGoalsDashboard } from '@/components/variable-remuneration/goals/vr-goals-dashboard'
import { VrGoalsManagement } from '@/components/variable-remuneration/goals/vr-goals-management'
import { VrAwards } from '@/components/variable-remuneration/goals/vr-awards'
import { VrCommunications } from '@/components/variable-remuneration/goals/vr-communications'
import { VrSellerView } from '@/components/variable-remuneration/goals/vr-seller-view'
import { useAuth } from '@/hooks/use-auth'
import { canViewVR } from '@/lib/variable-remuneration-permissions'

export default function VariableRemuneration({ screen = 'dashboard' }: { screen?: string }) {
  const { user } = useAuth()
  const activeTab = screen

  if (!canViewVR(user?.role)) {
    return (
      <VrLayout title="Remuneração Variável">
        <p className="text-center text-muted-foreground py-12">
          Você não tem permissão para acessar este módulo.
        </p>
      </VrLayout>
    )
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'goals':
        return <VrGoalsDashboard />
      case 'goals-management':
        return <VrGoalsManagement />
      case 'goals-awards':
        return <VrAwards />
      case 'goals-communications':
        return <VrCommunications />
      case 'goals-seller':
        return <VrSellerView />
    switch (activeTab) {
      case 'dashboard':
        return <VrDashboard />
      case 'rules':
        return <VrRules />
      case 'apuration':
        return <VrApuration />
      case 'simulator':
        return <VrSimulator />
      case 'approvals':
        return <VrApprovals />
      case 'history':
        return <VrHistory />
      case 'contests':
        return <VrContests />
      case 'campaigns':
        return <VrCampaigns />
      case 'ranking':
        return <VrRanking />
      default:
        return <VrDashboard />
    }
  }

  const titles: Record<string, string> = {
    dashboard: 'Remuneração Variável',
    rules: 'Regras de Remuneração',
    apuration: 'Apuração de Comissões',
    simulator: 'Simulador de Remuneração',
    approvals: 'Aprovações de Comissões',
    history: 'Histórico de Remuneração',
    contests: 'Contestações',
    campaigns: 'Campanhas',
    ranking: 'Ranking de Vendedores',
    goals: 'Metas & Premiações',
    'goals-management': 'Gestão de Metas',
    'goals-awards': 'Premiações',
    'goals-communications': 'Comunicações de Metas',
    'goals-seller': 'Visão do Vendedor',
  }
  const title = titles[activeTab] || 'Remuneração Variável'

  return <VrLayout title={title}>{renderContent()}</VrLayout>
}
