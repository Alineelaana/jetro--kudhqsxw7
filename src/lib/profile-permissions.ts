import pb from '@/lib/pocketbase/client'
import { ADMIN_MENU, type MenuGroup, type MenuEntry } from '@/lib/admin-menu-config'
import { SCREEN_REGISTRY, type ScreenEntry } from '@/lib/screen-registry'

export interface ScreenPermission {
  v: boolean // Visualizar
  c: boolean // Criar
  e: boolean // Editar
  d: boolean // Excluir
}

export interface ProfilePermissionsData {
  allowedMenus?: string[]
  screens?: Record<string, ScreenPermission>
  [key: string]: unknown
}

export interface PerfilPermissaoRecord {
  id: string
  code: string
  name: string
  description?: string
  active?: boolean
  permissions?: ProfilePermissionsData | Record<string, unknown>
  responsible_user?: string
  created?: string
  updated?: string
}

export interface SystemMenuItem {
  id: string
  label: string
  route: string
  group: string
  parentLabel?: string
  isSubmenu?: boolean
}

export interface SystemScreenItem {
  id: string
  label: string
  route: string
  group: string
  parentLabel?: string
}

/**
 * Retorna todos os menus e submenus do sistema derivados da estrutura oficial do ADMIN_MENU.
 */
export function getAllSystemMenus(): {
  groups: { name: string; items: SystemMenuItem[] }[]
  allItems: SystemMenuItem[]
} {
  const allItems: SystemMenuItem[] = []
  const groups: { name: string; items: SystemMenuItem[] }[] = []

  for (const group of ADMIN_MENU) {
    const groupItems: SystemMenuItem[] = []

    for (const item of group.items) {
      const topItem: SystemMenuItem = {
        id: item.route,
        label: item.label,
        route: item.route,
        group: group.title,
        isSubmenu: false,
      }
      groupItems.push(topItem)
      allItems.push(topItem)

      if (item.children && item.children.length > 0) {
        for (const child of item.children) {
          const childItem: SystemMenuItem = {
            id: child.route,
            label: child.label,
            route: child.route,
            group: group.title,
            parentLabel: item.label,
            isSubmenu: true,
          }
          groupItems.push(childItem)
          allItems.push(childItem)
        }
      }
    }

    groups.push({
      name: group.title,
      items: groupItems,
    })
  }

  return { groups, allItems }
}

/**
 * Retorna todas as telas do sistema para busca global de telas em todo o ERP.
 * Combina SCREEN_REGISTRY com ADMIN_MENU, garantindo que mesmo telas fora de menus fiquem buscáveis.
 */
export function getAllSystemScreens(): SystemScreenItem[] {
  const map = new Map<string, SystemScreenItem>()

  // 1. Inserir a partir do ADMIN_MENU
  for (const group of ADMIN_MENU) {
    for (const item of group.items) {
      if (!map.has(item.route)) {
        map.set(item.route, {
          id: item.route,
          label: item.label,
          route: item.route,
          group: group.title,
        })
      }
      if (item.children) {
        for (const child of item.children) {
          if (!map.has(child.route)) {
            map.set(child.route, {
              id: child.route,
              label: child.label,
              route: child.route,
              group: group.title,
              parentLabel: item.label,
            })
          }
        }
      }
    }
  }

  // 2. Inserir telas adicionais do SCREEN_REGISTRY (inclui telas técnicas e recuperadas)
  for (const s of SCREEN_REGISTRY) {
    if (!map.has(s.route)) {
      map.set(s.route, {
        id: s.route,
        label: s.label,
        route: s.route,
        group: s.group,
      })
    }
  }

  return Array.from(map.values()).sort((a, b) =>
    a.label.localeCompare(b.label, 'pt-BR', { sensitivity: 'base' }),
  )
}

/**
 * Busca perfis de permissão do banco real
 */
export async function getPerfisPermissoes(): Promise<PerfilPermissaoRecord[]> {
  try {
    const list = await pb.collection('perfis_permissoes').getFullList<PerfilPermissaoRecord>({
      sort: 'name',
    })
    return list
  } catch (err) {
    console.warn('Erro ao carregar perfis_permissoes:', err)
    return []
  }
}

/**
 * Salva ou atualiza um perfil de permissão
 */
export async function savePerfilPermissao(
  id: string | null,
  data: {
    name: string
    code: string
    description?: string
    active?: boolean
    permissions: ProfilePermissionsData
  },
): Promise<PerfilPermissaoRecord> {
  const payload = {
    name: data.name.trim(),
    code: data.code.trim().toUpperCase(),
    description: data.description || '',
    active: data.active !== false,
    permissions: data.permissions,
  }

  if (id) {
    return pb.collection('perfis_permissoes').update<PerfilPermissaoRecord>(id, payload)
  }
  return pb.collection('perfis_permissoes').create<PerfilPermissaoRecord>(payload)
}

/**
 * Exclui um perfil de permissão (SUP não pode ser excluído)
 */
export async function deletePerfilPermissao(id: string, code: string): Promise<void> {
  if (code.toUpperCase() === 'SUP') {
    throw new Error('O perfil SUP (Superusuário) é vital para o sistema e não pode ser excluído.')
  }
  await pb.collection('perfis_permissoes').delete(id)
}

// Cache local em memória de perfis para verificação rápida em runtime
let profilesCache: PerfilPermissaoRecord[] | null = null
let lastProfilesFetch = 0

export async function loadProfilesCache(force = false): Promise<PerfilPermissaoRecord[]> {
  const now = Date.now()
  if (!force && profilesCache && now - lastProfilesFetch < 30000) {
    return profilesCache
  }
  profilesCache = await getPerfisPermissoes()
  lastProfilesFetch = now
  return profilesCache
}

/**
 * Verifica se um usuário com dado perfil pode acessar um menu ou tela.
 * Regra obrigatória: o perfil SUP tem acesso total e irrestrito a todas as telas.
 */
export function checkProfileScreenAccess(
  userRole: string | undefined,
  route: string,
  operation: 'v' | 'c' | 'e' | 'd' = 'v',
  profilesList?: PerfilPermissaoRecord[],
): boolean {
  if (!userRole) return false
  const upper = userRole.toUpperCase()
  // SUP sempre tem acesso irrestrito
  if (upper === 'SUP') return true

  const profiles = profilesList || profilesCache
  if (!profiles || profiles.length === 0) {
    // Se ainda não carregou o cache, manter comportamento permissivo para o perfil se rota pertencer ao escopo padrão
    return true
  }

  const profile = profiles.find((p) => p.code?.toUpperCase() === upper)
  if (!profile) return false

  const perms = (profile.permissions || {}) as ProfilePermissionsData

  // Mapeamento de rotas equivalentes/legadas (ex: /admin/configuracoes/permissoes -> /admin/cadastros/perfis-permissoes)
  const equivalentRoutes = [route]
  if (route === '/admin/cadastros/perfis-permissoes') {
    equivalentRoutes.push('/admin/configuracoes/permissoes')
  } else if (route === '/admin/configuracoes/permissoes') {
    equivalentRoutes.push('/admin/cadastros/perfis-permissoes')
  }

  // 1. Checar se alguma rota equivalente tem permissão pontual configurada
  if (perms.screens) {
    for (const r of equivalentRoutes) {
      if (perms.screens[r]) {
        const screenPerm = perms.screens[r]
        if (typeof screenPerm[operation] === 'boolean') {
          return screenPerm[operation]
        }
      }
    }
  }

  // 2. Se a operação for 'v' (visualizar), checar se o menu foi marcado
  if (operation === 'v' && perms.allowedMenus && perms.allowedMenus.length > 0) {
    for (const r of equivalentRoutes) {
      if (perms.allowedMenus.includes(r)) {
        return true
      }
      // Checar se rota pai foi permitida
      const isChildOfAllowed = perms.allowedMenus.some(
        (m) => r.startsWith(m + '/') || m.startsWith(r + '/'),
      )
      if (isChildOfAllowed) return true
    }
  }

  // Se o perfil não tem customização de allowedMenus nem screens, não bloqueia
  if (!perms.allowedMenus && !perms.screens) {
    return true
  }

  return false
}
