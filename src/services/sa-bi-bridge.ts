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
  return null
}
