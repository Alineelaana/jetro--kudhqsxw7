const VR_VIEW_ROLES = ['SUP', 'PADRAO', 'SDR', 'Vendedor', 'FINANCEIRO', 'COMERCIAL']
const VR_EDIT_ROLES = ['SUP', 'PADRAO', 'COMERCIAL']
const VR_ADMIN_ROLES = ['SUP', 'COMERCIAL']
const VR_FIN_ROLES = ['SUP', 'FINANCEIRO']

export function canViewVR(role: string | undefined): boolean {
  if (!role) return false
  return VR_VIEW_ROLES.includes(role)
}
export function canViewOwnCommission(role: string | undefined): boolean {
  if (!role) return false
  return VR_VIEW_ROLES.includes(role)
}
export function canViewTeamCommission(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'PADRAO', 'COMERCIAL', 'FINANCEIRO'].includes(role)
}
export function canViewCompanyCommission(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'COMERCIAL', 'FINANCEIRO'].includes(role)
}
export function canViewAllCompanies(role: string | undefined): boolean {
  return role === 'SUP'
}
export function canCreateRules(role: string | undefined): boolean {
  if (!role) return false
  return VR_ADMIN_ROLES.includes(role)
}
export function canEditRules(role: string | undefined): boolean {
  return canCreateRules(role)
}
export function canDeleteRules(role: string | undefined): boolean {
  return role === 'SUP'
}
export function canApurate(role: string | undefined): boolean {
  if (!role) return false
  return VR_EDIT_ROLES.includes(role)
}
export function canApproveGestor(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'COMERCIAL', 'PADRAO'].includes(role)
}
export function canApproveFinanceiro(role: string | undefined): boolean {
  return VR_FIN_ROLES.includes(role)
}
export function canReleasePayment(role: string | undefined): boolean {
  return role === 'SUP' || role === 'FINANCEIRO'
}
export function canCancelCommission(role: string | undefined): boolean {
  return role === 'SUP'
}
export function canExportVR(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'PADRAO', 'FINANCEIRO', 'COMERCIAL'].includes(role)
}
export function canCreateCampaigns(role: string | undefined): boolean {
  return VR_ADMIN_ROLES.includes(role)
}
export function canCreateGoals(role: string | undefined): boolean {
  return VR_ADMIN_ROLES.includes(role)
}
export function canEditGoals(role: string | undefined): boolean {
  return VR_ADMIN_ROLES.includes(role)
}
export function canCloseGoals(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'COMERCIAL'].includes(role)
}
export function canCreateAwards(role: string | undefined): boolean {
  return VR_ADMIN_ROLES.includes(role)
}
export function canEditAwards(role: string | undefined): boolean {
  return VR_ADMIN_ROLES.includes(role)
}
export function canSendCommunications(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'PADRAO', 'COMERCIAL'].includes(role)
}
export function canSimulateCommission(role: string | undefined): boolean {
  if (!role) return false
  return VR_VIEW_ROLES.includes(role)
}
export function canAlterGoalsAfterStart(role: string | undefined): boolean {
  return role === 'SUP'
}
