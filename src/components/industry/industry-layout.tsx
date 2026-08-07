import { NavLink, Outlet } from 'react-router-dom'
import { type ReactNode, type ComponentType } from 'react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth'
import { useModuleSections } from '@/hooks/use-module-sections'
import { ModuleNavSection } from '@/components/enterprise/module-nav-section'
import {
  Package,
  Layers,
  FlaskConical,
  Cog,
  Route,
  DollarSign,
  LayoutDashboard,
  Factory,
  ClipboardList,
  Calendar,
  CalendarClock,
  Brain,
  Activity,
  BarChart3,
  Wrench,
  ShieldCheck,
  GitBranch,
  ListOrdered,
  Crown,
  SlidersHorizontal,
} from 'lucide-react'

interface NavItem {
  to: string
  label: string
  icon: ComponentType<{ className?: string }>
  end?: boolean
}
interface NavSectionDef {
  title: string
  items: NavItem[]
}

const DASHBOARD: NavItem = {
  to: '/admin/industria',
  label: 'Dashboard',
  icon: LayoutDashboard,
  end: true,
}

const SECTIONS: NavSectionDef[] = [
  {
    title: 'Engenharia & Produto',
    items: [
      { to: '/admin/industria/catalogo', label: 'Catálogo de Itens', icon: Package },
      { to: '/admin/industria/bom', label: 'BOM / Estruturas', icon: Layers },
      { to: '/admin/industria/engenharia-bom', label: 'Engenharia BOM', icon: GitBranch },
      { to: '/admin/industria/formulacoes', label: 'Formulações', icon: FlaskConical },
      { to: '/admin/industria/engenharia', label: 'Engenharia (ECR/ECO)', icon: ShieldCheck },
    ],
  },
  {
    title: 'Planejamento (PCP)',
    items: [
      { to: '/admin/industria/recursos', label: 'Recursos Produtivos', icon: Cog },
      { to: '/admin/industria/roteiros', label: 'Roteiros de Produção', icon: Route },
      { to: '/admin/industria/capacidade', label: 'Capacidade Produtiva', icon: Calendar },
      { to: '/admin/industria/plano-mestre', label: 'Plano Mestre', icon: Calendar },
      { to: '/admin/industria/aps', label: 'APS & Cronograma', icon: CalendarClock },
      { to: '/admin/industria/planejamento', label: 'Planejamento & MRP', icon: Brain },
    ],
  },
  {
    title: 'Produção',
    items: [
      { to: '/admin/industria/ordens-producao', label: 'Ordens de Produção', icon: ClipboardList },
      { to: '/admin/industria/execucao', label: 'Execução & Apontamentos', icon: Activity },
      { to: '/admin/industria/fases', label: 'Fases de Produção', icon: ListOrdered },
    ],
  },
  {
    title: 'Qualidade & Rastreabilidade',
    items: [
      { to: '/admin/industria/qualidade', label: 'Qualidade Industrial', icon: ShieldCheck },
      { to: '/admin/industria/rastreabilidade', label: 'Rastreabilidade', icon: GitBranch },
    ],
  },
  {
    title: 'Gestão & Indicadores',
    items: [
      { to: '/admin/industria/custos', label: 'Custos Industriais', icon: DollarSign },
      { to: '/admin/industria/kpis', label: 'Indicadores (KPIs)', icon: BarChart3 },
      { to: '/admin/industria/manutencao', label: 'Manutenção', icon: Wrench },
      {
        to: '/admin/industria/calibracao',
        label: 'Calibração de Alertas',
        icon: SlidersHorizontal,
      },
      { to: '/admin/industria/executivo', label: 'Visão Executiva', icon: Crown },
    ],
  },
]

function navClass(isActive: boolean) {
  return cn(
    'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
    isActive
      ? 'bg-[#005B2E] text-white'
      : 'text-muted-foreground hover:bg-[#005B2E]/10 hover:text-[#005B2E]',
  )
}

export function IndustryLayout({ children }: { children?: ReactNode }) {
  const { user } = useAuth()
  const { isExpanded, toggle } = useModuleSections('industry', user?.id as string)
  const allItems = [DASHBOARD, ...SECTIONS.flatMap((s) => s.items)]

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="flex items-center gap-3 mb-6">
        <Factory className="w-7 h-7 text-[#005B2E]" />
        <div>
          <h1 className="text-2xl font-black text-foreground">Industrial</h1>
          <p className="text-sm text-muted-foreground">Módulo Industrial</p>
        </div>
      </div>
      <div className="flex flex-col lg:flex-row gap-6">
        <nav className="lg:w-64 shrink-0">
          <div className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
            <NavLink
              to={DASHBOARD.to}
              end={DASHBOARD.end}
              className={({ isActive }) => navClass(isActive)}
            >
              <DASHBOARD.icon className="w-4 h-4 shrink-0" />
              {DASHBOARD.label}
            </NavLink>
            <div className="hidden lg:block lg:mt-2 lg:space-y-1">
              {SECTIONS.map((section) => (
                <ModuleNavSection
                  key={section.title}
                  title={section.title}
                  isExpanded={isExpanded(section.title)}
                  onToggle={() => toggle(section.title)}
                >
                  {section.items.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={({ isActive }) => navClass(isActive)}
                    >
                      <item.icon className="w-4 h-4 shrink-0" />
                      {item.label}
                    </NavLink>
                  ))}
                </ModuleNavSection>
              ))}
            </div>
            <div className="flex lg:hidden">
              {allItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) => navClass(isActive)}
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
        </nav>
        <div className="flex-1 min-w-0">{children || <Outlet />}</div>
      </div>
    </div>
  )
}
