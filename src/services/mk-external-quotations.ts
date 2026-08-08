import pb from '@/lib/pocketbase/client'
import { createPurchaseRequest, getNextPurchaseNumber } from '@/services/purchasing'
import type {
  MkExternalQuotation,
  MkQuotationSupplier,
  MkQuotationProposal,
  MkNegotiationRound,
  MkApprovalEntry,
} from '@/lib/mk-external-quotations-types'
import { getApprovalLevel } from '@/lib/mk-external-quotations-types'

function generateEqNumber(): string {
  const d = new Date()
  const r = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `COT-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}-${r}`
}

export async function getEqList(filters?: Record<string, string>): Promise<MkExternalQuotation[]> {
  const parts: string[] = []
  if (filters?.status) parts.push(`status = "${filters.status}"`)
  if (filters?.company) parts.push(`company = "${filters.company}"`)
  if (filters?.priority) parts.push(`priority = "${filters.priority}"`)
  return pb.collection('mk_external_quotations').getFullList({
    sort: '-created',
    filter: parts.length ? parts.join(' && ') : undefined,
  }) as Promise<MkExternalQuotation[]>
}

export async function getEqOne(id: string): Promise<MkExternalQuotation> {
  return pb.collection('mk_external_quotations').getOne(id) as Promise<MkExternalQuotation>
}

export async function createEq(data: Record<string, unknown>): Promise<MkExternalQuotation> {
  const user = pb.authStore.record as Record<string, unknown> | null
  return pb.collection('mk_external_quotations').create({
    ...data,
    quotation_number: generateEqNumber(),
    status: data.status || 'rascunho',
    suppliers: data.suppliers || [],
    proposals: data.proposals || [],
    negotiation_history: data.negotiation_history || [],
    approval_data: data.approval_data || [],
    created_by: user?.id || '',
    created_by_name: (user?.name as string) || '',
  }) as Promise<MkExternalQuotation>
}

export async function updateEq(
  id: string,
  data: Record<string, unknown>,
): Promise<MkExternalQuotation> {
  return pb.collection('mk_external_quotations').update(id, data) as Promise<MkExternalQuotation>
}

export async function deleteEq(id: string): Promise<void> {
  await pb.collection('mk_external_quotations').delete(id)
}

export async function addEqSupplier(
  quotationId: string,
  supplier: MkQuotationSupplier,
): Promise<void> {
  const q = await getEqOne(quotationId)
  await updateEq(quotationId, { suppliers: [...(q.suppliers || []), supplier] })
  logEqAudit('fornecedor_convidado', quotationId, `Fornecedor ${supplier.supplier_name} convidado`)
}

export async function updateEqSupplierStatus(
  quotationId: string,
  supplierId: string,
  status: string,
): Promise<void> {
  const q = await getEqOne(quotationId)
  const suppliers = (q.suppliers || []).map((s) =>
    s.supplier_id === supplierId ? { ...s, status } : s,
  )
  await updateEq(quotationId, { suppliers })
}

export async function addEqProposal(
  quotationId: string,
  proposal: MkQuotationProposal,
): Promise<void> {
  const q = await getEqOne(quotationId)
  await updateEq(quotationId, { proposals: [...(q.proposals || []), proposal] })
  const suppliers = (q.suppliers || []).map((s) =>
    s.supplier_id === proposal.supplier_id
      ? { ...s, status: 'proposta_recebida', proposal_received_at: new Date().toISOString() }
      : s,
  )
  await updateEq(quotationId, { suppliers, status: 'propostas_recebidas' })
  logEqAudit('proposta_recebida', quotationId, `Proposta de ${proposal.supplier_name} recebida`)
}

export async function addEqNegotiationRound(
  quotationId: string,
  round: MkNegotiationRound,
): Promise<void> {
  const q = await getEqOne(quotationId)
  await updateEq(quotationId, {
    negotiation_history: [...(q.negotiation_history || []), round],
    status: 'em_negociacao',
  })
  logEqAudit(
    'negociacao',
    quotationId,
    `Negociação com ${round.supplier_name}: R$ ${round.new_value}`,
  )
}

export async function setEqRecommendation(
  quotationId: string,
  supplierId: string,
  supplierName: string,
  justification: string,
): Promise<void> {
  await updateEq(quotationId, {
    recommended_supplier_id: supplierId,
    recommended_supplier_name: supplierName,
    recommendation_justification: justification,
    status: 'aguardando_aprovacao',
  })
  logEqAudit('recomendacao', quotationId, `Recomendado: ${supplierName}`)
}

export async function approveEq(
  quotationId: string,
  notes: string,
  userName: string,
  userId: string,
): Promise<void> {
  const q = await getEqOne(quotationId)
  const entry: MkApprovalEntry = {
    id: crypto.randomUUID(),
    action: 'approve',
    user: userName,
    user_id: userId,
    date: new Date().toISOString(),
    notes,
    level: getApprovalLevel(
      parseFloat(
        q.proposals.find((p) => p.supplier_id === q.recommended_supplier_id)?.final_value || '0',
      ),
    ).level,
  }
  await updateEq(quotationId, {
    status: 'aprovada',
    approval_data: [...(q.approval_data || []), entry],
  })
  logEqAudit('aprovacao', quotationId, `Aprovado por ${userName}`)
}

export async function rejectEq(
  quotationId: string,
  notes: string,
  userName: string,
  userId: string,
): Promise<void> {
  const q = await getEqOne(quotationId)
  const entry: MkApprovalEntry = {
    id: crypto.randomUUID(),
    action: 'reject',
    user: userName,
    user_id: userId,
    date: new Date().toISOString(),
    notes,
    level: '',
  }
  await updateEq(quotationId, {
    status: 'rejeitada',
    approval_data: [...(q.approval_data || []), entry],
  })
  logEqAudit('rejeicao', quotationId, `Rejeitado por ${userName}`)
}

export async function requestEqAdjustment(
  quotationId: string,
  notes: string,
  userName: string,
  userId: string,
): Promise<void> {
  const q = await getEqOne(quotationId)
  const entry: MkApprovalEntry = {
    id: crypto.randomUUID(),
    action: 'request_adjustment',
    user: userName,
    user_id: userId,
    date: new Date().toISOString(),
    notes,
    level: '',
  }
  await updateEq(quotationId, {
    status: 'em_negociacao',
    approval_data: [...(q.approval_data || []), entry],
  })
}

export async function generateEqPurchaseRequest(
  quotationId: string,
  userName: string,
): Promise<string> {
  const q = await getEqOne(quotationId)
  const recommended = q.proposals.find((p) => p.supplier_id === q.recommended_supplier_id)
  if (!recommended) throw new Error('Fornecedor recomendado não possui proposta')
  const { number } = await getNextPurchaseNumber('request')
  const priorityMap: Record<string, string> = {
    critica: 'Urgente',
    urgente: 'Urgente',
    alta: 'Alta',
    normal: 'Normal',
    baixa: 'Baixa',
  }
  const result = await createPurchaseRequest({
    request_number: number,
    status: 'Rascunho',
    requester: q.requester,
    requester_id: q.requester_id,
    company: q.company,
    branch: q.branch,
    cost_center: q.cost_center,
    department: 'Marketing',
    priority: priorityMap[q.priority] || 'Normal',
    justification: `Cotação externa ${q.quotation_number} - ${q.title}`,
    items: [
      {
        product: q.description,
        description: q.specifications,
        quantity: q.quantity,
        unit: q.unit,
        observation: `Fornecedor: ${recommended.supplier_name} - Valor: R$ ${recommended.final_value} - Prazo: ${recommended.delivery_deadline}`,
      },
    ],
    responsible_user: userName,
    history: [
      {
        action: 'Gerado de Cotação Externa',
        user: userName,
        date: new Date().toISOString(),
        note: q.quotation_number,
      },
    ],
  })
  const prId = (result as Record<string, unknown>).id as string
  await updateEq(quotationId, {
    status: 'encaminhada_compras',
    purchase_request_id: prId,
    purchase_request_number: number,
  })
  logEqAudit('geracao_compra', quotationId, `Compra gerada: ${number}`)
  return number
}

export async function getCorporateSuppliers(): Promise<Record<string, unknown>[]> {
  try {
    return await pb.collection('partners').getFullList({ filter: 'partner_type ~ "Fornecedor"' })
  } catch {
    return []
  }
}

export async function getTradeActions(): Promise<Record<string, unknown>[]> {
  try {
    return await pb.collection('trade_marketing_actions').getFullList({ sort: '-created' })
  } catch {
    return []
  }
}

export function logEqAudit(action: string, targetId: string, summary: string): void {
  pb.send('/backend/v1/audit/create', {
    method: 'POST',
    body: JSON.stringify({
      action,
      module: 'mk_external_quotations',
      target_collection: 'mk_external_quotations',
      target_id: targetId,
      target_summary: summary,
    }),
    headers: { 'Content-Type': 'application/json' },
  }).catch(() => {})
}
