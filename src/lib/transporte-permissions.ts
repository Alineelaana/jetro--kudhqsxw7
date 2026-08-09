const TRANS_BASE_ROLES = ['SUP', 'PADRAO', 'SDR', 'Vendedor', 'FINANCEIRO', 'COMERCIAL']
const TRANS_OPS_ROLES = ['SUP', 'PADRAO', 'SDR']
const TRANS_ADMIN_ROLES = ['SUP', 'PADRAO']
const TRANS_COST_ROLES = ['SUP', 'FINANCEIRO', 'COMERCIAL']
const TRANS_EXPORT_ROLES = ['SUP', 'PADRAO', 'FINANCEIRO', 'COMERCIAL']

export function canViewTransporte(role: string | undefined): boolean {
  if (!role) return false
  return TRANS_BASE_ROLES.includes(role)
}
export function canPlanLoad(role: string | undefined): boolean {
  if (!role) return false
  return TRANS_OPS_ROLES.includes(role)
}
export function canCreateTransportRoute(role: string | undefined): boolean {
  if (!role) return false
  return TRANS_ADMIN_ROLES.includes(role)
}
export function canReleaseJourney(role: string | undefined): boolean {
  if (!role) return false
  return TRANS_OPS_ROLES.includes(role)
}
export function canUpdateTransportDelivery(role: string | undefined): boolean {
  if (!role) return false
  return TRANS_OPS_ROLES.includes(role)
}
export function canRegisterTransportOccurrence(role: string | undefined): boolean {
  if (!role) return false
  return TRANS_BASE_ROLES.includes(role)
}
export function canApproveTransportFreight(role: string | undefined): boolean {
  return role === 'SUP'
}
export function canRegisterTransportVehicle(role: string | undefined): boolean {
  if (!role) return false
  return TRANS_ADMIN_ROLES.includes(role)
}
export function canRegisterTransportDriver(role: string | undefined): boolean {
  if (!role) return false
  return TRANS_ADMIN_ROLES.includes(role)
}
export function canViewTransportCosts(role: string | undefined): boolean {
  if (!role) return false
  return TRANS_COST_ROLES.includes(role)
}
export function canViewTransportTracking(role: string | undefined): boolean {
  if (!role) return false
  return TRANS_BASE_ROLES.includes(role)
}
export function canCancelJourney(role: string | undefined): boolean {
  return role === 'SUP'
}
export function canExportTransportInfo(role: string | undefined): boolean {
  if (!role) return false
  return TRANS_EXPORT_ROLES.includes(role)
}
