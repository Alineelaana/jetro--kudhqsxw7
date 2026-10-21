import { type ComponentType } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import { type MenuEntry } from '@/lib/admin-menu-config'
import { checkProfileScreenAccess } from '@/lib/profile-permissions'

export interface MenuLinkProps {
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

export function MenuLink({
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
  const isSup = userRole?.toUpperCase() === 'SUP'

  const canAccess = (itemRoute: string, itemPerm?: (r: string | undefined) => boolean) => {
    if (!userRole) return false
    if (isSup) return true
    return checkProfileScreenAccess(userRole, itemRoute, 'v')
  }

  const visible = canAccess(entry.route, entry.perm)
  if (!visible) return null

  // Ocultar submenus sem autorização expressa no perfil
  const visibleChildren = hasChildren
    ? entry.children!.filter((child) => canAccess(child.route, child.perm))
    : []
  if (hasChildren && visibleChildren.length === 0) {
    return null
  }

  const linkClass = cn(
    'flex-1 flex items-center gap-2 px-3 py-1.5 rounded text-sm transition-colors',
    isActive || isChildActive
      ? 'bg-[#063D30] text-white font-semibold shadow-xs'
      : 'text-[#202B28] hover:bg-[#F1F4F2] hover:text-[#063D30]',
  )

  if (hasChildren) {
    return (
      <div>
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => onToggleExpand(favKey)}
            className={cn(linkClass, 'text-left w-full cursor-pointer select-none')}
          >
            <Icon
              className={cn(
                'w-4 h-4 shrink-0',
                isActive || isChildActive ? 'text-[#C69B45]' : 'text-[#66736D]',
              )}
            />
            <span className="truncate flex-1">{entry.label}</span>
            <ChevronDown
              className={cn(
                'w-3.5 h-3.5 transition-transform duration-150 shrink-0',
                isActive || isChildActive ? 'text-[#C69B45]' : 'text-[#66736D]',
                isExpanded && 'rotate-180',
              )}
            />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onToggleFavorite(favKey)
            }}
            className="p-1 rounded hover:bg-[#F1F4F2] shrink-0 cursor-pointer text-[#66736D] hover:text-[#063D30]"
            title={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          >
            <Star
              className={cn(
                'w-3 h-3',
                isFavorite ? 'fill-[#C69B45] text-[#C69B45]' : 'text-[#66736D]/60',
              )}
            />
          </button>
        </div>
        {isExpanded && (
          <div className="ml-4 mt-0.5 border-l border-[#E4EAE6] pl-2 space-y-0.5 animate-in fade-in-50 duration-150">
            {visibleChildren.map((child) => {
              const ChildIcon = child.icon as ComponentType<{ className?: string }> | undefined
              const isChildItemActive = currentPathname === child.route
              return (
                <Link
                  key={child.route}
                  to={child.route}
                  className={cn(
                    'flex items-center gap-1.5 px-2 py-1 rounded text-xs transition-colors',
                    isChildItemActive
                      ? 'bg-[#063D30] text-white font-semibold border-l-2 border-[#C69B45]'
                      : 'text-[#202B28] hover:text-[#063D30] hover:bg-[#F1F4F2]',
                  )}
                >
                  {ChildIcon && (
                    <ChildIcon
                      className={cn(
                        'w-3.5 h-3.5 shrink-0',
                        isChildItemActive ? 'text-[#C69B45]' : 'text-[#66736D]',
                      )}
                    />
                  )}
                  <span className="truncate">{child.label}</span>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-0.5">
      <Link to={entry.route} className={linkClass}>
        <Icon className={cn('w-4 h-4 shrink-0', isActive ? 'text-[#C69B45]' : 'text-[#66736D]')} />
        <span className="truncate flex-1">{entry.label}</span>
      </Link>
      <button
        type="button"
        onClick={() => onToggleFavorite(favKey)}
        className="p-1 rounded hover:bg-[#F1F4F2] shrink-0 cursor-pointer text-[#66736D] hover:text-[#063D30]"
        title={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
      >
        <Star
          className={cn(
            'w-3 h-3',
            isFavorite ? 'fill-[#C69B45] text-[#C69B45]' : 'text-[#66736D]/60',
          )}
        />
      </button>
    </div>
  )
}
