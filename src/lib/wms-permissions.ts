const WMS_BASE_ROLES = ['SUP', 'PADRAO', 'SDR', 'Vendedor', 'FINANCEIRO', 'COMERCIAL']
const WMS_OPS_ROLES = ['SUP', 'PADRAO']
const WMS_OPS_SDR = ['SUP', 'PADRAO', 'SDR']
const WMS_COST_ROLES = ['SUP', 'FINANCEIRO', 'COMERCIAL']
const WMS_EXPORT_ROLES = ['SUP', 'PADRAO', 'FINANCEIRO', 'COMERCIAL']

export function canViewWms(role: string | undefined): boolean {
  if (!role) return false
  return WMS_BASE_ROLES.includes(role)
}
export function canRegisterReceipt(role: string | undefined): boolean {
  if (!role) return false
  return WMS_OPS_ROLES.includes(role)
}
export function canPerformCheck(role: string | undefined): boolean {
  if (!role) return false
  return WMS_OPS_ROLES.includes(role)
}
export function canApproveDivergence(role: string | undefined): boolean {
  return role === 'SUP'
}
export function canChangePutaway(role: string | undefined): boolean {
  if (!role) return false
  return WMS_OPS_ROLES.includes(role)
}
export function canPerformStorage(role: string | undefined): boolean {
  if (!role) return false
  return WMS_OPS_ROLES.includes(role)
}
export function canExecuteReplenishment(role: string | undefined): boolean {
  if (!role) return false
  return WMS_OPS_ROLES.includes(role)
}
export function canCreateWaves(role: string | undefined): boolean {
  if (!role) return false
  return WMS_OPS_ROLES.includes(role)
}
export function canReleaseWaves(role: string | undefined): boolean {
  return role === 'SUP'
}
export function canPickOrdersWms(role: string | undefined): boolean {
  if (!role) return false
  return WMS_OPS_SDR.includes(role)
}
export function canCheckExpedition(role: string | undefined): boolean {
  if (!role) return false
  return WMS_OPS_ROLES.includes(role)
}
export function canReleaseExpedition(role: string | undefined): boolean {
  if (!role) return false
  return WMS_OPS_ROLES.includes(role)
}
export function canPerformInventoryWms(role: string | undefined): boolean {
  if (!role) return false
  return WMS_OPS_ROLES.includes(role)
}
export function canApproveInventoryWms(role: string | undefined): boolean {
  return role === 'SUP'
}
export function canPerformTransfersWms(role: string | undefined): boolean {
  if (!role) return false
  return WMS_OPS_ROLES.includes(role)
}
export function canBlockLotsWms(role: string | undefined): boolean {
  if (!role) return false
  return WMS_OPS_ROLES.includes(role)
}
export function canUnblockLotsWms(role: string | undefined): boolean {
  return role === 'SUP'
}
export function canViewWmsCosts(role: string | undefined): boolean {
  if (!role) return false
  return WMS_COST_ROLES.includes(role)
}
export function canExportWmsInfo(role: string | undefined): boolean {
  if (!role) return false
  return WMS_EXPORT_ROLES.includes(role)
}
export function canChangeWmsParams(role: string | undefined): boolean {
  return role === 'SUP'
}
