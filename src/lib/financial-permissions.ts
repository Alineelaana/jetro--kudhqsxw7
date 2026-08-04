const FIN_BASE_ROLES = ['SUP', 'PADRAO', 'FINANCEIRO', 'COMERCIAL']
const FIN_VIEW_ROLES = ['SUP', 'PADRAO', 'FINANCEIRO', 'COMERCIAL', 'Vendedor', 'SDR']
const FIN_EDIT_ROLES = ['SUP', 'PADRAO', 'FINANCEIRO']
const FIN_ADMIN_ROLES = ['SUP', 'FINANCEIRO']
const FIN_COST_ROLES = ['SUP', 'FINANCEIRO', 'COMERCIAL']
const FIN_EXPORT_ROLES = ['SUP', 'PADRAO', 'FINANCEIRO', 'COMERCIAL']

export function canViewFinancial(role: string | undefined): boolean {
  if (!role) return false
  return FIN_VIEW_ROLES.includes(role)
}
export function canViewFinancialBalances(role: string | undefined): boolean {
  if (!role) return false
  return FIN_BASE_ROLES.includes(role)
}
export function canViewFinancialCosts(role: string | undefined): boolean {
  if (!role) return false
  return FIN_COST_ROLES.includes(role)
}
export function canCreateTitles(role: string | undefined): boolean {
  if (!role) return false
  return FIN_EDIT_ROLES.includes(role)
}
export function canEditTitles(role: string | undefined): boolean {
  if (!role) return false
  return FIN_EDIT_ROLES.includes(role)
}
export function canApprovePayments(role: string | undefined): boolean {
  return role === 'SUP'
}
export function canMakePayments(role: string | undefined): boolean {
  if (!role) return false
  return FIN_ADMIN_ROLES.includes(role)
}
export function canReceivePayments(role: string | undefined): boolean {
  if (!role) return false
  return FIN_EDIT_ROLES.includes(role)
}
export function canApplyDiscounts(role: string | undefined): boolean {
  if (!role) return false
  return FIN_ADMIN_ROLES.includes(role)
}
export function canChangeDueDates(role: string | undefined): boolean {
  if (!role) return false
  return FIN_EDIT_ROLES.includes(role)
}
export function canRenegotiate(role: string | undefined): boolean {
  if (!role) return false
  return FIN_ADMIN_ROLES.includes(role)
}
export function canReverse(role: string | undefined): boolean {
  return role === 'SUP'
}
export function canCancel(role: string | undefined): boolean {
  return role === 'SUP'
}
export function canIssueBoletos(role: string | undefined): boolean {
  if (!role) return false
  return FIN_EDIT_ROLES.includes(role)
}
export function canGeneratePix(role: string | undefined): boolean {
  if (!role) return false
  return FIN_EDIT_ROLES.includes(role)
}
export function canReconcile(role: string | undefined): boolean {
  if (!role) return false
  return FIN_EDIT_ROLES.includes(role)
}
export function canOpenCashRegister(role: string | undefined): boolean {
  if (!role) return false
  return FIN_EDIT_ROLES.includes(role)
}
export function canCloseCashRegister(role: string | undefined): boolean {
  if (!role) return false
  return FIN_EDIT_ROLES.includes(role)
}
export function canReopenPeriod(role: string | undefined): boolean {
  return role === 'SUP'
}
export function canExportFinancial(role: string | undefined): boolean {
  if (!role) return false
  return FIN_EXPORT_ROLES.includes(role)
}
export function canViewAllBranches(role: string | undefined): boolean {
  return role === 'SUP'
}
