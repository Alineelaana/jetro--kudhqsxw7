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
    profilesCacheFailed = false
    return list
  } catch (err) {
    console.warn('Erro ao carregar perfis_permissoes:', err)
    profilesCacheFailed = true
    // Cache volta a null para não servir lista vazia como válida nas próximas chamadas
    profilesCache = null
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
// Marca que a ÚLTIMA consulta ao banco falhou (erro de rede/servidor).
// Usada para fail-open de VISUALIZAÇÃO: menu nunca pode ficar vazio por falha de consulta.
let profilesCacheFailed = false

export async function loadProfilesCache(force = false): Promise<PerfilPermissaoRecord[]> {
  const now = Date.now()
  // Só honra o TTL quando há cache real e populado; cache vazio (falha anterior) refetch sempre
  if (!force && profilesCache && profilesCache.length > 0 && now - lastProfilesFetch < 30000) {
    return profilesCache
  }
  let list = await getPerfisPermissoes()
  // Uma tentativa extra em caso de falha transitória (rede/token expirado renovado)
  if (list.length === 0) {
    await new Promise((resolve) => setTimeout(resolve, 500))
    list = await getPerfisPermissoes()
  }
  profilesCache = list
  lastProfilesFetch = Date.now()
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
  const trimmed = userRole.trim()
  const upper = trimmed.toUpperCase()

  // SUP sempre tem acesso irrestrito
  if (upper === 'SUP') return true

  // Home básica (/admin ou /admin/) é permitida para qualquer usuário autenticado com perfil válido
  const normalizedRoute = route.split('?')[0].replace(/\/+$/, '') || '/'
  if (normalizedRoute === '/admin' && operation === 'v') {
    return true
  }

  const profiles = profilesList || profilesCache
  if (!profiles || profiles.length === 0) {
    // Fail-open controlado APENAS para visualização quando a consulta dos perfis
    // FALHOU (token expirado/rede/servidor): um usuário legítimo não pode ficar com
    // o menu lateral vazio. Em vez de liberar tudo, usa o fallback estático do papel.
    if (profilesCacheFailed) {
      return hasStaticAccess(upper, normalizedRoute, operation)
    }
    // Comportamento padrão seguro: SEM cache/dados -> NEGAR por segurança
    return false
  }

  // Busca o perfil por id, por code ou por name (case-insensitive)
  const profile = profiles.find((p) => {
    if (p.id === trimmed) return true
    const pCode = (p.code || '').trim().toUpperCase()
    if (pCode === upper) return true
    const pName = (p.name || '').trim().toUpperCase()
    if (pName === upper) return true
    return false
  })

  // Perfil desativado explicitamente -> NEGAR sempre
  if (profile && profile.active === false) return false

  // Perfil inexistente na tabela (ex.: vínculo removido, empresa/usuário recém-criado
  // sem perfil configurado): fallback estático do papel. Para papéis desconhecidos o
  // fallback devolve lista vazia e o acesso continua negado — sem risco de escalação.
  if (!profile) {
    return hasStaticAccess(upper, normalizedRoute, operation)
  }

  const perms = (profile.permissions || {}) as ProfilePermissionsData

  // Mapeamento de rotas equivalentes/legadas
  const equivalentRoutes = [normalizedRoute]
  if (normalizedRoute === '/admin/cadastros/perfis-permissoes') {
    equivalentRoutes.push('/admin/configuracoes/permissoes')
  } else if (normalizedRoute === '/admin/configuracoes/permissoes') {
    equivalentRoutes.push('/admin/cadastros/perfis-permissoes')
  }

  // 1. Checar se alguma rota equivalente tem permissão pontual configurada (screens)
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

  // Se a operação NÃO for visualização e não foi explicitamente concedida em screens:
  // para 'c', 'e', 'd', se o menu foi autorizado e não há restrição pontual explícita,
  // conceder apenas se o menu está permitido. Caso contrário, negar.
  if (operation !== 'v') {
    // Se a permissão pontual não definiu, checar se a tela é visualizável; se não for, nega.
    const canView = checkProfileScreenAccess(userRole, route, 'v', profiles)
    if (!canView) return false
    // Se a tela é visualizável e não foi negada pontualmente, herda permissão de operação do perfil
    return true
  }

  // 2. Se a operação for 'v' (visualizar), checar se o menu foi marcado
  if (perms.allowedMenus && Array.isArray(perms.allowedMenus)) {
    const allowed = perms.allowedMenus.map((m) => m.split('?')[0].replace(/\/+$/, '') || '/')

    for (const r of equivalentRoutes) {
      // Casamento exato
      if (allowed.includes(r)) {
        return true
      }
      // Casamento por prefixo seguro de módulo (ex: /admin/rh/colaboradores pertence a /admin/rh).
      // NUNCA casar /admin como prefixo genérico de tudo — apenas sub-rotas específicas (ex: /admin/rh, /admin/dp, etc.)
      const isUnderAllowedModule = allowed.some((m) => {
        if (m === '/admin' || m === '/' || !m) return false
        return r === m || r.startsWith(m + '/')
      })
      if (isUnderAllowedModule) return true
    }
  }

  // Comportamento padrão seguro Huram: se não foi explicitamente autorizado em allowedMenus ou screens -> NEGAR.
  // EXCEÇÃO (bug do menu vazio, v0.0.693): perfil EXISTENTE e ATIVO SEM configuração dinâmica
  // (allowedMenus vazio/ausente E screens vazio/ausente — perfil recém-criado ou legado).
  // Nesse caso, para VISUALIZAÇÃO, usa o fallback estático do papel (mesmas listas de
  // src/lib/permissions.ts), garantindo que o menu lateral nunca fique vazio para um
  // usuário legítimo. Perfis COM configuração dinâmica continuam negando fora dela, e as
  // operações c/e/d do fallback estático continuam NEGADAS (somente leitura).
  if (!hasProfileDynamicConfig(perms)) {
    return hasStaticAccess(upper, normalizedRoute, operation)
  }

  return false
}

/**
 * Verifica acesso de visualização via permissões estáticas do papel
 * (as mesmas funções perm() que montam o ADMIN_MENU em src/lib/admin-menu-config.ts).
 * Leitura (v) apenas: criação/edição/exclusão nunca são concedidas pelo fallback.
 */
function hasStaticAccess(
  roleUpper: string,
  normalizedRoute: string,
  operation: 'v' | 'c' | 'e' | 'd',
): boolean {
  if (operation !== 'v') return false

  const equivalentRoutes = [normalizedRoute]
  if (normalizedRoute === '/admin/cadastros/perfis-permissoes') {
    equivalentRoutes.push('/admin/configuracoes/permissoes')
  } else if (normalizedRoute === '/admin/configuracoes/permissoes') {
    equivalentRoutes.push('/admin/cadastros/perfis-permissoes')
  }

  const staticAllowed = getStaticMenusForRole(roleUpper)
  for (const r of equivalentRoutes) {
    if (staticAllowed.includes(r)) return true
    const isUnderAllowedModule = staticAllowed.some(
      (m) => m !== '/admin' && m !== '/' && !!m && (r === m || r.startsWith(m + '/')),
    )
    if (isUnderAllowedModule) return true
  }
  return false
}

/**
 * Um perfil tem configuração dinâmica quando define allowedMenus ou screens não vazios.
 */
function hasProfileDynamicConfig(perms: ProfilePermissionsData): boolean {
  const hasMenus = Array.isArray(perms.allowedMenus) && perms.allowedMenus.length > 0
  const hasScreens = !!perms.screens && Object.keys(perms.screens).length > 0
  return hasMenus || hasScreens
}

/**
 * Deriva menus permitidos a partir das permissões estáticas do módulo (src/lib/permissions.ts),
 * usadas como fallback quando o perfil não tem configuração dinâmica (allowedMenus/screens).
 */
function getStaticMenusForRole(roleUpper: string): string[] {
  const menus: string[] = []
  for (const group of ADMIN_MENU) {
    for (const item of group.items) {
      if (item.perm && item.perm(roleUpper)) {
        menus.push(item.route)
      }
      if (item.children) {
        for (const child of item.children) {
          if (child.perm && child.perm(roleUpper)) {
            menus.push(child.route)
          }
        }
        // Um item com filhos tem o pai autorizado quando QUALQUER filho tem permissão
        if (!item.perm && item.children.some((c) => c.perm && c.perm(roleUpper))) {
          menus.push(item.route)
        }
        // Filhos sem perm própria herdam do pai já autorizado
        if (item.perm && item.perm(roleUpper)) {
          for (const child of item.children) {
            if (!child.perm) menus.push(child.route)
          }
        }
      }
    }
  }
  return menus
}
