import { type ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { useModuleSections } from '@/hooks/use-module-sections'
import { AdminLogin } from '@/components/admin-login'
import { ModulePageHeader } from '@/components/enterprise/module-page-header'
import { ModuleNavSection } from '@/components/enterprise/module-nav-section'
import { Button } from '@/components/ui/button'
import { Loader2, Gauge } from 'lucide-react'
import { cn } from '@/lib/utils'
import { canViewPerformance } from '@/lib/performance-permissions'
import { MODULE_LABELS, MODULE_ICONS } from '@/lib/performance-types'

const CENTERS = Object.keys(MODULE_LABELS)

export function PerformanceLayout({ children, title }: { children: ReactNode; title: string }) {
  const { isAuthenticated, loading, userRole } = useAuth()
  const { pathname } = useLocation()
  const { isExpanded, toggle } = useModuleSections('performance', '')

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )
  if (!isAuthenticated || !canViewPerformance(userRole)) return <AdminLogin />

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <ModulePageHeader
        title={title}
        icon={Gauge}
        breadcrumbs={[{ label: 'Performance', to: '/admin/performance' }, { label: title }]}
      />
      <div className="flex flex-col lg:flex-row gap-4">
        <aside className="lg:w-56 shrink-0 border rounded-lg overflow-hidden bg-card">
          <ModuleNavSection
            title="Dashboard"
            isExpanded={isExpanded('Dashboard')}
            onToggle={() => toggle('Dashboard')}
          >
            <Button
              variant={pathname === '/admin/performance' ? 'default' : 'ghost'}
              size="sm"
              asChild
              className={cn(
                'justify-start text-xs w-full h-8',
                pathname === '/admin/performance'
                  ? 'bg-[#005B2E] text-white'
                  : 'hover:bg-[#005B2E]/5',
              )}
            >
              <Link to="/admin/performance">
                <span className="mr-1.5">📊</span> Dashboard Corporativo
              </Link>
            </Button>
          </ModuleNavSection>
          <ModuleNavSection
            title="Centros de Performance"
            isExpanded={isExpanded('Centros')}
            onToggle={() => toggle('Centros')}
          >
            {CENTERS.map((key) => {
              const to = `/admin/performance/${key}`
              const isActive = pathname === to
              return (
                <Button
                  key={key}
                  variant={isActive ? 'default' : 'ghost'}
                  size="sm"
                  asChild
                  className={cn(
                    'justify-start text-xs w-full h-8',
                    isActive ? 'bg-[#005B2E] text-white' : 'hover:bg-[#005B2E]/5',
                  )}
                >
                  <Link to={to}>
                    <span className="mr-1.5">{MODULE_ICONS[key]}</span> {MODULE_LABELS[key]}
                  </Link>
                </Button>
              )
            })}
          </ModuleNavSection>
          <ModuleNavSection
            title="Gestão"
            isExpanded={isExpanded('Gestão')}
            onToggle={() => toggle('Gestão')}
          >
            {[
              { to: '/admin/performance/gamification', label: 'Gamificação', icon: '🏆' },
              { to: '/admin/performance/config', label: 'Configurações', icon: '⚙️' },
              { to: '/admin/performance/chat', label: 'Chat IA', icon: '🤖' },
            ].map((item) => {
              const isActive = pathname === item.to
              return (
                <Button
                  key={item.to}
                  variant={isActive ? 'default' : 'ghost'}
                  size="sm"
                  asChild
                  className={cn(
                    'justify-start text-xs w-full h-8',
                    isActive ? 'bg-[#005B2E] text-white' : 'hover:bg-[#005B2E]/5',
                  )}
                >
                  <Link to={item.to}>
                    <span className="mr-1.5">{item.icon}</span> {item.label}
                  </Link>
                </Button>
              )
            })}
          </ModuleNavSection>
        </aside>
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  )
}
