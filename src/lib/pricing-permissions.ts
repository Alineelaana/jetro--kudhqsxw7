import { canConsultCosts } from '@/lib/permissions'

export function canViewPrices(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'PADRAO', 'SDR', 'Vendedor', 'FINANCEIRO', 'COMERCIAL'].includes(role)
}

export function canViewCosts(role: string | undefined): boolean {
  return canConsultCosts(role)
}

export function canViewMargins(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'FINANCEIRO', 'COMERCIAL'].includes(role)
}

export function canCreatePrice(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'COMERCIAL'].includes(role)
}

export function canChangePrice(role: string | undefined): boolean {
  return canCreatePrice(role)
}

export function canChangeCost(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'FINANCEIRO'].includes(role)
}

export function canChangeMargin(role: string | undefined): boolean {
  return canChangeCost(role)
}

export function canChangeCommission(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'COMERCIAL'].includes(role)
}

export function canChangeDiscounts(role: string | undefined): boolean {
  return canChangeCommission(role)
}

export function canSimulatePrices(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'PADRAO', 'SDR', 'Vendedor', 'FINANCEIRO', 'COMERCIAL'].includes(role)
}

export function canApprovePrices(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'COMERCIAL'].includes(role)
}

export function canRestoreVersions(role: string | undefined): boolean {
  return role === 'SUP'
}

export function canViewPricingAudit(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'FINANCEIRO'].includes(role)
}

export function canViewRiskMonitor(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'FINANCEIRO'].includes(role)
}

export function canExportPricing(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'PADRAO', 'FINANCEIRO', 'COMERCIAL'].includes(role)
}

export function checkSmartBlocks(
  cfg: Partial<import('@/lib/pricing-types').PricingConfig>,
  product: Partial<import('@/lib/product-types').Product>,
): string[] {
  const blocks: string[] = []
  const { parseNum, calcPrices } = require('@/lib/pricing-types')
  const computed = calcPrices(cfg)
  if (parseNum(cfg.suggested_price) > 0 && parseNum(cfg.suggested_price) < computed.final_cost)
    blocks.push('Preço abaixo do custo')
  if (computed.profit_percent < 0) blocks.push('Margem negativa')
  if (parseNum(cfg.minimum_margin) > 0 && computed.profit_percent < parseNum(cfg.minimum_margin))
    blocks.push('Margem abaixo do mínimo')
  if (product.active === false) blocks.push('Produto inativo')
  if (!cfg.icms && !cfg.cbs && !cfg.ibs) blocks.push('Imposto não configurado')
  return blocks
}
