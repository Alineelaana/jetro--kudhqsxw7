import { ADMIN_MENU } from '@/lib/admin-menu-config'
import { NAVIGATION_BASELINE, STABLE_ROUTES, isAllowedRoute } from '@/lib/navigation-baseline'

export interface ContractValidationResult {
  valid: boolean
  navigationViolations: string[]
  permissionViolations: string[]
  missingRoutes: string[]
  unauthorizedRoutes: string[]
  missingPermissions: string[]
  baselineRouteCount: number
  currentRouteCount: number
  baselinePermissionCount: number
  currentPermissionCount: number
}

export function validateNavigationContract(): ContractValidationResult {
  const currentRoutes = new Set<string>()
  for (const group of ADMIN_MENU) {
    for (const item of group.items) {
      currentRoutes.add(item.route)
      if (item.children) {
        for (const child of item.children) {
          currentRoutes.add(child.route)
        }
      }
    }
  }

  const navigationViolations: string[] = []
  const missingRoutes: string[] = []
  const unauthorizedRoutes: string[] = []

  for (const route of STABLE_ROUTES) {
    if (!currentRoutes.has(route)) {
      missingRoutes.push(route)
      navigationViolations.push(
        `MISSING_BASELINE_ROUTE: "${route}" existed in stable revision but is absent from current menu`,
      )
    }
  }

  for (const route of currentRoutes) {
    if (!isAllowedRoute(route)) {
      unauthorizedRoutes.push(route)
      navigationViolations.push(
        `UNAUTHORIZED_ROUTE: "${route}" is not in stable baseline or approved additions`,
      )
    }
  }

  const permissionViolations: string[] = []
  const missingPermissions: string[] = []

  return {
    valid: navigationViolations.length === 0 && permissionViolations.length === 0,
    navigationViolations,
    permissionViolations,
    missingRoutes,
    unauthorizedRoutes,
    missingPermissions,
    baselineRouteCount: STABLE_ROUTES.length,
    currentRouteCount: currentRoutes.size,
    baselinePermissionCount: 0,
    currentPermissionCount: 0,
  }
}

export function getBaselineSnapshot() {
  return NAVIGATION_BASELINE.map((r) => ({
    route: r.route,
    label: r.label,
    group: r.group,
    classification: r.classification,
  }))
}
