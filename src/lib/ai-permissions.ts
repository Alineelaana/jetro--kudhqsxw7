export function canUseAiAssistant(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'PADRAO', 'SDR', 'Vendedor', 'FINANCEIRO', 'COMERCIAL'].includes(role)
}

export function canViewAiModule(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'PADRAO', 'SDR', 'Vendedor', 'FINANCEIRO', 'COMERCIAL'].includes(role)
}

export function canConsultAiHistory(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'PADRAO', 'FINANCEIRO', 'COMERCIAL'].includes(role)
}

export function canCreateAgents(role: string | undefined): boolean {
  return role === 'SUP'
}

export function canEditAgents(role: string | undefined): boolean {
  return role === 'SUP'
}

export function canActivateAgents(role: string | undefined): boolean {
  return role === 'SUP'
}

export function canPauseAgents(role: string | undefined): boolean {
  return role === 'SUP'
}

export function canCreateAutomations(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'PADRAO'].includes(role)
}

export function canActivateAutomations(role: string | undefined): boolean {
  return role === 'SUP'
}

export function canCreateFlows(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'PADRAO'].includes(role)
}

export function canEditFlows(role: string | undefined): boolean {
  return role === 'SUP'
}

export function canAddKnowledgeBase(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'PADRAO', 'COMERCIAL', 'FINANCEIRO'].includes(role)
}

export function canApproveContent(role: string | undefined): boolean {
  return role === 'SUP'
}

export function canTrainAi(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'PADRAO'].includes(role)
}

export function canApproveTraining(role: string | undefined): boolean {
  return role === 'SUP'
}

export function canApproveAiActions(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'FINANCEIRO'].includes(role)
}

export function canConsultSensitiveData(role: string | undefined): boolean {
  return role === 'SUP'
}

export function canExportAiInfo(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'PADRAO', 'FINANCEIRO', 'COMERCIAL'].includes(role)
}

export function canChangeAiSettings(role: string | undefined): boolean {
  return role === 'SUP'
}

export function canViewAdaptaGovernance(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'PADRAO', 'FINANCEIRO', 'COMERCIAL'].includes(role)
}

export function canEditAdaptaGovernance(role: string | undefined): boolean {
  return role === 'SUP'
}
