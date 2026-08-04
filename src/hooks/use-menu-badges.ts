import { useState, useEffect, useCallback } from 'react'
import pb from '@/lib/pocketbase/client'
import { useRealtime } from '@/hooks/use-realtime'

interface NotificationRecord {
  id: string
  type: string
  link: string
  read: boolean
  recipient: string
}

function getBadgeKeyForNotification(n: NotificationRecord): string | null {
  if (n.type === 'budget_created' || n.type === 'budget_saved') return 'budgets'
  if (n.type === 'stock_low') return 'Estoque'
  if (n.type === 'price_below_cost') return 'pricing'
  if (n.link) {
    if (n.link.includes('/admin/vendas')) return 'Vendas'
    if (n.link.includes('/admin/estoque')) return 'Estoque'
    if (n.link.includes('purchasing') || n.link.includes('compras')) return 'purchasing'
    if (n.link.includes('pricing') || n.link.includes('precificacao')) return 'pricing'
    if (n.link.includes('budget') || n.link.includes('orcamento')) return 'budgets'
  }
  return null
}

export function useMenuBadges(userId?: string) {
  const [badges, setBadges] = useState<Record<string, number>>({})

  const load = useCallback(async () => {
    if (!userId) {
      setBadges({})
      return
    }
    try {
      const [notifs, pendingPurchases, pendingQuotations, pendingApprovals, pendingSales] =
        await Promise.all([
          pb.collection('notifications').getFullList({
            filter: `recipient = "${userId}" && read = false`,
          }),
          pb.collection('purchase_requests').count('status = "Aguardando Aprovação"'),
          pb.collection('quotations').count('status = "Em Digitação" || status = "Em Análise"'),
          pb.collection('pricing_approvals').count('status = "pending"'),
          pb.collection('sales_orders').count('status = "Aguardando Aprovação"'),
        ])

      const badgeMap: Record<string, number> = {}

      for (const n of notifs as unknown as NotificationRecord[]) {
        const key = getBadgeKeyForNotification(n)
        if (key) badgeMap[key] = (badgeMap[key] || 0) + 1
      }

      badgeMap['purchasing'] = (badgeMap['purchasing'] || 0) + (pendingPurchases as number)
      badgeMap['pricing'] = (badgeMap['pricing'] || 0) + (pendingApprovals as number)
      badgeMap['Vendas'] = (badgeMap['Vendas'] || 0) + (pendingSales as number)

      setBadges(badgeMap)
    } catch {
      /* noop */
    }
  }, [userId])

  useEffect(() => {
    load()
  }, [load])

  useRealtime('notifications', () => load())
  useRealtime('purchase_requests', () => load())
  useRealtime('quotations', () => load())
  useRealtime('pricing_approvals', () => load())
  useRealtime('sales_orders', () => load())

  return badges
}
