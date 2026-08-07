export type ProductionScenario =
  | 'made_to_order'
  | 'make_to_stock'
  | 'batch'
  | 'continuous'
  | 'serial'
  | 'partial_outsourcing'
  | 'complete_outsourcing'
  | 'subassembly'
  | 'semi_finished'
  | 'multi_level'

export type PhaseStatus = 'pending' | 'in_progress' | 'paused' | 'completed' | 'rework' | 'skipped'
export type QualityStageStatus = 'pending' | 'approved' | 'rejected' | 'rework' | 'conditional'
export type DemandStatus = 'open' | 'planned' | 'fulfilled' | 'cancelled'
export type PhaseCostType =
  | 'labor'
  | 'machine'
  | 'energy'
  | 'tools'
  | 'consumption'
  | 'materials'
  | 'services'
  | 'third_party'
  | 'losses'
  | 'reworks'
  | 'indirect'

export interface IndustrialPhase {
  id: string
  production_order_id: string
  sequence: number
  operation_name: string
  work_center: string
  resource_id: string
  team_name: string
  operator_name: string
  expected_time_minutes: number
  actual_time_minutes: number
  setup_time_minutes: number
  status: PhaseStatus
  consumption: Record<string, unknown> | null
  losses: Record<string, unknown> | null
  quality_status: QualityStageStatus
  cost_summary: Record<string, unknown> | null
  attachments: Record<string, unknown> | null
  observations: string
  started_at: string
  completed_at: string
  responsible: string
  created: string
  updated: string
  expand?: {
    production_order_id?: { id: string; order_number: string }
    resource_id?: { id: string; name: string }
  }
}

export interface IndustrialPhaseCost {
  id: string
  phase_id: string
  cost_type: PhaseCostType
  amount: string
  description: string
  responsible: string
  created: string
  updated: string
}

export interface IndustrialDemand {
  id: string
  demand_number: string
  product_id: string
  quantity: number
  unit: string
  demand_type: 'forecast' | 'order' | 'internal'
  scenario: ProductionScenario
  source: string
  due_date: string
  status: DemandStatus
  production_order_id: string
  responsible: string
  created: string
  updated: string
  expand?: { product_id?: { id: string; name: string } }
}

export interface ExecutiveDashboardData {
  most_productive_machine: { resource_id: string; name: string; total_produced: number } | null
  highest_operator_productivity: { operator_name: string; total_produced: number } | null
  highest_cost_product: { product_id: string; name: string; total_cost: string } | null
  bottlenecks: Array<{ resource_name: string; scheduled_ops: number }>
  highest_loss_phase: { operation_name: string; total_losses: number } | null
  highest_rework_phase: { operation_name: string; rework_count: number } | null
  overloaded_work_center: { name: string; scheduled_ops: number } | null
  late_orders: Array<{ order_number: string; end_date: string; days_late: number }>
  total_orders: number
  total_phases: number
  total_demand: number
}

export interface TraceabilityNode {
  type: string
  id: string
  label: string
  [key: string]: unknown
}

export interface TraceabilityResult {
  direction: string
  start_id: string
  nodes: TraceabilityNode[]
  edges: Array<{ from: string; to: string }>
  total_nodes: number
}
