import pb from '@/lib/pocketbase/client'
import type { PriceVault, PricingRiskMonitor } from '@/lib/pricing-types'

export async function getVaultEntries(productId?: string): Promise<PriceVault[]> {
  const filter = productId ? `product_id = "${productId}"` : undefined
  return pb.collection('price_vault').getFullList({ sort: '-created', filter })
}

export async function createVaultEntry(data: Record<string, unknown>): Promise<PriceVault> {
  return pb.collection('price_vault').create(data)
}

export async function getRiskMonitors(resolved?: boolean): Promise<PricingRiskMonitor[]> {
  const filter = resolved !== undefined ? `resolved = ${resolved}` : undefined
  return pb.collection('pricing_risk_monitor').getFullList({ sort: '-created', filter })
}

export async function resolveRisk(id: string, resolvedBy: string): Promise<PricingRiskMonitor> {
  return pb.collection('pricing_risk_monitor').update(id, {
    resolved: true,
    resolved_by: resolvedBy,
    resolved_at: new Date().toISOString(),
  })
}

export async function getAIAnalysis(): Promise<{ suggestions: unknown[]; total_analyzed: number }> {
  return pb.send('/backend/v1/pricing/ai-analyze', { method: 'POST' })
}

export async function getApprovalThresholds(): Promise<{
  small: number
  medium: number
  critical: number
  smallRole: string
  mediumRole: string
  criticalRole: string
}> {
  try {
    const [s, m, c, sr, mr, cr] = await Promise.all([
      pb.collection('settings').getFirstListItem('key = "pricing_approval_small_threshold"'),
      pb.collection('settings').getFirstListItem('key = "pricing_approval_medium_threshold"'),
      pb.collection('settings').getFirstListItem('key = "pricing_approval_critical_threshold"'),
      pb.collection('settings').getFirstListItem('key = "pricing_approval_small_role"'),
      pb.collection('settings').getFirstListItem('key = "pricing_approval_medium_role"'),
      pb.collection('settings').getFirstListItem('key = "pricing_approval_critical_role"'),
    ])
    return {
      small: parseFloat(s.value) || 5,
      medium: parseFloat(m.value) || 15,
      critical: parseFloat(c.value) || 30,
      smallRole: sr.value || 'SDR',
      mediumRole: mr.value || 'COMERCIAL',
      criticalRole: cr.value || 'SUP',
    }
  } catch {
    return {
      small: 5,
      medium: 15,
      critical: 30,
      smallRole: 'SDR',
      mediumRole: 'COMERCIAL',
      criticalRole: 'SUP',
    }
  }
}

export function getApprovalLevel(
  changePercent: number,
  thresholds: {
    small: number
    medium: number
    critical: number
  },
): { level: string; role: string } {
  const abs = Math.abs(changePercent)
  if (abs >= thresholds.critical) return { level: 'critical', role: 'SUP' }
  if (abs >= thresholds.medium) return { level: 'medium', role: 'COMERCIAL' }
  return { level: 'small', role: 'SDR' }
}
