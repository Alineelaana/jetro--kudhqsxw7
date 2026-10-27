/**
 * order-purchase-rules.ts
 * Motor de regras de negócio exclusivo para Pedido de Compra no ERP HURAM.
 * Responsável por:
 * - Validações de compras (fornecedor homologado, alçadas de comprador/gerência, orçamento disponível)
 * - Divergências com cotação vinculada
 * - Saldo pendente por item para recebimento parcial
 * - REGRA OBRIGATÓRIA: o preço negociado no Pedido de Compra NÃO é o custo médio do produto.
 *   O usuário informa o preço de compra negociado, mas NUNCA edita diretamente o custo oficial do estoque.
 * - Transições oficiais de status
 */

export interface PurchaseOrderValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
  requiresApproval: boolean
  approvalReasons: string[]
}

export interface PurchaseItemRuleInput {
  code: string
  product: string
  unit: string
  quantity: number
  unit_price: number
  discount: number
  quoted_price?: number // Preço da cotação vinculada (se houver)
  quantity_received?: number // Recebido até agora
  product_id?: string
}

export interface PurchasePendingBalanceItem {
  code: string
  product: string
  unit: string
  quantity_ordered: number
  quantity_received: number
  quantity_pending: number
  unit_price: number
  pending_value: number
  status: 'Pendente' | 'Parcial' | 'Entregue'
}

export const PURCHASE_ORDER_STAGES = [
  'Rascunho',
  'Validado',
  'Aguardando Aprovação',
  'Aprovado',
  'Enviado ao Fornecedor',
  'Recebimento Parcial',
  'Recebimento Total',
  'Concluído',
  'Cancelado',
  'Bloqueado',
] as const

export type PurchaseOrderStage = (typeof PURCHASE_ORDER_STAGES)[number]

/**
 * Normaliza status legados de compras para o novo fluxo padronizado
 */
export function normalizePurchaseOrderStatus(status: string | undefined): PurchaseOrderStage {
  if (!status) return 'Rascunho'
  const s = status.trim().toLowerCase()
  if (s.includes('digitação') || s.includes('digitacao') || s.includes('rascunho'))
    return 'Rascunho'
  if (s.includes('validado') || s.includes('validação')) return 'Validado'
  if (s.includes('aguardando aprovação') || s.includes('em análise') || s.includes('em analise'))
    return 'Aguardando Aprovação'
  if (s.includes('aprovado') || s.includes('aprovada')) return 'Aprovado'
  if (s.includes('enviado')) return 'Enviado ao Fornecedor'
  if (s.includes('recebido parcial') || s.includes('recebimento parcial'))
    return 'Recebimento Parcial'
  if (s.includes('recebido totalmente') || s.includes('recebido total')) return 'Recebimento Total'
  if (s.includes('concl') || s.includes('finaliz')) return 'Concluído'
  if (s.includes('cancel')) return 'Cancelado'
  if (s.includes('bloque')) return 'Bloqueado'
  return 'Rascunho'
}

/**
 * Calcula saldo pendente por item para acompanhamento de conferência física/fiscal
 */
export function calculatePendingBalances(
  items: PurchaseItemRuleInput[],
): PurchasePendingBalanceItem[] {
  return items.map((it) => {
    const ordered = Number(it.quantity) || 0
    const received = Number(it.quantity_received) || 0
    const pending = Math.max(0, ordered - received)
    const unitPrice = Number(it.unit_price) || 0
    const pendingVal = pending * unitPrice

    let status: 'Pendente' | 'Parcial' | 'Entregue' = 'Pendente'
    if (received >= ordered && ordered > 0) {
      status = 'Entregue'
    } else if (received > 0 && received < ordered) {
      status = 'Parcial'
    }

    return {
      code: it.code || '',
      product: it.product || '',
      unit: it.unit || 'UN',
      quantity_ordered: ordered,
      quantity_received: received,
      quantity_pending: pending,
      unit_price: unitPrice,
      pending_value: Number(pendingVal.toFixed(2)),
      status,
    }
  })
}

/**
 * Validação abrangente de pedido de compra
 */
export function validatePurchaseOrder(params: {
  supplierId?: string
  supplierName?: string
  items: PurchaseItemRuleInput[]
  orderTotal: number
  approvalThreshold?: number
  budgetAvailable?: number
  quotationTolerancePercent?: number
}): PurchaseOrderValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  const approvalReasons: string[] = []

  const {
    items,
    orderTotal,
    approvalThreshold = 5000,
    budgetAvailable,
    quotationTolerancePercent = 5,
  } = params

  if (!params.supplierId && !params.supplierName) {
    errors.push('Fornecedor não selecionado.')
  }

  if (!items || items.length === 0) {
    errors.push('O pedido de compra deve conter ao menos 1 item.')
  }

  // Alçada de comprador
  if (orderTotal > approvalThreshold) {
    approvalReasons.push(
      `Valor total (R$ ${orderTotal.toFixed(2)}) supera o teto de autoaprovação de R$ ${approvalThreshold.toFixed(2)}. Exige aprovação de alçada gerencial.`,
    )
  }

  // Verificação de orçamento (se parametrizado)
  if (budgetAvailable !== undefined && budgetAvailable >= 0) {
    if (orderTotal > budgetAvailable) {
      warnings.push(
        `O pedido supera o orçamento alocado disponível (Orçamento: R$ ${budgetAvailable.toFixed(2)} | Pedido: R$ ${orderTotal.toFixed(2)}).`,
      )
      approvalReasons.push(
        `Estouro de verba orçamentária em R$ ${(orderTotal - budgetAvailable).toFixed(2)}`,
      )
    }
  }

  // Validação por item
  items.forEach((it, idx) => {
    const lineNum = idx + 1
    if (!it.product || !it.product.trim()) {
      errors.push(`Item ${lineNum}: Produto/Insumo não informado.`)
      return
    }
    if (it.quantity <= 0) {
      errors.push(`Item ${lineNum} (${it.product}): Quantidade deve ser maior que zero.`)
    }
    if (it.unit_price <= 0) {
      errors.push(`Item ${lineNum} (${it.product}): Preço negociado deve ser maior que zero.`)
    }

    // Divergência contra cotação vinculada
    if (it.quoted_price && it.quoted_price > 0) {
      const diff = it.unit_price - it.quoted_price
      if (diff > 0) {
        const diffPercent = (diff / it.quoted_price) * 100
        if (diffPercent > quotationTolerancePercent) {
          warnings.push(
            `Item ${lineNum} (${it.product}): Preço informado (R$ ${it.unit_price.toFixed(2)}) está ${diffPercent.toFixed(1)}% acima da cotação vencedora (R$ ${it.quoted_price.toFixed(2)}).`,
          )
          approvalReasons.push(
            `Item ${lineNum}: Preço divergente da cotação (+${diffPercent.toFixed(1)}% vs cotação)`,
          )
        }
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
