const MK_VIEW_ROLES = ['SUP', 'PADRAO', 'COMERCIAL', 'FINANCEIRO', 'SDR', 'Vendedor']
const MK_EDIT_ROLES = ['SUP', 'PADRAO', 'COMERCIAL']
const MK_APPROVE_ROLES = ['SUP', 'COMERCIAL', 'FINANCEIRO']
const MK_FINANCIAL_ROLES = ['SUP', 'FINANCEIRO']

export function canViewMarketing(role: string | undefined): boolean {
  return !!role && MK_VIEW_ROLES.includes(role)
}
export function canManageMarketing(role: string | undefined): boolean {
  return !!role && MK_EDIT_ROLES.includes(role)
}
export function canApproveMaterial(role: string | undefined): boolean {
  return !!role && MK_APPROVE_ROLES.includes(role)
}
export function canViewMarketingROI(role: string | undefined): boolean {
  return !!role && MK_FINANCIAL_ROLES.includes(role)
}
export function canUseAdaptaMarketing(role: string | undefined): boolean {
  return !!role && MK_VIEW_ROLES.includes(role)
}
export function canManageMarketingBudget(role: string | undefined): boolean {
  return !!role && MK_FINANCIAL_ROLES.includes(role)
}
export function canExportMarketing(role: string | undefined): boolean {
  return !!role && MK_VIEW_ROLES.includes(role)
}
