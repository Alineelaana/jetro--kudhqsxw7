export function canViewBlueprint(role: string | undefined): boolean {
  if (!role) return false
  return true
}

export function canEditBlueprint(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'COMERCIAL'].includes(role)
}

export function canPublishBlueprint(role: string | undefined): boolean {
  return role === 'SUP'
}

export function canManageBlueprintConfig(role: string | undefined): boolean {
  return role === 'SUP'
}

export function canManageADRs(role: string | undefined): boolean {
  return role === 'SUP'
}
