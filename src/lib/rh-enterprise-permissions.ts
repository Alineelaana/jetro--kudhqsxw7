import { canViewRH } from '@/lib/rh-permissions'

export function canViewRhOrgChart(role: string | undefined): boolean {
  return canViewRH(role)
}

export function canViewRhPerformance(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'PADRAO', 'COMERCIAL'].includes(role)
}

export function canViewRhPotential(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'PADRAO', 'COMERCIAL'].includes(role)
}

export function canViewRhSuccession(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'PADRAO', 'COMERCIAL'].includes(role)
}

export function canViewRhCompensation(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'FINANCEIRO'].includes(role)
}

export function canViewRhPersonalData(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'PADRAO'].includes(role)
}

export function canViewRhConfidential(role: string | undefined): boolean {
  return role === 'SUP'
}

export function canManageRhCompetencies(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'PADRAO'].includes(role)
}

export function canManageRhCalibration(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'PADRAO'].includes(role)
}

export function canManageRhPdi(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'PADRAO', 'COMERCIAL'].includes(role)
}

export function canManageRhOnboarding(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'PADRAO'].includes(role)
}

export function canManageRhOffboarding(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'PADRAO'].includes(role)
}

export function canUseRhAdapta(role: string | undefined): boolean {
  return canViewRH(role)
}

export function canViewRhCockpit(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'PADRAO', 'FINANCEIRO', 'COMERCIAL'].includes(role)
}
