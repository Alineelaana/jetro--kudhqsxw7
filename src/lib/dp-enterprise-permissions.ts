import { canViewRH } from '@/lib/rh-permissions'

export function canViewDpSalary(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'FINANCEIRO'].includes(role)
}

export function canViewDpPayroll(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'FINANCEIRO'].includes(role)
}

export function canViewDpDiscounts(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'FINANCEIRO'].includes(role)
}

export function canViewDpBankData(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'FINANCEIRO'].includes(role)
}

export function canViewDpDocuments(role: string | undefined): boolean {
  return canViewRH(role)
}

export function canViewDpBenefits(role: string | undefined): boolean {
  return canViewRH(role)
}

export function canViewDpDependents(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'PADRAO'].includes(role)
}

export function canViewDpLeaves(role: string | undefined): boolean {
  return canViewRH(role)
}

export function canManageDpAdmissions(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'PADRAO'].includes(role)
}

export function canManageDpContracts(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'PADRAO'].includes(role)
}

export function canManageDpDismissals(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'PADRAO'].includes(role)
}

export function canManageDpEsocial(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'PADRAO', 'FINANCEIRO'].includes(role)
}

export function canManageDpFgts(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'FINANCEIRO'].includes(role)
}

export function canManageDpBankHours(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'PADRAO'].includes(role)
}

export function canManageDpTaxTables(role: string | undefined): boolean {
  return role === 'SUP'
}

export function canManageDpConsignments(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'FINANCEIRO'].includes(role)
}

export function canManageDpUnions(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'PADRAO'].includes(role)
}

export function canManageDpProvisions(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'FINANCEIRO'].includes(role)
}

export function canUseDpAdapta(role: string | undefined): boolean {
  return canViewRH(role)
}
