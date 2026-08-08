export function canViewValidityAlerts(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'PADRAO', 'FINANCEIRO', 'COMERCIAL'].includes(role)
}

export function canTreatValidityAlerts(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'PADRAO', 'FINANCEIRO', 'COMERCIAL'].includes(role)
}

export function canResolveValidityAlerts(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'PADRAO', 'FINANCEIRO', 'COMERCIAL'].includes(role)
}

export function canConfigureValidityRules(role: string | undefined): boolean {
  return role === 'SUP'
}

export function canConfigureValidityRecipients(role: string | undefined): boolean {
  return role === 'SUP'
}

export function canConfigureValidityDeadlines(role: string | undefined): boolean {
  return role === 'SUP'
}
