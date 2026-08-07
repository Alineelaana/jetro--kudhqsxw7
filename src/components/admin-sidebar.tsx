import { type ComponentType } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ChevronDown, Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth'
import { useModuleSections } from '@/hooks/use-module-sections'
import { useMenuFavorites } from '@/hooks/use-menu-favorites'
import { ADMIN_MENU, type MenuEntry } from '@/lib/admin-menu-config'

interface MenuLinkProps {
  entry: MenuEntry
  userRole: string | undefined
  isFavorite: boolean
  onToggleFavorite: (key: string) => void
  isActive: boolean
  isChildActive: boolean
  currentPathname: string
  isExpanded: boolean
  onToggleExpand: (key: string) => void
}

function MenuLink({
  entry,
  userRole,
  isFavorite,
  onToggleFavorite,
  isActive,
  isChildActive,
  currentPathname,
  isExpanded,
  onToggleExpand,
}: MenuLinkProps) {
  const Icon = entry.icon as ComponentType<{ className?: string }>
  const hasChildren = !!entry.children?.length
  const favKey = entry.route
  const visible = !entry.perm || entry.perm(userRole)
  if (!visible) return null

  const linkClass = cn(
    'flex-1 flex items-center gap-2 px-3 py-1.5 rounded text-sm transition-colors',
    isActive || isChildActive
      ? 'bg-[#005B2E] text-white font-semibold'
      : 'text-gray-600 hover:bg-gray-100 hover:text-[#005B2E]',
  )

  if (hasChildren) {
    return (
      <div>
        <div className="flex items-center">
          <Link to={entry.route} className={linkClass}>
            <Icon className="w-4 h-4 shrink-0" />
            <span className="truncate">{entry.label}</span>
          </Link>
          <button onClick={() => onToggleExpand(favKey)} className="p-1 rounded hover:bg-gray-100">
            <ChevronDown
              className={cn(
                'w-3.5 h-3.5 transition-transform text-gray-400',
                isExpanded && 'rotate-180',
              )}
            />
          </button>
          <button
            onClick={() => onToggleFavorite(favKey)}
            className="p-1 rounded hover:bg-gray-100"
          >
            <Star
              className={cn(
                'w-3 h-3',
                isFavorite ? 'fill-amber-400 text-amber-400' : 'text-gray-300',
              )}
            />
          </button>
        </div>
        {isExpanded && (
          <div className="ml-4 mt-0.5 border-l border-gray-200 pl-2 space-y-0.5">
            {entry.children!.map((child) => (
              <Link
                key={child.route}
                to={child.route}
                className={cn(
                  'block px-2 py-1 rounded text-xs transition-colors',
                  currentPathname === child.route
                    ? 'bg-[#005B2E]/10 text-[#005B2E] font-semibold'
                    : 'text-gray-500 hover:text-[#005B2E] hover:bg-gray-50',
                )}
              >
                {child.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex items-center">
      <Link to={entry.route} className={linkClass}>
        <Icon className="w-4 h-4 shrink-0" />
        <span className="truncate">{entry.label}</span>
      </Link>
      <button onClick={() => onToggleFavorite(favKey)} className="p-1 rounded hover:bg-gray-100">
        <Star
          className={cn('w-3 h-3', isFavorite ? 'fill-amber-400 text-amber-400' : 'text-gray-300')}
        />
      </button>
    </div>
  )
}

export function AdminSidebar() {
  const { pathname } = useLocation()
  const { user, userRole } = useAuth()
  const { isExpanded, toggle } = useModuleSections('admin-sidebar', user?.id as string)
  const { isExpanded: isItemExpanded, toggle: toggleItem } = useModuleSections(
    'admin-sidebar-items',
    user?.id as string,
  )
  const { isFavorite, toggleFavorite } = useMenuFavorites(user?.id as string)

  const favItems = ADMIN_MENU.flatMap((g) => g.items).filter((item) => isFavorite(item.route))

  const renderItem = (item: MenuEntry) => {
    const isActive = pathname === item.route
    const isChildActive = item.children
      ? pathname.startsWith(item.route + '/') || pathname === item.route
      : false
    const itemExpanded = isItemExpanded(item.route) || isChildActive
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
        isExpanded={itemExpanded}
        onToggleExpand={toggleItem}
      />
    )
  }

  return (
    <aside className="w-60 shrink-0 border-r border-gray-200 bg-white h-[calc(100vh-3.5rem)] sticky top-14 overflow-y-auto">
      <nav className="p-2 space-y-1">
        {favItems.length > 0 && (
          <div className="pb-2 border-b border-gray-100">
            <div className="px-3 py-1 text-xs font-semibold text-gray-400 uppercase">Favoritos</div>
            {favItems.map((item) => {
              const childActive = pathname.startsWith(item.route + '/') || pathname === item.route
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
                  isExpanded={isItemExpanded(item.route) || childActive}
                  onToggleExpand={toggleItem}
                />
              )
            })}
          </div>
        )}
        {ADMIN_MENU.map((group) => {
          const expanded =
            isExpanded(group.title) || group.items.some((item) => pathname.startsWith(item.route))
          return (
            <div key={group.title} className="border-b border-gray-100 last:border-b-0">
              <button
                onClick={() => toggle(group.title)}
                className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide hover:text-gray-600"
              >
                {group.title}
                <ChevronDown
                  className={cn('w-3.5 h-3.5 transition-transform', expanded && 'rotate-180')}
                />
              </button>
              {expanded && (
                <div className="flex flex-col gap-0.5 pb-2">{group.items.map(renderItem)}</div>
              )}
            </div>
          )
        })}
      </nav>
    </aside>
  )
}

export default AdminSidebar
