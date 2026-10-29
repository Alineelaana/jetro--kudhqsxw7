export interface B2BClientProfile {
  id: string
  email: string
  name: string
  company_name: string
  cnpj: string
  phone: string
  active: boolean
  status: string
  empresa_id?: string
  filial_id?: string
}

export interface B2BPartnerProfile {
  id: string
  company_name: string
  trade_name: string
  cnpj: string
  email: string
  phone: string
  address: string
  address_number: string
  address_district: string
  address_city: string
  address_state: string
  cep: string
  financial_restriction: boolean
  bloqueio_vendas_prazo: boolean
  exibir_limite_credito: boolean
  limite_credito?: string | null
  limite_credito_disponivel?: string | null
  situacao_credito?: string | null
}

export interface B2BProductItem {
  id: string
  code: string
  name: string
  description: string
  unit: string
  price: number
  price_formatted: string
  brand: string
  category: string
  stock: number
  b2b_min_order_qty: number
  ean: string
  ncm: string
}

export interface B2BCartItem {
  product: B2BProductItem
  quantity: number
  unit_price: number
  notes?: string
}

export interface B2BOrderListItem {
  id: string
  order_number: string
  status: string
  order_stage?: string
  created: string
  total_value: string
  gross_value: string
  sales_channel: string
  items_count: number
  cancellation_reason?: string
  approved_by?: string
  approved_at?: string
}

export interface B2BOrderItemDetail {
  product_id: string
  code: string
  name: string
  quantity: number
  unit: string
  unit_price: number
  total_price: number
  notes?: string
}

export interface B2BOrderDetail {
  id: string
  order_number: string
  status: string
  order_stage?: string
  created: string
  updated?: string
  gross_value: string
  total_value: string
  payment_condition: string
  payment_method: string
  delivery_address: string
  internal_notes: string
  items: B2BOrderItemDetail[]
  history: Array<{
    action: string
    user: string
    date: string
    value?: number
    notes?: string
    reason?: string
  }>
  cancellation_reason?: string
  approved_by?: string
  approved_at?: string
}
