import { type ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { AdminLogin } from '@/components/admin-login'
import { ModulePageHeader } from '@/components/enterprise/module-page-header'
import { ModuleNavSection } from '@/components/enterprise/module-nav-section'
import { Button } from '@/components/ui/button'
import { Loader2, Target } from 'lucide-react'
import { cn } from '@/lib/utils'
import { canViewStrategic } from '@/lib/strategic-permissions'
import { useModuleSections } from '@/hooks/use-module-sections'
import { AdminBackButton } from '@/components/admin-back-button'

const NAV_SECTIONS = [
  {
    title: 'Principal',
    items: [
      { to: '/admin/estrategia', label: 'Dashboard Executivo', icon: '📊' },
      { to: '/admin/estrategia/sala-decisao', label: 'Sala de Decisão', icon: '🎯' },
    ],
  },
  {
    title: 'Gestão',
    items: [
      { to: '/admin/estrategia/gestao', label: 'Iniciativas', icon: '📋' },
      { to: '/admin/estrategia/okrs', label: 'OKRs', icon: '🎯' },
      { to: '/admin/estrategia/roadmap', label: 'Roadmap', icon: '🗺️' },
      { to: '/admin/estrategia/projetos', label: 'Projetos', icon: '📁' },
      { to: '/admin/estrategia/business-case', label: 'Business Case', icon: '💼' },
    ],
  },
  {
    title: 'Crescimento',
    items: [
      { to: '/admin/estrategia/growth', label: 'Growth', icon: '🚀' },
      {
        to: '/admin/estrategia/inteligencia-mercado',
        label: 'Inteligência de Mercado',
        icon: '📡',
      },
      { to: '/admin/estrategia/radar', label: 'Radar de Oportunidades', icon: '🔍' },
    ],
  },
  {
    title: 'Digital',
    items: [
      { to: '/admin/estrategia/jornada-digital', label: 'Jornada Digital', icon: '🛤️' },
      { to: '/admin/estrategia/transformacao-digital', label: 'Transformação Digital', icon: '💻' },
    ],
  },
  {
    title: 'Centros',
    items: [
      { to: '/admin/estrategia/indicadores', label: 'Indicadores', icon: '📈' },
      { to: '/admin/estrategia/relatorios', label: 'Relatórios', icon: '📑' },
      { to: '/admin/estrategia/decisoes', label: 'Decisões', icon: '⚡' },
    ],
  },
]

export function StrategicLayout({ children, title }: { children: ReactNode; title: string }) {
  const { user, isAuthenticated, loading, userRole } = useAuth()
  const { pathname } = useLocation()
  const { isExpanded, toggle } = useModuleSections('estrategia', user?.id as string)

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )
  if (!isAuthenticated || !canViewStrategic(userRole)) return <AdminLogin />

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="mb-2">
        <AdminBackButton fallback="/admin" label="Voltar" />
      </div>
      <ModulePageHeader
        title={title}
        icon={Target}
        breadcrumbs={[{ label: 'Admin', to: '/admin' }, { label: 'Estratégia' }, { label: title }]}
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
