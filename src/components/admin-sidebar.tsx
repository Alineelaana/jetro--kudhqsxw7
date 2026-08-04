import { useState, type ComponentType } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth'
import { canViewSales } from '@/lib/permissions'
import {
  LayoutDashboard,
  FileText,
  Wrench,
  MessageSquare,
  Users,
  Database,
  Package,
  ShoppingCart,
  ChevronDown,
  DollarSign,
  Briefcase,
  Settings,
  Shield,
  Archive,
  Bot,
  FileSignature,
} from 'lucide-react'

type IconType = ComponentType<{ className?: string }>

interface SubItem {
  to: string
  label: string
}
interface NavItem {
  id?: string
  label: string
  icon: IconType
  to?: string
  submenu?: SubItem[]
  permission?: (role?: string) => boolean
}

const SALES_SUBMENU: SubItem[] = [
  { to: '/admin/vendas', label: 'Dashboard de Vendas' },
  { to: '/admin/vendas/pedidos', label: 'Pedidos de Venda' },
  { to: '/admin/vendas/faturamento', label: 'Faturamento' },
  { to: '/admin/vendas/nfe', label: 'Emissão de NF-e' },
  { to: '/admin/vendas/nfce', label: 'Emissão de NFC-e' },
  { to: '/admin/vendas/contratos', label: 'Contratos' },
  { to: '/admin/vendas/devolucoes', label: 'Devoluções' },
  { to: '/admin/vendas/historico', label: 'Histórico de Vendas' },
]

const SECTIONS: { title: string; items: NavItem[] }[] = [
  {
    title: 'Operacional',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'budgets', label: 'Orçamentos', icon: FileText },
      { id: 'services', label: 'Serviços', icon: Wrench },
      { id: 'chat', label: 'Chat', icon: MessageSquare },
      { id: 'partners', label: 'Parceiros', icon: Users },
    ],
  },
  {
    title: 'Área da Empresa',
    items: [
      { to: '/admin/cadastros', label: 'Cadastros', icon: Database },
      { to: '/admin/produtos', label: 'Produtos', icon: Package },
      { label: 'Vendas', icon: ShoppingCart, submenu: SALES_SUBMENU, permission: canViewSales },
      { id: 'contracts', label: 'Contratos', icon: FileSignature },
      { id: 'purchasing', label: 'Compras', icon: Briefcase },
      { id: 'pricing', label: 'Precificação', icon: DollarSign },
    ],
  },
  {
    title: 'Administração',
    items: [
      { id: 'users', label: 'Usuários', icon: Settings },
      { id: 'cms', label: 'CMS', icon: Archive },
      { id: 'audit', label: 'Auditoria', icon: Shield },
      { id: 'backups', label: 'Backups', icon: Database },
      { id: 'ai', label: 'Treinamento IA', icon: Bot },
    ],
  },
]

export function AdminSidebar({
  activeTab,
  onTabChange,
}: {
  activeTab: string
  onTabChange: (tab: string) => void
}) {
  const { user } = useAuth()
  const [openMenus, setOpenMenus] = useState<Set<string>>(new Set(['Vendas']))

  const toggleMenu = (label: string) =>
    setOpenMenus((prev) => {
      const next = new Set(prev)
      if (next.has(label)) next.delete(label)
      else next.add(label)
      return next
    })

  return (
    <nav className="flex flex-col gap-1 p-3">
      {SECTIONS.map((section) => (
        <div key={section.title}>
          <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">
            {section.title}
          </div>
          {section.items.map((item) => {
            if (item.permission && !item.permission(user?.role)) return null
            const Icon = item.icon

            if (item.submenu) {
              const isOpen = openMenus.has(item.label)
              return (
                <div key={item.label}>
                  <button
                    onClick={() => toggleMenu(item.label)}
                    className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                    <ChevronDown
                      className={cn('w-4 h-4 ml-auto transition-transform', isOpen && 'rotate-180')}
                    />
                  </button>
                  {isOpen && (
                    <div className="ml-7 flex flex-col gap-0.5 mt-0.5">
                      {item.submenu.map((sub) => (
                        <Link
                          key={sub.to}
                          to={sub.to}
                          className="px-3 py-1.5 rounded-lg text-sm text-gray-600 hover:bg-gray-100 hover:text-[#005B2E] transition-colors"
                        >
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )
            }

            if (item.to) {
              return (
                <Link
                  key={item.label}
                  to={item.to}
                  className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-[#005B2E] transition-colors"
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              )
            }

            return (
              <button
                key={item.label}
                onClick={() => onTabChange(item.id!)}
                className={cn(
                  'flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  activeTab === item.id
                    ? 'bg-[#005B2E] text-white'
                    : 'text-gray-600 hover:bg-gray-100',
                )}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            )
          })}
        </div>
      ))}
    </nav>
  )
}
