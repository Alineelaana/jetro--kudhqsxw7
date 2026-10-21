import pb from '@/lib/pocketbase/client'
import { mergeTenantFilter, withTenantData } from '@/lib/multitenancy'

export async function getPurchaseRequests(filter?: string) {
  const merged = mergeTenantFilter('company', filter)
  return pb.collection('purchase_requests').getFullList({
    sort: '-created',
    filter: merged || undefined,
  })
}
export async function createPurchaseRequest(data: Record<string, unknown>) {
  const tenantData = withTenantData(data, 'company')
  return pb.collection('purchase_requests').create(tenantData)
}
export async function updatePurchaseRequest(id: string, data: Record<string, unknown>) {
  return pb.collection('purchase_requests').update(id, data)
}
export async function deletePurchaseRequest(id: string) {
  return pb.collection('purchase_requests').delete(id)
}

export async function getQuotations() {
  return pb.collection('quotations').getFullList({ sort: '-created' })
}
export async function createQuotation(data: Record<string, unknown>) {
  return pb.collection('quotations').create(data)
}
export async function updateQuotation(id: string, data: Record<string, unknown>) {
  return pb.collection('quotations').update(id, data)
}

export async function getPurchaseOrders(filter?: string) {
  const merged = mergeTenantFilter('company', filter)
  return pb.collection('purchase_orders').getFullList({
    sort: '-created',
    filter: merged || undefined,
  })
}
export async function createPurchaseOrder(data: Record<string, unknown>) {
  const tenantData = withTenantData(data, 'company')
  return pb.collection('purchase_orders').create(tenantData)
}
export async function updatePurchaseOrder(id: string, data: Record<string, unknown>) {
  return pb.collection('purchase_orders').update(id, data)
}

export async function getPurchaseInvoices(filter?: string) {
  const merged = mergeTenantFilter('company', filter)
  return pb.collection('purchase_invoices').getFullList({
    sort: '-created',
    filter: merged || undefined,
  })
}
export async function createPurchaseInvoice(data: Record<string, unknown>) {
  const tenantData = withTenantData(data, 'company')
  return pb.collection('purchase_invoices').create(tenantData)
}
export async function updatePurchaseInvoice(id: string, data: Record<string, unknown>) {
  return pb.collection('purchase_invoices').update(id, data)
}

export async function getPurchaseReturns(filter?: string) {
  const merged = mergeTenantFilter('company', filter)
  return pb.collection('purchase_returns').getFullList({
    sort: '-created',
    filter: merged || undefined,
  })
}
export async function createPurchaseReturn(data: Record<string, unknown>) {
  const tenantData = withTenantData(data, 'company')
  return pb.collection('purchase_returns').create(tenantData)
}
export async function updatePurchaseReturn(id: string, data: Record<string, unknown>) {
  return pb.collection('purchase_returns').update(id, data)
}

export async function getNextPurchaseNumber(type: string) {
  return pb.send(`/backend/v1/purchase-numbers/next?type=${type}`, { method: 'GET' })
}

export async function getApprovalThreshold(): Promise<number> {
  try {
    const record = await pb
      .collection('settings')
      .getFirstListItem('key = "purchase_approval_threshold"')
    return parseFloat((record as Record<string, unknown>).value as string) || 5000
  } catch {
    return 5000
  }
}

export async function getSuppliers() {
  try {
    return await pb.collection('partners').getFullList({ filter: 'partner_type ~ "Fornecedor"' })
  } catch {
    return []
  }
}
