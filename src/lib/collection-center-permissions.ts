const CC_VIEW_ROLES = ['SUP', 'PADRAO', 'FINANCEIRO', 'COMERCIAL', 'Vendedor', 'SDR']
const CC_EDIT_ROLES = ['SUP', 'PADRAO', 'FINANCEIRO']
const CC_ADMIN_ROLES = ['SUP', 'FINANCEIRO']
const CC_EXPORT_ROLES = ['SUP', 'PADRAO', 'FINANCEIRO', 'COMERCIAL']

const DISCOUNT_LIMITS: Record<string, number> = {
  SUP: 100,
  FINANCEIRO: 30,
  PADRAO: 10,
  COMERCIAL: 5,
}

export function canViewCollectionCenter(role: string | undefined): boolean {
  if (!role) return false
  return CC_VIEW_ROLES.includes(role)
}

export function canRegisterContact(role: string | undefined): boolean {
  if (!role) return false
  return CC_EDIT_ROLES.includes(role)
}

export function canRegisterPromise(role: string | undefined): boolean {
  if (!role) return false
  return CC_EDIT_ROLES.includes(role)
}

export function canNegotiate(role: string | undefined): boolean {
  if (!role) return false
  return CC_EDIT_ROLES.includes(role)
}

export function canApplyDiscount(role: string | undefined, discountPercent: number): boolean {
  if (!role) return false
  const limit = DISCOUNT_LIMITS[role] || 0
  return discountPercent <= limit
}

export function getDiscountLimit(role: string | undefined): number {
  if (!role) return 0
  return DISCOUNT_LIMITS[role] || 0
}

export function canOpenDispute(role: string | undefined): boolean {
  if (!role) return false
  return CC_EDIT_ROLES.includes(role)
}

export function canExportCollection(role: string | undefined): boolean {
  if (!role) return false
  return CC_EXPORT_ROLES.includes(role)
}

export function canAdminCollection(role: string | undefined): boolean {
  if (!role) return false
  return CC_ADMIN_ROLES.includes(role)
}

export function canConfigureCollection(role: string | undefined): boolean {
  return role === 'SUP' || role === 'FINANCEIRO'
}

export function getAlcadaProfile(role: string | undefined): string {
  if (!role) return 'cobrador'
  if (role === 'SUP') return 'gerente'
  if (role === 'FINANCEIRO' || role === 'PADRAO') return 'supervisor'
  return 'cobrador'
}

export function getDiscountLimitFromConfig(
  role: string | undefined,
  alcadas: Record<string, { percent: number; valor: number }> | null,
): { percent: number; valor: number } {
  if (!alcadas) return { percent: 0, valor: 0 }
  const profile = getAlcadaProfile(role)
  return alcadas[profile] || alcadas['cobrador'] || { percent: 0, valor: 0 }
}

export function canApplyDiscountWithAlcada(
  role: string | undefined,
  discountPercent: number,
  alcadas: Record<string, { percent: number; valor: number }> | null,
): boolean {
  const limit = getDiscountLimitFromConfig(role, alcadas)
  return discountPercent <= limit.percent
}
