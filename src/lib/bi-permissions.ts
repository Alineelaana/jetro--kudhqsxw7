export function canViewBI(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'PADRAO', 'FINANCEIRO', 'COMERCIAL'].includes(role)
}

export function canCreateBIReport(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'FINANCEIRO', 'COMERCIAL'].includes(role)
}

export function canDeleteBIReport(role: string | undefined): boolean {
  return role === 'SUP'
}

export function canExportBIReport(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'PADRAO', 'FINANCEIRO', 'COMERCIAL'].includes(role)
}

export function canManageCustomDashboards(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'PADRAO', 'FINANCEIRO', 'COMERCIAL'].includes(role)
}

export function canUseAiAdapta(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'PADRAO', 'FINANCEIRO', 'COMERCIAL'].includes(role)
}

export function canShareDashboards(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'PADRAO', 'FINANCEIRO', 'COMERCIAL'].includes(role)
}
