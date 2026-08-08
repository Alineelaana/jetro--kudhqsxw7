export function canViewPerformance(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'PADRAO', 'FINANCEIRO', 'COMERCIAL'].includes(role)
}

export function canEditPerformanceConfig(role: string | undefined): boolean {
  return role === 'SUP'
}

export function canManageGamification(role: string | undefined): boolean {
  return role === 'SUP'
}

export function canViewPerformanceCosts(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'FINANCEIRO'].includes(role)
}

export function canTriggerCompute(role: string | undefined): boolean {
  return role === 'SUP'
}
