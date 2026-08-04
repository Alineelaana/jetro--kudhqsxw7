export const SALES_ORDER_STATUS = [
  'Rascunho',
  'Aguardando Aprovação',
  'Aprovado',
  'Reprovado',
  'Estoque Reservado',
  'Aguardando Faturamento',
  'Faturado Parcialmente',
  'Faturado Totalmente',
  'Entregue',
  'Cancelado',
] as const

export const SALES_RETURN_STATUS = [
  'Solicitada',
  'Em Análise',
  'Aprovada',
  'Reprovada',
  'Aguardando Recebimento',
  'Recebida',
  'Finalizada',
  'Cancelada',
] as const

export const NFE_STATUS = [
  'Em Digitação',
  'Em Validação',
  'Aguardando Transmissão',
  'Autorizada',
  'Rejeitada',
  'Cancelada',
  'Denegada',
  'Contingência',
] as const

export const NFCE_STATUS = [
  'Em Digitação',
  'Aguardando Transmissão',
  'Autorizada',
  'Rejeitada',
  'Cancelada',
] as const

export const STATUS_COLORS: Record<string, string> = {
  Rascunho: 'bg-gray-100 text-gray-700',
  'Aguardando Aprovação': 'bg-amber-100 text-amber-700',
  Aprovado: 'bg-emerald-100 text-emerald-700',
  Reprovado: 'bg-red-100 text-red-700',
  'Estoque Reservado': 'bg-blue-100 text-blue-700',
  'Aguardando Faturamento': 'bg-cyan-100 text-cyan-700',
  'Faturado Parcialmente': 'bg-purple-100 text-purple-700',
  'Faturado Totalmente': 'bg-emerald-100 text-emerald-700',
  Entregue: 'bg-green-100 text-green-700',
  Cancelado: 'bg-red-100 text-red-700',
  Solicitada: 'bg-amber-100 text-amber-700',
  'Em Análise': 'bg-blue-100 text-blue-700',
  Aprovada: 'bg-emerald-100 text-emerald-700',
  Reprovada: 'bg-red-100 text-red-700',
  Autorizada: 'bg-emerald-100 text-emerald-700',
  Rejeitada: 'bg-red-100 text-red-700',
  Denegada: 'bg-red-100 text-red-700',
  Contingência: 'bg-orange-100 text-orange-700',
  'Em Digitação': 'bg-gray-100 text-gray-700',
  'Em Validação': 'bg-blue-100 text-blue-700',
  'Aguardando Transmissão': 'bg-amber-100 text-amber-700',
  'Aguardando Recebimento': 'bg-amber-100 text-amber-700',
  Recebida: 'bg-cyan-100 text-cyan-700',
  Finalizada: 'bg-emerald-100 text-emerald-700',
}

export interface SalesOrderItem {
  code: string
  product: string
  unit: string
  quantity: string
  available_stock: string
  table_price: string
  unit_price: string
  discount: string
  addition: string
  total: string
  margin: string
  situation: string
}

export interface HistoryEntry {
  action: string
  user: string
  date: string
  note: string
}

export interface SalesOrder {
  id: string
  order_number: string
  status: string
  client_id: string
  client_name: string
  salesperson_id: string
  salesperson_name: string
  price_table_id: string
  payment_condition: string
  payment_method: string
  delivery_date: string
  carrier_name: string
  freight_type: string
  delivery_address: string
  cost_center: string
  internal_notes: string
  fiscal_notes: string
  items: SalesOrderItem[]
  gross_value: string
  discount_value: string
  addition_value: string
  freight_value: string
  insurance_value: string
  other_expenses: string
  tax_value: string
  total_value: string
  company: string
  branch: string
  history: HistoryEntry[]
  responsible_user: string
  stock_reserved: boolean
  created: string
  updated: string
}

export interface SalesInvoice {
  id: string
  invoice_number: string
  status: string
  order_id: string
  order_number: string
  client_name: string
  invoice_date: string
  items: unknown[]
  total_value: string
  carrier_name: string
  volumes: string
  gross_weight: string
  net_weight: string
  freight_value: string
  other_expenses: string
  company: string
  branch: string
  history: HistoryEntry[]
  responsible_user: string
  created: string
}

export interface NfeRecord {
  id: string
  nfe_number: string
  status: string
  invoice_id: string
  order_id: string
  client_name: string
  company: string
  nature_of_operation: string
  cfop: string
  items: unknown[]
  total_value: string
  tax_value: string
  carrier_name: string
  volumes: string
  additional_info: string
  authorization_protocol: string
  rejection_reason: string
  history: HistoryEntry[]
  responsible_user: string
  created: string
}

export interface NfceRecord {
  id: string
  nfce_number: string
  status: string
  consumer_name: string
  consumer_doc: string
  items: unknown[]
  total_value: string
  discount_value: string
  payment_method: string
  change_amount: string
  authorization_protocol: string
  company: string
  branch: string
  responsible_user: string
  created: string
}

export interface SalesReturn {
  id: string
  return_number: string
  status: string
  order_id: string
  order_number: string
  invoice_number: string
  client_name: string
  items: unknown[]
  reason: string
  product_condition: string
  destination: string
  responsible_analyst: string
  observations: string
  financial_treatment: string
  total_value: string
  history: HistoryEntry[]
  responsible_user: string
  created: string
}

export const FREIGHT_TYPES = ['CIF', 'FOB', 'Terceiros', 'Sem Frete'] as const
export const RETURN_DESTINATIONS = [
  'Retornar ao estoque disponível',
  'Retornar ao estoque avariado',
  'Enviar para assistência',
  'Descartar',
  'Aguardar análise',
] as const
export const FINANCIAL_TREATMENTS = [
  'Estorno total',
  'Estorno parcial',
  'Crédito para o cliente',
  'Troca de produto',
  'Sem impacto financeiro',
] as const
export const PAYMENT_METHODS = [
  'Dinheiro',
  'PIX',
  'Cartão de Débito',
  'Cartão de Crédito',
  'Boleto',
  'Outros',
] as const
