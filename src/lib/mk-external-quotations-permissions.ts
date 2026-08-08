const EQ_VIEW_ROLES = ['SUP', 'PADRAO', 'COMERCIAL', 'FINANCEIRO', 'SDR', 'Vendedor']
const EQ_EDIT_ROLES = ['SUP', 'PADRAO', 'COMERCIAL']
const EQ_APPROVE_ROLES = ['SUP', 'COMERCIAL', 'FINANCEIRO']
const EQ_PURCHASE_ROLES = ['SUP', 'PADRAO', 'COMERCIAL']

export function canViewExternalQuotations(role: string | undefined): boolean {
  return !!role && EQ_VIEW_ROLES.includes(role)
}
export function canCreateExternalQuotation(role: string | undefined): boolean {
  return !!role && EQ_EDIT_ROLES.includes(role)
}
export function canEditExternalQuotation(role: string | undefined): boolean {
  return !!role && EQ_EDIT_ROLES.includes(role)
}
export function canNegotiateExternalQuotation(role: string | undefined): boolean {
  return !!role && EQ_EDIT_ROLES.includes(role)
}
export function canRecommendExternalQuotation(role: string | undefined): boolean {
  return !!role && EQ_EDIT_ROLES.includes(role)
}
export function canApproveExternalQuotation(role: string | undefined): boolean {
  return !!role && EQ_APPROVE_ROLES.includes(role)
}
export function canRejectExternalQuotation(role: string | undefined): boolean {
  return !!role && EQ_APPROVE_ROLES.includes(role)
}
export function canGeneratePurchaseFromQuotation(role: string | undefined): boolean {
  return !!role && EQ_PURCHASE_ROLES.includes(role)
}
export function canExportExternalQuotation(role: string | undefined): boolean {
  return !!role && EQ_VIEW_ROLES.includes(role)
}
export function canAdminExternalQuotations(role: string | undefined): boolean {
  return role === 'SUP'
}
