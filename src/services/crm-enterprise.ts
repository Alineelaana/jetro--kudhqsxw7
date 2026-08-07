import pb from '@/lib/pocketbase/client'
import { updateProposal, createHistoryEntry, logCRMAudit } from '@/services/crm'

export async function getClientFinancialData(clientName: string) {
  try {
    const q = clientName.replace(/"/g, '\\"')
    const receivables = await pb
      .collection('financial_receivables')
      .getFullList({ filter: `client_name ~ "${q}"` })
    const overdue = receivables.filter((r: Record<string, unknown>) =>
      ['Atraso', 'Em Aberto', 'Vencido'].includes(r.status as string),
    )
    const totalOverdue = overdue.reduce(
      (s: number, r: Record<string, unknown>) => s + (parseFloat(r.value as string) || 0),
      0,
    )
    return {
      totalTitles: receivables.length,
      overdueCount: overdue.length,
      totalOverdue,
      hasInadimplence: totalOverdue > 0,
    }
  } catch {
    return { totalTitles: 0, overdueCount: 0, totalOverdue: 0, hasInadimplence: false }
  }
}

export async function getClientOrders(clientName: string) {
  try {
    const q = clientName.replace(/"/g, '\\"')
    return await pb
      .collection('sales_orders')
      .getFullList({ filter: `client_name ~ "${q}"`, sort: '-created' })
  } catch {
    return []
  }
}

export async function getClientDeliveries(clientName: string) {
  try {
    const q = clientName.replace(/"/g, '\\"')
    return await pb
      .collection('logistics_deliveries')
      .getFullList({ filter: `cliente ~ "${q}"`, sort: '-created' })
  } catch {
    return []
  }
}

export async function getProductsForProposal() {
  try {
    return await pb.collection('products').getFullList({ filter: 'active = true', sort: 'name' })
  } catch {
    return []
  }
}

export async function getERPIntegrationData() {
  try {
    const [receivables, orders, deliveries] = await Promise.all([
      pb
        .collection('financial_receivables')
        .getFullList()
        .catch(() => []),
      pb
        .collection('sales_orders')
        .getFullList({ sort: '-created' })
        .catch(() => []),
      pb
        .collection('logistics_deliveries')
        .getFullList({ sort: '-created' })
        .catch(() => []),
    ])
    const totalReceivables = receivables.reduce(
      (s: number, r: Record<string, unknown>) => s + (parseFloat(r.value as string) || 0),
      0,
    )
    const overdueReceivables = receivables.filter((r: Record<string, unknown>) =>
      ['Atraso', 'Em Aberto', 'Vencido'].includes(r.status as string),
    )
    const pendingDeliveries = deliveries.filter(
      (d: Record<string, unknown>) => !['Entregue', 'Cancelada'].includes(d.status as string),
    )
    return {
      totalReceivables,
      overdueCount: overdueReceivables.length,
      totalOrders: orders.length,
      pendingDeliveries: pendingDeliveries.length,
      recentOrders: orders.slice(0, 5),
    }
  } catch {
    return {
      totalReceivables: 0,
      overdueCount: 0,
      totalOrders: 0,
      pendingDeliveries: 0,
      recentOrders: [],
    }
  }
}

export async function convertProposalToOrder(proposalId: string, userName: string) {
  const proposal = await pb.collection('crm_proposals').getOne(proposalId)
  if ((proposal as Record<string, unknown>).converted_order_id) {
    throw new Error('Proposta já convertida em pedido')
  }
  const orderRes = await pb.send('/backend/v1/sales-numbers/next?type=order', { method: 'GET' })
  const rawItems = ((proposal as Record<string, unknown>).items || []) as Array<
    Record<string, unknown>
  >
  const items = rawItems.map((item) => ({
    code: '',
    product: item.product_service || '',
    unit: 'UN',
    quantity: item.quantity || '1',
    available_stock: '',
    table_price: item.unit_price || '0',
    unit_price: item.unit_price || '0',
    discount: item.discount || '0',
    addition: item.addition || '0',
    total: item.total || '0',
    margin: '',
    situation: '',
  }))
  const orderData = {
    order_number: orderRes.number,
    status: 'Rascunho',
    client_name: (proposal as Record<string, unknown>).client_name || '',
    items,
    gross_value: (proposal as Record<string, unknown>).subtotal || '0',
    discount_value: (proposal as Record<string, unknown>).discount || '0',
    addition_value: '0',
    freight_value: '0',
    insurance_value: '0',
    other_expenses: '0',
    tax_value: '0',
    total_value: (proposal as Record<string, unknown>).total || '0',
    company: (proposal as Record<string, unknown>).company || 'Velora Log',
    branch: (proposal as Record<string, unknown>).filial || 'Matriz',
    history: [
      {
        action: 'create',
        user: userName,
        date: new Date().toISOString(),
        note: `Pedido criado a partir da proposta ${(proposal as Record<string, unknown>).proposal_number}`,
      },
    ],
    responsible_user: userName,
  }
  const order = await pb.collection('sales_orders').create(orderData)
  await updateProposal(proposalId, {
    converted_order_id: order.id,
    converted_order_number: orderRes.number,
    status: 'Convertida',
  })
  await createHistoryEntry({
    entity_type: 'proposal',
    entity_id: proposalId,
    type: 'convert',
    description: `Proposta convertida em pedido ${orderRes.number}`,
    user_name: userName,
    date: new Date().toISOString(),
    company: ((proposal as Record<string, unknown>).company as string) || 'Velora Log',
    filial: ((proposal as Record<string, unknown>).filial as string) || 'Matriz',
  })
  logCRMAudit(
    'convert_proposal_to_order',
    'proposals',
    proposalId,
    `Proposta ${(proposal as Record<string, unknown>).proposal_number} convertida em pedido ${orderRes.number}`,
  )
  return order
}
