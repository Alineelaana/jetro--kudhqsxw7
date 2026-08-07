import { type ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { AdminLogin } from '@/components/admin-login'
import { ModulePageHeader } from '@/components/enterprise/module-page-header'
import { ModuleNavSection } from '@/components/enterprise/module-nav-section'
import { Button } from '@/components/ui/button'
import { Loader2, Calculator } from 'lucide-react'
import { cn } from '@/lib/utils'
import { canViewControladoria } from '@/lib/controladoria-permissions'
import { useModuleSections } from '@/hooks/use-module-sections'

const NAV_SECTIONS = [
  {
    title: 'Ciclo de Controladoria',
    items: [
      { to: '/admin/controladoria', label: 'Cockpit Executivo', icon: '📊', stage: 'Análise' },
      { to: '/admin/controladoria/dre', label: 'DRE', icon: '📋', stage: 'Apuração' },
      { to: '/admin/controladoria/kpis', label: 'KPIs Corporativos', icon: '📈', stage: 'Análise' },
      { to: '/admin/controladoria/drivers', label: 'Drivers', icon: '🎯', stage: 'Análise' },
      { to: '/admin/controladoria/budget', label: 'Orçamento', icon: '💰', stage: 'Orçamento' },
      { to: '/admin/controladoria/forecast', label: 'Forecast', icon: '🔮', stage: 'Análise' },
      {
        to: '/admin/controladoria/fechamento',
        label: 'Fechamento Gerencial',
        icon: '🔒',
        stage: 'Consolidação',
      },
    ],
  },
  {
    title: 'Análises',
    items: [
      {
        to: '/admin/controladoria/simulador',
        label: 'Simulador Corporativo',
        icon: '🧮',
        stage: 'Simulações',
      },
      {
        to: '/admin/controladoria/consolidacao',
        label: 'Consolidação',
        icon: '🏢',
        stage: 'Consolidação',
      },
      {
        to: '/admin/controladoria/materialidade',
        label: 'Motor de Materialidade',
        icon: '⚖️',
        stage: 'Análise',
      },
      {
        to: '/admin/controladoria/reclassificacoes',
        label: 'Reclassificações',
        icon: '🔄',
        stage: 'Apuração',
      },
      {
        to: '/admin/controladoria/visoes-salvas',
        label: 'Visões Salvas',
        icon: '🔖',
        stage: 'Análise',
      },
      {
        to: '/admin/controladoria/adapta',
        label: 'ADAPTA Financeira',
        icon: '🤖',
        stage: 'Tomada de Decisão',
      },
    ],
  },
]

export function ControladoriaLayout({ children, title }: { children: ReactNode; title: string }) {
  const { user, isAuthenticated, loading, userRole } = useAuth()
  const { pathname } = useLocation()
  const { isExpanded, toggle } = useModuleSections('controladoria', user?.id as string)

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )
  if (!isAuthenticated || !canViewControladoria(userRole)) return <AdminLogin />

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <ModulePageHeader
        title={title}
        icon={Calculator}
        breadcrumbs={[
          { label: 'Admin', to: '/admin' },
          { label: 'Controladoria' },
          { label: title },
        ]}
      />
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
  )
}
