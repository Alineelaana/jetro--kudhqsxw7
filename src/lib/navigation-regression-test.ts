import { ADMIN_MENU, type MenuGroup, type MenuEntry } from '@/lib/admin-menu-config'
import { STABLE_ROUTES, ALL_ALLOWED_ROUTES } from '@/lib/navigation-baseline'

export interface FlatMenuItem {
  label: string
  route: string
  group: string
  hasChildren: boolean
  childRoutes: string[]
}

export function flattenMenu(menu: MenuGroup[]): FlatMenuItem[] {
  return menu.flatMap((group) =>
    group.items.map((item: MenuEntry) => ({
      label: item.label,
      route: item.route,
      group: group.title,
      hasChildren: !!item.children?.length,
      childRoutes: item.children?.map((c) => c.route) ?? [],
    })),
  )
}

export function validateAgainstBaseline(): {
  valid: boolean
  missing: string[]
  unauthorized: string[]
} {
  const current = new Set(getCurrentNavigationSnapshot().map((i) => i.route))
  const missing = STABLE_ROUTES.filter((r) => !current.has(r))
  const unauthorized = [...current].filter((r) => !ALL_ALLOWED_ROUTES.includes(r))
  return { valid: missing.length === 0 && unauthorized.length === 0, missing, unauthorized }
}

export interface NavigationDiff {
  disappeared: FlatMenuItem[]
  appeared: FlatMenuItem[]
  unchanged: FlatMenuItem[]
}

export function compareNavigation(before: FlatMenuItem[], after: FlatMenuItem[]): NavigationDiff {
  const beforeRoutes = new Set(before.map((item) => item.route))
  const afterRoutes = new Set(after.map((item) => item.route))

  const disappeared = before.filter((item) => !afterRoutes.has(item.route))
  const appeared = after.filter((item) => !beforeRoutes.has(item.route))
  const unchanged = after.filter((item) => beforeRoutes.has(item.route))

  return { disappeared, appeared, unchanged }
}

export function getCurrentNavigationSnapshot(): FlatMenuItem[] {
  return flattenMenu(ADMIN_MENU)
}

export interface NavigationValidationResult {
  valid: boolean
  violations: string[]
  diff: NavigationDiff
}

export function validateNavigationChange(
  before: FlatMenuItem[],
  after: FlatMenuItem[],
  explicitlyRemoved: string[] = [],
): NavigationValidationResult {
  const diff = compareNavigation(before, after)
  const violations: string[] = []

  for (const item of diff.disappeared) {
    if (!explicitlyRemoved.includes(item.route)) {
      violations.push(
        `REGRESSION: "${item.label}" (${item.route}) in group "${item.group}" disappeared without explicit removal`,
      )
    }
  }

  for (const item of diff.unchanged) {
    const beforeChildRoutes = new Set(before.find((b) => b.route === item.route)?.childRoutes ?? [])
    const afterChildRoutes = new Set(item.childRoutes)
    const lostChildren = [...beforeChildRoutes].filter((r) => !afterChildRoutes.has(r))
    for (const childRoute of lostChildren) {
      if (!explicitlyRemoved.includes(childRoute)) {
        violations.push(
          `REGRESSION: Child route "${childRoute}" under "${item.label}" (${item.route}) disappeared without explicit removal`,
        )
      }
    }
  }

  return {
    valid: violations.length === 0,
    violations,
    diff,
  }
}

export function snapshotToJson(snapshot: FlatMenuItem[]): string {
  return JSON.stringify(snapshot, null, 2)
}

export function jsonToSnapshot(json: string): FlatMenuItem[] {
  return JSON.parse(json) as FlatMenuItem[]
}
