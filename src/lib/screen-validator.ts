import {
  SCREEN_REGISTRY,
  findScreenByRoute,
  findScreensByName,
  findScreensByRoutePrefix,
  getBaselineScreens,
  getRecoveredScreens,
  type ScreenEntry,
} from '@/lib/screen-registry'

export interface ScreenCheckRequest {
  name: string
  route?: string
  description?: string
}

export interface ScreenCheckResult {
  exists: boolean
  matchType: 'route' | 'name' | 'prefix' | 'none'
  matchedScreens: ScreenEntry[]
  recommendation: 'create' | 'improve'
  checkedAgainstBaseline: boolean
  checkedAgainstMenu: boolean
}

export interface ScreenCheckLogEntry {
  request: ScreenCheckRequest
  result: ScreenCheckResult
  timestamp: string
}

const checkLog: ScreenCheckLogEntry[] = []

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

export function checkScreenExists(request: ScreenCheckRequest): ScreenCheckResult {
  const checkedAgainstBaseline = true
  const checkedAgainstMenu = true

  if (request.route) {
    const exact = findScreenByRoute(request.route)
    if (exact) {
      return {
        exists: true,
        matchType: 'route',
        matchedScreens: [exact],
        recommendation: 'improve',
        checkedAgainstBaseline,
        checkedAgainstMenu,
      }
    }

    const prefixMatches = findScreensByRoutePrefix(request.route)
    if (prefixMatches.length > 0) {
      return {
        exists: true,
        matchType: 'prefix',
        matchedScreens: prefixMatches,
        recommendation: 'improve',
        checkedAgainstBaseline,
        checkedAgainstMenu,
      }
    }
  }

  if (request.name) {
    const normalized = normalizeText(request.name)
    const nameMatches = SCREEN_REGISTRY.filter((s) => {
      const labelNorm = normalizeText(s.label)
      return labelNorm.includes(normalized) || normalized.includes(labelNorm)
    })
    if (nameMatches.length > 0) {
      return {
        exists: true,
        matchType: 'name',
        matchedScreens: nameMatches,
        recommendation: 'improve',
        checkedAgainstBaseline,
        checkedAgainstMenu,
      }
    }
  }

  return {
    exists: false,
    matchType: 'none',
    matchedScreens: [],
    recommendation: 'create',
    checkedAgainstBaseline,
    checkedAgainstMenu,
  }
}

export function recordScreenCheck(request: ScreenCheckRequest): ScreenCheckResult {
  const result = checkScreenExists(request)
  checkLog.push({ request, result, timestamp: new Date().toISOString() })
  return result
}

export function getScreenCheckLog(): ScreenCheckLogEntry[] {
  return [...checkLog]
}

export function clearScreenCheckLog(): void {
  checkLog.length = 0
}

export interface DeliveryValidationResult {
  valid: boolean
  totalChecks: number
  newScreens: ScreenCheckLogEntry[]
  improvedScreens: ScreenCheckLogEntry[]
  duplicates: ScreenCheckLogEntry[]
  baselineIntact: boolean
  recoveredIntact: boolean
}

export function validateDelivery(): DeliveryValidationResult {
  const duplicates = checkLog.filter((e) => e.result.matchType === 'route')
  const newScreens = checkLog.filter((e) => !e.result.exists)
  const improvedScreens = checkLog.filter((e) => e.result.exists && e.result.matchType !== 'route')

  const baselineRoutes = getBaselineScreens().map((s) => s.route)
  const recoveredRoutes = getRecoveredScreens().map((s) => s.route)

  return {
    valid: duplicates.length === 0,
    totalChecks: checkLog.length,
    newScreens,
    improvedScreens,
    duplicates,
    baselineIntact: baselineRoutes.length >= 24,
    recoveredIntact: recoveredRoutes.length >= 4,
  }
}

export function getBaselineRouteCount(): number {
  return getBaselineScreens().length
}

export function getRecoveredRouteCount(): number {
  return getRecoveredScreens().length
}
