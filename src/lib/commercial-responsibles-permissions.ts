const EDIT_ROLES = ['SUP', 'COMERCIAL', 'FINANCEIRO']
const VIEW_ROLES = ['SUP', 'COMERCIAL', 'FINANCEIRO', 'PADRAO', 'Vendedor']
const COMMISSION_RULE_ROLES = ['SUP', 'FINANCEIRO']

export function canViewCommercialResponsibles(userRole?: string): boolean {
  if (!userRole) return false
  return VIEW_ROLES.includes(userRole)
}

export function canEditCommercialResponsibles(userRole?: string): boolean {
  if (!userRole) return false
  return EDIT_ROLES.includes(userRole)
}

export function canManageCommissionRules(userRole?: string): boolean {
  if (!userRole) return false
  return COMMISSION_RULE_ROLES.includes(userRole)
}
