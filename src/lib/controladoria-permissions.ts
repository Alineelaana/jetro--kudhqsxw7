const CTRL_VIEW = ['SUP', 'FINANCEIRO', 'COMERCIAL']
const CTRL_EDIT = ['SUP', 'FINANCEIRO']
const CTRL_ADMIN = ['SUP', 'FINANCEIRO']
const CTRL_APPROVE = ['SUP']

export function canViewControladoria(role: string | undefined): boolean {
  if (!role) return false
  return CTRL_VIEW.includes(role)
}
export function canEditDREConfig(role: string | undefined): boolean {
  if (!role) return false
  return CTRL_EDIT.includes(role)
}
export function canManageBudget(role: string | undefined): boolean {
  if (!role) return false
  return CTRL_EDIT.includes(role)
}
export function canManageForecast(role: string | undefined): boolean {
  if (!role) return false
  return CTRL_EDIT.includes(role)
}
export function canManageClosing(role: string | undefined): boolean {
  if (!role) return false
  return CTRL_EDIT.includes(role)
}
export function canApproveClosing(role: string | undefined): boolean {
  return role === 'SUP'
}
export function canReopenPeriod(role: string | undefined): boolean {
  return role === 'SUP'
}
export function canManageKPIs(role: string | undefined): boolean {
  if (!role) return false
  return CTRL_EDIT.includes(role)
}
export function canManageDrivers(role: string | undefined): boolean {
  if (!role) return false
  return CTRL_EDIT.includes(role)
}
export function canManageMateriality(role: string | undefined): boolean {
  if (!role) return false
  return CTRL_EDIT.includes(role)
}
export function canManageSimulations(role: string | undefined): boolean {
  if (!role) return false
  return CTRL_VIEW.includes(role)
}
export function canManageConsolidation(role: string | undefined): boolean {
  if (!role) return false
  return CTRL_ADMIN.includes(role)
}
export function canViewSensitiveFinancial(role: string | undefined): boolean {
  if (!role) return false
  return CTRL_ADMIN.includes(role)
}
export function canUseAdaptaFinanceira(role: string | undefined): boolean {
  if (!role) return false
  return CTRL_VIEW.includes(role)
}
export function canManageReclassifications(role: string | undefined): boolean {
  if (!role) return false
  return CTRL_EDIT.includes(role)
}
export function canApproveReclassification(role: string | undefined): boolean {
  return role === 'SUP'
}
