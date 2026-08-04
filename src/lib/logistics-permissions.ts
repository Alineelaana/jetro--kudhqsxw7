const LOG_BASE_ROLES = ['SUP', 'PADRAO', 'SDR', 'Vendedor', 'FINANCEIRO', 'COMERCIAL']
const LOG_OPS_ROLES = ['SUP', 'PADRAO', 'SDR']
const LOG_ADMIN_ROLES = ['SUP', 'PADRAO']
const LOG_COST_ROLES = ['SUP', 'FINANCEIRO', 'COMERCIAL']
const LOG_EXPORT_ROLES = ['SUP', 'PADRAO', 'FINANCEIRO', 'COMERCIAL']

export function canViewLogistics(role: string | undefined): boolean {
  if (!role) return false
  return LOG_BASE_ROLES.includes(role)
}
export function canCreateRoutes(role: string | undefined): boolean {
  if (!role) return false
  return LOG_ADMIN_ROLES.includes(role)
}
export function canEditRoutes(role: string | undefined): boolean {
  if (!role) return false
  return LOG_ADMIN_ROLES.includes(role)
}
export function canPlanDeliveries(role: string | undefined): boolean {
  if (!role) return false
  return LOG_OPS_ROLES.includes(role)
}
export function canReleaseLoading(role: string | undefined): boolean {
  if (!role) return false
  return LOG_OPS_ROLES.includes(role)
}
export function canConfirmDeparture(role: string | undefined): boolean {
  if (!role) return false
  return LOG_OPS_ROLES.includes(role)
}
export function canUpdateDeliveries(role: string | undefined): boolean {
  if (!role) return false
  return LOG_OPS_ROLES.includes(role)
}
export function canRegisterOccurrences(role: string | undefined): boolean {
  if (!role) return false
  return LOG_BASE_ROLES.includes(role)
}
export function canApproveFreights(role: string | undefined): boolean {
  return role === 'SUP'
}
export function canChangeFreightValues(role: string | undefined): boolean {
  return role === 'SUP'
}
export function canRegisterVehicles(role: string | undefined): boolean {
  if (!role) return false
  return LOG_ADMIN_ROLES.includes(role)
}
export function canRegisterDrivers(role: string | undefined): boolean {
  if (!role) return false
  return LOG_ADMIN_ROLES.includes(role)
}
export function canViewLogisticsCosts(role: string | undefined): boolean {
  if (!role) return false
  return LOG_COST_ROLES.includes(role)
}
export function canViewTracking(role: string | undefined): boolean {
  if (!role) return false
  return LOG_BASE_ROLES.includes(role)
}
export function canViewProofDelivery(role: string | undefined): boolean {
  if (!role) return false
  return LOG_BASE_ROLES.includes(role)
}
export function canCancelDeliveries(role: string | undefined): boolean {
  return role === 'SUP'
}
export function canExportLogisticsInfo(role: string | undefined): boolean {
  if (!role) return false
  return LOG_EXPORT_ROLES.includes(role)
}
