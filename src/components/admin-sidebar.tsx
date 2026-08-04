import { useState, useMemo, type ComponentType } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth'
import { canViewSales, canViewStock } from '@/lib/permissions'
import { Input } from '@/components/ui/input'
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
  Boxes,
  Search,
  X,
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

interface FlatItem {
  label: string
  to?: string
  id?: string
  parentLabel?: string
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

const STOCK_SUBMENU: SubItem[] = [
  { to: '/admin/estoque', label: 'Dashboard de Estoque' },
  { to: '/admin/estoque/movimentacoes', label: 'Movimentações' },
  { to: '/admin/estoque/inventario', label: 'Inventário' },
  { to: '/admin/estoque/transferencias', label: 'Transferências' },
  { to: '/admin/estoque/ajustes', label: 'Ajustes de Estoque' },
  { to: '/admin/estoque/lotes', label: 'Controle de Lotes' },
  { to: '/admin/estoque/validade', label: 'Controle de Validade' },
  { to: '/admin/estoque/localizacoes', label: 'Localizações' },
  { to: '/admin/estoque/separacao', label: 'Separação' },
  { to: '/admin/estoque/conferencia', label: 'Conferência' },
  { to: '/admin/estoque/expedicao', label: 'Expedição' },
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
      { label: 'Estoque', icon: Boxes, submenu: STOCK_SUBMENU, permission: canViewStock },
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
  onNavigate,
}: {
  activeTab: string
  onTabChange: (tab: string) => void
  onNavigate?: () => void
}) {
  const { user } = useAuth()
  const [search, setSearch] = useState('')
  const [openMenus, setOpenMenus] = useState<Set<string>>(new Set(['Vendas', 'Estoque']))

  const allFlatItems = useMemo<FlatItem[]>(() => {
    const items: FlatItem[] = []
    for (const section of SECTIONS) {
      for (const item of section.items) {
        if (item.permission && !item.permission(user?.role)) continue
        if (item.submenu) {
          for (const sub of item.submenu) {
            items.push({ label: sub.label, to: sub.to, parentLabel: item.label })
          }
        } else if (item.to) {
          items.push({ label: item.label, to: item.to })
        } else if (item.id) {
          items.push({ label: item.label, id: item.id })
        }
      }
    }
    return items
  }, [user?.role])

  const filteredItems = useMemo<FlatItem[] | null>(() => {
    const q = search.trim().toLowerCase()
    if (!q) return null
    return allFlatItems.filter((item) => item.label.toLowerCase().includes(q))
  }, [search, allFlatItems])

  const toggleMenu = (label: string) =>
    setOpenMenus((prev) => {
      const next = new Set(prev)
      if (next.has(label)) next.delete(label)
      else next.add(label)
      return next
    })

  const handleSearchItem = (item: FlatItem) => {
    if (item.id) {
      onTabChange(item.id)
    }
    onNavigate?.()
  }

  return (
    <nav className="flex flex-col gap-1 p-3">
      <div className="relative mb-2">
        <label htmlFor="sidebar-search" className="sr-only">
          Buscar tela
        </label>
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <Input
          id="sidebar-search"
          type="text"
          placeholder="Buscar tela..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8 pr-8 h-9 text-sm bg-gray-50 border-gray-200"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && filteredItems && filteredItems.length > 0) {
              handleSearchItem(filteredItems[0])
            }
          }}
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            aria-label="Limpar busca"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {filteredItems !== null ? (
        filteredItems.length > 0 ? (
          <div className="flex flex-col gap-0.5">
            {filteredItems.map((item, idx) => {
              if (item.to) {
                return (
                  <Link
                    key={`${item.to}-${idx}`}
                    to={item.to}
                    onClick={() => onNavigate?.()}
                    className="px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 hover:text-[#005B2E] transition-colors"
                  >
                    {item.parentLabel && (
                      <span className="text-xs text-gray-400 block">{item.parentLabel}</span>
                    )}
                    {item.label}
                  </Link>
                )
              }
              return (
                <button
                  key={`${item.id}-${idx}`}
                  onClick={() => handleSearchItem(item)}
                  className={cn(
                    'px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left w-full',
                    activeTab === item.id
                      ? 'bg-[#005B2E] text-white'
                      : 'text-gray-600 hover:bg-gray-100',
                  )}
                >
                  {item.parentLabel && (
                    <span className="text-xs text-gray-400 block">{item.parentLabel}</span>
                  )}
                  {item.label}
                </button>
              )
            })}
          </div>
        ) : (
          <div className="px-3 py-8 text-center text-sm text-gray-400">Nenhuma tela encontrada</div>
        )
      ) : (
        <>
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
                          className={cn(
                            'w-4 h-4 ml-auto transition-transform',
                            isOpen && 'rotate-180',
                          )}
                        />
                      </button>
                      {isOpen && (
                        <div className="ml-7 flex flex-col gap-0.5 mt-0.5">
                          {item.submenu.map((sub) => (
                            <Link
                              key={sub.to}
                              to={sub.to}
                              onClick={() => onNavigate?.()}
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
                      onClick={() => onNavigate?.()}
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
        </>
      )}
    </nav>
  )
}
