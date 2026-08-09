import pb from '@/lib/pocketbase/client'

type Rec = Record<string, unknown>

function parseNum(v: unknown): number {
  const n = parseFloat(String(v || '0'))
  return isNaN(n) ? 0 : n
}

async function safeFilter(collection: string, filter: string): Promise<Rec[]> {
  try {
    return (await pb.collection(collection).getFullList({ filter })) as Rec[]
  } catch {
    return []
  }
}

export interface EntityAnalysis {
  name: string
  orders: number
  revenue: number
  pending: number
  overdue: number
  stock: number
  opportunities: number
  wonOpps: number
  lostOpps: number
  margin: number
  campaigns: number
  verbas: number
  purchases: number
  inadimplencia: number
  productsCount: number
  leads: number
}

export async function analyzeEntity(name: string): Promise<EntityAnalysis> {
  const q = name.replace(/"/g, '\\"')
  const [
    orders,
    receivables,
    payables,
    opps,
    leads,
    purchases,
    campaigns,
    apurations,
    collections,
  ] = await Promise.all([
    safeFilter('sales_orders', `client_name ~ "${q}"`),
    safeFilter('financial_receivables', `cliente ~ "${q}"`),
    safeFilter('financial_payables', `fornecedor ~ "${q}"`),
    safeFilter('crm_opportunities', `client_name ~ "${q}"`),
    safeFilter('crm_leads', `name ~ "${q}"`),
    safeFilter('purchase_orders', `supplier_name ~ "${q}"`),
    safeFilter('vr_campaigns', `name ~ "${q}"`),
    safeFilter('vr_apurations', `seller_name ~ "${q}"`),
    safeFilter('financial_collections', `cliente ~ "${q}"`),
  ])

  const revenue = orders.reduce((s, o) => s + parseNum(o.total_value), 0)

  let totalCost = 0
  const productSet = new Set<string>()
  orders.forEach((o) => {
    const items = (Array.isArray(o.items) ? o.items : []) as Rec[]
    items.forEach((item) => {
      const total = parseNum(item.total)
      const marginPct = parseNum(item.margin) / 100
      totalCost += total * (1 - marginPct)
      const prod = (item.product as string) || ''
      if (prod) productSet.add(prod)
    })
  })
  const margin = revenue > 0 ? ((revenue - totalCost) / revenue) * 100 : 0

  const overdue = receivables.filter(
    (r) => r.status && !['Recebido', 'Cancelado'].includes(r.status as string),
  ).length

  const inadimplencia = collections.length
  const wonOpps = opps.filter((o) => o.status === 'Ganha').length
  const lostOpps = opps.filter((o) => o.status === 'Perdida').length

  const productsCount = productSet.size

  const verbas = apurations.reduce((s, a) => s + parseNum(a.commission_value), 0)

  return {
    name,
    orders: orders.length,
    revenue,
    pending: receivables.length,
    overdue,
    stock: productsCount,
    opportunities: opps.length,
    wonOpps,
    lostOpps,
    margin,
    campaigns: campaigns.length,
    verbas,
    purchases: purchases.length,
    inadimplencia,
    productsCount,
    leads: leads.length,
  }
}
