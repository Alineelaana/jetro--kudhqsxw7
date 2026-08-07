import pb from '@/lib/pocketbase/client'

export const SA_COLLECTIONS = {
  agreements: 'supplier_allowance_agreements',
  accounts: 'supplier_allowance_accounts',
  movements: 'supplier_allowance_movements',
  accruals: 'supplier_allowance_accruals',
  appropriations: 'supplier_allowance_appropriations',
  settlements: 'supplier_allowance_settlements',
  consumptions: 'supplier_allowance_consumptions',
} as const

export function saGetList(collection: string) {
  return pb.collection(collection).getFullList({ sort: '-created' })
}
export function saGetOne(collection: string, id: string) {
  return pb.collection(collection).getOne(id)
}
export function saCreate(collection: string, data: Record<string, unknown>) {
  return pb.collection(collection).create(data)
}
export function saUpdate(collection: string, id: string, data: Record<string, unknown>) {
  return pb.collection(collection).update(id, data)
}
export function saDelete(collection: string, id: string) {
  return pb.collection(collection).delete(id)
}

export async function accrueAllowances(
  agreementId: string,
  competencePeriod: string,
): Promise<any> {
  return pb.send('/backend/v1/supplier-allowance/accrue', {
    method: 'POST',
    body: JSON.stringify({ agreement_id: agreementId, competence_period: competencePeriod }),
    headers: { 'Content-Type': 'application/json' },
  })
}
export async function settleAllowance(
  accrualId: string,
  settlementType: string,
  payableId?: string,
): Promise<any> {
  return pb.send('/backend/v1/supplier-allowance/settle', {
    method: 'POST',
    body: JSON.stringify({
      accrual_id: accrualId,
      settlement_type: settlementType,
      payable_id: payableId,
    }),
    headers: { 'Content-Type': 'application/json' },
  })
}
export async function appropriateAllowance(data: {
  accrual_id: string
  allocated_value: string
  product_id?: string
  cost_center_id?: string
  reason?: string
}): Promise<any> {
  return pb.send('/backend/v1/supplier-allowance/appropriate', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
  })
}
export async function consumeAllowance(data: {
  account_id: string
  agreement_id: string
  consumed_value: string
  reason?: string
  purchase_id?: string
  promotion_id?: string
}): Promise<any> {
  return pb.send('/backend/v1/supplier-allowance/consume', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
  })
}
