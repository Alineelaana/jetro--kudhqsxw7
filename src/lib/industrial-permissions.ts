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

export function canManageEngineeringChanges(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'PADRAO', 'COMERCIAL'].includes(role)
}

export function canApproveRevision(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'PADRAO'].includes(role)
}

export function canManageMasterPlan(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'PADRAO', 'COMERCIAL'].includes(role)
}

export function canManageAPS(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'PADRAO'].includes(role)
}

export function canManageSimulations(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'PADRAO', 'COMERCIAL'].includes(role)
}

export function canAdjustIndustrialCosts(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'FINANCEIRO'].includes(role)
}

export function canReleaseOrder(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'PADRAO'].includes(role)
}

export function canCloseOrder(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'PADRAO'].includes(role)
}

export function canManagePhases(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'PADRAO'].includes(role)
}

export function canManageDemand(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'PADRAO', 'COMERCIAL'].includes(role)
}

export function canViewExecutiveDashboard(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'PADRAO', 'COMERCIAL', 'FINANCEIRO'].includes(role)
}

export function canPerformQualityCheck(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'PADRAO'].includes(role)
}

export function canFeedPhaseCosts(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'FINANCEIRO', 'PADRAO'].includes(role)
}
