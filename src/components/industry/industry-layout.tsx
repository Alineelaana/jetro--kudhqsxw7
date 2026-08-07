import { NavLink, Outlet } from 'react-router-dom'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import {
  Package,
  FileCheck,
  ArrowLeftRight,
  Layers,
  FlaskConical,
  Cog,
  Route,
  DollarSign,
  LayoutDashboard,
  Factory,
  ClipboardList,
  Calendar,
  Brain,
  Activity,
  BarChart3,
  Wrench,
  ShieldCheck,
  GitBranch,
} from 'lucide-react'

const NAV_ITEMS = [
  { to: '/admin/industria', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/industria/catalogo', label: 'Catálogo de Itens', icon: Package },
  { to: '/admin/industria/especificacoes', label: 'Especificações', icon: FileCheck },
  { to: '/admin/industria/conversoes', label: 'Conversões de Unidade', icon: ArrowLeftRight },
  { to: '/admin/industria/bom', label: 'BOM / Estruturas', icon: Layers },
  { to: '/admin/industria/formulacoes', label: 'Formulações', icon: FlaskConical },
  { to: '/admin/industria/recursos', label: 'Recursos Produtivos', icon: Cog },
  { to: '/admin/industria/roteiros', label: 'Roteiros de Produção', icon: Route },
  { to: '/admin/industria/capacidade', label: 'Capacidade Produtiva', icon: Calendar },
  { to: '/admin/industria/planejamento', label: 'Planejamento & MRP', icon: Brain },
  { to: '/admin/industria/custos', label: 'Custos Industriais', icon: DollarSign },
  { to: '/admin/industria/ordens-producao', label: 'Ordens de Produção', icon: ClipboardList },
  { to: '/admin/industria/execucao', label: 'Execução & Apontamentos', icon: Activity },
  { to: '/admin/industria/qualidade', label: 'Qualidade Industrial', icon: ShieldCheck },
  { to: '/admin/industria/rastreabilidade', label: 'Rastreabilidade', icon: GitBranch },
  { to: '/admin/industria/kpis', label: 'Indicadores (KPIs)', icon: BarChart3 },
  { to: '/admin/industria/manutencao', label: 'Manutenção', icon: Wrench },
]

export function IndustryLayout({ children }: { children?: ReactNode }) {
  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="flex items-center gap-3 mb-6">
        <Factory className="w-7 h-7 text-[#005B2E]" />
        <div>
          <h1 className="text-2xl font-black text-foreground">Engenharia & Produtos</h1>
          <p className="text-sm text-muted-foreground">Módulo Indústria — Fase 0</p>
        </div>
      </div>
      <div className="flex flex-col lg:flex-row gap-6">
        <nav className="lg:w-64 shrink-0">
          <div className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
                    isActive
                      ? 'bg-[#005B2E] text-white'
                      : 'text-muted-foreground hover:bg-[#005B2E]/10 hover:text-[#005B2E]',
                  )
                }
              >
                <item.icon className="w-4 h-4 shrink-0" />
                {item.label}
              </NavLink>
            ))}
          </div>
        </nav>
        <div className="flex-1 min-w-0">{children || <Outlet />}</div>
      </div>
    </div>
  )
}
