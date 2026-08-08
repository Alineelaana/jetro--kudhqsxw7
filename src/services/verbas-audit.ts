import pb from '@/lib/pocketbase/client'

export interface LedgerSummary {
  supplier_name: string
  earned: number
  consumed: number
  received: number
  claim: number
  applied_compras: number
  consumed_trade: number
  consumed_marketing: number
  consumed_bonificacao: number
  pending_receipt: number
  available: number
  committed: number
}

export interface LedgerAnalytical {
  id: string
  created: string
  supplier_name: string
  buyer_name: string
  program: string
  campaign: string
  movement_type: string
  direction: string
  value: string
  document_number: string
  category: string
  brand: string
  product_name: string
  competence_period: string
  workflow_state: string
  justification: string
  user: string
  claim_status: string
  receipt_status: string
  observations: string
  sales_manager: string
  supervisor: string
  seller: string
}

export interface LedgerKpis {
  total_earned: number
  total_consumed: number
  total_received: number
  total_claims: number
  total_applied_compras: number
  total_consumed_trade: number
  total_consumed_marketing: number
  total_consumed_bonificacao: number
  total_available: number
  roi: number
}

export interface LedgerQueryResult {
  summary: LedgerSummary[]
  analytical: LedgerAnalytical[]
  kpis: LedgerKpis
  total_movements: number
}

export async function queryLedger(filters: Record<string, string>): Promise<LedgerQueryResult> {
  return pb.send('/backend/v1/supplier-allowance/ledger-query', {
    method: 'POST',
    body: JSON.stringify(filters),
    headers: { 'Content-Type': 'application/json' },
  })
}

export async function checkVerbasAlerts(): Promise<{ status: string; alerts_created: number }> {
  return pb.send('/backend/v1/supplier-allowance/alerts-check', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  })
}
