const TM_VIEW_ROLES = ['SUP', 'PADRAO', 'COMERCIAL', 'FINANCEIRO', 'SDR', 'Vendedor']
const TM_EDIT_ROLES = ['SUP', 'PADRAO', 'COMERCIAL']
const TM_ADMIN_ROLES = ['SUP', 'COMERCIAL']
const TM_APPROVE_ROLES = ['SUP', 'COMERCIAL', 'FINANCEIRO']
const TM_EXEC_ROLES = ['SUP', 'PADRAO', 'SDR', 'Vendedor']

export function canViewTradeMarketing(role: string | undefined): boolean {
  return !!role && TM_VIEW_ROLES.includes(role)
}
export function canCreateTradeAction(role: string | undefined): boolean {
  return !!role && TM_EDIT_ROLES.includes(role)
}
export function canEditTradeAction(role: string | undefined): boolean {
  return !!role && TM_EDIT_ROLES.includes(role)
}
export function canDeleteTradeAction(role: string | undefined): boolean {
  return role === 'SUP'
}
export function canApproveTradeAction(role: string | undefined): boolean {
  return !!role && TM_APPROVE_ROLES.includes(role)
}
export function canExecuteTradeAction(role: string | undefined): boolean {
  return !!role && TM_EXEC_ROLES.includes(role)
}
export function canCloseTradeAction(role: string | undefined): boolean {
  return !!role && TM_ADMIN_ROLES.includes(role)
}
export function canExportTradeAction(role: string | undefined): boolean {
  return !!role && TM_VIEW_ROLES.includes(role)
}
export function canAdminTradeMarketing(role: string | undefined): boolean {
  return !!role && TM_ADMIN_ROLES.includes(role)
}
