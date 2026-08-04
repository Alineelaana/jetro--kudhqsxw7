export const REQUEST_STATUS = [
  'Rascunho',
  'Aguardando Aprovação',
  'Aprovada',
  'Reprovada',
  'Cancelada',
] as const
export const QUOTATION_STATUS = ['Em Digitação', 'Em Análise', 'Finalizada', 'Cancelada'] as const
export const ORDER_STATUS = [
  'Em Digitação',
  'Aguardando Aprovação',
  'Aprovado',
  'Enviado ao Fornecedor',
  'Recebido Parcialmente',
  'Recebido Totalmente',
  'Cancelado',
] as const
export const INVOICE_STATUS = ['Em Digitação', 'Confirmada', 'Cancelada'] as const
export const RETURN_STATUS = [
  'Em Digitação',
  'Aguardando Envio',
  'Finalizada',
  'Cancelada',
] as const
export const PRIORITY_OPTIONS = ['Baixa', 'Normal', 'Alta', 'Urgente'] as const

export interface HistoryEntry {
  action: string
  user: string
  date: string
  note: string
}

export interface PurchaseRequestItem {
  product: string
  description: string
  quantity: string
  unit: string
  observation: string
}
export interface PurchaseRequest {
  id: string
  request_number: string
  status: string
  requester: string
  requester_id: string
  company: string
  branch: string
  cost_center: string
  department: string
  priority: string
  justification: string
  items: PurchaseRequestItem[]
  history: HistoryEntry[]
  responsible_user: string
  created: string
  updated: string
}

export interface SupplierQuote {
  supplier_id: string
  supplier_name: string
  unit_value: string
  quantity: string
  delivery_time: string
  payment_method: string
  payment_condition: string
  freight: string
  observations: string
}
export interface Quotation {
  id: string
  quotation_number: string
  status: string
  request_id: string
  request_number: string
  supplier_quotes: SupplierQuote[]
  winning_supplier_id: string
  winning_supplier_name: string
  highlights: Record<string, unknown>
  history: HistoryEntry[]
  responsible_user: string
  created: string
  updated: string
}

export interface OrderItem {
  code: string
  product: string
  quantity: string
  unit_price: string
  discount: string
  total: string
}
export interface PurchaseOrder {
  id: string
  order_number: string
  status: string
  supplier_id: string
  supplier_name: string
  quotation_id: string
  request_id: string
  company: string
  branch: string
  buyer: string
  buyer_id: string
  payment_condition: string
  payment_method: string
  delivery_forecast: string
  items: OrderItem[]
  freight: string
  discounts: string
  other_expenses: string
  products_value: string
  total_value: string
  history: HistoryEntry[]
  responsible_user: string
  created: string
  updated: string
}

export interface InvoiceItem {
  code: string
  product: string
  quantity: string
  unit_price: string
  total: string
  tax: string
}
export interface PurchaseInvoice {
  id: string
  invoice_number: string
  status: string
  order_id: string
  order_number: string
  supplier_id: string
  supplier_name: string
  invoice_key: string
  invoice_doc_number: string
  invoice_series: string
  items: InvoiceItem[]
  total_value: string
  divergences: Array<{ field: string; expected: string; received: string }>
  stock_updated: boolean
  cost_updated: boolean
  payable_generated: boolean
  history: HistoryEntry[]
  responsible_user: string
  created: string
  updated: string
}

export interface ReturnItem {
  code: string
  product: string
  quantity: string
  unit_price: string
  total: string
}
export interface PurchaseReturn {
  id: string
  return_number: string
  status: string
  supplier_id: string
  supplier_name: string
  order_id: string
  order_number: string
  invoice_id: string
  invoice_doc_number: string
  reason: string
  items: ReturnItem[]
  total_value: string
  history: HistoryEntry[]
  responsible_user: string
  created: string
  updated: string
}

export const STATUS_COLORS: Record<string, string> = {
  Rascunho: 'bg-gray-100 text-gray-600',
  'Aguardando Aprovação': 'bg-amber-100 text-amber-700',
  Aprovada: 'bg-emerald-100 text-emerald-700',
  Aprovado: 'bg-emerald-100 text-emerald-700',
  Reprovada: 'bg-red-100 text-red-700',
  Cancelada: 'bg-red-100 text-red-700',
  Cancelado: 'bg-red-100 text-red-700',
  'Em Digitação': 'bg-blue-100 text-blue-700',
  'Em Análise': 'bg-amber-100 text-amber-700',
  Finalizada: 'bg-emerald-100 text-emerald-700',
  'Enviado ao Fornecedor': 'bg-purple-100 text-purple-700',
  'Recebido Parcialmente': 'bg-cyan-100 text-cyan-700',
  'Recebido Totalmente': 'bg-emerald-100 text-emerald-700',
  Confirmada: 'bg-emerald-100 text-emerald-700',
  'Aguardando Envio': 'bg-amber-100 text-amber-700',
}
