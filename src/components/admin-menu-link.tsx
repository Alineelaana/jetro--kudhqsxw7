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

  const canAccess = (itemRoute: string) => {
    if (!userRole) return false
    if (isSup) return true
    return checkProfileScreenAccess(userRole, itemRoute, 'v')
  }

  const visible = canAccess(entry.route)
  if (!visible) return null

  // Ocultar submenus sem autorização expressa no perfil
  const visibleChildren = hasChildren
    ? entry.children!.filter((child) => canAccess(child.route))
    : []
  if (hasChildren && visibleChildren.length === 0) {
    return null
  }

  const isSelected = isActive || isChildActive
  const linkClass = cn(
    'flex-1 flex items-center gap-2 px-3 py-1.5 rounded text-sm transition-colors',
    isSelected
      ? 'bg-[var(--brand-primary,#063D30)] text-white font-semibold shadow-xs'
      : 'text-[#202B28] hover:bg-[#F1F4F2] hover:text-[var(--brand-primary,#063D30)]',
  )

  if (hasChildren) {
    return (
      <div>
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => onToggleExpand(favKey)}
            className={cn(linkClass, 'text-left w-full cursor-pointer select-none')}
            style={isSelected ? { backgroundColor: 'var(--brand-primary, #063D30)' } : undefined}
          >
            <span
              className={cn(
                'shrink-0 flex items-center',
                isSelected ? 'text-[var(--brand-secondary,#C69B45)]' : 'text-[#66736D]',
              )}
              style={isSelected ? { color: 'var(--brand-secondary, #C69B45)' } : undefined}
            >
              <Icon className="w-4 h-4 shrink-0" />
            </span>
            <span className="truncate flex-1">{entry.label}</span>
            <ChevronDown
              className={cn(
                'w-3.5 h-3.5 transition-transform duration-150 shrink-0',
                isSelected ? 'text-[var(--brand-secondary,#C69B45)]' : 'text-[#66736D]',
                isExpanded && 'rotate-180',
              )}
              style={isSelected ? { color: 'var(--brand-secondary, #C69B45)' } : undefined}
            />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onToggleFavorite(favKey)
            }}
            className="p-1 rounded hover:bg-[#F1F4F2] shrink-0 cursor-pointer text-[#66736D] hover:text-[var(--brand-primary,#063D30)]"
            title={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          >
            <Star
              className={cn(
                'w-3 h-3',
                isFavorite
                  ? 'fill-[var(--brand-secondary,#C69B45)] text-[var(--brand-secondary,#C69B45)]'
                  : 'text-[#66736D]/60',
              )}
              style={
                isFavorite
                  ? {
                      fill: 'var(--brand-secondary, #C69B45)',
                      color: 'var(--brand-secondary, #C69B45)',
                    }
                  : undefined
              }
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
                      ? 'bg-[var(--brand-primary,#063D30)] text-white font-semibold border-l-2 border-[var(--brand-secondary,#C69B45)]'
                      : 'text-[#202B28] hover:text-[var(--brand-primary,#063D30)] hover:bg-[#F1F4F2]',
                  )}
                  style={
                    isChildItemActive
                      ? {
                          backgroundColor: 'var(--brand-primary, #063D30)',
                          borderLeftColor: 'var(--brand-secondary, #C69B45)',
                        }
                      : undefined
                  }
                >
                  {ChildIcon && (
                    <span
                      className={cn(
                        'shrink-0 flex items-center',
                        isChildItemActive
                          ? 'text-[var(--brand-secondary,#C69B45)]'
                          : 'text-[#66736D]',
                      )}
                      style={
                        isChildItemActive ? { color: 'var(--brand-secondary, #C69B45)' } : undefined
                      }
                    >
                      <ChildIcon className="w-3.5 h-3.5 shrink-0" />
                    </span>
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
      <Link
        to={entry.route}
        className={linkClass}
        style={isActive ? { backgroundColor: 'var(--brand-primary, #063D30)' } : undefined}
      >
        <span
          className={cn(
            'shrink-0 flex items-center',
            isActive ? 'text-[var(--brand-secondary,#C69B45)]' : 'text-[#66736D]',
          )}
          style={isActive ? { color: 'var(--brand-secondary, #C69B45)' } : undefined}
        >
          <Icon className="w-4 h-4 shrink-0" />
        </span>
        <span className="truncate flex-1">{entry.label}</span>
      </Link>
      <button
        type="button"
        onClick={() => onToggleFavorite(favKey)}
        className="p-1 rounded hover:bg-[#F1F4F2] shrink-0 cursor-pointer text-[#66736D] hover:text-[var(--brand-primary,#063D30)]"
        title={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
      >
        <Star
          className={cn(
            'w-3 h-3',
            isFavorite
              ? 'fill-[var(--brand-secondary,#C69B45)] text-[var(--brand-secondary,#C69B45)]'
              : 'text-[#66736D]/60',
          )}
          style={
            isFavorite
              ? {
                  fill: 'var(--brand-secondary, #C69B45)',
                  color: 'var(--brand-secondary, #C69B45)',
                }
              : undefined
          }
        />
      </button>
    </div>
  )
}
