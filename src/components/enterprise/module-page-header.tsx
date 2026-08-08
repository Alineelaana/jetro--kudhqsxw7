import { type ReactNode, type ComponentType } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ChevronRight } from 'lucide-react'
import { useBackNavigation } from '@/hooks/use-back-navigation'

interface BreadcrumbItem {
  label: string
  to?: string
}

interface ModulePageHeaderProps {
  title: string
  icon?: ComponentType<{ className?: string }>
  breadcrumbs?: BreadcrumbItem[]
  backTo?: string
  backLabel?: string
  children?: ReactNode
}

export function ModulePageHeader({
  title,
  icon: Icon,
  breadcrumbs = [],
  backTo = '/admin',
  backLabel = 'Voltar ao painel',
  children,
}: ModulePageHeaderProps) {
  const goBack = useBackNavigation(backTo)
  return (
    <div className="mb-6 space-y-3">
      {breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-1 text-xs text-muted-foreground">
          {breadcrumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1">
              {crumb.to ? (
                <Link to={crumb.to} className="hover:text-foreground transition-colors">
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-foreground font-medium">{crumb.label}</span>
              )}
              {i < breadcrumbs.length - 1 && <ChevronRight className="w-3 h-3" />}
            </span>
          ))}
        </nav>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="ghost" onClick={goBack}>
            <ArrowLeft className="w-4 h-4 mr-1" /> {backLabel}
          </Button>
          {Icon && (
            <div className="flex items-center gap-2">
              <Icon className="w-5 h-5 text-[#005B2E]" />
              <h2 className="text-xl font-black text-foreground">{title}</h2>
            </div>
          )}
          {!Icon && <h2 className="text-xl font-black text-foreground">{title}</h2>}
        </div>
        {children && <div className="flex items-center gap-2">{children}</div>}
      </div>
    </div>
  )
}
