import { useState, useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ChevronDown, Search, PanelLeftClose, PanelLeftOpen, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth'
import { useMenuFavorites } from '@/hooks/use-menu-favorites'
import { useSidebarMode } from '@/hooks/use-sidebar-mode'
import { ADMIN_MENU, type MenuEntry } from '@/lib/admin-menu-config'
import { MenuLink } from '@/components/admin-menu-link'
import { Input } from '@/components/ui/input'
import logoJetro from '@/assets/whatsapp-image-2026-08-09-at-23.25.57-7232a.jpeg'

interface SearchResult {
  label: string
  route: string
  parent: string
}

export function AdminSidebar() {
  const { pathname } = useLocation()
  const { user, userRole } = useAuth()
  const [activeArea, setActiveArea] = useState<string | null>(null)
  const { isFavorite, toggleFavorite } = useMenuFavorites(user?.id as string)
  const { collapsed, toggle: toggleSidebar } = useSidebarMode(user?.id as string)
  const [searchQuery, setSearchQuery] = useState('')
  const isSearching = searchQuery.trim().length > 0

  const toggleArea = (key: string) => {
    setActiveArea((prev) => (prev === key ? null : key))
  }

  const searchResults = useMemo<SearchResult[]>(() => {
    if (!isSearching) return []
    const q = searchQuery.toLowerCase()
    const results: SearchResult[] = []
    for (const group of ADMIN_MENU) {
      for (const item of group.items) {
        if (item.perm && !item.perm(userRole)) continue
        if (item.label.toLowerCase().includes(q))
          results.push({ label: item.label, route: item.route, parent: group.title })
        if (item.children) {
          for (const child of item.children) {
            if (child.label.toLowerCase().includes(q))
              results.push({ label: child.label, route: child.route, parent: item.label })
          }
        }
      }
    }
    return results
  }, [searchQuery, isSearching, userRole])

  const favItems = ADMIN_MENU.flatMap((g) => g.items).filter((item) => isFavorite(item.route))

  const renderItem = (item: MenuEntry) => {
    const isChildActive = item.children
      ? item.children.some((c) => pathname === c.route || pathname.startsWith(c.route + '/'))
      : false
    const isActive = !item.children && pathname === item.route
    const isExpanded = activeArea === item.route
    return (
      <MenuLink
        key={item.route}
        entry={item}
        userRole={userRole}
        isFavorite={isFavorite(item.route)}
        onToggleFavorite={toggleFavorite}
        isActive={isActive}
        isChildActive={isChildActive}
        currentPathname={pathname}
        isExpanded={isExpanded}
        onToggleExpand={toggleArea}
      />
    )
  }

  if (collapsed) {
    return (
      <div className="w-12 h-full shrink-0 border-r border-gray-200 bg-[#01361D] flex flex-col items-center py-3 gap-3 overflow-y-auto">
        <img
          src={logoJetro}
          alt="Jetro"
          className="h-8 w-auto object-contain rounded border border-[#C89B3C]/40 bg-black/20"
        />
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded hover:bg-white/10 text-white/80"
          title="Mostrar menu"
        >
          <PanelLeftOpen className="w-4 h-4 text-[#E4C46A]" />
        </button>
      </div>
    )
  }

  return (
    <aside className="w-60 h-full shrink-0 border-r border-gray-200 bg-white flex flex-col overflow-hidden">
      <div className="p-2.5 border-b border-gray-100 shrink-0 bg-[#01361D] text-white flex items-center justify-between gap-2">
        <Link to="/admin" className="flex items-center gap-2 overflow-hidden">
          <img
            src={logoJetro}
            alt="Jetro - Plataforma Inteligente de Gestão Empresarial"
            className="h-9 w-auto object-contain rounded border border-[#C89B3C]/40 bg-black/20 shadow-sm"
          />
          <div className="flex flex-col min-w-0">
            <span className="font-black text-xs text-[#E4C46A] tracking-wider truncate">JETRO</span>
            <span className="text-[10px] text-white/80 truncate">Gestão Empresarial</span>
          </div>
        </Link>
        <button
          onClick={toggleSidebar}
          className="p-1 rounded text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          title="Esconder menu"
        >
          <PanelLeftClose className="w-4 h-4" />
        </button>
      </div>

      <div className="p-2 border-b border-gray-100 shrink-0 space-y-1">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <Input
            type="text"
            placeholder="Buscar tela..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-7 pr-7 h-8 text-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2"
            >
              <X className="w-3 h-3 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-2 space-y-1">
        {isSearching ? (
          <div className="space-y-0.5">
            {searchResults.length === 0 ? (
              <div className="px-3 py-4 text-center text-xs text-gray-400">
                Nenhuma tela encontrada
              </div>
            ) : (
              searchResults.map((r) => (
                <Link
                  key={r.route}
                  to={r.route}
                  onClick={() => setSearchQuery('')}
                  className={cn(
                    'block px-3 py-1.5 rounded text-sm transition-colors',
                    pathname === r.route
                      ? 'bg-[#005B2E] text-white font-semibold'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-[#005B2E]',
                  )}
                >
                  <div className="truncate">{r.label}</div>
                  <div className="text-xs text-gray-400 truncate">{r.parent}</div>
                </Link>
              ))
            )}
          </div>
        ) : (
          <>
            {favItems.length > 0 && (
              <div className="pb-2 border-b border-gray-100">
                <div className="px-3 py-1 text-xs font-semibold text-gray-400 uppercase">
                  Favoritos
                </div>
                {favItems.map((item) => {
                  const childActive =
                    pathname.startsWith(item.route + '/') || pathname === item.route
                  const isExpanded = activeArea === item.route
                  return (
                    <MenuLink
                      key={`fav-${item.route}`}
                      entry={item}
                      userRole={userRole}
                      isFavorite={true}
                      onToggleFavorite={toggleFavorite}
                      isActive={pathname === item.route}
                      isChildActive={childActive}
                      currentPathname={pathname}
                      isExpanded={isExpanded}
                      onToggleExpand={toggleArea}
                    />
                  )
                })}
              </div>
            )}
            {ADMIN_MENU.map((group) => {
              return (
                <div key={group.title} className="border-b border-gray-100 last:border-b-0 py-1">
                  <div className="px-3 py-1 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                    {group.title}
                  </div>
                  <div className="flex flex-col gap-0.5 pb-1">{group.items.map(renderItem)}</div>
                </div>
              )
            })}
          </>
        )}
      </nav>
    </aside>
  )
}

export default AdminSidebar
