import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { AdminLogin } from '@/components/admin-login'
import { ModulePageHeader } from '@/components/enterprise/module-page-header'
import { Button } from '@/components/ui/button'
import { Megaphone, Loader2 } from 'lucide-react'
import { canViewMarketing } from '@/lib/marketing-permissions'
import { cn } from '@/lib/utils'
import { MarketingRequestCenter } from '@/components/marketing/marketing-request-center'
import { MarketingJobs } from '@/components/marketing/marketing-jobs'
import { MarketingPieceApproval } from '@/components/marketing/marketing-piece-approval'
import { MarketingMediaManager } from '@/components/marketing/marketing-media-manager'
import { MarketingBrand } from '@/components/marketing/marketing-brand'
import { MarketingCockpit } from '@/components/marketing/marketing-cockpit'
import { MarketingEditorialCalendar } from '@/components/marketing/marketing-editorial-calendar'
import { MarketingLibrary } from '@/components/marketing/marketing-library'
import { MarketingAttribution } from '@/components/marketing/marketing-attribution'
import { MarketingBriefingTemplates } from '@/components/marketing/marketing-briefing-templates'

const TABS = [
  { id: 'cockpit', label: 'Cockpit' },
  { id: 'requests', label: 'Solicitações' },
  { id: 'jobs', label: 'Jobs' },
  { id: 'approval', label: 'Aprovação de Peças' },
  { id: 'calendar', label: 'Calendário Editorial' },
  { id: 'media', label: 'Mídia' },
  { id: 'attribution', label: 'Atribuição' },
  { id: 'brand', label: 'Brand' },
  { id: 'library', label: 'Biblioteca' },
  { id: 'templates', label: 'Templates' },
]

interface MarketingEnterpriseProps {
  screen?: string
}

export default function MarketingEnterprise({ screen = 'cockpit' }: MarketingEnterpriseProps) {
  const { isAuthenticated, loading, userRole } = useAuth()
  const [activeTab, setActiveTab] = useState<string>(screen)

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )
  if (!isAuthenticated || !canViewMarketing(userRole)) return <AdminLogin />

  const renderScreen = () => {
    switch (activeTab) {
      case 'cockpit':
        return <MarketingCockpit />
      case 'requests':
        return <MarketingRequestCenter />
      case 'jobs':
        return <MarketingJobs />
      case 'approval':
        return <MarketingPieceApproval />
      case 'calendar':
        return <MarketingEditorialCalendar />
      case 'media':
        return <MarketingMediaManager />
      case 'attribution':
        return <MarketingAttribution />
      case 'brand':
        return <MarketingBrand />
      case 'library':
        return <MarketingLibrary />
      case 'templates':
        return <MarketingBriefingTemplates />
      default:
        return <MarketingCockpit />
    }
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <ModulePageHeader
        title="Marketing Enterprise"
        icon={Megaphone}
        breadcrumbs={[{ label: 'Admin', to: '/admin' }, { label: 'Marketing' }]}
      />
      <div className="flex flex-wrap gap-2 mb-4 border-b pb-3">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'text-xs font-semibold px-3 py-1.5 rounded transition-colors',
              activeTab === tab.id
                ? 'bg-[#005B2E] text-white'
                : 'text-gray-600 hover:bg-gray-100 hover:text-[#005B2E]',
            )}
          >
            {tab.label}
          </button>
        ))}
        <Link to="/admin/trade-marketing" className="ml-auto">
          <Button variant="outline" size="sm" className="text-xs">
            Trade Marketing →
          </Button>
        </Link>
      </div>
      {renderScreen()}
    </div>
  )
}
