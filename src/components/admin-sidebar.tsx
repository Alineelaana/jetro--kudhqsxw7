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
import { useBrand } from '@/hooks/use-brand'
import { useMenuFavorites } from '@/hooks/use-menu-favorites'
import { useSidebarMode } from '@/hooks/use-sidebar-mode'
import { useUserPreferences } from '@/hooks/use-user-preferences'
import { useIsMobile } from '@/hooks/use-mobile'
import { ADMIN_MENU, type MenuEntry, type MenuChild } from '@/lib/admin-menu-config'
import { checkProfileScreenAccess, loadProfilesCache } from '@/lib/profile-permissions'
import { MenuLink } from '@/components/admin-menu-link'
import { Input } from '@/components/ui/input'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { logoHuramDark } from '@/lib/brand-assets'
import { Building2, ChevronDown, Check } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

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
  const { brand, empresasDoUsuario, empresaAtivaId, setEmpresaAtivaId } = useBrand()
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

  const [, setProfilesVersion] = useState(0)

  useEffect(() => {
    loadProfilesCache(true)
      .then(() => setProfilesVersion((v) => v + 1))
      .catch(() => {})
  }, [userRole])

  // Checa se usuário tem permissão para o item de menu ou tela
  // Regra Huram: SUP é 100% irrestrito. Para todos os demais, APENAS perfis_permissoes define o acesso.
  // Setor, cargo, função legada ou regras estáticas perm() NÃO podem ampliar acesso.
  const canAccessEntry = (item: { route: string; perm?: (r: string) => boolean }): boolean => {
    if (!userRole) return false
    if (userRole.toUpperCase() === 'SUP') return true
    return checkProfileScreenAccess(userRole, item.route, 'v')
  }

  const searchResults = useMemo<SearchResult[]>(() => {
    if (!isSearching) return []
    const q = searchQuery.toLowerCase()
    const results: SearchResult[] = []
    for (const group of ADMIN_MENU) {
      for (const item of group.items) {
        if (!canAccessEntry(item)) continue
        if (item.label.toLowerCase().includes(q))
          results.push({ label: item.label, route: item.route, parent: group.title })
        if (item.children) {
          for (const child of item.children) {
            if (!canAccessEntry(child)) continue
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

  const sidebarLogoSrc = brand.logoDarkUrl || logoHuramDark
  const sidebarBrandName = brand.nomeExibicao || 'HURAM'
  const isSup = userRole?.toUpperCase() === 'SUP'
  const hasMultipleEmpresas = isSup || empresasDoUsuario.length > 1

  return (
    <div className="relative flex h-full shrink-0" ref={flyoutRef}>
      <aside
        data-tour-id="admin-sidebar-nav"
        className={cn(
          'border-r bg-card transition-all duration-300 flex flex-col shrink-0 h-full select-none relative',
          effectiveRail ? 'w-16' : preferences.sidebarWidth === 'compact' ? 'w-56' : 'w-64',
        )}
      >
        {/* Cabeçalho do Sidebar (com Logo da Marca Ativa e Nome de Exibição) */}
        <div
          className={cn(
            'border-b border-[#E4EAE6] shrink-0 bg-white text-[#202B28] flex items-center transition-all duration-200',
            effectiveRail
              ? 'p-2 flex-col gap-2 justify-center py-2.5'
              : 'p-2.5 justify-between gap-2',
          )}
        >
          {effectiveRail ? (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    to="/admin"
                    className="flex items-center justify-center p-0.5 rounded hover:opacity-90 transition-opacity"
                    title={`${sidebarBrandName} — Sistema Inteligente de Gestão`}
                  >
                    <img
                      src={sidebarLogoSrc}
                      alt={sidebarBrandName}
                      className="h-8 w-8 object-contain rounded-md border border-[#E4EAE6] bg-[#F8FAF9] shadow-2xs"
                    />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <div className="font-semibold">{sidebarBrandName}</div>
                  <div className="text-[10px] text-muted-foreground">{brand.empresaNome}</div>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={toggleSidebar}
                    className="p-1.5 rounded-md text-[#66736D] hover:text-[var(--brand-primary,#063D30)] hover:bg-[#F1F4F2] transition-colors cursor-pointer"
                    aria-label="Expandir menu lateral"
                  >
                    <PanelLeftOpen
                      className="w-4 h-4"
                      style={{ color: 'var(--brand-primary, #063D30)' }}
                    />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">Fixar menu expandido</TooltipContent>
              </Tooltip>
            </>
          ) : (
            <>
              <Link
                to="/admin"
                className="flex items-center gap-2 overflow-hidden min-w-0"
                title={`${sidebarBrandName} — ${brand.empresaNome}`}
              >
                <img
                  src={sidebarLogoSrc}
                  alt={sidebarBrandName}
                  className="h-9 w-auto max-w-[80px] object-contain rounded border border-[#E4EAE6] bg-[#F8FAF9] p-0.5 shadow-2xs shrink-0"
                />
                <div className="flex flex-col min-w-0">
                  <span
                    className="font-black text-xs tracking-wider truncate"
                    style={{ color: 'var(--brand-primary, #063D30)' }}
                  >
                    {sidebarBrandName}
                  </span>
                  <span className="text-[10px] text-[#66736D] font-medium truncate">
                    {brand.empresaNome !== sidebarBrandName
                      ? brand.empresaNome
                      : 'Sistema Inteligente de Gestão'}
                  </span>
                </div>
              </Link>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={toggleSidebar}
                    className="p-1 rounded text-[#66736D] hover:text-[var(--brand-primary,#063D30)] hover:bg-[#F1F4F2] transition-colors shrink-0 cursor-pointer"
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

        {/* Seletor rápido de empresa na sidebar (quando expandido para multiempresa/SUP) */}
        {!effectiveRail && hasMultipleEmpresas && empresasDoUsuario.length > 0 && (
          <div className="px-2 py-1.5 border-b border-[#E4EAE6] bg-[#F8FAF9]/80 shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="w-full flex items-center justify-between gap-1.5 px-2 py-1 rounded-md text-[11px] font-semibold text-[#202B28] hover:bg-white border border-[#E4EAE6] transition-colors cursor-pointer text-left shadow-2xs"
                  title="Trocar empresa ativa"
                >
                  <div className="flex items-center gap-1.5 min-w-0 truncate">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: 'var(--brand-primary, #063D30)' }}
                    />
                    <span className="truncate">{brand.empresaNome || sidebarBrandName}</span>
                  </div>
                  <ChevronDown className="w-3 h-3 text-[#66736D] shrink-0" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="w-56 bg-white text-[#202B28] border border-[#E4EAE6] shadow-lg p-1 rounded-lg z-50 text-xs"
              >
                <DropdownMenuLabel className="text-[11px] font-bold text-[#063D30] px-2 py-1">
                  Empresa Ativa
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-[#E4EAE6]" />
                <div className="max-h-52 overflow-y-auto space-y-0.5">
                  {empresasDoUsuario.map((emp) => {
                    const isSelected =
                      brand.empresaId === emp.id ||
                      (!brand.empresaId && !empresaAtivaId && emp.padrao)
                    const displayName = emp.marca_nome_exibicao || emp.nome_fantasia || emp.name

                    return (
                      <DropdownMenuItem
                        key={`sidebar-emp-${emp.id}`}
                        onClick={() => setEmpresaAtivaId(emp.id)}
                        className={cn(
                          'flex items-center justify-between px-2 py-1.5 rounded text-xs cursor-pointer',
                          isSelected
                            ? 'bg-[var(--brand-primary,#063D30)] text-white font-semibold'
                            : 'hover:bg-[#F1F4F2] text-[#202B28]',
                        )}
                        style={
                          isSelected
                            ? { backgroundColor: 'var(--brand-primary, #063D30)' }
                            : undefined
                        }
                      >
                        <span className="truncate">{displayName}</span>
                        {isSelected && <Check className="w-3 h-3 shrink-0 text-white" />}
                      </DropdownMenuItem>
                    )
                  })}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
        {/* MODO RAIL (ÍCONES COMPACTOS - FUNDO BRANCO / GELO) */}
        {effectiveRail ? (
          <>
            <nav
              ref={railNavRef}
              onScroll={handleRailScroll}
              className="flex-1 overflow-y-auto overscroll-contain py-2 px-1 flex flex-col items-center gap-1 bg-white"
            >
              {ADMIN_MENU.map((group, groupIdx) => {
                const visibleItems = group.items.filter((item) => {
                  if (!canAccessEntry(item)) {
                    // Se o item pai não foi marcado, mas tem algum filho com permissão concedida (busca pontual), permite
                    if (item.children && item.children.length > 0) {
                      const hasChild = item.children.some((c) => canAccessEntry(c))
                      if (!hasChild) return false
                    } else {
                      return false
                    }
                  } else if (item.children && item.children.length > 0) {
                    const hasVisibleChild = item.children.some((c) => canAccessEntry(c))
                    if (!hasVisibleChild) return false
                  }
                  return true
                })
                if (visibleItems.length === 0) return null

                return (
                  <div
                    key={group.title}
                    className={cn(
                      'w-full flex flex-col items-center gap-1',
                      groupIdx > 0 && 'pt-1.5 mt-1 border-t border-[#E4EAE6]',
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
                                  'relative w-11 h-10 rounded-lg flex items-center justify-center transition-all group cursor-pointer',
                                  active
                                    ? 'bg-[var(--brand-primary,#063D30)] text-white font-semibold shadow-xs'
                                    : isFlyoutOpen
                                      ? 'bg-[#E4EAE6] text-[var(--brand-primary,#063D30)]'
                                      : 'text-[#66736D] hover:bg-[#F1F4F2] hover:text-[var(--brand-primary,#063D30)]',
                                )}
                                style={
                                  active
                                    ? { backgroundColor: 'var(--brand-primary, #063D30)' }
                                    : undefined
                                }
                                aria-label={item.label}
                              >
                                {active && (
                                  <span
                                    className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-sm"
                                    style={{ backgroundColor: 'var(--brand-secondary, #C69B45)' }}
                                  />
                                )}
                                <Icon className="w-5 h-5 shrink-0" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent
                              side="right"
                              className="font-medium bg-[var(--brand-primary,#063D30)] text-white border-[var(--brand-secondary,#C69B45)]/40"
                              style={{ backgroundColor: 'var(--brand-primary, #063D30)' }}
                            >
                              <div className="flex items-center gap-1.5">
                                <span>{item.label}</span>
                                <ChevronRight
                                  className="w-3 h-3"
                                  style={{ color: 'var(--brand-secondary, #C69B45)' }}
                                />
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
                                  ? 'bg-[var(--brand-primary,#063D30)] text-white font-semibold shadow-xs'
                                  : 'text-[#66736D] hover:bg-[#F1F4F2] hover:text-[var(--brand-primary,#063D30)]',
                              )}
                              style={
                                active
                                  ? { backgroundColor: 'var(--brand-primary, #063D30)' }
                                  : undefined
                              }
                              aria-label={item.label}
                            >
                              {active && (
                                <span
                                  className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-sm"
                                  style={{ backgroundColor: 'var(--brand-secondary, #C69B45)' }}
                                />
                              )}
                              <Icon className="w-5 h-5 shrink-0" />
                            </Link>
                          </TooltipTrigger>
                          <TooltipContent
                            side="right"
                            className="font-medium bg-[var(--brand-primary,#063D30)] text-white border-[var(--brand-secondary,#C69B45)]/40"
                            style={{ backgroundColor: 'var(--brand-primary, #063D30)' }}
                          >
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
          /* MODO EXPANDIDO (COMPORTAMENTO ACCORDION COMPLETO - FUNDO BRANCO HURAM) */
          <>
            <div className="p-2 border-b border-[#E4EAE6] bg-[#F8FAF9] shrink-0 space-y-1">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#66736D]" />
                <Input
                  type="text"
                  placeholder="Buscar tela..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-7 pr-7 h-8 text-xs bg-white border-[#E4EAE6] text-[#202B28] placeholder:text-[#66736D]/70 focus-visible:ring-[var(--brand-primary,#063D30)]"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[#66736D] hover:text-[#202B28]"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            <nav
              ref={expandedNavRef}
              onScroll={handleExpandedScroll}
              className="flex-1 overflow-y-auto overscroll-contain p-2 space-y-1 bg-white text-[#202B28]"
            >
              {isSearching ? (
                <div className="space-y-0.5">
                  {searchResults.length === 0 ? (
                    <div className="px-3 py-4 text-center text-xs text-[#66736D]">
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
                            ? 'bg-[var(--brand-primary,#063D30)] text-white font-semibold border-l-2 border-[var(--brand-secondary,#C69B45)]'
                            : 'text-[#202B28] hover:bg-[#F1F4F2] hover:text-[var(--brand-primary,#063D30)]',
                        )}
                        style={
                          pathname === r.route
                            ? {
                                backgroundColor: 'var(--brand-primary, #063D30)',
                                borderLeftColor: 'var(--brand-secondary, #C69B45)',
                              }
                            : undefined
                        }
                      >
                        <div className="truncate">{r.label}</div>
                        <div className="text-xs text-[#66736D] truncate">{r.parent}</div>
                      </Link>
                    ))
                  )}
                </div>
              ) : (
                <>
                  {favItems.length > 0 && (
                    <div className="pb-2 border-b border-[#E4EAE6]">
                      <div
                        className="px-3 py-1 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5"
                        style={{ color: 'var(--brand-primary, #063D30)' }}
                      >
                        <Star
                          className="w-3 h-3"
                          style={{
                            fill: 'var(--brand-secondary, #C69B45)',
                            color: 'var(--brand-secondary, #C69B45)',
                          }}
                        />
                        <span>Favoritos</span>
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
                    const visibleGroupItems = group.items.filter((item) => {
                      if (!canAccessEntry(item)) {
                        if (item.children && item.children.length > 0) {
                          const hasChild = item.children.some((c) => canAccessEntry(c))
                          if (!hasChild) return false
                        } else {
                          return false
                        }
                      } else if (item.children && item.children.length > 0) {
                        const hasVisibleChild = item.children.some((c) => canAccessEntry(c))
                        if (!hasVisibleChild) return false
                      }
                      return true
                    })
                    if (visibleGroupItems.length === 0) return null

                    return (
                      <div
                        key={group.title}
                        className="border-b border-[#E4EAE6]/80 last:border-b-0 py-1"
                      >
                        <div
                          className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider opacity-85"
                          style={{ color: 'var(--brand-primary, #063D30)' }}
                        >
                          {group.title}
                        </div>
                        <div className="flex flex-col gap-0.5 pb-1">
                          {visibleGroupItems.map(renderItem)}
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

      {/* PAINEL FLUTUANTE (OVERLAY/POPOVER) QUANDO CLICA EM ÁREA NO MODO RAIL - FUNDO BRANCO */}
      {effectiveRail &&
        flyoutItem &&
        flyoutItem.children &&
        (() => {
          const visibleFlyoutChildren = flyoutItem.children.filter((c) => canAccessEntry(c))
          if (visibleFlyoutChildren.length === 0) return null

          return (
            <div className="absolute left-16 top-0 bottom-0 z-40 w-64 bg-white text-[#202B28] border-r border-[#E4EAE6] shadow-2xl flex flex-col animate-in fade-in slide-in-from-left-2 duration-150">
              {/* Header do submenu flutuante */}
              <div className="p-3 border-b border-[#E4EAE6] bg-[#F8FAF9] flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className="w-7 h-7 rounded-md text-white flex items-center justify-center shrink-0"
                    style={{ backgroundColor: 'var(--brand-primary, #063D30)' }}
                  >
                    <flyoutItem.icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div
                      className="text-xs font-semibold truncate"
                      style={{ color: 'var(--brand-primary, #063D30)' }}
                    >
                      {flyoutItem.label}
                    </div>
                    <div className="text-[10px] text-[#66736D]">
                      {visibleFlyoutChildren.length}{' '}
                      {visibleFlyoutChildren.length === 1 ? 'item disponível' : 'itens disponíveis'}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setRailFlyoutArea(null)}
                  className="p-1 rounded-md text-[#66736D] hover:text-[var(--brand-primary,#063D30)] hover:bg-[#E4EAE6] transition-colors cursor-pointer"
                  aria-label="Fechar submenu"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Atalho para a rota principal do item caso ela exista diretamente */}
              <div className="p-2 border-b border-[#E4EAE6] bg-white">
                <Link
                  to={flyoutItem.route}
                  className={cn(
                    'flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors',
                    pathname === flyoutItem.route
                      ? 'bg-[var(--brand-primary,#063D30)] text-white font-semibold'
                      : 'text-[#202B28] hover:bg-[#F1F4F2] hover:text-[var(--brand-primary,#063D30)]',
                  )}
                  style={
                    pathname === flyoutItem.route
                      ? { backgroundColor: 'var(--brand-primary, #063D30)' }
                      : undefined
                  }
                >
                  <span>Acessar visão geral</span>
                  <ExternalLink className="w-3 h-3 text-[#66736D]" />
                </Link>
              </div>

              {/* Lista de submenus com scroll interno independente */}
              <div
                ref={flyoutNavRef}
                onScroll={handleFlyoutScroll}
                className="flex-1 overflow-y-auto overscroll-contain p-2 space-y-0.5 bg-white"
              >
                {visibleFlyoutChildren.map((child: MenuChild) => {
                  const ChildIcon = child.icon
                  const isChildActive = pathname === child.route
                  return (
                    <Link
                      key={child.route}
                      to={child.route}
                      className={cn(
                        'flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs transition-colors',
                        isChildActive
                          ? 'bg-[var(--brand-primary,#063D30)] text-white font-semibold border-l-2 border-[var(--brand-secondary,#C69B45)]'
                          : 'text-[#202B28] hover:text-[var(--brand-primary,#063D30)] hover:bg-[#F1F4F2]',
                      )}
                      style={
                        isChildActive
                          ? {
                              backgroundColor: 'var(--brand-primary, #063D30)',
                              borderLeftColor: 'var(--brand-secondary, #C69B45)',
                            }
                          : undefined
                      }
                    >
                      {ChildIcon ? (
                        <ChildIcon
                          className="w-3.5 h-3.5 shrink-0"
                          style={
                            isChildActive ? { color: 'var(--brand-secondary, #C69B45)' } : undefined
                          }
                        />
                      ) : (
                        <span
                          className="w-1.5 h-1.5 rounded-full shrink-0"
                          style={
                            isChildActive
                              ? { backgroundColor: 'var(--brand-secondary, #C69B45)' }
                              : undefined
                          }
                        />
                      )}
                      <span className="truncate flex-1">{child.label}</span>
                    </Link>
                  )
                })}
              </div>

              {/* Rodapé do painel flutuante */}
              <div className="p-2 border-t border-[#E4EAE6] bg-[#F8FAF9] flex items-center justify-between shrink-0">
                <button
                  onClick={() => toggleFavorite(flyoutItem.route)}
                  className="flex items-center gap-1.5 text-[11px] text-[#66736D] hover:text-[var(--brand-primary,#063D30)] px-2 py-1 rounded hover:bg-[#E4EAE6] cursor-pointer"
                >
                  <Star
                    className="w-3.5 h-3.5"
                    style={
                      isFavorite(flyoutItem.route)
                        ? {
                            fill: 'var(--brand-secondary, #C69B45)',
                            color: 'var(--brand-secondary, #C69B45)',
                          }
                        : undefined
                    }
                  />
                  <span>{isFavorite(flyoutItem.route) ? 'Favoritado' : 'Favoritar área'}</span>
                </button>
                <button
                  onClick={toggleSidebar}
                  className="text-[11px] hover:underline font-semibold px-2 py-1 cursor-pointer"
                  style={{ color: 'var(--brand-primary, #063D30)' }}
                >
                  Fixar menu
                </button>
              </div>
            </div>
          )
        })()}
    </div>
  )
}

export default AdminSidebar
