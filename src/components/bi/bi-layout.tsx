import { type ReactNode, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { useModuleSections } from '@/hooks/use-module-sections'
import { AdminLogin } from '@/components/admin-login'
import { ModulePageHeader } from '@/components/enterprise/module-page-header'
import { ModuleNavSection } from '@/components/enterprise/module-nav-section'
import { Button } from '@/components/ui/button'
import { Loader2, BarChart3 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { canViewBI } from '@/lib/bi-permissions'
import { BIFilterProvider, BIFilterBar } from './bi-filters'

const NAV_SECTIONS = [
  {
    title: 'Principal',
    items: [
      { to: '/admin/bi', label: 'Dashboard Executivo', icon: '📊' },
      { to: '/admin/bi/executive', label: 'Inteligência Executiva', icon: '👑' },
      { to: '/admin/bi/cross-module', label: 'Visão Cruzada', icon: '🔀' },
      { to: '/admin/bi/projection', label: 'Projeção de Vendas', icon: '📈' },
    ],
  },
  {
    title: 'Centros de Inteligência',
    items: [
      { to: '/admin/bi/commercial', label: 'Comercial', icon: '📈' },
      { to: '/admin/bi/financial-intel', label: 'Financeira', icon: '💰' },
      { to: '/admin/bi/industrial-intel', label: 'Industrial', icon: '🏭' },
      { to: '/admin/bi/logistics-intel', label: 'Logística', icon: '🚚' },
      { to: '/admin/bi/stock-intel', label: 'Estoque', icon: '📦' },
      { to: '/admin/bi/fiscal-intel', label: 'Fiscal', icon: '🧾' },
      { to: '/admin/bi/purchasing-intel', label: 'Compras', icon: '🛒' },
      { to: '/admin/bi/crm-intel', label: 'CRM', icon: '🎯' },
      { to: '/admin/bi/trade-intel', label: 'Trade Marketing', icon: '📣' },
      { to: '/admin/bi/rh-intel', label: 'RH', icon: '👥' },
      { to: '/admin/bi/quality-intel', label: 'Qualidade', icon: '✅' },
      { to: '/admin/bi/maintenance-intel', label: 'Manutenção', icon: '🔧' },
      { to: '/admin/bi/vr-intel', label: 'Remuneração Variável', icon: '🏆' },
    ],
  },
  {
    title: 'Analytics Clássico',
    items: [
      { to: '/admin/bi/sales', label: 'Vendas', icon: '📉' },
      { to: '/admin/bi/stock', label: 'Estoque (Clássico)', icon: '📋' },
      { to: '/admin/bi/financial', label: 'Financeiro (Clássico)', icon: '💵' },
      { to: '/admin/bi/industrial', label: 'Industrial (Clássico)', icon: '⚙️' },
    ],
  },
  {
    title: 'Gestão',
    items: [
      { to: '/admin/bi/custom-dashboards', label: 'Dashboards Personalizados', icon: '🎨' },
      { to: '/admin/bi/saved-views', label: 'Relatórios Salvos', icon: '🔖' },
      { to: '/admin/bi/report-center', label: 'Central de Relatórios', icon: '📋' },
      { to: '/admin/bi/ai-adapta', label: 'IA ADAPTA', icon: '🤖' },
    ],
  },
]

export function BiLayout({ children, title }: { children: ReactNode; title: string }) {
  const { user, isAuthenticated, loading, userRole } = useAuth()
  const { pathname } = useLocation()
  const { isExpanded, toggle } = useModuleSections('bi', user?.id as string)

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )
  if (!isAuthenticated || !canViewBI(userRole)) return <AdminLogin />

  return (
    <BIFilterProvider>
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <ModulePageHeader
          title={title}
          icon={BarChart3}
          breadcrumbs={[{ label: 'BI / Analytics', to: '/admin/bi' }, { label: title }]}
        />
        <BIFilterBar />
        <div className="flex flex-col lg:flex-row gap-4">
          <aside className="lg:w-56 shrink-0 border rounded-lg overflow-hidden bg-card">
            {NAV_SECTIONS.map((section) => (
              <ModuleNavSection
                key={section.title}
                title={section.title}
                isExpanded={isExpanded(section.title)}
                onToggle={() => toggle(section.title)}
              >
                {section.items.map((item) => {
                  const isActive = pathname === item.to
                  return (
                    <Button
                      key={item.to}
                      variant={isActive ? 'default' : 'ghost'}
                      size="sm"
                      asChild
                      className={cn(
                        'justify-start text-xs w-full h-8',
                        isActive
                          ? 'bg-[#005B2E] text-white hover:bg-[#01361D]'
                          : 'hover:bg-[#005B2E]/5 hover:text-[#005B2E]',
                      )}
                    >
                      <Link to={item.to}>
                        <span className="mr-1.5">{item.icon}</span>
                        {item.label}
                      </Link>
                    </Button>
                  )
                })}
              </ModuleNavSection>
            ))}
          </aside>
          <div className="flex-1 min-w-0">{children}</div>
        </div>
      </div>
    </BIFilterProvider>
  )
}
