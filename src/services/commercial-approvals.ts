import pb from '@/lib/pocketbase/client'

const COLLECTION_REQUESTS = 'commercial_release_requests'
const COLLECTION_DIVERGENCES = 'commercial_release_divergences'
const COLLECTION_DECISIONS = 'commercial_release_decisions'

export type ReleaseStatus = 'pendente' | 'aprovada' | 'recusada' | 'cancelada'
export type DivergenceStatus = 'pendente' | 'aplicada' | 'recusada'
export type DivergenceUnit = 'percent' | 'real'

export interface CommercialReleaseRequest {
  id: string
  empresa_id: string
  filial_id: string
  order_id: string
  order_number: string
  client_id: string
  client_name: string
  rca_id: string
  rca_name: string
  requester_id: string
  requester_name: string
  responsavel_id: string
  responsavel_name: string
  status: ReleaseStatus
  negotiation_type: string
  operation: string
  freight_type: string
  order_value: number
  order_date: string
  divergences_count: number
  resolved_count: number
  source: string
  notes: string
  created: string
  updated: string
  expand?: {
    divergences?: CommercialReleaseDivergence[]
  }
}

export interface CommercialReleaseDivergence {
  id: string
  request_id: string
  order_id: string
  order_item_id: string
  product_code: string
  product_description: string
  quantity: number
  table_price: number
  requested_discount: number
  discount_value: number
  ipi_value: number
  st_value: number
  unit_with_taxes: number
  rule_description: string
  rule_type: string
  limit_value: number
  limit_unit: DivergenceUnit
  requested_value: number
  requested_unit: DivergenceUnit
  vendor_name: string
  status: DivergenceStatus
  decided_by: string
  decided_at: string
  decision_note: string
  created: string
  updated: string
}

export interface CommercialReleaseDecision {
  id: string
  divergence_id: string
  order_number: string
  client_name: string
  rca_name: string
  rule_description: string
  limit_value: number
  requested_value: number
  decision: 'aplicada' | 'recusada'
  reason: string
  decided_by: string
  decided_by_id: string
  created: string
}

function applyMultitenancyFilter(): string {
  const empresaId = pb.authStore.record?.empresa_id as string | undefined
  return empresaId ? `empresa_id = "${empresaId}"` : ''
}

export interface ListRequestsParams {
  status?: ReleaseStatus | 'todas'
  search?: string
  empresaId?: string
  filialId?: string
  rcaName?: string
  responsavelId?: string
  ruleType?: string
  dateFrom?: string
  dateTo?: string
}

function buildFilter(params: ListRequestsParams): string {
  const parts: string[] = []
  const multitenancy = applyMultitenancyFilter()
  if (multitenancy) parts.push(multitenancy)
  if (params.status && params.status !== 'todas') {
    parts.push(`status = "${params.status}"`)
  }
  if (params.search) {
    const s = params.search.replace(/"/g, '\\"')
    parts.push(`(order_number ~ "${s}" || client_name ~ "${s}")`)
  }
  if (params.empresaId) parts.push(`empresa_id = "${params.empresaId}"`)
  if (params.filialId) parts.push(`filial_id = "${params.filialId}"`)
  if (params.rcaName) parts.push(`rca_name ~ "${params.rcaName}"`)
  if (params.responsavelId) parts.push(`responsavel_id = "${params.responsavelId}"`)
  if (params.dateFrom) parts.push(`order_date >= "${params.dateFrom} 00:00:00"`)
  if (params.dateTo) parts.push(`order_date <= "${params.dateTo} 23:59:59"`)
  return parts.join(' && ')
}

export async function listReleaseRequests(
  params: ListRequestsParams = {},
): Promise<CommercialReleaseRequest[]> {
  const filter = buildFilter(params)
  return pb.collection(COLLECTION_REQUESTS).getFullList({
    filter,
    sort: '-created',
  }) as Promise<CommercialReleaseRequest[]>
}

export async function getReleaseRequest(id: string): Promise<CommercialReleaseRequest> {
  return pb.collection(COLLECTION_REQUESTS).getOne(id) as Promise<CommercialReleaseRequest>
}

export async function listDivergences(requestId: string): Promise<CommercialReleaseDivergence[]> {
  return pb
    .collection(COLLECTION_DIVERGENCES)
    .getFullList({ filter: `request_id = "${requestId}"`, sort: 'created' }) as Promise<
    CommercialReleaseDivergence[]
  >
}

export async function listDivergencesByRule(ruleType: string): Promise<number> {
  const res = await pb.collection(COLLECTION_DIVERGENCES).getList(1, 1, {
    filter: `rule_type = "${ruleType}"`,
  })
  return res.totalItems || 0
}

export async function listDecisions(requestId: string): Promise<CommercialReleaseDecision[]> {
  try {
    const res = await pb.send<{
      request_id: string
      total: number
      decisions: CommercialReleaseDecision[]
    }>(`/backend/v1/commercial-approvals/history/${requestId}`, {})
    return res.decisions || []
  } catch {
    return pb
      .collection(COLLECTION_DECISIONS)
      .getFullList({ filter: `request_id = "${requestId}"`, sort: 'created' }) as Promise<
      CommercialReleaseDecision[]
    >
  }
}

export interface DecideInput {
  divergenceId: string
  decision: 'aplicada' | 'recusada'
  reason?: string
}

export async function decideDivergence(input: DecideInput): Promise<{
  ok: boolean
  request_status: string
  divergences: { total: number; aplicadas: number; recusadas: number; pendentes: number }
}> {
  return pb.send('/backend/v1/commercial-approvals/decide', {
    method: 'POST',
    body: JSON.stringify({
      divergence_id: input.divergenceId,
      decision: input.decision,
      reason: input.reason || '',
    }),
  })
}

export async function notifyReleaseRequest(requestId: string): Promise<{
  ok: boolean
  deduplicated?: boolean
  pending_assignment?: boolean
  message?: string
}> {
  return pb.send('/backend/v1/commercial-approvals/notify', {
    method: 'POST',
    body: JSON.stringify({ request_id: requestId }),
  })
}

// Cria (ou retorna a existente) a solicitação de liberação de um pedido.
// Usado por rotinas que detectam divergência ao salvar/enviar um pedido.
export async function ensureReleaseRequest(input: {
  empresa_id?: string
  filial_id?: string
  order_id: string
  order_number: string
  client_id: string
  client_name: string
  rca_id?: string
  rca_name?: string
  requester_id?: string
  requester_name?: string
  responsavel_id?: string
  responsavel_name?: string
  negotiation_type?: string
  operation?: string
  freight_type?: string
  order_value?: number
  order_date?: string
  divergences_count?: number
  source?: string
}): Promise<CommercialReleaseRequest | null> {
  try {
    const existing = await pb.collection(COLLECTION_REQUESTS).getList(1, 1, {
      filter: `order_id = "${input.order_id}"`,
    })
    if (existing.totalItems > 0) {
      return existing.items[0] as unknown as CommercialReleaseRequest
    }
    return (await pb
      .collection(COLLECTION_REQUESTS)
      .create({ ...input, status: 'pendente' })) as unknown as CommercialReleaseRequest
  } catch (err) {
    console.warn('Erro ao criar solicitação de liberação:', err)
    return null
  }
}

export async function ensureDivergence(input: {
  request_id: string
  order_id: string
  order_item_id?: string
  product_code?: string
  product_description?: string
  quantity?: number
  table_price?: number
  requested_discount?: number
  discount_value?: number
  ipi_value?: number
  st_value?: number
  unit_with_taxes?: number
  rule_description: string
  rule_type?: string
  limit_value?: number
  limit_unit?: DivergenceUnit
  requested_value?: number
  requested_unit?: DivergenceUnit
  vendor_name?: string
  empresa_id?: string
  filial_id?: string
}): Promise<CommercialReleaseDivergence | null> {
  try {
    const existing = await pb.collection(COLLECTION_DIVERGENCES).getList(1, 1, {
      filter: `request_id = "${input.request_id}" && rule_description = "${input.rule_description}" && (order_item_id = "${input.order_item_id || ''}" || order_item_id = "")`,
    })
    if (existing.totalItems > 0) {
      return existing.items[0] as unknown as CommercialReleaseDivergence
    }
    return (await pb
      .collection(COLLECTION_DIVERGENCES)
      .create({ ...input, status: 'pendente' })) as unknown as CommercialReleaseDivergence
  } catch (err) {
    console.warn('Erro ao criar divergência:', err)
    return null
  }
}
