import { type ReactNode, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { AdminLogin } from '@/components/admin-login'
import { ModulePageHeader } from '@/components/enterprise/module-page-header'
import { ModuleNavSection } from '@/components/enterprise/module-nav-section'
import { Button } from '@/components/ui/button'
import { Loader2, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_SECTIONS = [
  {
    title: 'Principal',
    items: [
      { to: '/admin/crm', label: 'Dashboard', icon: '📊' },
      { to: '/admin/crm/leads', label: 'Leads', icon: '🎯' },
      { to: '/admin/crm/oportunidades', label: 'Oportunidades', icon: '💼' },
      { to: '/admin/crm/funil', label: 'Funil de Vendas', icon: '🔻' },
      { to: '/admin/crm/funil-config', label: 'Config. Funis', icon: '⚙️' },
    ],
  },
  {
    title: 'Comercial',
    items: [
      { to: '/admin/crm/agenda', label: 'Agenda', icon: '📅' },
      { to: '/admin/crm/propostas', label: 'Propostas', icon: '📄' },
      { to: '/admin/crm/atividades', label: 'Atividades', icon: '⚡' },
      { to: '/admin/crm/historico', label: 'Histórico', icon: '📋' },
    ],
  },
  {
    title: 'Gestão',
    items: [
      { to: '/admin/crm/motivos-perda', label: 'Motivos de Perda', icon: '❌' },
      { to: '/admin/crm/metas', label: 'Metas', icon: '🏆' },
      { to: '/admin/crm/automacao', label: 'Automação', icon: '🤖' },
      { to: '/admin/crm/relatorios', label: 'Relatórios', icon: '📈' },
    ],
  },
]

export function CrmLayout({ children, title }: { children: ReactNode; title: string }) {
  const { isAuthenticated, loading } = useAuth()
  const { pathname } = useLocation()
  const [sections, setSections] = useState<Record<string, boolean>>({
    Principal: true,
    Comercial: true,
    Gestão: true,
  })

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )
  if (!isAuthenticated) return <AdminLogin />

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <ModulePageHeader
        title={title}
        icon={Users}
        breadcrumbs={[{ label: 'CRM', to: '/admin/crm' }, { label: title }]}
      />
      <div className="flex flex-col lg:flex-row gap-4">
        <aside className="lg:w-56 shrink-0 border rounded-lg overflow-hidden bg-card">
          {NAV_SECTIONS.map((section) => (
            <ModuleNavSection
              key={section.title}
              title={section.title}
              isExpanded={sections[section.title] ?? true}
              onToggle={() => setSections((p) => ({ ...p, [section.title]: !p[section.title] }))}
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
