export interface ClientNetwork {
  id: string
  name: string
  corporate_name: string
  responsible: string
  contact_phone: string
  contact_email: string
  main_buyer: string
  manager_rca: string
  observations: string
  status: string
  empresa: string
  filial: string
  credit_limit: string
  restriction_policy: string
  member_ids: string[]
  member_history: NetworkMemberHistoryEntry[]
  created: string
  updated: string
}

export interface NetworkMemberHistoryEntry {
  id: string
  partner_id: string
  partner_name: string
  action: 'added' | 'removed'
  user: string
  date: string
  justification: string
}

export interface NetworkMemberData {
  id: string
  name: string
  cnpj: string
  totalReceivable: number
  totalOverdue: number
  maxDelay: number
  isRestricted: boolean
  restrictionSource: string
  openOrders: number
  blockedOrders: number
}

export interface NetworkConsolidatedData {
  network: ClientNetwork
  members: NetworkMemberData[]
  totalReceivable: number
  totalOverdue: number
  openOrders: number
  blockedOrders: number
  maxDelay: number
  consolidatedRisk: string
  creditLimit: number
  creditUsed: number
  creditAvailable: number
}

export interface CreditCheckResult {
  decision: 'approved' | 'blocked' | 'requires_approval'
  partner_id: string
  partner_name: string
  network_id: string
  network_name: string
  own_delinquency: boolean
  network_delinquency: boolean
  own_overdue_amount: number
  network_overdue_amount: number
  individual_limit: number
  network_limit: number
  restriction_policy: string
  own_max_days: number
  network_max_days: number
  members_count: number
}
