import pb from '@/lib/pocketbase/client'

type Rec = Record<string, unknown>

function parseNum(v: unknown): number {
  const n = parseFloat(String(v || '0'))
  return isNaN(n) ? 0 : n
}

async function safeList(collection: string, filter?: string): Promise<Rec[]> {
  try {
    return filter
      ? ((await pb.collection(collection).getFullList({ filter })) as Rec[])
      : ((await pb.collection(collection).getFullList()) as Rec[])
  } catch {
    return []
  }
}

export interface StrategicMetrics {
  churn: number
  churnCount: number
  cac: number
  marketingCost: number
  ltv: number
  campaignRoi: number
  campaignRevenue: number
  campaignCost: number
  activeCampaigns: number
  lostClients: number
  newClients: number
  activeClients: number
  retentionRate: number
  avgMarginPerClient: number
}

export async function computeStrategicMetrics(): Promise<StrategicMetrics> {
  const [orders, leads, campaigns, apurations] = await Promise.all([
    safeList('sales_orders'),
    safeList('crm_leads'),
    safeList('vr_campaigns'),
    safeList('vr_apurations'),
  ])

  const now = new Date()
  const cutoff90 = new Date(now.getTime() - 90 * 86400000)
  const cutoff30 = new Date(now.getTime() - 30 * 86400000)

  const clientMap: Record<string, { last: Date; first: Date; total: number }> = {}
  orders.forEach((o) => {
    const name = (o.client_name as string) || ''
    if (!name) return
    const d = new Date((o.created as string) || now)
    if (!clientMap[name]) clientMap[name] = { last: d, first: d, total: 0 }
    if (d > clientMap[name].last) clientMap[name].last = d
    if (d < clientMap[name].first) clientMap[name].first = d
    clientMap[name].total += parseNum(o.total_value)
  })

  const allClients = Object.keys(clientMap)
  const totalEver = allClients.length
  const activeClients = allClients.filter((n) => clientMap[n].last >= cutoff90).length
  const lostClients = allClients.filter((n) => clientMap[n].last < cutoff90).length
  const lostLeads = leads.filter((l) => l.status === 'Perdido').length
  const churn = totalEver > 0 ? (lostClients / totalEver) * 100 : 0

  const newClients = allClients.filter((n) => clientMap[n].first >= cutoff30).length

  const tradeActions = await safeList('trade_marketing_actions')
  const tradeCost = tradeActions.reduce((s, a) => s + parseNum(a.budget), 0)
  const commissionCost = apurations.reduce((s, a) => s + parseNum(a.commission_value), 0)
  const totalMarketingCost = tradeCost + commissionCost
  const cac = newClients > 0 ? totalMarketingCost / newClients : 0

  const retentionRate = totalEver > 0 ? activeClients / totalEver : 0

  let totalMargin = 0
  let clientsWithMargin = 0
  allClients.forEach((name) => {
    const revenue = clientMap[name].total
    if (revenue <= 0) return
    const clientOrders = orders.filter((o) => (o.client_name as string) === name)
    const items = clientOrders.flatMap((o) => (Array.isArray(o.items) ? o.items : []) as Rec[])
    const cost = items.reduce((s, item) => {
      const total = parseNum(item.total)
      const marginPct = parseNum(item.margin) / 100
      return s + total * (1 - marginPct)
    }, 0)
    totalMargin += revenue - (cost || revenue * 0.65)
    clientsWithMargin++
  })
  const avgMarginPerClient = clientsWithMargin > 0 ? totalMargin / clientsWithMargin : 0
  const ltv = avgMarginPerClient * retentionRate

  const activeCampaigns = campaigns.filter((c) => c.status === 'ativa').length
  const campaignRevenue = apurations.reduce(
    (s, a) => s + parseNum(a.revenue || a.commission_value),
    0,
  )
  const campaignRoi =
    totalMarketingCost > 0 ? ((campaignRevenue - totalMarketingCost) / totalMarketingCost) * 100 : 0

  return {
    churn,
    churnCount: lostClients + lostLeads,
    cac,
    marketingCost: totalMarketingCost,
    ltv,
    campaignRoi,
    campaignRevenue,
    campaignCost: totalMarketingCost,
    activeCampaigns,
    lostClients,
    newClients,
    activeClients,
    retentionRate,
    avgMarginPerClient,
  }
}
