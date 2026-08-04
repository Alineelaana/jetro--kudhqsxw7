export function canViewFiscal(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'PADRAO', 'FINANCEIRO', 'COMERCIAL'].includes(role)
}
export function canImportXml(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'PADRAO', 'FINANCEIRO'].includes(role)
}
export function canConfirmEntry(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'PADRAO'].includes(role)
}
export function canEmitFiscalDocs(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'PADRAO'].includes(role)
}
export function canCancelFiscalDocs(role: string | undefined): boolean {
  return role === 'SUP'
}
export function canIssueCorrection(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'PADRAO'].includes(role)
}
export function canManifest(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'PADRAO', 'FINANCEIRO'].includes(role)
}
export function canProcessApuracao(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'FINANCEIRO'].includes(role)
}
export function canApproveApuracao(role: string | undefined): boolean {
  return role === 'SUP'
}
export function canClosePeriod(role: string | undefined): boolean {
  return role === 'SUP'
}
export function canChangeFiscalConfig(role: string | undefined): boolean {
  return role === 'SUP'
}
export function canChangeReformRules(role: string | undefined): boolean {
  return role === 'SUP'
}
export function canClassifyProducts(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'PADRAO', 'FINANCEIRO'].includes(role)
}
export function canSimulateReform(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'PADRAO', 'SDR', 'Vendedor', 'FINANCEIRO', 'COMERCIAL'].includes(role)
}
export function canGenerateSped(role: string | undefined): boolean {
  return role === 'SUP'
}
export function canExportFiscal(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'PADRAO', 'FINANCEIRO', 'COMERCIAL'].includes(role)
}
