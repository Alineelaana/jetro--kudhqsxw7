export type OpCostType = 'percent' | 'fixed'

export interface PricingConfig {
  id: string
  product_id: string
  product_code: string
  product_name: string
  brand: string
  category: string
  supplier: string
  unit: string
  active: boolean
  last_purchase_cost: string
  average_cost: string
  accounting_cost: string
  replacement_cost: string
  freight_cost: string
  insurance_cost: string
  other_expenses_cost: string
  financial_discount: string
  bonifications: string
  final_cost: string
  icms: string
  icms_st: string
  ipi: string
  pis: string
  cofins: string
  fcp: string
  difal: string
  iss: string
  icms_credit: string
  pis_credit: string
  cofins_credit: string
  commission_type: OpCostType
  commission_value: string
  card_fee_type: OpCostType
  card_fee_value: string
  pix_fee_type: OpCostType
  pix_fee_value: string
  marketplace_type: OpCostType
  marketplace_value: string
  packaging_type: OpCostType
  packaging_value: string
  storage_type: OpCostType
  storage_value: string
  logistics_type: OpCostType
  logistics_value: string
  marketing_type: OpCostType
  marketing_value: string
  admin_expenses_type: OpCostType
  admin_expenses_value: string
  financial_cost_type: OpCostType
  financial_cost_value: string
  other_opex_type: OpCostType
  other_opex_value: string
  desired_margin: string
  minimum_margin: string
  markup: string
  total_cost: string
  total_expenses: string
  total_taxes: string
  expected_profit: string
  minimum_price: string
  ideal_price: string
  suggested_price: string
  profit_value: string
  profit_percent: string
  price_varejo: string
  price_atacado: string
  price_distribuidor: string
  price_promocional: string
  price_especial: string
  cbs: string
  ibs: string
  selective_tax: string
  cashback: string
  maximum_margin: string
  market_avg_price: string
  market_lowest_price: string
  market_highest_price: string
  market_position: string
  company: string
  branch: string
  created: string
  updated: string
}

export interface PriceTable {
  id: string
  table_name: string
  table_type: 'varejo' | 'atacado' | 'distribuidor' | 'promocional' | 'especial'
  product_id: string
  product_code: string
  product_name: string
  price: string
  discount_percent: string
  final_price: string
  active: boolean
  created: string
  updated: string
}

export interface PricingSimulation {
  id: string
  product_id: string
  product_code: string
  product_name: string
  scenario_name: string
  scenario_type:
    | 'a_vista'
    | 'pix'
    | 'cartao'
    | 'atacado'
    | 'varejo'
    | 'promocional'
    | 'personalizado'
  simulated_price: string
  simulated_cost: string
  simulated_margin: string
  simulated_profit: string
  profit_value: string
  profit_percent: string
  rentability: string
  notes: string
  created_by: string
  created: string
  updated: string
}

export interface PricingHistory {
  id: string
  product_id: string
  product_code: string
  product_name: string
  user_name: string
  user_role: string
  previous_price: string
  new_price: string
  change_reason: string
  field_changed: string
  previous_value: string
  new_value: string
  created: string
  updated: string
}

export interface PricingApproval {
  id: string
  product_id: string
  product_code: string
  product_name: string
  requested_price: string
  current_price: string
  margin_percent: string
  minimum_margin: string
  status: 'pending' | 'approved' | 'rejected'
  requester_name: string
  approver_name: string
  rejection_reason: string
  approval_reason: string
  approved_at: string
  created: string
  updated: string
}

export interface PricingAlert {
  id: string
  product_id: string
  product_code: string
  product_name: string
  alert_type:
    | 'below_cost'
    | 'negative_margin'
    | 'selling_at_loss'
    | 'tax_not_configured'
    | 'cost_outdated'
    | 'supplier_price_changed'
    | 'tax_burden_changed'
  severity: 'info' | 'warning' | 'critical'
  message: string
  resolved: boolean
  resolved_by: string
  resolved_at: string
  created: string
  updated: string
}

export const OP_COST_FIELDS = [
  { key: 'commission', label: 'Comissão de Venda' },
  { key: 'card_fee', label: 'Taxa de Cartão' },
  { key: 'pix_fee', label: 'Taxa PIX' },
  { key: 'marketplace', label: 'Marketplace' },
  { key: 'packaging', label: 'Embalagem' },
  { key: 'storage', label: 'Armazenagem' },
  { key: 'logistics', label: 'Logística' },
  { key: 'marketing', label: 'Marketing' },
  { key: 'admin_expenses', label: 'Despesas Administrativas' },
  { key: 'financial_cost', label: 'Custo Financeiro' },
  { key: 'other_opex', label: 'Outras Despesas' },
] as const

export const COST_FIELDS = [
  { key: 'last_purchase_cost', label: 'Último Custo de Compra' },
  { key: 'average_cost', label: 'Custo Médio' },
  { key: 'accounting_cost', label: 'Custo Contábil' },
  { key: 'replacement_cost', label: 'Custo de Reposição' },
  { key: 'freight_cost', label: 'Frete' },
  { key: 'insurance_cost', label: 'Seguro' },
  { key: 'other_expenses_cost', label: 'Outras Despesas' },
  { key: 'financial_discount', label: 'Desconto Financeiro' },
  { key: 'bonifications', label: 'Bonificações' },
  { key: 'cashback', label: 'Cashback' },
] as const

export const TAX_FIELDS = [
  { key: 'icms', label: 'ICMS' },
  { key: 'icms_st', label: 'ICMS ST' },
  { key: 'ipi', label: 'IPI' },
  { key: 'pis', label: 'PIS' },
  { key: 'cofins', label: 'COFINS' },
  { key: 'fcp', label: 'FCP' },
  { key: 'difal', label: 'DIFAL' },
  { key: 'iss', label: 'ISS' },
  { key: 'icms_credit', label: 'Crédito de ICMS' },
  { key: 'pis_credit', label: 'Crédito de PIS' },
  { key: 'cofins_credit', label: 'Crédito de COFINS' },
  { key: 'cbs', label: 'CBS (Reforma Tributária)' },
  { key: 'ibs', label: 'IBS (Reforma Tributária)' },
  { key: 'selective_tax', label: 'Imposto Seletivo' },
] as const

export const TABLE_TYPES = [
  { value: 'varejo', label: 'Tabela Varejo' },
  { value: 'atacado', label: 'Tabela Atacado' },
  { value: 'distribuidor', label: 'Tabela Distribuidor' },
  { value: 'promocional', label: 'Tabela Promocional' },
  { value: 'especial', label: 'Tabela Especial' },
] as const

export function parseNum(v: string | undefined | null): number {
  if (!v) return 0
  const n = parseFloat(String(v).replace(',', '.'))
  return isNaN(n) ? 0 : n
}

export function formatCurrency(v: string | number): string {
  const n = typeof v === 'number' ? v : parseNum(v)
  return n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function calcFinalCost(cfg: Partial<PricingConfig>): number {
  const base =
    parseNum(cfg.replacement_cost) ||
    parseNum(cfg.last_purchase_cost) ||
    parseNum(cfg.average_cost) ||
    parseNum(cfg.accounting_cost)
  const freight = parseNum(cfg.freight_cost)
  const insurance = parseNum(cfg.insurance_cost)
  const other = parseNum(cfg.other_expenses_cost)
  const discount = parseNum(cfg.financial_discount)
  const bonif = parseNum(cfg.bonifications)
  return base + freight + insurance + other - discount - bonif
}

export function calcTotalTaxes(cfg: Partial<PricingConfig>): number {
  return (
    parseNum(cfg.icms) +
    parseNum(cfg.icms_st) +
    parseNum(cfg.ipi) +
    parseNum(cfg.pis) +
    parseNum(cfg.cofins) +
    parseNum(cfg.fcp) +
    parseNum(cfg.difal) +
    parseNum(cfg.iss) -
    parseNum(cfg.icms_credit) -
    parseNum(cfg.pis_credit) -
    parseNum(cfg.cofins_credit) +
    parseNum(cfg.cbs) +
    parseNum(cfg.ibs) +
    parseNum(cfg.selective_tax)
  )
}

export function calcOpCost(value: string, type: OpCostType, basePrice: number): number {
  const v = parseNum(value)
  return type === 'percent' ? (basePrice * v) / 100 : v
}

export function calcTotalExpenses(cfg: Partial<PricingConfig>, basePrice: number): number {
  let total = 0
  for (const f of OP_COST_FIELDS) {
    total += calcOpCost(
      cfg[`${f.key}_value` as keyof PricingConfig] as string,
      cfg[`${f.key}_type` as keyof PricingConfig] as OpCostType,
      basePrice,
    )
  }
  return total
}

export function calcTotalCost(cfg: Partial<PricingConfig>): number {
  return calcFinalCost(cfg) + calcTotalTaxes(cfg)
}

export function calcPrices(cfg: Partial<PricingConfig>) {
  const finalCost = calcFinalCost(cfg)
  const taxes = calcTotalTaxes(cfg)
  const totalCost = finalCost + taxes
  const desiredMargin = parseNum(cfg.desired_margin) || 30
  const minimumMargin = parseNum(cfg.minimum_margin) || 10
  const basePrice = totalCost / (1 - desiredMargin / 100)
  const expenses = calcTotalExpenses(cfg, basePrice)
  const totalWithExpenses = totalCost + expenses
  const minimumPrice = totalWithExpenses / (1 - minimumMargin / 100)
  const idealPrice = totalWithExpenses / (1 - desiredMargin / 100)
  const maximumMargin = parseNum(cfg.maximum_margin) || 50
  const maximumPrice = totalWithExpenses / (1 - maximumMargin / 100)
  const suggestedPrice = idealPrice
  const profitValue = suggestedPrice - totalWithExpenses
  const profitPercent = totalWithExpenses > 0 ? (profitValue / totalWithExpenses) * 100 : 0
  const markup = totalCost > 0 ? suggestedPrice / totalCost : 0
  const expectedProfit = profitValue
  return {
    final_cost: finalCost,
    total_taxes: taxes,
    total_cost: totalCost,
    total_expenses: expenses,
    minimum_price: minimumPrice,
    ideal_price: idealPrice,
    suggested_price: suggestedPrice,
    profit_value: profitValue,
    profit_percent: profitPercent,
    markup,
    expected_profit: expectedProfit,
    maximum_price: maximumPrice,
  }
}

export function getInitialPricingConfig(productId?: string): Partial<PricingConfig> {
  return {
    product_id: productId || '',
    product_code: '',
    product_name: '',
    brand: '',
    category: '',
    supplier: '',
    unit: '',
    active: true,
    last_purchase_cost: '',
    average_cost: '',
    accounting_cost: '',
    replacement_cost: '',
    freight_cost: '',
    insurance_cost: '',
    other_expenses_cost: '',
    financial_discount: '',
    bonifications: '',
    icms: '',
    icms_st: '',
    ipi: '',
    pis: '',
    cofins: '',
    fcp: '',
    difal: '',
    iss: '',
    icms_credit: '',
    pis_credit: '',
    cofins_credit: '',
    commission_type: 'percent',
    commission_value: '',
    card_fee_type: 'percent',
    card_fee_value: '',
    pix_fee_type: 'percent',
    pix_fee_value: '',
    marketplace_type: 'percent',
    marketplace_value: '',
    packaging_type: 'fixed',
    packaging_value: '',
    storage_type: 'percent',
    storage_value: '',
    logistics_type: 'percent',
    logistics_value: '',
    marketing_type: 'percent',
    marketing_value: '',
    admin_expenses_type: 'percent',
    admin_expenses_value: '',
    financial_cost_type: 'percent',
    financial_cost_value: '',
    other_opex_type: 'fixed',
    other_opex_value: '',
    desired_margin: '30',
    minimum_margin: '10',
    maximum_margin: '50',
    cbs: '',
    ibs: '',
    selective_tax: '',
    cashback: '',
    market_avg_price: '',
    market_lowest_price: '',
    market_highest_price: '',
    market_position: '',
    company: '',
    branch: '',
  }
}

export interface PriceVault {
  id: string
  product_id: string
  product_code: string
  product_name: string
  version_number: number
  field_changed: string
  previous_value: string
  new_value: string
  previous_margin: string
  new_margin: string
  previous_cost: string
  new_cost: string
  user_name: string
  user_role: string
  company: string
  branch: string
  reason: string
  justification: string
  related_document: string
  related_campaign: string
  observations: string
  approval_id: string
  approval_status: string
  approved_at: string
  approved_by: string
  electronic_signature: string
  is_restored: boolean
  restored_from_version: number
  created: string
  updated: string
}

export interface PricingRiskMonitor {
  id: string
  product_id: string
  product_code: string
  product_name: string
  user_name: string
  user_role: string
  change_type: string
  risk_index: number
  risk_factors: Record<string, unknown>
  previous_value: string
  new_value: string
  change_percentage: string
  company: string
  branch: string
  requires_approval: boolean
  approval_status: string
  resolved: boolean
  resolved_by: string
  resolved_at: string
  created: string
  updated: string
}
