export interface IndustrialCalendar {
  id: string
  name: string
  resource_id: string
  start_date: string
  end_date: string
  work_days: string[]
  active: boolean
  responsible: string
  created: string
  updated: string
  expand?: { resource_id: { id: string; name: string } }
}

export interface IndustrialShift {
  id: string
  calendar_id: string
  name: string
  start_time: string
  end_time: string
  break_start: string
  break_end: string
  capacity_hours: number
  active: boolean
  created: string
  updated: string
}

export type ApontamentoType = 'inicio' | 'pausa' | 'retomada' | 'producao' | 'fim'

export interface IndustrialApontamento {
  id: string
  production_order_id: string
  product_id: string
  resource_id: string
  operator_name: string
  operation_name: string
  type: ApontamentoType
  quantity_produced: number
  quantity_rejected: number
  start_time: string
  end_time: string
  duration_minutes: number
  notes: string
  lot_number: string
  responsible: string
  created: string
  updated: string
  expand?: {
    production_order_id?: { id: string; order_number: string }
    product_id?: { id: string; name: string }
    resource_id?: { id: string; name: string }
  }
}

export interface QualityChecklist {
  id: string
  name: string
  product_id: string
  bom_version_id: string
  items: Array<{ label: string; type: string; required: boolean }>
  active: boolean
  responsible: string
  created: string
  updated: string
  expand?: { product_id?: { id: string; name: string } }
}

export type NonConformitySeverity = 'baixa' | 'media' | 'alta' | 'critica'
export type NonConformityStatus =
  | 'aberta'
  | 'em_analise'
  | 'acao_definida'
  | 'resolvida'
  | 'cancelada'

export interface QualityNonConformity {
  id: string
  production_order_id: string
  product_id: string
  parameter_id: string
  description: string
  severity: NonConformitySeverity
  status: NonConformityStatus
  quantity_affected: number
  root_cause: string
  corrective_action: string
  lot_number: string
  responsible: string
  resolution_date: string
  created: string
  updated: string
  expand?: {
    production_order_id?: { id: string; order_number: string }
    product_id?: { id: string; name: string }
  }
}

export interface IndustrialKpi {
  id: string
  resource_id: string
  production_order_id: string
  period: string
  oee: number
  availability: number
  performance: number
  quality_rate: number
  efficiency: number
  productivity: number
  lead_time_minutes: number
  setup_time_minutes: number
  planned_quantity: number
  produced_quantity: number
  rejected_quantity: number
  cost_per_unit: string
  responsible: string
  created: string
  updated: string
  expand?: { resource_id?: { id: string; name: string } }
}

export type MaintenanceType = 'preventiva' | 'corretiva' | 'preditiva'
export type MaintenanceStatus = 'agendada' | 'em_andamento' | 'concluida' | 'atrasada' | 'cancelada'

export interface MaintenanceSchedule {
  id: string
  resource_id: string
  type: MaintenanceType
  title: string
  description: string
  frequency_days: number
  last_maintenance: string
  next_maintenance: string
  status: MaintenanceStatus
  impact_on_production: 'nenhum' | 'baixo' | 'medio' | 'alto' | 'critico'
  estimated_downtime_hours: number
  responsible: string
  cost: string
  notes: string
  created: string
  updated: string
  expand?: { resource_id?: { id: string; name: string } }
}

export interface IndustrialTraceability {
  id: string
  production_order_id: string
  product_id: string
  raw_material_id: string
  lot_number: string
  serial_number: string
  operator_name: string
  resource_id: string
  inspection_id: string
  quantity: number
  direction: 'entrada' | 'saida'
  timestamp: string
  notes: string
  created: string
  updated: string
  expand?: {
    production_order_id?: { id: string; order_number: string }
    product_id?: { id: string; name: string }
    raw_material_id?: { id: string; name: string }
    resource_id?: { id: string; name: string }
  }
}

export interface MrpSuggestion {
  product_id: string
  product_name: string
  product_code: string
  required_quantity: number
  available_stock: number
  in_transit: number
  open_orders: number
  net_need: number
  suggested_action: 'comprar' | 'produzir' | 'transferir' | 'nenhum'
  priority: 'baixa' | 'media' | 'alta' | 'critica'
  bom_id?: string
  supplier?: string
  lead_time_days?: number
}
