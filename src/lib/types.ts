export type BudgetStatus =
  | 'PENDENTE'
  | 'EM ANDAMENTO'
  | 'CONCLUÍDO'
  | 'CANCELADO'
  | 'EM CONTATO COM O CLIENTE'

export const STATUS_OPTIONS: BudgetStatus[] = [
  'PENDENTE',
  'EM ANDAMENTO',
  'EM CONTATO COM O CLIENTE',
  'CONCLUÍDO',
  'CANCELADO',
]

export const STATUS_COLORS: Record<string, string> = {
  PENDENTE: 'bg-red-100 text-red-800 border-red-300',
  'EM ANDAMENTO': 'bg-orange-100 text-orange-800 border-orange-300',
  'EM CONTATO COM O CLIENTE': 'bg-blue-100 text-blue-800 border-blue-300',
  CONCLUÍDO: 'bg-green-100 text-green-800 border-green-300',
  CANCELADO: 'bg-[#DEB887]/30 text-[#8B4513] border-[#8B4513]/40',
}

export interface StatusHistoryEntry {
  status: string
  note: string
  author: string
  date: string
}

export interface BudgetRecord {
  id: string
  data: Record<string, unknown>
  client_name: string
  client_email: string
  client_phone: string
  service: string
  status: string
  status_history: StatusHistoryEntry[]
  created: string
  updated: string
  responsible_email?: string
  responsible_phone?: string
  quote_created_at?: string
  budget_number?: string
}
