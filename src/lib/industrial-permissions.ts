export function canViewIndustry(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'PADRAO', 'COMERCIAL', 'FINANCEIRO'].includes(role)
}

export function canManageEngineering(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'PADRAO'].includes(role)
}

export function canManageProduction(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'PADRAO'].includes(role)
}

export function canManagePlanning(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'PADRAO', 'COMERCIAL'].includes(role)
}

export function canViewIndustrialCosts(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'FINANCEIRO', 'COMERCIAL'].includes(role)
}

export function canManageQuality(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'PADRAO'].includes(role)
}

export function canManageMaintenance(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'PADRAO'].includes(role)
}

export function canRegisterApontamentos(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'PADRAO', 'SDR'].includes(role)
}

export function canViewKpis(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'PADRAO', 'COMERCIAL', 'FINANCEIRO'].includes(role)
}

export function canViewTraceability(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'PADRAO', 'COMERCIAL'].includes(role)
}
