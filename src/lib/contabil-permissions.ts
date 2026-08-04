const CT_BASE = ['SUP', 'PADRAO', 'FINANCEIRO', 'COMERCIAL']
const CT_VIEW = ['SUP', 'PADRAO', 'FINANCEIRO', 'COMERCIAL', 'SDR', 'Vendedor']
const CT_EDIT = ['SUP', 'PADRAO', 'FINANCEIRO']
const CT_ADMIN = ['SUP', 'FINANCEIRO']

export function canViewContabil(role: string | undefined): boolean {
  if (!role) return false
  return CT_VIEW.includes(role)
}
export function canViewContabilBalances(role: string | undefined): boolean {
  if (!role) return false
  return CT_BASE.includes(role)
}
export function canCreateEntries(role: string | undefined): boolean {
  if (!role) return false
  return CT_EDIT.includes(role)
}
export function canEditEntries(role: string | undefined): boolean {
  if (!role) return false
  return CT_EDIT.includes(role)
}
export function canApproveEntries(role: string | undefined): boolean {
  if (!role) return false
  return CT_ADMIN.includes(role)
}
export function canBookEntries(role: string | undefined): boolean {
  if (!role) return false
  return CT_EDIT.includes(role)
}
export function canReverseEntries(role: string | undefined): boolean {
  return role === 'SUP'
}
export function canCreateLotes(role: string | undefined): boolean {
  if (!role) return false
  return CT_EDIT.includes(role)
}
export function canApproveLotes(role: string | undefined): boolean {
  if (!role) return false
  return CT_ADMIN.includes(role)
}
export function canChangePlanoContas(role: string | undefined): boolean {
  if (!role) return false
  return CT_EDIT.includes(role)
}
export function canChangeIntegrationRules(role: string | undefined): boolean {
  if (!role) return false
  return CT_ADMIN.includes(role)
}
export function canReconcileContabil(role: string | undefined): boolean {
  if (!role) return false
  return CT_EDIT.includes(role)
}
export function canGenerateStatements(role: string | undefined): boolean {
  if (!role) return false
  return CT_EDIT.includes(role)
}
export function canClosePeriod(role: string | undefined): boolean {
  return role === 'SUP'
}
export function canReopenPeriod(role: string | undefined): boolean {
  return role === 'SUP'
}
export function canViewAllBranchesContabil(role: string | undefined): boolean {
  return role === 'SUP'
}
export function canExportContabil(role: string | undefined): boolean {
  if (!role) return false
  return CT_BASE.includes(role)
}
