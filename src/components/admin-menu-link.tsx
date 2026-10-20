import { type ComponentType } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import { type MenuEntry } from '@/lib/admin-menu-config'

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
  const visible = !entry.perm || entry.perm(userRole)
  if (!visible) return null

  // Se o item tem filhos, mas todos os filhos estão restritos por permissão, oculta o grupo inteiro
  const visibleChildren = hasChildren
    ? entry.children!.filter((child) => !child.perm || child.perm(userRole))
    : []
  if (hasChildren && visibleChildren.length === 0) {
    return null
  }

  const linkClass = cn(
    'flex-1 flex items-center gap-2 px-3 py-1.5 rounded text-sm transition-colors',
    isActive || isChildActive
      ? 'bg-[#003D30] text-white font-semibold'
      : 'text-gray-600 hover:bg-gray-100 hover:text-[#003D30]',
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
            <Icon className="w-4 h-4 shrink-0" />
            <span className="truncate flex-1">{entry.label}</span>
            <ChevronDown
              className={cn(
                'w-3.5 h-3.5 transition-transform duration-150 shrink-0',
                isActive || isChildActive ? 'text-white/80' : 'text-gray-400',
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
            className="p-1 rounded hover:bg-gray-100 shrink-0"
            title={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
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
          <div className="ml-4 mt-0.5 border-l border-gray-200 pl-2 space-y-0.5 animate-in fade-in-50 duration-150">
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
                      ? 'bg-[#003D30]/10 text-[#003D30] font-semibold'
                      : 'text-gray-500 hover:text-[#003D30] hover:bg-gray-50',
                  )}
                >
                  {ChildIcon && <ChildIcon className="w-3.5 h-3.5 shrink-0" />}
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
        <Icon className="w-4 h-4 shrink-0" />
        <span className="truncate flex-1">{entry.label}</span>
      </Link>
      <button
        type="button"
        onClick={() => onToggleFavorite(favKey)}
        className="p-1 rounded hover:bg-gray-100 shrink-0"
        title={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
      >
        <Star
          className={cn('w-3 h-3', isFavorite ? 'fill-amber-400 text-amber-400' : 'text-gray-300')}
        />
      </button>
    </div>
  )
}
