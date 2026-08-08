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
