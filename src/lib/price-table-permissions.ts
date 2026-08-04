export function canViewPriceTables(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'PADRAO', 'SDR', 'Vendedor', 'FINANCEIRO', 'COMERCIAL'].includes(role)
}

export function canCreatePriceTable(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'COMERCIAL'].includes(role)
}

export function canEditPriceTable(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'COMERCIAL'].includes(role)
}

export function canChangePriceTablePrices(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'COMERCIAL'].includes(role)
}

export function canBatchAdjustPriceTable(role: string | undefined): boolean {
  return role === 'SUP'
}

export function canDuplicatePriceTable(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'COMERCIAL'].includes(role)
}

export function canApprovePriceTable(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'COMERCIAL'].includes(role)
}

export function canActivatePriceTable(role: string | undefined): boolean {
  return role === 'SUP'
}

export function canDeactivatePriceTable(role: string | undefined): boolean {
  return role === 'SUP'
}

export function canCancelPriceTable(role: string | undefined): boolean {
  return role === 'SUP'
}

export function canViewPriceTableCosts(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'FINANCEIRO', 'COMERCIAL'].includes(role)
}

export function canViewPriceTableMargins(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'FINANCEIRO', 'COMERCIAL'].includes(role)
}

export function canExportPriceTable(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'PADRAO', 'FINANCEIRO', 'COMERCIAL'].includes(role)
}
