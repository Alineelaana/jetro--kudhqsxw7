import pb from '@/lib/pocketbase/client'

export interface OrderApprovalTier {
  id: string
  role_or_profile: string
  name: string
  order_type: 'ambos' | 'venda' | 'compra'
  max_value_direct: number
  max_value_approval: number
  max_discount_percent: number
  can_approve_credit_override: boolean
  active: boolean
}

export interface OrderApprovalRecord {
  id: string
  order_id: string
  order_number: string
  order_type: 'venda' | 'compra'
  company: string
  branch: string
  total_value: number
  requester_id: string
  requester_name: string
  approver_id: string
  approver_name: string
  action: 'solicitado' | 'aprovado' | 'rejeitado'
  tier_level: string
  reason: string
  notes: string
  approval_reasons?: string[]
  created: string
}

export interface PendingOrderApproval {
  id: string
  order_number: string
  order_type: 'venda' | 'compra'
  status: string
  total_value: number
  company: string
  branch: string
  requester_name: string
  requester_id: string
  client_or_supplier_name: string
  client_or_supplier_doc?: string
  date: string
  approval_reasons: string[]
  discount_value?: number
  payment_condition?: string
  credit_block_reason?: string
  rawOrder: Record<string, unknown>
}

/**
 * Retorna as alçadas cadastradas no sistema
 */
export async function getApprovalTiers(): Promise<OrderApprovalTier[]> {
  try {
    const records = await pb.collection('order_approval_tiers').getFullList({
      sort: '-max_value_approval',
    })
    return records as unknown as OrderApprovalTier[]
  } catch (err) {
    console.warn('Erro ao carregar alçadas:', err)
    return []
  }
}

/**
 * Busca todos os pedidos pendentes de aprovação de Venda e Compra
 */
export async function getPendingOrdersForApproval(): Promise<PendingOrderApproval[]> {
  const [salesRes, purchaseRes] = await Promise.all([
    pb
      .collection('sales_orders')
      .getFullList({
        filter: 'status = "Aguardando Aprovação" || order_stage = "Aguardando Aprovação"',
        sort: '-created',
      })
      .catch(() => []),
    pb
      .collection('purchase_orders')
      .getFullList({
        filter: 'status = "Aguardando Aprovação" || order_stage = "Aguardando Aprovação"',
        sort: '-created',
      })
      .catch(() => []),
  ])

  const pendingList: PendingOrderApproval[] = []

  salesRes.forEach((s) => {
    const raw = s as unknown as Record<string, unknown>
    const history = (raw.history as Array<Record<string, unknown>>) || []
    const reasons: string[] = []

    // Coleta motivos do histórico recente
    history.forEach((h) => {
      if (h.reasons && Array.isArray(h.reasons)) {
        h.reasons.forEach((r) => {
          if (!reasons.includes(String(r))) reasons.push(String(r))
        })
      }
      if (h.note && String(h.note).includes('Motivos:')) {
        const parts = String(h.note).replace('Motivos:', '').split(';')
        parts.forEach((p) => {
          const trimmed = p.trim()
          if (trimmed && !reasons.includes(trimmed)) reasons.push(trimmed)
        })
      }
    })

    if (raw.credit_block_reason) {
      reasons.push(`Crédito: ${raw.credit_block_reason}`)
    }

    pendingList.push({
      id: raw.id as string,
      order_number: (raw.order_number as string) || (raw.id as string),
      order_type: 'venda',
      status: (raw.status as string) || 'Aguardando Aprovação',
      total_value: parseFloat(String(raw.total_value || '0')),
      company: (raw.company as string) || (raw.empresa_id as string) || 'DEC Eldorado',
      branch: (raw.branch as string) || (raw.filial_id as string) || 'Matriz',
      requester_name:
        (raw.responsible_user as string) || (raw.salesperson_name as string) || 'Vendedor',
      requester_id: (raw.salesperson_id as string) || (raw.created_by as string) || '',
      client_or_supplier_name: (raw.client_name as string) || 'Cliente',
      client_or_supplier_doc: (raw.customer_cnpj as string) || '',
      date: (raw.created as string) || new Date().toISOString(),
      approval_reasons:
        reasons.length > 0 ? reasons : ['Alçada comercial / margem / limite de crédito'],
      discount_value: parseFloat(String(raw.discount_value || '0')),
      payment_condition: raw.payment_condition as string,
      credit_block_reason: raw.credit_block_reason as string,
      rawOrder: raw,
    })
  })

  purchaseRes.forEach((p) => {
    const raw = p as unknown as Record<string, unknown>
    const history = (raw.history as Array<Record<string, unknown>>) || []
    const reasons: string[] = []

    history.forEach((h) => {
      if (h.reasons && Array.isArray(h.reasons)) {
        h.reasons.forEach((r) => {
          if (!reasons.includes(String(r))) reasons.push(String(r))
        })
      }
      if (h.note && String(h.note).includes('Motivos:')) {
        const parts = String(h.note).replace('Motivos:', '').split(';')
        parts.forEach((part) => {
          const trimmed = part.trim()
          if (trimmed && !reasons.includes(trimmed)) reasons.push(trimmed)
        })
      }
    })

    if (parseFloat(String(raw.total_value || '0')) > 5000) {
      reasons.push('Valor do pedido acima da alçada padrão de compra (R$ 5.000,00)')
    }

    pendingList.push({
      id: raw.id as string,
      order_number: (raw.order_number as string) || (raw.id as string),
      order_type: 'compra',
      status: (raw.status as string) || 'Aguardando Aprovação',
      total_value: parseFloat(String(raw.total_value || '0')),
      company: (raw.company as string) || (raw.empresa_id as string) || 'DEC Eldorado',
      branch: (raw.branch as string) || (raw.filial_id as string) || 'Matriz',
      requester_name: (raw.responsible_user as string) || (raw.buyer as string) || 'Comprador',
      requester_id: (raw.buyer_id as string) || (raw.created_by as string) || '',
      client_or_supplier_name: (raw.supplier_name as string) || 'Fornecedor',
      client_or_supplier_doc: '',
      date: (raw.created as string) || new Date().toISOString(),
      approval_reasons:
        reasons.length > 0 ? reasons : ['Exige aprovação gerencial de compras por alçada'],
      payment_condition: raw.payment_condition as string,
      rawOrder: raw,
    })
  })

  return pendingList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

/**
 * Executa a ação de aprovar ou rejeitar pedido via endpoint seguro backend
 */
export async function executeOrderApprovalAction(params: {
  order_id: string
  order_type: 'venda' | 'compra'
  action: 'aprovar' | 'rejeitar'
  reason?: string
  notes?: string
}): Promise<{
  success: boolean
  message: string
  status?: string
  error?: string
}> {
  try {
    const res = await pb.send('/backend/v1/orders/approval/action', {
      method: 'POST',
      body: params,
    })
    return res as { success: boolean; message: string; status?: string }
  } catch (err: unknown) {
    const msg =
      err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { error?: string } }).response?.error
        : err instanceof Error
          ? err.message
          : 'Erro ao processar ação de aprovação no servidor'
    throw new Error(msg || 'Falha na validação de alçada pelo backend')
  }
}

/**
 * Submete pedido para a fila de aprovação via backend hook
 */
export async function submitOrderForApproval(params: {
  order_id: string
  order_type: 'venda' | 'compra'
  approval_reasons: string[]
}): Promise<{ success: boolean; message: string }> {
  try {
    const res = await pb.send('/backend/v1/orders/approval/submit', {
      method: 'POST',
      body: params,
    })
    return res as { success: boolean; message: string }
  } catch (err: unknown) {
    const msg =
      err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { error?: string } }).response?.error
        : err instanceof Error
          ? err.message
          : 'Erro ao submeter pedido para aprovação'
    throw new Error(msg || 'Falha ao submeter pedido')
  }
}

/**
 * Consulta o histórico auditável da trilha de aprovação
 */
export async function getApprovalTrail(orderId?: string): Promise<OrderApprovalRecord[]> {
  try {
    const filter = orderId ? `order_id = "${orderId}"` : ''
    const records = await pb.collection('order_approval_records').getFullList({
      filter: filter || undefined,
      sort: '-created',
    })
    return records as unknown as OrderApprovalRecord[]
  } catch (err) {
    console.warn('Erro ao buscar trilha de aprovação:', err)
    return []
  }
}
