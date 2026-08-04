import {
  useState,
  useMemo,
  useEffect,
  type ComponentType,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth'
import { useMenuHistory } from '@/hooks/use-menu-history'
import { canViewSales, canViewStock } from '@/lib/permissions'
import { Input } from '@/components/ui/input'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
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

function getItemKey(item: FlatItem): string {
  return item.to || item.id || item.label
}

export function AdminSidebar({
  activeTab,
  onTabChange,
  onNavigate,
  collapsed = false,
}: {
  activeTab: string
  onTabChange: (tab: string) => void
  onNavigate?: () => void
  collapsed?: boolean
}) {
  const { user } = useAuth()
  const [search, setSearch] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const [openMenus, setOpenMenus] = useState<Set<string>>(new Set(['Vendas', 'Estoque']))
  const [searchOpen, setSearchOpen] = useState(false)
  const { history, recordVisit } = useMenuHistory(user?.id as string)

  const allFlatItems = useMemo<FlatItem[]>(() => {
    const items: FlatItem[] = []
    for (const section of SECTIONS) {
      for (const item of section.items) {
        if (item.permission && !item.permission(user?.role as string)) continue
        if (item.submenu) {
          for (const sub of item.submenu)
            items.push({ label: sub.label, to: sub.to, parentLabel: item.label })
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
    const matches = allFlatItems.filter((item) => item.label.toLowerCase().includes(q))
    matches.sort((a, b) => {
      const aKey = getItemKey(a)
      const bKey = getItemKey(b)
      const aCount = history[aKey]?.count || 0
      const bCount = history[bKey]?.count || 0
      if (bCount !== aCount) return bCount - aCount
      const aLast = history[aKey]?.lastVisited || 0
      const bLast = history[bKey]?.lastVisited || 0
      return bLast - aLast
    })
    return matches
  }, [search, allFlatItems, history])

  useEffect(() => {
    setActiveIndex(0)
  }, [search])

  const toggleMenu = (label: string) =>
    setOpenMenus((prev) => {
      const next = new Set(prev)
      if (next.has(label)) next.delete(label)
      else next.add(label)
      return next
    })

  const handleTabChange = (tab: string) => {
    recordVisit(tab)
    onTabChange(tab)
  }

  const handleSearchItem = (item: FlatItem) => {
    recordVisit(getItemKey(item))
    if (item.id) onTabChange(item.id)
    onNavigate?.()
    setSearch('')
    setSearchOpen(false)
  }

  const handleKeyDown = (e: ReactKeyboardEvent) => {
    if (!filteredItems || filteredItems.length === 0) {
      if (e.key === 'Escape') {
        e.preventDefault()
        setSearch('')
      }
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((prev) => (prev + 1) % filteredItems.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const item = filteredItems[activeIndex]
      if (item) handleSearchItem(item)
    } else if (e.key === 'Escape') {
      e.preventDefault()
      setSearch('')
    }
  }

  const renderSearchResults = (onClose?: () => void) => {
    if (!filteredItems) return null
    if (filteredItems.length === 0)
      return (
        <div className="px-3 py-8 text-center text-sm text-gray-400">Nenhuma tela encontrada</div>
      )
    return (
      <div className="flex flex-col gap-0.5">
        {filteredItems.map((item, idx) => {
          const isActive = idx === activeIndex
          const visits = history[getItemKey(item)]?.count || 0
          if (item.to)
            return (
              <Link
                key={`${item.to}-${idx}`}
                to={item.to}
                onClick={() => {
                  recordVisit(item.to!)
                  onNavigate?.()
                  setSearch('')
                  onClose?.()
                }}
                className={cn(
                  'px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between',
                  isActive
                    ? 'bg-gray-100 text-[#005B2E]'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-[#005B2E]',
                )}
              >
                <span>
                  {item.parentLabel && (
                    <span className="text-xs text-gray-400 block">{item.parentLabel}</span>
                  )}
                  {item.label}
                </span>
                {visits > 0 && <span className="text-xs text-amber-500">★</span>}
              </Link>
            )
          return (
            <button
              key={`${item.id}-${idx}`}
              onClick={() => handleSearchItem(item)}
              className={cn(
                'px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left w-full flex items-center justify-between',
                isActive ? 'bg-[#005B2E] text-white' : 'text-gray-600 hover:bg-gray-100',
              )}
            >
              <span>
                {item.parentLabel && (
                  <span className="text-xs text-gray-400 block">{item.parentLabel}</span>
                )}
                {item.label}
              </span>
              {visits > 0 && <span className="text-xs text-amber-400">★</span>}
            </button>
          )
        })}
      </div>
    )
  }

  if (collapsed) {
    return (
      <nav className="flex flex-col items-center gap-1 p-2">
        <Popover open={searchOpen} onOpenChange={setSearchOpen}>
          <PopoverTrigger asChild>
            <button
              className="flex items-center justify-center w-10 h-10 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
              aria-label="Buscar tela"
            >
              <Search className="w-4 h-4" />
            </button>
          </PopoverTrigger>
          <PopoverContent side="right" align="start" className="w-72 p-3">
            <div className="relative mb-2">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                autoFocus
                type="text"
                placeholder="Buscar tela..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pl-8 pr-8 h-9 text-sm bg-gray-50 border-gray-200"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {renderSearchResults(() => setSearchOpen(false))}
            </div>
          </PopoverContent>
        </Popover>

        <div className="h-px w-6 bg-gray-200 my-1" />

        {SECTIONS.map((section) => (
          <div key={section.title} className="flex flex-col items-center gap-1">
            {section.items.map((item) => {
              if (item.permission && !item.permission(user?.role as string)) return null
              const Icon = item.icon

              if (item.submenu) {
                return (
                  <div key={item.label} className="relative group">
                    <button
                      onClick={() => toggleMenu(item.label)}
                      className={cn(
                        'flex items-center justify-center w-10 h-10 rounded-lg transition-colors',
                        openMenus.has(item.label)
                          ? 'bg-gray-100 text-[#005B2E]'
                          : 'text-gray-600 hover:bg-gray-100',
                      )}
                    >
                      <Icon className="w-4 h-4" />
                    </button>
                    <div
                      className={cn(
                        'absolute left-full ml-2 top-0 z-50 bg-white rounded-lg shadow-lg border p-1 min-w-[200px]',
                        openMenus.has(item.label) ? 'block' : 'hidden group-hover:block',
                      )}
                    >
                      <div className="px-3 py-1 text-xs font-semibold text-gray-400 uppercase">
                        {item.label}
                      </div>
                      {item.submenu.map((sub) => (
                        <Link
                          key={sub.to}
                          to={sub.to}
                          onClick={() => {
                            recordVisit(sub.to)
                            onNavigate?.()
                          }}
                          className="block px-3 py-1.5 rounded-lg text-sm text-gray-600 hover:bg-gray-100 hover:text-[#005B2E] transition-colors"
                        >
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )
              }

              if (item.to) {
                return (
                  <Tooltip key={item.label}>
                    <TooltipTrigger asChild>
                      <Link
                        to={item.to}
                        onClick={() => {
                          recordVisit(item.to!)
                          onNavigate?.()
                        }}
                        className="flex items-center justify-center w-10 h-10 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-[#005B2E] transition-colors"
                      >
                        <Icon className="w-4 h-4" />
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right">{item.label}</TooltipContent>
                  </Tooltip>
                )
              }

              return (
                <Tooltip key={item.label}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => handleTabChange(item.id!)}
                      className={cn(
                        'flex items-center justify-center w-10 h-10 rounded-lg transition-colors',
                        activeTab === item.id
                          ? 'bg-[#005B2E] text-white'
                          : 'text-gray-600 hover:bg-gray-100',
                      )}
                    >
                      <Icon className="w-4 h-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right">{item.label}</TooltipContent>
                </Tooltip>
              )
            })}
          </div>
        ))}
      </nav>
    )
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
          onKeyDown={handleKeyDown}
          className="pl-8 pr-8 h-9 text-sm bg-gray-50 border-gray-200"
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
          renderSearchResults()
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
                if (item.permission && !item.permission(user?.role as string)) return null
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
                              onClick={() => {
                                recordVisit(sub.to)
                                onNavigate?.()
                              }}
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
                      onClick={() => {
                        recordVisit(item.to!)
                        onNavigate?.()
                      }}
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
                    onClick={() => handleTabChange(item.id!)}
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
