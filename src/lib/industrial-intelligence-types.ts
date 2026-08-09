export interface IntelligenceAlert {
  id: string
  detection_key: string
  type: string
  severity: 'info' | 'warning' | 'critical'
  title: string
  description: string
  status: 'open' | 'acknowledged' | 'resolved' | 'dismissed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  origin: string
  justification: string
  data_used: Record<string, unknown> | null
  expected_impact: string
  evidence: Array<Record<string, unknown>> | null
  source_records: Array<Record<string, unknown>> | null
  product_id: string
  order_id: string
  machine_id: string
  work_center_id: string
  resolved: boolean
  resolved_by: string
  resolved_at: string
  resolution_note: string
  empresa: string
  filial: string
  created: string
  updated: string
}

export interface IntelligenceRecommendation {
  id: string
  detection_key: string
  type: string
  title: string
  description: string
  status: 'pending' | 'accepted' | 'rejected' | 'implemented'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  origin: string
  justification: string
  data_used: Record<string, unknown> | null
  expected_impact: string
  evidence: Array<Record<string, unknown>> | null
  source_records: Array<Record<string, unknown>> | null
  product_id: string
  order_id: string
  machine_id: string
  work_center_id: string
  action_taken: string
  empresa: string
  filial: string
  created: string
  updated: string
}

export interface IntelligencePrediction {
  id: string
  detection_key: string
  type: string
  title: string
  description: string
  probability: 'low' | 'medium' | 'high'
  status: 'active' | 'materialized' | 'expired'
  origin: string
  justification: string
  data_used: Record<string, unknown> | null
  evidence: Array<Record<string, unknown>> | null
  source_records: Array<Record<string, unknown>> | null
  product_id: string
  order_id: string
  machine_id: string
  work_center_id: string
  predicted_date: string
  empresa: string
  filial: string
  created: string
  updated: string
}

export interface IntelligenceInsight {
  id: string
  detection_key: string
  type: string
  title: string
  description: string
  category: string
  origin: string
  data_used: Record<string, unknown> | null
  evidence: Array<Record<string, unknown>> | null
  source_records: Array<Record<string, unknown>> | null
  product_id: string
  order_id: string
  machine_id: string
  work_center_id: string
  value: string
  unit: string
  empresa: string
  filial: string
  created: string
  updated: string
}

export interface ExecutivePanelData {
  geral: {
    total_orders: number
    active_orders: number
    late_orders: number
    completed_today: number
    total_phases: number
    total_demand: number
  }
  producao_hoje: {
    apontamentos_count: number
    total_produced: number
    active_operators: number
  }
  ordens_criticas: Array<{
    order_number: string
    status: string
    end_date: string
    days_late: number
    progress: number
  }>
  gargalos: Array<{ resource_name: string; scheduled_ops: number; insight_id: string }>
  maquinas: {
    total: number
    active: number
    idle: number
    overloaded: number
    maintenance: number
    list: Array<{ name: string; status: string; load: number }>
  }
  centros_trabalho: Array<{ name: string; load: number; capacity: number; utilization: number }>
  eficiencia: {
    avg_productivity: number
    oee_estimate: number
    best_operator: string
    best_team: string
  }
  custos: { total_cost: number; highest_cost_product: string; cost_trend: string }
  qualidade: { pending_inspections: number; rework_count: number; rejection_rate: number }
  entregas: { on_time: number; delayed: number; at_risk: number }
  compras_criticas: Array<{
    order_number: string
    supplier_name: string
    delivery_forecast: string
    days_late: number
    status: string
  }>
  estoque_critico: Array<{ product_name: string; stock: number; min_stock: number; status: string }>
  alertas: IntelligenceAlert[]
  recomendacoes: IntelligenceRecommendation[]
  gerencial: {
    machine_highest_cost: { name: string; cost: number } | null
    best_operator: { name: string; produced: number } | null
    best_team_efficiency: { name: string; efficiency: number } | null
    highest_margin_product: { name: string; margin: number } | null
    most_rework_product: { name: string; count: number } | null
    biggest_loss_source: { operation: string; losses: number } | null
    saturated_centers: Array<{ name: string; load: number }>
    at_risk_orders: Array<{ order_number: string; risk_factor: string }>
    products_delaying_deliveries: Array<{ product_name: string; delay_days: number }>
    suppliers_compromising_production: Array<{ supplier_name: string; delay_days: number }>
    processes_needing_revision: Array<{ process: string; reason: string }>
  }
  fluxo_comercial: {
    sales_orders: number
    with_production: number
    stock_available: number
    scheduled: number
    produced: number
    invoiced: number
  }
}

export type ResolveAction =
  | 'resolve'
  | 'acknowledge'
  | 'dismiss'
  | 'accept'
  | 'reject'
  | 'implement'
