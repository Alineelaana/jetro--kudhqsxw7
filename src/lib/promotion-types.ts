export type PromoType =
  | 'buy_x_get_y'
  | 'percentage'
  | 'fixed_discount'
  | 'min_value'
  | 'mix'
  | 'specific_product'
  | 'brand'
  | 'supplier'
  | 'category'
  | 'combo'
export type Cumulativity = 'cumulative' | 'non_cumulative' | 'priority' | 'most_advantageous'
export type PromoStatus = 'rascunho' | 'ativo' | 'pausado' | 'encerrado' | 'expirado'

export interface PromotionRule {
  id: string
  name: string
  description: string
  promo_type: PromoType
  conditions: Array<Record<string, unknown>>
  benefits: Array<Record<string, unknown>>
  cumulativity: Cumulativity
  priority: number
  limits: Record<string, unknown>
  status: PromoStatus
  start_date: string
  end_date: string
  applicable_channels: string[]
  version: number
  is_active: boolean
  campaign_id: string
  company: string
  branch: string
  created_by: string
  created_by_name: string
  created: string
  updated: string
}

export interface PromotionApplication {
  id: string
  promotion_id: string
  promotion_name: string
  promotion_version: number
  order_id: string
  order_number: string
  client_id: string
  client_name: string
  benefits_applied: Record<string, unknown>
  discount_value: string
  bonification_value: string
  margin_before: string
  margin_after: string
  applied_by: string
  applied_by_name: string
  company: string
  branch: string
  created: string
}

export interface CartItem {
  product_id: string
  product_name: string
  quantity: number
  unit_price: number
  category: string
  brand: string
  supplier: string
}

export interface SimulationResult {
  activatedRules: Array<{
    promotion_id: string
    promotion_name: string
    benefits: Array<Record<string, unknown>>
    discount_value: number
    bonification_value: number
    priority: number
  }>
  totalDiscount: number
  totalBonification: number
  marginBefore: number
  marginAfter: number
  suggestions: string[]
}

export const PROMO_TYPE_LABELS: Record<string, string> = {
  buy_x_get_y: 'Compre X Leve Y',
  percentage: 'Percentual',
  fixed_discount: 'Desconto Fixo',
  min_value: 'Valor Mínimo',
  mix: 'Mix de Produtos',
  specific_product: 'Produto Específico',
  brand: 'Marca',
  supplier: 'Fornecedor',
  category: 'Categoria',
  combo: 'Combo Misto',
}

export const CUMULATIVITY_LABELS: Record<string, string> = {
  cumulative: 'Cumulativa',
  non_cumulative: 'Não Cumulativa',
  priority: 'Por Prioridade',
  most_advantageous: 'Mais Vantajosa',
}

export const PROMO_STATUS_LABELS: Record<string, string> = {
  rascunho: 'Rascunho',
  ativo: 'Ativo',
  pausado: 'Pausado',
  encerrado: 'Encerrado',
  expirado: 'Expirado',
}
