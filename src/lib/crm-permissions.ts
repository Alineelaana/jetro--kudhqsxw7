const CRM_ROLES = ['SUP', 'PADRAO', 'SDR', 'Vendedor', 'FINANCEIRO', 'COMERCIAL']

export function canViewCRM(role: string | undefined): boolean {
  if (!role) return false
  return CRM_ROLES.includes(role)
}
export function canManageCRM(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'COMERCIAL'].includes(role)
}
export function canCreateLeads(role: string | undefined): boolean {
  if (!role) return false
  return CRM_ROLES.includes(role)
}
export function canEditLeads(role: string | undefined): boolean {
  if (!role) return false
  return CRM_ROLES.includes(role)
}
export function canDeleteLeads(role: string | undefined): boolean {
  return role === 'SUP'
}
export function canConvertLeads(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'PADRAO', 'SDR', 'Vendedor', 'COMERCIAL'].includes(role)
}
export function canManageFunnelStages(role: string | undefined): boolean {
  return role === 'SUP'
}
export function canViewCRMReports(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'PADRAO', 'COMERCIAL', 'FINANCEIRO'].includes(role)
}
export function canManageCRMGoals(role: string | undefined): boolean {
  return role === 'SUP'
}
export function canManageCRMAutomation(role: string | undefined): boolean {
  return role === 'SUP'
}
