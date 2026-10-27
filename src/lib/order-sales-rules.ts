/**
 * order-sales-rules.ts
 * Motor de regras de negócio exclusivo para Pedido de Venda no ERP HURAM.
 * Responsável por:
 * - Validações comerciais (disponibilidade, limite de crédito, política de preço, margem mínima, descontos máximos)
 * - Custo médio e custo de reposição somente leitura oriundos do motor oficial
 * - Cálculo de margem de contribuição estimada por item e total
 * - Transições oficiais de status
 */

export interface SalesOrderValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
  requiresApproval: boolean
  approvalReasons: string[]
}

export interface SalesItemRuleInput {
  code: string
  product: string
  unit: string
  quantity: number
  available_stock: number
  table_price: number
  unit_price: number
  discount: number
  addition: number
  cost_average: number // SOMENTE LEITURA
  cost_replacement: number // SOMENTE LEITURA
  max_discount_percent?: number
  min_margin_percent?: number
}

export interface SalesPartnerCreditInfo {
  id: string
  name: string
  credit_limit: number
  credit_situation: string // 'Liberado', 'Bloqueado', 'Em Análise', 'Restrito'
  financial_restriction?: boolean
  outstanding_balance?: number
  block_credit_sales?: boolean
}

export const SALES_ORDER_STAGES = [
  'Rascunho',
  'Validado',
  'Aguardando Aprovação',
  'Confirmado',
  'Separação/Expedição',
  'Faturado Parcialmente',
  'Faturado Totalmente',
  'Concluído',
  'Cancelado',
  'Bloqueado',
] as const

export type SalesOrderStage = (typeof SALES_ORDER_STAGES)[number]

/**
 * Mapeia status legados para a nova esteira padronizada do ERP HURAM
 */
export function normalizeSalesOrderStatus(status: string | undefined): SalesOrderStage {
  if (!status) return 'Rascunho'
  const s = status.trim().toLowerCase()
  if (s.includes('rascunho') || s.includes('digitação') || s.includes('digitacao'))
    return 'Rascunho'
  if (s.includes('validado') || s.includes('validação')) return 'Validado'
  if (s.includes('aprov') && (s.includes('aguardando') || s.includes('pendente')))
    return 'Aguardando Aprovação'
  if (s.includes('confirmado') || s.includes('aprovado')) return 'Confirmado'
  if (s.includes('separ') || s.includes('exped') || s.includes('romaneio'))
    return 'Separação/Expedição'
  if (s.includes('faturado parcial') || s.includes('faturamento parcial'))
    return 'Faturado Parcialmente'
  if (s.includes('faturado') || s.includes('faturado totalmente')) return 'Faturado Totalmente'
  if (s.includes('concl')) return 'Concluído'
  if (s.includes('cancel')) return 'Cancelado'
  if (s.includes('bloque')) return 'Bloqueado'
  return 'Rascunho'
}

/**
 * Calcula a margem estimada da linha: (Preço Líquido - Custo Médio) / Preço Líquido * 100
 */
export function calculateItemMargin(
  unitPrice: number,
  discount: number,
  addition: number,
  qty: number,
  costAverage: number,
): {
  netTotal: number
  unitNet: number
  marginPercent: number
  marginTotal: number
} {
  const gross = unitPrice * qty
  const netTotal = Math.max(0, gross - discount + addition)
  const unitNet = qty > 0 ? netTotal / qty : 0
  const marginTotal = Math.max(0, netTotal - costAverage * qty)
  const marginPercent = netTotal > 0 ? ((netTotal - costAverage * qty) / netTotal) * 100 : 0

  return {
    netTotal: Number(netTotal.toFixed(2)),
    unitNet: Number(unitNet.toFixed(4)),
    marginPercent: Number(marginPercent.toFixed(2)),
    marginTotal: Number(marginTotal.toFixed(2)),
  }
}

/**
 * Validação abrangente de pedido de venda
 */
export function validateSalesOrder(params: {
  partner?: SalesPartnerCreditInfo | null
  items: SalesItemRuleInput[]
  orderTotal: number
  paymentCondition?: string
  isTermPayment?: boolean
  systemMaxDiscountPercent?: number
  systemMinMarginPercent?: number
}): SalesOrderValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  const approvalReasons: string[] = []
  const { partner, items, orderTotal, isTermPayment } = params

  if (!items || items.length === 0) {
    errors.push('O pedido deve conter pelo menos 1 item.')
  }

  // 1. Verificações de Parceiro / Crédito
  if (partner) {
    if (partner.financial_restriction || partner.credit_situation === 'Bloqueado') {
      errors.push(
        `Cliente com bloqueio financeiro ativo: ${partner.credit_situation}. Venda bloqueada.`,
      )
    }

    if (isTermPayment && partner.block_credit_sales) {
      errors.push('Cliente com bloqueio cadastral para vendas a prazo.')
    }

    if (isTermPayment && partner.credit_limit > 0) {
      const currentOutstanding = partner.outstanding_balance || 0
      const totalExposure = currentOutstanding + orderTotal
      if (totalExposure > partner.credit_limit) {
        warnings.push(
          `Limite de crédito excedido: Limite R$ ${partner.credit_limit.toFixed(2)} | Exposição após pedido: R$ ${totalExposure.toFixed(2)}`,
        )
        approvalReasons.push(
          `Limite de crédito excedido em R$ ${(totalExposure - partner.credit_limit).toFixed(2)}`,
        )
      }
    }
  }

  // 2. Verificações por Item
  const defaultMaxDiscount = params.systemMaxDiscountPercent ?? 15
  const defaultMinMargin = params.systemMinMarginPercent ?? 12

  items.forEach((it, idx) => {
    const lineNum = idx + 1
    if (!it.product || !it.product.trim()) {
      errors.push(`Item ${lineNum}: Produto não informado.`)
      return
    }
    if (it.quantity <= 0) {
      errors.push(`Item ${lineNum} (${it.product}): Quantidade deve ser maior que zero.`)
    }
    if (it.unit_price <= 0) {
      errors.push(`Item ${lineNum} (${it.product}): Preço unitário deve ser maior que zero.`)
    }

    // Estoque disponível
    if (it.quantity > it.available_stock) {
      warnings.push(
        `Item ${lineNum} (${it.product}): Quantidade solicitada (${it.quantity}) excede o estoque disponível imediato (${it.available_stock}).`,
      )
    }

    // Desconto máximo
    const maxDiscPercent = it.max_discount_percent ?? defaultMaxDiscount
    if (it.table_price > 0 && it.unit_price < it.table_price) {
      const discountPct = ((it.table_price - it.unit_price) / it.table_price) * 100
      if (discountPct > maxDiscPercent) {
        warnings.push(
          `Item ${lineNum} (${it.product}): Desconto aplicado de ${discountPct.toFixed(1)}% supera a alçada permitida de ${maxDiscPercent}%.`,
        )
        approvalReasons.push(
          `Item ${lineNum}: Desconto ${discountPct.toFixed(1)}% acima do limite de ${maxDiscPercent}%`,
        )
      }
    }

    // Margem mínima
    if (it.cost_average > 0) {
      const { marginPercent } = calculateItemMargin(
        it.unit_price,
        it.discount,
        it.addition,
        it.quantity,
        it.cost_average,
      )
      const minMargin = it.min_margin_percent ?? defaultMinMargin
      if (marginPercent < minMargin) {
        warnings.push(
          `Item ${lineNum} (${it.product}): Margem estimada (${marginPercent}%) abaixo da margem mínima configurada (${minMargin}%).`,
        )
        approvalReasons.push(
          `Item ${lineNum}: Margem estimada (${marginPercent}%) abaixo do piso (${minMargin}%)`,
        )
      }
    }
  })

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    requiresApproval: approvalReasons.length > 0,
    approvalReasons,
  }
}
