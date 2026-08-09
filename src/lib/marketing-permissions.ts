const MK_VIEW_ROLES = ['SUP', 'PADRAO', 'COMERCIAL', 'FINANCEIRO', 'SDR', 'Vendedor']
const MK_EDIT_ROLES = ['SUP', 'PADRAO', 'COMERCIAL']
const MK_APPROVE_ROLES = ['SUP', 'COMERCIAL']
const MK_PUBLISH_ROLES = ['SUP', 'PADRAO']
const MK_ADMIN_ROLES = ['SUP']

export function canViewMarketing(role: string | undefined): boolean {
  return !!role && MK_VIEW_ROLES.includes(role)
}
export function canCreateMarketingRequest(role: string | undefined): boolean {
  return !!role && MK_EDIT_ROLES.includes(role)
}
export function canEditMarketingRequest(role: string | undefined): boolean {
  return !!role && MK_EDIT_ROLES.includes(role)
}
export function canDeleteMarketingRequest(role: string | undefined): boolean {
  return role === 'SUP'
}
export function canApprovePiece(role: string | undefined): boolean {
  return !!role && MK_APPROVE_ROLES.includes(role)
}
export function canPublishPiece(role: string | undefined): boolean {
  return !!role && MK_PUBLISH_ROLES.includes(role)
}
export function canManageBrand(role: string | undefined): boolean {
  return !!role && MK_ADMIN_ROLES.includes(role)
}
export function canManageMarketingBudget(role: string | undefined): boolean {
  return !!role && ['SUP', 'FINANCEIRO', 'COMERCIAL'].includes(role)
}
export function canExportMarketing(role: string | undefined): boolean {
  return !!role && MK_VIEW_ROLES.includes(role)
}
export function canAdminMarketing(role: string | undefined): boolean {
  return role === 'SUP'
}
export function canViewMarketingCockpit(role: string | undefined): boolean {
  return !!role && MK_VIEW_ROLES.includes(role)
}
