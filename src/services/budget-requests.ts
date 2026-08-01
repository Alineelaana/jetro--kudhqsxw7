import pb from '@/lib/pocketbase/client'
import type { StatusHistoryEntry } from '@/lib/types'

export interface QuoteData {
  budget_number: string
  responsible_email: string
  responsible_phone: string
  quote_created_at: string
}

export async function saveQuoteData(id: string, data: QuoteData): Promise<void> {
  await pb.collection('budget_requests').update(id, data)
}

export async function getAverageResponseTime(): Promise<{
  averageMs: number
  count: number
  formatted: string
}> {
  return pb.send('/backend/v1/response-time/average', { method: 'GET' })
}

export interface BudgetRequestData {
  data: Record<string, string>
  client_name: string
  client_email: string
  client_phone: string
  service: string
}

export async function createBudgetRequest(payload: BudgetRequestData): Promise<void> {
  await pb.collection('budget_requests').create({
    ...payload,
    status: 'PENDENTE',
    status_history: [],
  })
}

export async function getBudgetRequests() {
  return pb.collection('budget_requests').getFullList({
    sort: '-created',
  })
}

export async function updateBudgetRequestStatus(
  id: string,
  status: string,
  note: string,
  author: string,
): Promise<void> {
  const record = await pb.collection('budget_requests').getOne(id)
  const history =
    (record as unknown as { status_history?: StatusHistoryEntry[] }).status_history || []
  history.push({ status, note, author, date: new Date().toISOString() })
  await pb.collection('budget_requests').update(id, { status, status_history: history })
}

export async function getNextBudgetNumber(): Promise<{ number: string; sequence: number }> {
  return pb.send('/backend/v1/budget-number/next', { method: 'GET' })
}
