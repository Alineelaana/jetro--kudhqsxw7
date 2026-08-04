import pb from '@/lib/pocketbase/client'

export interface StockAlert {
  id: string
  product_id: string
  product_code: string
  product_name: string
  alert_type: string
  severity: string
  current_stock: number
  min_stock: number
  message: string
  resolved: boolean
  resolved_by: string
  resolved_at: string
  created: string
  updated: string
}

export async function resolveAlert(alertType: 'stock' | 'price', alertId: string): Promise<void> {
  await pb.send('/backend/v1/alerts/resolve', {
    method: 'POST',
    body: JSON.stringify({ alert_type: alertType, alert_id: alertId }),
    headers: { 'Content-Type': 'application/json' },
  })
}

export async function getStockAlerts(resolved?: boolean): Promise<StockAlert[]> {
  const filter = resolved !== undefined ? `resolved = ${resolved}` : undefined
  return pb.collection('stock_alerts').getFullList({ sort: '-created', filter })
}

export function parseAlertFromLink(link: string): { type: 'stock' | 'price'; id: string } | null {
  if (!link) return null
  const match = link.match(/alert_type=(stock|price)&alert_id=([^&]+)/)
  if (match) return { type: match[1] as 'stock' | 'price', id: match[2] }
  return null
}
