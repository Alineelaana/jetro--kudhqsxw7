import pb from '@/lib/pocketbase/client'

export async function getOverdueReceivables(filter?: string) {
  const base = "status != 'Recebido' && status != 'Cancelado'"
  return pb.collection('financial_receivables').getFullList({
    filter: filter ? `${base} && (${filter})` : base,
    sort: '-data_vencimento',
  })
}

export async function getAllReceivables() {
  return pb.collection('financial_receivables').getFullList({ sort: '-created' })
}

export async function getCollectionRecords() {
  return pb.collection('financial_collections').getFullList({ sort: '-created' })
}

async function findOrCreateCollection(cliente: string): Promise<any> {
  try {
    const result = await pb.collection('financial_collections').getList(1, 1, {
      filter: `cliente = "${cliente}"`,
    })
    if (result.items.length > 0) return result.items[0]
  } catch {
    /* intentionally ignored */
  }
  const user = pb.authStore.record as any
  return pb.collection('financial_collections').create({
    cliente,
    status: 'Em Cobrança',
    empresa: user?.empresa_id || '',
    filial: user?.filial_id || '',
    contacts_log: [],
    negotiations_log: [],
    historico: [],
  })
}

function appendTimeline(record: any, entry: Record<string, unknown>): any[] {
  return [...(record.historico || []), { ...entry, date: new Date().toISOString() }]
}

export async function saveContact(cliente: string, contact: Record<string, unknown>) {
  const record = await findOrCreateCollection(cliente)
  const user = pb.authStore.record as any
  const entry = { user: user?.name || 'Sistema', action: 'contact', ...contact }
  return pb.collection('financial_collections').update(record.id, {
    contacts_log: [...(record.contacts_log || []), contact],
    historico: appendTimeline(record, entry),
    ultimo_contato: (contact.datetime as string) || new Date().toISOString().split('T')[0],
    proxima_acao: (contact.next_action as string) || record.proxima_acao,
    status: 'Em Cobrança',
  })
}

export async function savePromise(cliente: string, promise: Record<string, unknown>) {
  const record = await findOrCreateCollection(cliente)
  const user = pb.authStore.record as any
  const entry = { user: user?.name || 'Sistema', action: 'promise', ...promise }
  return pb.collection('financial_collections').update(record.id, {
    promise_value: promise.value,
    promise_date: promise.date,
    promise_status: 'Pendente',
    promise_payment_method: promise.payment_method,
    promise_responsible: promise.responsible,
    historico: appendTimeline(record, entry),
    status: 'Promessa de Pagamento',
  })
}

export async function saveNegotiation(cliente: string, negotiation: Record<string, unknown>) {
  const record = await findOrCreateCollection(cliente)
  const user = pb.authStore.record as any
  const entry = { user: user?.name || 'Sistema', action: 'negotiation', ...negotiation }
  return pb.collection('financial_collections').update(record.id, {
    negotiations_log: [...(record.negotiations_log || []), negotiation],
    historico: appendTimeline(record, entry),
    status: 'Negociação',
  })
}

export async function createApprovalRequest(data: Record<string, unknown>) {
  const user = pb.authStore.record as any
  return pb.collection('financial_approvals').create({
    tipo_solicitacao: 'Desconto em Negociação',
    solicitante: user?.name || '',
    status: 'Pendente',
    empresa: user?.empresa_id || '',
    filial: user?.filial_id || '',
    ...data,
  })
}

export async function saveDispute(cliente: string, dispute: Record<string, unknown>) {
  const record = await findOrCreateCollection(cliente)
  const user = pb.authStore.record as any
  const entry = { user: user?.name || 'Sistema', action: 'dispute', ...dispute }
  return pb.collection('financial_collections').update(record.id, {
    dispute_reason: dispute.reason,
    dispute_status: 'Aberta',
    dispute_responsible: dispute.responsible,
    dispute_deadline: dispute.deadline,
    historico: appendTimeline(record, entry),
  })
}

export async function logSendCollection(cliente: string, channel: string, message: string) {
  const record = await findOrCreateCollection(cliente)
  const user = pb.authStore.record as any
  const entry = { user: user?.name || 'Sistema', action: 'send', channel, message }
  return pb.collection('financial_collections').update(record.id, {
    historico: appendTimeline(record, entry),
  })
}

export async function saveNextAction(cliente: string, action: Record<string, unknown>) {
  const record = await findOrCreateCollection(cliente)
  const user = pb.authStore.record as any
  const entry = { user: user?.name || 'Sistema', action: 'next_action', ...action }
  return pb.collection('financial_collections').update(record.id, {
    next_action_type: action.type,
    next_action_date: action.date,
    next_action_time: action.time,
    next_action_priority: action.priority,
    next_action_responsible: action.responsible,
    proxima_acao: action.type as string,
    historico: appendTimeline(record, entry),
  })
}

export async function searchPartnerByName(name: string): Promise<any | null> {
  try {
    return await pb
      .collection('partners')
      .getFirstListItem(`full_name ~ "${name}" || company_name ~ "${name}"`)
  } catch {
    return null
  }
}
