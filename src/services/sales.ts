import pb from '@/lib/pocketbase/client'
import type {
  SalesOrder,
  SalesInvoice,
  NfeRecord,
  NfceRecord,
  SalesReturn,
} from '@/lib/sales-types'

export async function getSalesOrders(): Promise<SalesOrder[]> {
  return pb.collection('sales_orders').getFullList({ sort: '-created' }) as Promise<SalesOrder[]>
}
export async function createSalesOrder(data: Record<string, unknown>): Promise<SalesOrder> {
  return pb.collection('sales_orders').create(data) as Promise<SalesOrder>
}
export async function updateSalesOrder(
  id: string,
  data: Record<string, unknown>,
): Promise<SalesOrder> {
  return pb.collection('sales_orders').update(id, data) as Promise<SalesOrder>
}
export async function deleteSalesOrder(id: string): Promise<void> {
  await pb.collection('sales_orders').delete(id)
}

export async function getSalesInvoices(): Promise<SalesInvoice[]> {
  return pb.collection('sales_invoices').getFullList({ sort: '-created' }) as Promise<
    SalesInvoice[]
  >
}
export async function createSalesInvoice(data: Record<string, unknown>): Promise<SalesInvoice> {
  return pb.collection('sales_invoices').create(data) as Promise<SalesInvoice>
}
export async function updateSalesInvoice(
  id: string,
  data: Record<string, unknown>,
): Promise<SalesInvoice> {
  return pb.collection('sales_invoices').update(id, data) as Promise<SalesInvoice>
}

export async function getNfeRecords(): Promise<NfeRecord[]> {
  return pb.collection('nfe_records').getFullList({ sort: '-created' }) as Promise<NfeRecord[]>
}
export async function createNfeRecord(data: Record<string, unknown>): Promise<NfeRecord> {
  return pb.collection('nfe_records').create(data) as Promise<NfeRecord>
}
export async function updateNfeRecord(
  id: string,
  data: Record<string, unknown>,
): Promise<NfeRecord> {
  return pb.collection('nfe_records').update(id, data) as Promise<NfeRecord>
}

export async function getNfceRecords(): Promise<NfceRecord[]> {
  return pb.collection('nfce_records').getFullList({ sort: '-created' }) as Promise<NfceRecord[]>
}
export async function createNfceRecord(data: Record<string, unknown>): Promise<NfceRecord> {
  return pb.collection('nfce_records').create(data) as Promise<NfceRecord>
}
export async function updateNfceRecord(
  id: string,
  data: Record<string, unknown>,
): Promise<NfceRecord> {
  return pb.collection('nfce_records').update(id, data) as Promise<NfceRecord>
}

export async function getSalesReturns(): Promise<SalesReturn[]> {
  return pb.collection('sales_returns').getFullList({ sort: '-created' }) as Promise<SalesReturn[]>
}
export async function createSalesReturn(data: Record<string, unknown>): Promise<SalesReturn> {
  return pb.collection('sales_returns').create(data) as Promise<SalesReturn>
}
export async function updateSalesReturn(
  id: string,
  data: Record<string, unknown>,
): Promise<SalesReturn> {
  return pb.collection('sales_returns').update(id, data) as Promise<SalesReturn>
}

export async function getNextSalesNumber(
  type: string,
): Promise<{ number: string; sequence: number }> {
  return pb.send(`/backend/v1/sales-numbers/next?type=${type}`, { method: 'GET' })
}

export async function getClients() {
  try {
    return await pb.collection('partners').getFullList({ filter: 'partner_type ~ "Cliente"' })
  } catch {
    return []
  }
}

export async function getSalespeople() {
  try {
    return await pb.collection('vendedores').getFullList({ filter: 'active = true' })
  } catch {
    return []
  }
}

export async function getCarriers() {
  try {
    return await pb.collection('transportadoras').getFullList({ filter: 'active = true' })
  } catch {
    return []
  }
}

export async function getPriceTableList() {
  try {
    return await pb.collection('price_tables').getFullList({ filter: 'active = true' })
  } catch {
    return []
  }
}

export async function getPaymentConditions() {
  try {
    return await pb.collection('condicoes_pagamento').getFullList({ filter: 'active = true' })
  } catch {
    return []
  }
}

export async function getPaymentMethods() {
  try {
    return await pb.collection('formas_pagamento').getFullList({ filter: 'active = true' })
  } catch {
    return []
  }
}

export function logSalesAudit(
  action: string,
  module: string,
  targetId: string,
  summary: string,
  prev?: unknown,
  next?: unknown,
) {
  pb.send('/backend/v1/audit/create', {
    method: 'POST',
    body: JSON.stringify({
      action,
      module,
      target_collection: 'sales_orders',
      target_id: targetId,
      target_summary: summary,
      previous_value: prev,
      new_value: next,
    }),
    headers: { 'Content-Type': 'application/json' },
  }).catch(() => {})
}
