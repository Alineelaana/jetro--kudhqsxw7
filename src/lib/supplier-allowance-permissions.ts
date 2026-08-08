const SA_VIEW_ROLES = ['SUP', 'PADRAO', 'FINANCEIRO', 'COMERCIAL']
const SA_EDIT_ROLES = ['SUP', 'PADRAO', 'COMERCIAL']
const SA_ADMIN_ROLES = ['SUP', 'COMERCIAL']
const SA_FIN_ROLES = ['SUP', 'FINANCEIRO']

export function canViewSA(role: string | undefined): boolean {
  if (!role) return false
  return SA_VIEW_ROLES.includes(role)
}
export function canCreateAgreements(role: string | undefined): boolean {
  if (!role) return false
  return SA_ADMIN_ROLES.includes(role)
}
export function canEditAgreements(role: string | undefined): boolean {
  if (!role) return false
  return SA_ADMIN_ROLES.includes(role)
}
export function canDeleteAgreements(role: string | undefined): boolean {
  return role === 'SUP'
}
export function canAccrue(role: string | undefined): boolean {
  if (!role) return false
  return SA_EDIT_ROLES.includes(role)
}
export function canApproveAccrual(role: string | undefined): boolean {
  if (!role) return false
  return SA_ADMIN_ROLES.includes(role)
}
export function canSettle(role: string | undefined): boolean {
  if (!role) return false
  return SA_EDIT_ROLES.includes(role)
}
export function canApproveSettlement(role: string | undefined): boolean {
  return SA_FIN_ROLES.includes(role)
}
export function canConsume(role: string | undefined): boolean {
  if (!role) return false
  return SA_EDIT_ROLES.includes(role)
}
export function canAppropriate(role: string | undefined): boolean {
  if (!role) return false
  return SA_EDIT_ROLES.includes(role)
}
const SA_COCKPIT_ROLES = ['SUP', 'FINANCEIRO', 'COMERCIAL']
const SA_AUDIT_ROLES = ['SUP', 'FINANCEIRO']

export function canViewSACockpit(role: string | undefined): boolean {
  if (!role) return false
  return SA_COCKPIT_ROLES.includes(role)
}
export function canViewSACorporateAudit(role: string | undefined): boolean {
  if (!role) return false
  return SA_AUDIT_ROLES.includes(role)
}
export function canUseSAAdapta(role: string | undefined): boolean {
  if (!role) return false
  return SA_VIEW_ROLES.includes(role)
}
export function canExportSA(role: string | undefined): boolean {
  if (!role) return false
  return SA_VIEW_ROLES.includes(role)
}
export function canAdminSA(role: string | undefined): boolean {
  if (!role) return false
  return SA_ADMIN_ROLES.includes(role)
}
export function canConfigureSA(role: string | undefined): boolean {
  return role === 'SUP'
}
