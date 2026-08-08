const SAFETY_ROLES = ['SUP', 'PADRAO']
const MEDICAL_ROLES = ['SUP']
const VIEW_ROLES = ['SUP', 'PADRAO', 'FINANCEIRO', 'COMERCIAL', 'SDR', 'Vendedor']

export function canViewSST(role: string | undefined): boolean {
  if (!role) return false
  return VIEW_ROLES.includes(role)
}

export function canManageSST(role: string | undefined): boolean {
  if (!role) return false
  return SAFETY_ROLES.includes(role)
}

export function canManageRiskMatrix(role: string | undefined): boolean {
  if (!role) return false
  return SAFETY_ROLES.includes(role)
}

export function canManageGRO(role: string | undefined): boolean {
  if (!role) return false
  return SAFETY_ROLES.includes(role)
}

export function canManagePGR(role: string | undefined): boolean {
  if (!role) return false
  return SAFETY_ROLES.includes(role)
}

export function canManageAccidents(role: string | undefined): boolean {
  if (!role) return false
  return SAFETY_ROLES.includes(role)
}

export function canManageCAT(role: string | undefined): boolean {
  if (!role) return false
  return SAFETY_ROLES.includes(role)
}

export function canManageEPI(role: string | undefined): boolean {
  if (!role) return false
  return SAFETY_ROLES.includes(role)
}

export function canManageEPC(role: string | undefined): boolean {
  if (!role) return false
  return SAFETY_ROLES.includes(role)
}

export function canManageInspections(role: string | undefined): boolean {
  if (!role) return false
  return SAFETY_ROLES.includes(role)
}

export function canManageAPR(role: string | undefined): boolean {
  if (!role) return false
  return SAFETY_ROLES.includes(role)
}

export function canManageWorkPermits(role: string | undefined): boolean {
  if (!role) return false
  return SAFETY_ROLES.includes(role)
}

export function canManageCIPA(role: string | undefined): boolean {
  if (!role) return false
  return SAFETY_ROLES.includes(role)
}

export function canManageSESMT(role: string | undefined): boolean {
  if (!role) return false
  return SAFETY_ROLES.includes(role)
}

export function canManageEsocialSST(role: string | undefined): boolean {
  if (!role) return false
  return SAFETY_ROLES.includes(role)
}

export function canViewMedicalRecord(role: string | undefined): boolean {
  if (!role) return false
  return MEDICAL_ROLES.includes(role)
}

export function canViewAdministrativeASO(role: string | undefined): boolean {
  if (!role) return false
  return VIEW_ROLES.includes(role)
}

export function canViewClinicalData(role: string | undefined): boolean {
  if (!role) return false
  return MEDICAL_ROLES.includes(role)
}

export function canViewSSTCockpit(role: string | undefined): boolean {
  if (!role) return false
  return VIEW_ROLES.includes(role)
}

export function canUseSSTAdapta(role: string | undefined): boolean {
  return canViewSST(role)
}

export function canManageCompliance(role: string | undefined): boolean {
  if (!role) return false
  return SAFETY_ROLES.includes(role)
}

export function canManageEmergencies(role: string | undefined): boolean {
  if (!role) return false
  return SAFETY_ROLES.includes(role)
}

export function canManageLockout(role: string | undefined): boolean {
  if (!role) return false
  return SAFETY_ROLES.includes(role)
}

export function canManageMOC(role: string | undefined): boolean {
  if (!role) return false
  return SAFETY_ROLES.includes(role)
}

export function canViewPPP(role: string | undefined): boolean {
  if (!role) return false
  return VIEW_ROLES.includes(role)
}

export function canManageInvestigations(role: string | undefined): boolean {
  if (!role) return false
  return SAFETY_ROLES.includes(role)
}

export function canManageObligations(role: string | undefined): boolean {
  if (!role) return false
  return SAFETY_ROLES.includes(role)
}

export function canManageAuditChecklists(role: string | undefined): boolean {
  if (!role) return false
  return SAFETY_ROLES.includes(role)
}

export function canViewNR10Data(role: string | undefined): boolean {
  if (!role) return false
  return VIEW_ROLES.includes(role)
}

export function canViewNR12Data(role: string | undefined): boolean {
  if (!role) return false
  return VIEW_ROLES.includes(role)
}

export function canViewNR13Data(role: string | undefined): boolean {
  if (!role) return false
  return VIEW_ROLES.includes(role)
}

export function canViewNR11Data(role: string | undefined): boolean {
  if (!role) return false
  return VIEW_ROLES.includes(role)
}

export function canViewNR15Data(role: string | undefined): boolean {
  if (!role) return false
  return VIEW_ROLES.includes(role)
}

export function canViewNR16Data(role: string | undefined): boolean {
  if (!role) return false
  return VIEW_ROLES.includes(role)
}
