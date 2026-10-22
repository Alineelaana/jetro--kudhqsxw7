export interface SpecGroup {
  id: string
  name: string
  item_category: string
  description: string
  active: boolean
  responsible: string
  created: string
  updated: string
}

export interface SpecAttribute {
  id: string
  group_id: string
  name: string
  label: string
  type: string
  unit: string
  required: boolean
  options: string[] | null
  order: number
  active: boolean
  created: string
  updated: string
  expand?: { group_id: SpecGroup }
}

export interface SpecValue {
  id: string
  item_id: string
  attribute_id: string
  value: string
  version: number
  vigencia_inicial: string
  vigencia_final: string
  status: string
  responsible: string
  approval_date: string
  created: string
  updated: string
  expand?: { item_id: { id: string; name: string }; attribute_id: SpecAttribute }
}

export interface UnitConversion {
  id: string
  from_unit: string
  to_unit: string
  factor: number
  scope: string
  item_id: string
  version: number
  vigencia_inicial: string
  vigencia_final: string
  active: boolean
  responsible: string
  created: string
  updated: string
}

export interface BomVersion {
  id: string
  product_id: string
  version: number
  revision_number?: number | string
  revision_status?: string
  effective_date?: string
  type: string
  status: string
  vigencia_inicial: string
  vigencia_final: string
  rendimento: string
  concentration: string
  ph: string
  density: string
  temperature: string
  mixing_sequence: string
  tolerances: string
  instructions: string
  responsible: string
  approval_date: string
  created: string
  updated: string
  expand?: { product_id: { id: string; name: string } }
}

export interface BomComponent {
  id: string
  bom_version_id: string
  item_id: string
  quantidade: string
  unidade: string
  perda_prevista: string
  substituto_permitido: boolean
  substituto_item_id: string
  ordem: number
  observations: string
  created: string
  updated: string
  expand?: { item_id: { id: string; name: string; code: string } }
}

export interface ProductionResource {
  id: string
  code: string
  name: string
  type?: string
  tipo?: string
  description?: string
  capacity_per_hour: number
  capacity_unit?: string
  status?: string
  location?: string
  active?: boolean
  responsible_user?: string
  modulo_origem?: string
  created?: string
  updated?: string
}

export interface ProductionRoute {
  id: string
  product_id: string
  version: number
  name: string
  description: string
  status: string
  vigencia_inicial: string
  vigencia_final: string
  responsible: string
  approval_date: string
  created: string
  updated: string
  expand?: { product_id: { id: string; name: string } }
}

export interface ProductionRouteOperation {
  id: string
  route_id: string
  order: number
  name: string
  description: string
  resource_id: string
  materials_consumed: unknown
  tempo_setup: string
  tempo_operacao: string
  perda_prevista: string
  responsible: string
  created: string
  updated: string
  expand?: { resource_id: ProductionResource }
}

export interface IndustrialCost {
  id: string
  item_id: string
  bom_version_id: string
  route_version_id: string
  cost_type: string
  version: number
  cost_materia_prima: string
  cost_embalagem: string
  cost_mao_obra: string
  cost_recurso: string
  cost_energia: string
  cost_perdas: string
  cost_indiretos: string
  cost_cambio: string
  cost_landing: string
  total_cost: string
  unit_cost: string
  deviations: unknown
  responsible: string
  calculation_date: string
  created: string
  updated: string
  expand?: { item_id: { id: string; name: string } }
}

export interface QualityInspection {
  id: string
  item_id: string
  batch_id: string
  parameter_id: string
  spec_value_id: string
  result_value: string
  status: string
  modulo_origem: string
  responsible: string
  observations: string
  inspection_date: string
  created: string
  updated: string
}
