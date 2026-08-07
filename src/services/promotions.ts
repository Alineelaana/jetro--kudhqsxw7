import pb from '@/lib/pocketbase/client'
import type {
  PromotionRule,
  PromotionApplication,
  CartItem,
  SimulationResult,
} from '@/lib/promotion-types'

export const getPromotions = (status?: string) =>
  pb.collection('promotion_rules').getFullList({
    sort: '-created',
    filter: status ? `status = "${status}"` : undefined,
  }) as Promise<PromotionRule[]>

export const getPromotion = (id: string) =>
  pb.collection('promotion_rules').getOne(id) as Promise<PromotionRule>

export const createPromotion = (data: Record<string, unknown>) =>
  pb.collection('promotion_rules').create(data) as Promise<PromotionRule>

export const updatePromotion = (id: string, data: Record<string, unknown>) =>
  pb.collection('promotion_rules').update(id, data) as Promise<PromotionRule>

export const deletePromotion = (id: string) => pb.collection('promotion_rules').delete(id)

export const getApplications = (promotionId?: string) =>
  pb.collection('promotion_applications').getFullList({
    sort: '-created',
    filter: promotionId ? `promotion_id = "${promotionId}"` : undefined,
  }) as Promise<PromotionApplication[]>

export async function simulatePromotions(
  cart: CartItem[],
  clientId?: string,
): Promise<SimulationResult> {
  return pb.send('/backend/v1/promotions/simulate', {
    method: 'POST',
    body: JSON.stringify({ cart, client_id: clientId }),
    headers: { 'Content-Type': 'application/json' },
  })
}

export function logPromotionAudit(action: string, targetId: string, summary: string) {
  pb.send('/backend/v1/audit/create', {
    method: 'POST',
    body: JSON.stringify({
      action,
      module: 'promotions',
      target_collection: 'promotion_rules',
      target_id: targetId,
      target_summary: summary,
    }),
    headers: { 'Content-Type': 'application/json' },
  }).catch(() => {})
}
