import pb from '@/lib/pocketbase/client'

export interface BudgetRequestData {
  data: Record<string, string>
  client_name: string
  client_email: string
  client_phone: string
  service: string
}

export async function createBudgetRequest(payload: BudgetRequestData): Promise<void> {
  await pb.collection('budget_requests').create(payload)
}

export async function getBudgetRequests() {
  return pb.collection('budget_requests').getFullList({
    sort: '-created',
  })
}
