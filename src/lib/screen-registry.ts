import { ADMIN_MENU } from '@/lib/admin-menu-config'
import { NAVIGATION_BASELINE } from '@/lib/navigation-baseline'

export interface ScreenEntry {
  route: string
  label: string
  group: string
  childRoutes: string[]
  isBaseline: boolean
  isRecovered: boolean
}

const RECOVERED_ROUTES = new Set<string>([
  '/admin/precificacao',
  '/admin/auditoria',
  '/admin/controladoria',
  '/admin/verbas-fornecedores',
])

export function buildScreenRegistry(): ScreenEntry[] {
  const baselineRoutes = new Set(NAVIGATION_BASELINE.map((r) => r.route))
  const entries: ScreenEntry[] = []

  for (const group of ADMIN_MENU) {
    for (const item of group.items) {
      entries.push({
        route: item.route,
        label: item.label,
        group: group.title,
        childRoutes: item.children?.map((c) => c.route) ?? [],
        isBaseline: baselineRoutes.has(item.route),
        isRecovered: RECOVERED_ROUTES.has(item.route),
      })
      if (item.children) {
        for (const child of item.children) {
          entries.push({
            route: child.route,
            label: child.label,
            group: group.title,
            childRoutes: [],
            isBaseline: false,
            isRecovered: false,
          })
        }
      }
    }
  }

  for (const base of NAVIGATION_BASELINE) {
    if (!entries.some((e) => e.route === base.route)) {
      entries.push({
        route: base.route,
        label: base.label,
        group: base.group,
        childRoutes: [],
        isBaseline: true,
        isRecovered: RECOVERED_ROUTES.has(base.route),
      })
    }
  }

  return entries
}

export const SCREEN_REGISTRY: ScreenEntry[] = buildScreenRegistry()

export function findScreenByRoute(route: string): ScreenEntry | undefined {
  return SCREEN_REGISTRY.find((s) => s.route === route)
}

export function findScreensByName(name: string): ScreenEntry[] {
  const normalized = name.toLowerCase().trim()
  if (!normalized) return []
  return SCREEN_REGISTRY.filter(
    (s) => s.label.toLowerCase().includes(normalized) || normalized.includes(s.label.toLowerCase()),
  )
}

export function findScreensByRoutePrefix(route: string): ScreenEntry[] {
  if (!route) return []
  return SCREEN_REGISTRY.filter(
    (s) => s.route === route || route.startsWith(s.route + '/') || s.childRoutes.includes(route),
  )
}

export function getBaselineScreens(): ScreenEntry[] {
  return SCREEN_REGISTRY.filter((s) => s.isBaseline)
}

export function getRecoveredScreens(): ScreenEntry[] {
  return SCREEN_REGISTRY.filter((s) => s.isRecovered)
}
