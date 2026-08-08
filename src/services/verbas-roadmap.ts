import pb from '@/lib/pocketbase/client'

export const VR_COLLECTIONS = {
  tradeExpenses: 'supplier_allowance_trade_expenses',
  adhocCredits: 'supplier_allowance_adhoc_credits',
  documents: 'supplier_allowance_documents',
  reportVersions: 'supplier_allowance_report_versions',
} as const

export function vrGetList(collection: string) {
  return pb.collection(collection).getFullList({ sort: '-created' })
}

export function vrGetOne(collection: string, id: string) {
  return pb.collection(collection).getOne(id)
}

export function vrCreate(collection: string, data: Record<string, unknown>) {
  return pb.collection(collection).create(data)
}

export function vrUpdate(collection: string, id: string, data: Record<string, unknown>) {
  return pb.collection(collection).update(id, data)
}

export function vrDelete(collection: string, id: string) {
  return pb.collection(collection).delete(id)
}

export const TRADE_EXPENSE_CATEGORIES = [
  { value: 'marketing', label: 'Marketing' },
  { value: 'pdv', label: 'PDV' },
  { value: 'evento', label: 'Evento' },
  { value: 'midia', label: 'Mídia' },
  { value: 'logistica', label: 'Logística' },
  { value: 'producao', label: 'Produção' },
  { value: 'outros', label: 'Outros' },
] as const

export const TRADE_EXPENSE_STATUS = [
  { value: 'pendente', label: 'Pendente' },
  { value: 'aprovado', label: 'Aprovado' },
  { value: 'rejeitado', label: 'Rejeitado' },
  { value: 'pago', label: 'Pago' },
] as const

export const ADHOC_CREDIT_STATUS = [
  { value: 'pendente', label: 'Pendente' },
  { value: 'aprovado', label: 'Aprovado' },
  { value: 'rejeitado', label: 'Rejeitado' },
  { value: 'creditado', label: 'Creditado' },
] as const

export const REPORT_VERSION_STATUS = [
  { value: 'rascunho', label: 'Rascunho' },
  { value: 'publicado', label: 'Publicado' },
  { value: 'arquivado', label: 'Arquivado' },
] as const
