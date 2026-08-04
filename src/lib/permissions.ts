export function canManagePartners(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'FINANCEIRO', 'COMERCIAL'].includes(role)
}

export function canManageRestrictions(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'FINANCEIRO'].includes(role)
}

export function canRegisterPartners(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'COMERCIAL'].includes(role)
}

export function canEditPartners(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'FINANCEIRO', 'COMERCIAL'].includes(role)
}

export function canDeletePartners(role: string | undefined): boolean {
  return role === 'SUP'
}

export function canViewSales(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'PADRAO', 'SDR', 'Vendedor', 'FINANCEIRO', 'COMERCIAL'].includes(role)
}

export function canViewStock(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'PADRAO', 'SDR', 'Vendedor', 'FINANCEIRO', 'COMERCIAL'].includes(role)
}

export function canConsultCosts(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'FINANCEIRO', 'COMERCIAL'].includes(role)
}

export function canMakeMovements(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'PADRAO'].includes(role)
}

export function canCreateInventories(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'PADRAO'].includes(role)
}

export function canApproveInventories(role: string | undefined): boolean {
  return role === 'SUP'
}

export function canCreateTransfers(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'PADRAO'].includes(role)
}

export function canApproveTransfers(role: string | undefined): boolean {
  return role === 'SUP'
}

export function canMakeAdjustments(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'PADRAO'].includes(role)
}

export function canApproveAdjustments(role: string | undefined): boolean {
  return role === 'SUP'
}

export function canBlockLots(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'PADRAO'].includes(role)
}

export function canUnblockLots(role: string | undefined): boolean {
  return role === 'SUP'
}

export function canPickOrders(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'PADRAO', 'SDR'].includes(role)
}

export function canCheckProducts(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'PADRAO'].includes(role)
}

export function canDispatchExpedition(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'PADRAO'].includes(role)
}

export function canAllowNegativeStock(role: string | undefined): boolean {
  return role === 'SUP'
}

export function canExportInfo(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'PADRAO', 'FINANCEIRO', 'COMERCIAL'].includes(role)
}

export function canViewConfiguracoes(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'COMERCIAL', 'FINANCEIRO'].includes(role)
}

export function canManageConfiguracoes(role: string | undefined): boolean {
  return role === 'SUP'
}

export function canViewAuditLogs(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'FINANCEIRO', 'COMERCIAL'].includes(role)
}

export function canManageIntegrations(role: string | undefined): boolean {
  return role === 'SUP'
}

export function canManageBackups(role: string | undefined): boolean {
  return role === 'SUP'
}

export function canManageApis(role: string | undefined): boolean {
  return role === 'SUP'
}

export function canManagePermissions(role: string | undefined): boolean {
  return role === 'SUP'
}

export function canManageSystemParams(role: string | undefined): boolean {
  return role === 'SUP'
}

export function canManageUsers(role: string | undefined): boolean {
  return role === 'SUP'
}

export function canManageCms(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP'].includes(role)
}

export function canManageAiTraining(role: string | undefined): boolean {
  return role === 'SUP'
}

export function canViewPurchasing(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'PADRAO', 'COMERCIAL', 'FINANCEIRO'].includes(role)
}

export function canViewBudgets(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'PADRAO', 'SDR', 'Vendedor', 'FINANCEIRO', 'COMERCIAL'].includes(role)
}

export function canViewChat(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'PADRAO', 'SDR', 'Vendedor', 'FINANCEIRO', 'COMERCIAL'].includes(role)
}
