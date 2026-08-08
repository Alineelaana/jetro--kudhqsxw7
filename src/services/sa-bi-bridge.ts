import pb from '@/lib/pocketbase/client'
import { formatBRL } from '@/lib/supplier-allowance-types'

export interface SaBiKpi {
  label: string
  value: string
  icon: string
  color: string
}

export interface SaBiAlert {
  severity: 'info' | 'warning' | 'critical'
  message: string
}

export interface SaBiMovement {
  movement_type: string
  direction: string
  value: string
  created: string
}

export interface SaBiData {
  kpis: SaBiKpi[]
  alerts: SaBiAlert[]
  recentMovements: SaBiMovement[]
}

export async function getSaBiData(): Promise<SaBiData | null> {
  try {
    const result = await pb.send('/backend/v1/supplier-allowance/ledger-query', {
      method: 'POST',
      body: JSON.stringify({}),
      headers: { 'Content-Type': 'application/json' },
    })
    const k = result.kpis || {}
    return {
      kpis: [
        {
          label: 'Total Earned',
          value: formatBRL(k.total_earned),
          icon: 'trending-up',
          color: 'green',
        },
        {
          label: 'Total Recebido',
          value: formatBRL(k.total_received),
          icon: 'wallet',
          color: 'blue',
        },
        {
          label: 'Aplicado Compras',
          value: formatBRL(k.total_applied_compras),
          icon: 'shopping-cart',
          color: 'purple',
        },
        {
          label: 'Consumido Trade',
          value: formatBRL(k.total_consumed_trade),
          icon: 'megaphone',
          color: 'orange',
        },
        {
          label: 'Consumido Marketing',
          value: formatBRL(k.total_consumed_marketing),
          icon: 'target',
          color: 'pink',
        },
        {
          label: 'Saldo Disponivel',
          value: formatBRL(k.total_available),
          icon: 'check-circle',
          color: 'green',
        },
        {
          label: 'Total Claims',
          value: formatBRL(k.total_claims),
          icon: 'alert-triangle',
          color: 'red',
        },
        { label: 'ROI Geral', value: `${formatBRL(k.roi)}%`, icon: 'percent', color: 'teal' },
      ],
      alerts: [],
      recentMovements: (result.analytical || []).slice(0, 10).map((m: Record<string, string>) => ({
        movement_type: m.movement_type || '',
        direction: m.direction || '',
        value: m.value || '0',
        created: m.created || '',
      })),
    }
  } catch {
    return null
  }
}
