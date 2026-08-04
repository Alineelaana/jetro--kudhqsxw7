import pb from '@/lib/pocketbase/client'
import type {
  PricingConfig,
  PriceTable,
  PricingSimulation,
  PricingHistory,
  PricingApproval,
  PricingAlert,
} from '@/lib/pricing-types'

export async function getPricingConfigs(): Promise<PricingConfig[]> {
  return pb.collection('pricing_config').getFullList({ sort: '-updated' })
}

export async function getPricingConfig(productId: string): Promise<PricingConfig | null> {
  try {
    return await pb.collection('pricing_config').getFirstListItem(`product_id = "${productId}"`)
  } catch {
    return null
  }
}

export async function createPricingConfig(data: Record<string, unknown>): Promise<PricingConfig> {
  return pb.collection('pricing_config').create(data)
}

export async function updatePricingConfig(
  id: string,
  data: Record<string, unknown>,
): Promise<PricingConfig> {
  return pb.collection('pricing_config').update(id, data)
}

export async function deletePricingConfig(id: string): Promise<void> {
  await pb.collection('pricing_config').delete(id)
}

export async function getPriceTables(): Promise<PriceTable[]> {
  return pb.collection('price_tables').getFullList({ sort: '-updated' })
}

export async function getPriceTablesByProduct(productId: string): Promise<PriceTable[]> {
  return pb.collection('price_tables').getFullList({ filter: `product_id = "${productId}"` })
}

export async function createPriceTable(data: Record<string, unknown>): Promise<PriceTable> {
  return pb.collection('price_tables').create(data)
}

export async function updatePriceTable(
  id: string,
  data: Record<string, unknown>,
): Promise<PriceTable> {
  return pb.collection('price_tables').update(id, data)
}

export async function deletePriceTable(id: string): Promise<void> {
  await pb.collection('price_tables').delete(id)
}

export async function getSimulations(productId?: string): Promise<PricingSimulation[]> {
  const filter = productId ? `product_id = "${productId}"` : undefined
  return pb.collection('pricing_simulations').getFullList({ sort: '-created', filter })
}

export async function createSimulation(data: Record<string, unknown>): Promise<PricingSimulation> {
  return pb.collection('pricing_simulations').create(data)
}

export async function updateSimulation(
  id: string,
  data: Record<string, unknown>,
): Promise<PricingSimulation> {
  return pb.collection('pricing_simulations').update(id, data)
}

export async function deleteSimulation(id: string): Promise<void> {
  await pb.collection('pricing_simulations').delete(id)
}

export async function getPricingHistory(productId?: string): Promise<PricingHistory[]> {
  const filter = productId ? `product_id = "${productId}"` : undefined
  return pb.collection('pricing_history').getFullList({ sort: '-created', filter })
}

export async function createPricingHistory(data: Record<string, unknown>): Promise<PricingHistory> {
  return pb.collection('pricing_history').create(data)
}

export async function getApprovals(status?: string): Promise<PricingApproval[]> {
  const filter = status ? `status = "${status}"` : undefined
  return pb.collection('pricing_approvals').getFullList({ sort: '-created', filter })
}

export async function createApproval(data: Record<string, unknown>): Promise<PricingApproval> {
  return pb.collection('pricing_approvals').create(data)
}

export async function updateApproval(
  id: string,
  data: Record<string, unknown>,
): Promise<PricingApproval> {
  return pb.collection('pricing_approvals').update(id, data)
}

export async function getAlerts(resolved?: boolean): Promise<PricingAlert[]> {
  const filter = resolved !== undefined ? `resolved = ${resolved}` : undefined
  return pb.collection('pricing_alerts').getFullList({ sort: '-created', filter })
}

export async function createAlert(data: Record<string, unknown>): Promise<PricingAlert> {
  return pb.collection('pricing_alerts').create(data)
}

export async function resolveAlert(id: string, resolvedBy: string): Promise<PricingAlert> {
  return pb.collection('pricing_alerts').update(id, {
    resolved: true,
    resolved_by: resolvedBy,
    resolved_at: new Date().toISOString(),
  })
}
