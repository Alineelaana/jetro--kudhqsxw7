const SUP_ROLES = ['SUP']

export function canViewOwnSector(role: string | undefined): boolean {
  return !!role
}

export function canViewAllAtendimentos(role: string | undefined): boolean {
  if (!role) return false
  return SUP_ROLES.includes(role) || role === 'COMERCIAL' || role === 'FINANCEIRO'
}

export function canEditAtendimento(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'PADRAO', 'COMERCIAL', 'FINANCEIRO', 'SDR', 'Vendedor'].includes(role)
}

export function canCloseAtendimento(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'PADRAO', 'COMERCIAL'].includes(role)
}

export function canAssignManual(role: string | undefined): boolean {
  return role === 'SUP'
}

export function canManageMotivos(role: string | undefined): boolean {
  return role === 'SUP'
}

export function canManageSetores(role: string | undefined): boolean {
  return role === 'SUP'
}

export function canManageFlows(role: string | undefined): boolean {
  return role === 'SUP'
}

export function canViewAtendimentoModule(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'PADRAO', 'SDR', 'Vendedor', 'FINANCEIRO', 'COMERCIAL'].includes(role)
}
