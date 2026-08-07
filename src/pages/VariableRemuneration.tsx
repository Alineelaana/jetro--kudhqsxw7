import { useState } from 'react'
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
import { VrGoalsManagement } from '@/components/variable-remuneration/goals/vr-goals-management'
import { VrGoalsDashboard } from '@/components/variable-remuneration/goals/vr-goals-dashboard'
import { VrAwards } from '@/components/variable-remuneration/goals/vr-awards'
import { VrCommunications } from '@/components/variable-remuneration/goals/vr-communications'
import { VrSellerView } from '@/components/variable-remuneration/goals/vr-seller-view'
import { useAuth } from '@/hooks/use-auth'
import { canViewVR } from '@/lib/variable-remuneration-permissions'
import { VR_TABS } from '@/lib/variable-remuneration-types'
import { cn } from '@/lib/utils'

export default function VariableRemuneration({ screen = 'dashboard' }: { screen?: string }) {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState(screen)
  const [goalsTab, setGoalsTab] = useState<
    'dashboard' | 'management' | 'awards' | 'communications' | 'seller'
  >('dashboard')

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

  return (
    <VrLayout title={title}>
      <div className="flex flex-wrap gap-2 mb-4">
        {VR_TABS.map((tab) => (
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
      {activeTab === 'goals' && (
        <div className="flex flex-wrap gap-2 mb-4">
          {[
            { id: 'dashboard', label: 'Dashboard de Metas' },
            { id: 'management', label: 'Gestão de Metas' },
            { id: 'awards', label: 'Premiações' },
            { id: 'communications', label: 'Comunicações' },
            { id: 'seller', label: 'Minhas Metas' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setGoalsTab(t.id as any)}
              className={cn(
                'px-2.5 py-1 rounded-md text-xs font-medium transition-colors',
                goalsTab === t.id
                  ? 'bg-[#C89B3C] text-white'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted',
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}
      {renderContent()}
    </VrLayout>
  )
}
