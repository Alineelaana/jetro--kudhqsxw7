const STRAT_VIEW = ['SUP', 'PADRAO', 'FINANCEIRO', 'COMERCIAL']
const STRAT_EDIT = ['SUP', 'FINANCEIRO', 'COMERCIAL']
const STRAT_ADMIN = ['SUP']

export function canViewStrategic(role: string | undefined): boolean {
  if (!role) return false
  return STRAT_VIEW.includes(role)
}
export function canEditStrategic(role: string | undefined): boolean {
  if (!role) return false
  return STRAT_EDIT.includes(role)
}
export function canManageStrategicConfig(role: string | undefined): boolean {
  return role === 'SUP'
}
export function canApproveStrategic(role: string | undefined): boolean {
  return role === 'SUP'
}
export function canDeleteStrategic(role: string | undefined): boolean {
  return role === 'SUP'
}
export function canViewStrategicFinancial(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'FINANCEIRO'].includes(role)
}
export function canManageOKRs(role: string | undefined): boolean {
  if (!role) return false
  return STRAT_EDIT.includes(role)
}
export function canManageBusinessCases(role: string | undefined): boolean {
  if (!role) return false
  return STRAT_EDIT.includes(role)
}
export function canManageGrowthExperiments(role: string | undefined): boolean {
  if (!role) return false
  return STRAT_VIEW.includes(role)
}
export function canManageMarketIntelligence(role: string | undefined): boolean {
  if (!role) return false
  return STRAT_VIEW.includes(role)
}
export function canManageStrategicDecisions(role: string | undefined): boolean {
  if (!role) return false
  return STRAT_EDIT.includes(role)
}
export function canManageStrategicIndicators(role: string | undefined): boolean {
  if (!role) return false
  return STRAT_EDIT.includes(role)
}
