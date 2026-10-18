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
    if (activeTab === 'goals') {
      switch (goalsTab) {
        case 'dashboard':
          return <VrGoalsDashboard />
        case 'management':
          return <VrGoalsManagement />
        case 'awards':
          return <VrAwards />
        case 'communications':
          return <VrCommunications />
        case 'seller':
          return <VrSellerView />
        default:
          return <VrGoalsDashboard />
      }
    }
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

  const title = activeTab === 'goals' ? 'Metas & Premiações' : 'Remuneração Variável'

  return <VrLayout title={title}>{renderContent()}</VrLayout>
}
