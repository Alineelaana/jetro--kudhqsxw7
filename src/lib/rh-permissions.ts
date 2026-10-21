const RH_VIEW_ROLES = ['SUP', 'PADRAO', 'FINANCEIRO', 'COMERCIAL', 'RH / DP', 'RH', 'DP']

export function canViewRH(role: string | undefined): boolean {
  if (!role) return false
  return RH_VIEW_ROLES.includes(role) || RH_VIEW_ROLES.includes(role.toUpperCase())
}

export function canManageRHEmployees(role: string | undefined): boolean {
  if (!role) return false
  const r = role.toUpperCase()
  return ['SUP', 'PADRAO', 'RH / DP', 'RH', 'DP'].includes(r)
}

export function canManageRHPayroll(role: string | undefined): boolean {
  if (!role) return false
  const r = role.toUpperCase()
  return ['SUP', 'FINANCEIRO', 'RH / DP', 'RH', 'DP'].includes(r)
}

export function canExportRH(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'FINANCEIRO'].includes(role)
}

export function canViewRHPerformance(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'PADRAO', 'COMERCIAL'].includes(role)
}

export function canViewRHSuccession(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'PADRAO', 'COMERCIAL'].includes(role)
}

export function canViewRHPotential(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'PADRAO', 'COMERCIAL'].includes(role)
}

export function canViewRHCompensation(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'FINANCEIRO'].includes(role)
}

export function canViewRHConfidential(role: string | undefined): boolean {
  return role === 'SUP'
}

export function canViewRHCockpit(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'PADRAO', 'FINANCEIRO', 'COMERCIAL'].includes(role)
}

export function canUseRHAdapta(role: string | undefined): boolean {
  return canViewRH(role)
}

export function canManageRHCompetencies(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'PADRAO'].includes(role)
}

export function canManageRHCalibration(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'PADRAO'].includes(role)
}

export function canManageRHPdi(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'PADRAO', 'COMERCIAL'].includes(role)
}

export function canManageRHOnboarding(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'PADRAO'].includes(role)
}

export function canManageRHOffboarding(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'PADRAO'].includes(role)
}
