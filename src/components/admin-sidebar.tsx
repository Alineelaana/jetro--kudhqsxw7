import { useState, useMemo, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Search,
  PanelLeftClose,
  PanelLeftOpen,
  X,
  ChevronRight,
  Star,
  ExternalLink,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth'
import { useMenuFavorites } from '@/hooks/use-menu-favorites'
import { useSidebarMode } from '@/hooks/use-sidebar-mode'
import { useUserPreferences } from '@/hooks/use-user-preferences'
import { useIsMobile } from '@/hooks/use-mobile'
import { ADMIN_MENU, type MenuEntry, type MenuChild } from '@/lib/admin-menu-config'
import { MenuLink } from '@/components/admin-menu-link'
import { Input } from '@/components/ui/input'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import logoJetro from '@/assets/whatsapp-image-2026-08-09-at-23.25.57-7232a.jpeg'

interface SearchResult {
  label: string
  route: string
  parent: string
}

interface AdminSidebarProps {
  onMobileClose?: () => void
}

export function AdminSidebar({ onMobileClose }: AdminSidebarProps = {}) {
  const { pathname } = useLocation()
  const { user, userRole } = useAuth()
  const isMobile = useIsMobile()

  // Accordion centralizado: apenas uma área expandida por vez no modo expandido
  const [activeArea, setActiveArea] = useState<string | null>(null)

  // Submenu flutuante no modo rail (ao clicar no ícone)
  const [railFlyoutArea, setRailFlyoutArea] = useState<string | null>(null)
  const flyoutRef = useRef<HTMLDivElement>(null)

  const { preferences, updatePreference } = useUserPreferences()
  const { isFavorite, toggleFavorite } = useMenuFavorites(user?.id as string)
  const { isRail: localIsRail, toggle: toggleSidebarLocal } = useSidebarMode(user?.id as string)

  // O estado do sidebar sincroniza com as preferências do usuário
  const isRail = !preferences.sidebarExpanded
  const toggleSidebar = () => {
    updatePreference('sidebarExpanded', !preferences.sidebarExpanded)
    toggleSidebarLocal()
  }

  const [searchQuery, setSearchQuery] = useState('')
  const isSearching = searchQuery.trim().length > 0

  // No rail, não resetamos railFlyoutArea se o pathname ainda pertencer à mesma área de menu
  useEffect(() => {
    if (railFlyoutArea) {
      const isStillInArea = pathname === railFlyoutArea || pathname.startsWith(railFlyoutArea + '/')
      if (!isStillInArea) {
        setRailFlyoutArea(null)
      }
    }
  }, [pathname, railFlyoutArea])

  // Fechar flyout ao clicar fora
  useEffect(() => {
    if (!railFlyoutArea) return
    const handleClickOutside = (e: MouseEvent) => {
      if (flyoutRef.current && !flyoutRef.current.contains(e.target as Node)) {
        setRailFlyoutArea(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [railFlyoutArea])

  const toggleArea = (key: string) => {
    setActiveArea((prev) => (prev === key ? null : key))
  }

  // Helper para verificar se um item ou seus filhos estão na rota atual
  const isItemActive = (item: MenuEntry): boolean => {
    if (pathname === item.route || pathname.startsWith(item.route + '/')) return true
    if (item.children) {
      return item.children.some((c) => pathname === c.route || pathname.startsWith(c.route + '/'))
    }
    return false
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
            if (child.perm && !child.perm(userRole)) continue
            if (child.label.toLowerCase().includes(q))
              results.push({ label: child.label, route: child.route, parent: item.label })
          }
        }
      }
    }
    return results
  }, [searchQuery, isSearching, userRole])

  const favItems = ADMIN_MENU.flatMap((g) => g.items).filter((item) => isFavorite(item.route))

  // Referências para os containers de scroll do sidebar
  const expandedNavRef = useRef<HTMLElement>(null)
  const railNavRef = useRef<HTMLElement>(null)
  const flyoutNavRef = useRef<HTMLDivElement>(null)

  // Guardar posição de scroll do sidebar entre renderizações e navegações
  const savedScrollRef = useRef<{
    expanded: number
    rail: number
    flyouts: Record<string, number>
  }>({
    expanded: 0,
    rail: 0,
    flyouts: {},
  })

  // Flag para evitar que restaurações de scroll sobrescrevam a posição com 0 durante renderizações intermediárias
  const isRestoringRef = useRef(false)

  // Quando o usuário rola o menu expandido, armazenamos a posição
  const handleExpandedScroll = () => {
    if (isRestoringRef.current) return
    if (expandedNavRef.current) {
      savedScrollRef.current.expanded = expandedNavRef.current.scrollTop
    }
  }

  // Quando o usuário rola a barra rail, armazenamos a posição
  const handleRailScroll = () => {
    if (isRestoringRef.current) return
    if (railNavRef.current) {
      savedScrollRef.current.rail = railNavRef.current.scrollTop
    }
  }

  // Quando o usuário rola o flyout, armazenamos a posição da respectiva área
  const handleFlyoutScroll = () => {
    if (isRestoringRef.current) return
    if (flyoutNavRef.current && railFlyoutArea) {
      savedScrollRef.current.flyouts[railFlyoutArea] = flyoutNavRef.current.scrollTop
    }
  }

  // Preservar e restaurar posição de scroll entre renderizações e trocas de rota
  useEffect(() => {
    const restoreScrolls = () => {
      isRestoringRef.current = true
      try {
        if (!isSearching && expandedNavRef.current && savedScrollRef.current.expanded > 0) {
          expandedNavRef.current.scrollTop = savedScrollRef.current.expanded
        }
        if (railNavRef.current && savedScrollRef.current.rail > 0) {
          railNavRef.current.scrollTop = savedScrollRef.current.rail
        }
        if (
          railFlyoutArea &&
          flyoutNavRef.current &&
          savedScrollRef.current.flyouts[railFlyoutArea]
        ) {
          flyoutNavRef.current.scrollTop = savedScrollRef.current.flyouts[railFlyoutArea]
        }
      } finally {
        isRestoringRef.current = false
      }
    }

    restoreScrolls()
    const timer1 = setTimeout(restoreScrolls, 0)
    const timer2 = setTimeout(restoreScrolls, 50)
    const timer3 = setTimeout(restoreScrolls, 150)
    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
    }
  }, [pathname, isSearching, railFlyoutArea])

  // Objeto do item atualmente aberto no flyout (rail)
  const flyoutItem = useMemo<MenuEntry | null>(() => {
    if (!railFlyoutArea) return null
    for (const group of ADMIN_MENU) {
      for (const item of group.items) {
        if (item.route === railFlyoutArea) return item
      }
    }
    return null
  }, [railFlyoutArea])

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

  // Em mobile, mantemos a visualização completa ou drawer
  const effectiveRail = isRail && !isMobile

  return (
    <div className="relative flex h-full shrink-0" ref={flyoutRef}>
      <aside
        data-tour-id="admin-sidebar-nav"
        className={cn(
          'border-r bg-card transition-all duration-300 flex flex-col shrink-0 h-full select-none relative',
          effectiveRail ? 'w-16' : preferences.sidebarWidth === 'compact' ? 'w-56' : 'w-64',
        )}
      >
        {' '}
        {/* Cabeçalho do Sidebar */}
        <div
          className={cn(
            'border-b border-[#002817] shrink-0 bg-[#01361D] text-white flex items-center transition-all duration-200',
            effectiveRail
              ? 'p-2 flex-col gap-2 justify-center py-2.5'
              : 'p-2.5 justify-between gap-2',
          )}
        >
          {effectiveRail ? (
            <>
              <Link
                to="/admin"
                className="flex items-center justify-center p-0.5 rounded hover:opacity-90 transition-opacity"
                title="JETRO Gestão Empresarial"
              >
                <img
                  src={logoJetro}
                  alt="Jetro"
                  className="h-8 w-8 object-cover rounded-md border border-[#C89B3C]/50 bg-black/20 shadow-sm"
                />
              </Link>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={toggleSidebar}
                    className="p-1.5 rounded-md text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                    aria-label="Expandir menu lateral"
                  >
                    <PanelLeftOpen className="w-4 h-4 text-[#E4C46A]" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">Fixar menu expandido</TooltipContent>
              </Tooltip>
            </>
          ) : (
            <>
              <Link to="/admin" className="flex items-center gap-2 overflow-hidden min-w-0">
                <img
                  src={logoJetro}
                  alt="Jetro - Plataforma Inteligente de Gestão Empresarial"
                  className="h-9 w-auto object-contain rounded border border-[#C89B3C]/40 bg-black/20 shadow-sm shrink-0"
                />
                <div className="flex flex-col min-w-0">
                  <span className="font-black text-xs text-[#E4C46A] tracking-wider truncate">
                    JETRO
                  </span>
                  <span className="text-[10px] text-white/80 truncate">Gestão Empresarial</span>
                </div>
              </Link>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={toggleSidebar}
                    className="p-1 rounded text-white/70 hover:text-white hover:bg-white/10 transition-colors shrink-0"
                    aria-label="Recolher menu lateral (modo rail)"
                  >
                    <PanelLeftClose className="w-4 h-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">Recolher menu (modo rail)</TooltipContent>
              </Tooltip>
            </>
          )}
        </div>
        {/* MODO RAIL (ÍCONES COMPACTOS) */}
        {effectiveRail ? (
          <>
            <nav
              ref={railNavRef}
              onScroll={handleRailScroll}
              className="flex-1 overflow-y-auto overscroll-contain py-2 px-1 flex flex-col items-center gap-1"
            >
              {ADMIN_MENU.map((group, groupIdx) => {
                const visibleItems = group.items.filter((item) => !item.perm || item.perm(userRole))
                if (visibleItems.length === 0) return null

                return (
                  <div
                    key={group.title}
                    className={cn(
                      'w-full flex flex-col items-center gap-1',
                      groupIdx > 0 && 'pt-1.5 mt-1 border-t border-gray-100',
                    )}
                  >
                    {visibleItems.map((item) => {
                      const Icon = item.icon
                      const active = isItemActive(item)
                      const isFlyoutOpen = railFlyoutArea === item.route
                      const hasChildren = !!item.children && item.children.length > 0

                      if (hasChildren) {
                        return (
                          <Tooltip key={item.route}>
                            <TooltipTrigger asChild>
                              <button
                                type="button"
                                onClick={() => {
                                  setRailFlyoutArea((prev) =>
                                    prev === item.route ? null : item.route,
                                  )
                                }}
                                className={cn(
                                  'relative w-11 h-10 rounded-lg flex items-center justify-center transition-all group',
                                  active
                                    ? 'bg-[#005B2E]/10 text-[#005B2E] font-semibold shadow-xs'
                                    : isFlyoutOpen
                                      ? 'bg-gray-100 text-[#005B2E]'
                                      : 'text-gray-600 hover:bg-gray-100 hover:text-[#005B2E]',
                                )}
                                aria-label={item.label}
                              >
                                {active && (
                                  <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-[#005B2E] rounded-r-sm" />
                                )}
                                <Icon className="w-5 h-5 shrink-0" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="right" className="font-medium">
                              <div className="flex items-center gap-1.5">
                                <span>{item.label}</span>
                                <ChevronRight className="w-3 h-3 text-gray-400" />
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        )
                      }

                      return (
                        <Tooltip key={item.route}>
                          <TooltipTrigger asChild>
                            <Link
                              to={item.route}
                              onClick={() => setRailFlyoutArea(null)}
                              className={cn(
                                'relative w-11 h-10 rounded-lg flex items-center justify-center transition-all group',
                                active
                                  ? 'bg-[#005B2E]/10 text-[#005B2E] font-semibold shadow-xs'
                                  : 'text-gray-600 hover:bg-gray-100 hover:text-[#005B2E]',
                              )}
                              aria-label={item.label}
                            >
                              {active && (
                                <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-[#005B2E] rounded-r-sm" />
                              )}
                              <Icon className="w-5 h-5 shrink-0" />
                            </Link>
                          </TooltipTrigger>
                          <TooltipContent side="right" className="font-medium">
                            {item.label}
                          </TooltipContent>
                        </Tooltip>
                      )
                    })}
                  </div>
                )
              })}
            </nav>
          </>
        ) : (
          /* MODO EXPANDIDO (COMPORTAMENTO ACCORDION COMPLETO) */
          <>
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

            <nav
              ref={expandedNavRef}
              onScroll={handleExpandedScroll}
              className="flex-1 overflow-y-auto overscroll-contain p-2 space-y-1"
            >
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
                      <div
                        key={group.title}
                        className="border-b border-gray-100 last:border-b-0 py-1"
                      >
                        <div className="px-3 py-1 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                          {group.title}
                        </div>
                        <div className="flex flex-col gap-0.5 pb-1">
                          {group.items.map(renderItem)}
                        </div>
                      </div>
                    )
                  })}
                </>
              )}
            </nav>
          </>
        )}
      </aside>

      {/* PAINEL FLUTUANTE (OVERLAY/POPOVER) QUANDO CLICA EM ÁREA NO MODO RAIL */}
      {effectiveRail && flyoutItem && flyoutItem.children && (
        <div className="absolute left-16 top-0 bottom-0 z-40 w-64 bg-white border-r border-gray-200 shadow-xl flex flex-col animate-in fade-in slide-in-from-left-2 duration-150">
          {/* Header do submenu flutuante */}
          <div className="p-3 border-b border-gray-100 bg-gray-50/80 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-md bg-[#005B2E]/10 text-[#005B2E] flex items-center justify-center shrink-0">
                <flyoutItem.icon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-gray-900 truncate">
                  {flyoutItem.label}
                </div>
                <div className="text-[10px] text-gray-500">
                  {flyoutItem.children.length} itens disponíveis
                </div>
              </div>
            </div>
            <button
              onClick={() => setRailFlyoutArea(null)}
              className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-200/60 transition-colors"
              aria-label="Fechar submenu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Atalho para a rota principal do item caso ela exista diretamente */}
          <div className="p-2 border-b border-gray-100 bg-white">
            <Link
              to={flyoutItem.route}
              className={cn(
                'flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors',
                pathname === flyoutItem.route
                  ? 'bg-[#005B2E] text-white'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-[#005B2E]',
              )}
            >
              <span>Acessar visão geral</span>
              <ExternalLink className="w-3 h-3 opacity-70" />
            </Link>
          </div>

          {/* Lista de submenus com scroll interno independente */}
          <div
            ref={flyoutNavRef}
            onScroll={handleFlyoutScroll}
            className="flex-1 overflow-y-auto overscroll-contain p-2 space-y-0.5"
          >
            {flyoutItem.children.map((child: MenuChild) => {
              if (child.perm && !child.perm(userRole)) return null
              const ChildIcon = child.icon
              const isChildActive = pathname === child.route
              return (
                <Link
                  key={child.route}
                  to={child.route}
                  className={cn(
                    'flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs transition-colors',
                    isChildActive
                      ? 'bg-[#005B2E]/10 text-[#005B2E] font-semibold'
                      : 'text-gray-600 hover:text-[#005B2E] hover:bg-gray-50',
                  )}
                >
                  {ChildIcon ? (
                    <ChildIcon className="w-3.5 h-3.5 shrink-0 text-gray-400 group-hover:text-[#005B2E]" />
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-300 shrink-0" />
                  )}
                  <span className="truncate flex-1">{child.label}</span>
                </Link>
              )
            })}
          </div>

          {/* Rodapé do painel flutuante */}
          <div className="p-2 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between shrink-0">
            <button
              onClick={() => toggleFavorite(flyoutItem.route)}
              className="flex items-center gap-1.5 text-[11px] text-gray-500 hover:text-[#005B2E] px-2 py-1 rounded hover:bg-white"
            >
              <Star
                className={cn(
                  'w-3.5 h-3.5',
                  isFavorite(flyoutItem.route) ? 'fill-amber-400 text-amber-400' : 'text-gray-400',
                )}
              />
              <span>{isFavorite(flyoutItem.route) ? 'Favoritado' : 'Favoritar área'}</span>
            </button>
            <button
              onClick={toggleSidebar}
              className="text-[11px] text-[#005B2E] hover:underline font-medium px-2 py-1"
            >
              Fixar menu
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminSidebar
