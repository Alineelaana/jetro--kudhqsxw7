import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { AdminLogin } from '@/components/admin-login'
import { ModulePageHeader } from '@/components/enterprise/module-page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, Megaphone } from 'lucide-react'
import { cn } from '@/lib/utils'
import { canViewTradeMarketing } from '@/lib/trade-marketing-permissions'
import { getActions } from '@/services/trade-marketing'
import { TmDashboard } from '@/components/trade-marketing/tm-dashboard'
import { TmCalendar } from '@/components/trade-marketing/tm-calendar'
import { TmMaterials } from '@/components/trade-marketing/tm-materials'
import { TmAccountability } from '@/components/trade-marketing/tm-accountability'
import { TmAdapta } from '@/components/trade-marketing/tm-adapta'
import { TmVerbasFornecedor } from '@/components/trade-marketing/tm-verbas-fornecedor'
import { MkExternalQuotationsPanel } from '@/components/trade-marketing/mk-eq-panel'
import type { TradeMarketingAction } from '@/lib/trade-marketing-types'
import { STATUS_COLORS } from '@/lib/trade-marketing-types'

const TABS = [
  { id: 'dashboard', label: 'Dashboard', route: '/admin/trade-marketing' },
  { id: 'calendar', label: 'Calendário', route: '/admin/trade-marketing/calendario' },
  { id: 'actions', label: 'Ações', route: '/admin/trade-marketing/acoes' },
  { id: 'verbas', label: 'Verbas', route: '/admin/trade-marketing/verbas-fornecedor' },
  { id: 'materials', label: 'Materiais', route: '/admin/trade-marketing/materiais' },
  { id: 'accountability', label: 'Prestação', route: '/admin/trade-marketing/prestacao-contas' },
  { id: 'annual-plan', label: 'Planejamento', route: '/admin/trade-marketing/planejamento-anual' },
  { id: 'adapta', label: 'ADAPTA', route: '/admin/trade-marketing/adapta' },
  { id: 'cotacoes-externas', label: 'Cotações', route: '/admin/trade-marketing/cotacoes-externas' },
]

function ActionsTable({ actions }: { actions: TradeMarketingAction[] }) {
  return (
    <Card className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-[#01361D] text-white">
            <th className="text-left px-3 py-2">Título</th>
            <th className="text-left px-3 py-2">Tipo</th>
            <th className="text-left px-3 py-2">Status</th>
            <th className="text-left px-3 py-2">Início</th>
            <th className="text-left px-3 py-2">Resp.</th>
            <th className="text-left px-3 py-2">Orçamento</th>
          </tr>
        </thead>
        <tbody>
          {actions.map((a) => (
            <tr key={a.id} className="border-b hover:bg-[#005B2E]/5">
              <td className="px-3 py-2 font-medium">{a.title}</td>
              <td className="px-3 py-2 text-xs">{a.action_type}</td>
              <td className="px-3 py-2">
                <span className={cn('text-xs px-2 py-0.5 rounded', STATUS_COLORS[a.status])}>
                  {a.status}
                </span>
              </td>
              <td className="px-3 py-2 text-xs">{a.start_date}</td>
              <td className="px-3 py-2 text-xs">{a.responsible_name || '—'}</td>
              <td className="px-3 py-2 text-xs">R$ {a.budget_planned || '0'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  )
}

function AnnualPlanPlaceholder() {
  return (
    <Card className="border-2 border-dashed border-[#005B2E]/30">
      <CardContent className="py-12 text-center">
        <Megaphone className="w-10 h-10 text-[#005B2E]/30 mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">
          Planejamento Anual de Marketing — Ano → Fornecedor → Marca → Campanha → Objetivo →
          Orçamento → Período → Responsável → Resultado
        </p>
      </CardContent>
    </Card>
  )
}

interface TradeMarketingPageProps {
  screen?: string
}

export default function TradeMarketing({ screen = 'dashboard' }: TradeMarketingPageProps) {
  const { isAuthenticated, loading, userRole } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [actions, setActions] = useState<TradeMarketingAction[]>([])

  useEffect(() => {
    if (isAuthenticated && canViewTradeMarketing(userRole)) {
      getActions()
        .then(setActions)
        .catch(() => {})
    }
  }, [isAuthenticated, userRole])

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )
  if (!isAuthenticated || !canViewTradeMarketing(userRole)) return <AdminLogin />

  const renderContent = () => {
    switch (screen) {
      case 'calendar':
        return (
          <TmCalendar actions={actions} onEdit={() => navigate('/admin/trade-marketing/acoes')} />
        )
      case 'actions':
        return <ActionsTable actions={actions} />
      case 'verbas':
        return <TmVerbasFornecedor />
      case 'materials':
        return <TmMaterials />
      case 'accountability':
        return <TmAccountability />
      case 'annual-plan':
        return <AnnualPlanPlaceholder />
      case 'adapta':
        return <TmAdapta />
      case 'cotacoes-externas':
        return <MkExternalQuotationsPanel />
      default:
        return <TmDashboard actions={actions} />
    }
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <ModulePageHeader
        title="Trade & Marketing"
        icon={Megaphone}
        breadcrumbs={[{ label: 'Admin', to: '/admin' }, { label: 'Trade & Marketing' }]}
      />
      <div className="flex flex-wrap gap-2 mb-6">
        {TABS.map((tab) => (
          <Button
            key={tab.id}
            variant={pathname === tab.route ? 'default' : 'outline'}
            size="sm"
            onClick={() => navigate(tab.route)}
            className={cn(pathname === tab.route && 'bg-[#005B2E] hover:bg-[#01361D]')}
          >
            {tab.label}
          </Button>
        ))}
      </div>
      {renderContent()}
    </div>
  )
}
