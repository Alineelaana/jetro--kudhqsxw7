const RH_VIEW_ROLES = ['SUP', 'PADRAO', 'FINANCEIRO', 'COMERCIAL', 'SDR', 'Vendedor']
const RH_EDIT_ROLES = ['SUP', 'PADRAO']
const RH_SENSITIVE_ROLES = ['SUP', 'FINANCEIRO']

export function canViewRH(role: string | undefined): boolean {
  if (!role) return false
  return RH_VIEW_ROLES.includes(role)
}
export function canViewPersonalData(role: string | undefined): boolean {
  if (!role) return false
  return RH_SENSITIVE_ROLES.includes(role)
}
export function canViewSalaries(role: string | undefined): boolean {
  if (!role) return false
  return RH_SENSITIVE_ROLES.includes(role)
}
export function canCreateEmployees(role: string | undefined): boolean {
  if (!role) return false
  return RH_EDIT_ROLES.includes(role)
}
export function canEditEmployees(role: string | undefined): boolean {
  if (!role) return false
  return RH_EDIT_ROLES.includes(role)
}
export function canApproveAdmissions(role: string | undefined): boolean {
  return role === 'SUP'
}
export function canChangePositions(role: string | undefined): boolean {
  if (!role) return false
  return RH_EDIT_ROLES.includes(role)
}
export function canChangeSalaries(role: string | undefined): boolean {
  return role === 'SUP'
}
export function canViewTimeRecords(role: string | undefined): boolean {
  if (!role) return false
  return RH_VIEW_ROLES.includes(role)
}
export function canAdjustTimeRecords(role: string | undefined): boolean {
  if (!role) return false
  return RH_EDIT_ROLES.includes(role)
}
export function canApproveAdjustments(role: string | undefined): boolean {
  return role === 'SUP'
}
export function canManageVacations(role: string | undefined): boolean {
  if (!role) return false
  return RH_EDIT_ROLES.includes(role)
}
export function canApproveVacations(role: string | undefined): boolean {
  return role === 'SUP'
}
export function canProcessPayroll(role: string | undefined): boolean {
  if (!role) return false
  return RH_SENSITIVE_ROLES.includes(role)
}
export function canApprovePayroll(role: string | undefined): boolean {
  return role === 'SUP'
}
export function canViewBenefits(role: string | undefined): boolean {
  if (!role) return false
  return RH_VIEW_ROLES.includes(role)
}
export function canManageTrainings(role: string | undefined): boolean {
  if (!role) return false
  return RH_EDIT_ROLES.includes(role)
}
export function canDismissEmployees(role: string | undefined): boolean {
  return role === 'SUP'
}
export function canExportRH(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'PADRAO', 'FINANCEIRO', 'COMERCIAL'].includes(role)
}
