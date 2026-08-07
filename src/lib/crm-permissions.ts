const CRM_VIEW_ROLES = ['SUP', 'PADRAO', 'SDR', 'Vendedor', 'FINANCEIRO', 'COMERCIAL']

export function canViewCRM(role: string | undefined): boolean {
  if (!role) return false
  return CRM_VIEW_ROLES.includes(role)
}

export function canManageCRMLeads(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'PADRAO', 'SDR', 'Vendedor', 'COMERCIAL'].includes(role)
}

export function canManageCRMPipeline(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'COMERCIAL'].includes(role)
}

export function canExportCRM(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'COMERCIAL', 'FINANCEIRO'].includes(role)
}
