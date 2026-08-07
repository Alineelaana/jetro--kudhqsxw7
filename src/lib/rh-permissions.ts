const RH_VIEW_ROLES = ['SUP', 'PADRAO', 'FINANCEIRO', 'COMERCIAL']

export function canViewRH(role: string | undefined): boolean {
  if (!role) return false
  return RH_VIEW_ROLES.includes(role)
}

export function canManageRHEmployees(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'PADRAO'].includes(role)
}

export function canManageRHPayroll(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'FINANCEIRO'].includes(role)
}

export function canExportRH(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'FINANCEIRO'].includes(role)
}
