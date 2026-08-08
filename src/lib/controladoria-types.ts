export const DRE_GROUPS = ['Receitas', 'Custos', 'Despesas', 'Resultado', 'Impostos'] as const
export const RESULT_VERSIONS = [
  'oficial',
  'contabil',
  'gerencial',
  'orcado',
  'forecast',
  'rolling_forecast',
  'reforecast',
  'simulado',
  'consolidado',
] as const
export const CLOSING_STATUS = [
  'open',
  'in_review',
  'pending_approval',
  'approved',
  'closed',
  'reopened',
] as const
export const KPI_CATEGORIES = [
  'rentabilidade',
  'liquidez',
  'eficiencia',
  'crescimento',
  'estrutura',
  'capital_giro',
] as const
export const DRIVER_TYPES = ['financial', 'operational'] as const
export const SCENARIO_TYPES = [
  'price_increase',
  'cost_reduction',
  'mix_change',
  'sales_increase',
  'expense_reduction',
  'exchange_rate',
  'supplier_change',
  'tax_change',
] as const
export const SIMULATION_LABELS: Record<string, string> = {
  price_increase: 'Aumento de Preço',
  cost_reduction: 'Redução de Custos',
  mix_change: 'Alteração de Mix',
  sales_increase: 'Aumento de Vendas',
  expense_reduction: 'Redução de Despesas',
  exchange_rate: 'Alteração Cambial',
  supplier_change: 'Mudança de Fornecedor',
  tax_change: 'Alteração de Impostos',
}
export const STATUS_COLORS: Record<string, string> = {
  open: 'bg-blue-100 text-blue-700',
  in_review: 'bg-amber-100 text-amber-700',
  pending_approval: 'bg-orange-100 text-orange-700',
  approved: 'bg-emerald-100 text-emerald-700',
  closed: 'bg-gray-100 text-gray-600',
  reopened: 'bg-red-100 text-red-700',
  draft: 'bg-gray-100 text-gray-600',
  active: 'bg-emerald-100 text-emerald-700',
  archived: 'bg-gray-100 text-gray-600',
  completed: 'bg-emerald-100 text-emerald-700',
  pending: 'bg-amber-100 text-amber-700',
  rejected: 'bg-red-100 text-red-700',
}

export interface DRELine {
  id: string
  line_key: string
  label: string
  group: string
  level: number
  order: number
  formula_type: string
  formula_expression: string
  sign: string
  is_calculated: boolean
  is_active: boolean
  company: string
  observations: string
}
export interface AccountMapping {
  id: string
  account_code: string
  account_name: string
  dre_line_key: string
  reclassification_target: string
  mapping_type: string
  is_active: boolean
  company: string
}
export interface Reclassification {
  id: string
  period: string
  source_account_code: string
  source_account_name: string
  target_dre_line: string
  original_dre_line: string
  value: string
  justification: string
  status: string
  user_name: string
  company: string
  branch: string
}
export interface ResultVersion {
  id: string
  version_type: string
  period: string
  label: string
  description: string
  status: string
  is_current: boolean
  company: string
  branch: string
  created_by: string
  created_by_name: string
  created: string
}
export interface BudgetEntry {
  id: string
  version_id: string
  period: string
  dre_line_key: string
  cost_center: string
  value: string
  company: string
  branch: string
  observations: string
}
export interface ForecastEntry {
  id: string
  version_id: string
  period: string
  dre_line_key: string
  cost_center: string
  value: string
  forecast_type: string
  company: string
  branch: string
}
export interface ClosingRecord {
  id: string
  period: string
  company: string
  branch: string
  status: string
  responsible: string
  approver: string
  checklist: Record<string, unknown>
  timeline: Array<Record<string, unknown>>
  snapshot_id: string
  closing_date: string
  justification: string
  reopen_reason: string
  created: string
}
export interface Snapshot {
  id: string
  period: string
  version_type: string
  data: Record<string, unknown>
  hash: string
  created_by: string
  created_by_name: string
  closing_id: string
  company: string
  branch: string
  created: string
}
export interface KPIDefinition {
  id: string
  name: string
  category: string
  formula: string
  formula_description: string
  periodicity: string
  target: string
  responsible: string
  criticality: string
  lower_limit: string
  upper_limit: string
  unit: string
  trend: string
  materiality_id: string
  data_source: string
  is_active: boolean
}
export interface DriverDefinition {
  id: string
  name: string
  type: string
  category: string
  formula: string
  data_source: string
  description: string
  unit: string
  is_active: boolean
}
export interface MaterialityConfig {
  id: string
  indicator_name: string
  limit: string
  tolerance: string
  criticality: string
  impact: string
  relevance: string
  severity: string
  justification: string
  is_active: boolean
}
export interface SimulationRecord {
  id: string
  scenario_name: string
  scenario_type: string
  parameters: Record<string, unknown>
  results: Record<string, unknown>
  base_version: string
  status: string
  user_name: string
  company: string
  branch: string
  created: string
}
export interface ConsolidationRecord {
  id: string
  group_name: string
  companies: Record<string, unknown>
  eliminations: Record<string, unknown>
  consolidation_type: string
  period: string
  status: string
  results: Record<string, unknown>
}
export interface CommentRecord {
  id: string
  entity_type: string
  entity_id: string
  period: string
  line_key: string
  cost_center: string
  comment: string
  user_name: string
  user_role: string
  company: string
  branch: string
  created: string
}
export interface SavedView {
  id: string
  name: string
  view_type: string
  filters: Record<string, unknown>
  columns: Record<string, unknown>
  groupings: Record<string, unknown>
  comparison: Record<string, unknown>
  user_name: string
  is_shared: boolean
  company: string
  created: string
}
export interface DRELineResult {
  line_key: string
  label: string
  group: string
  order: number
  value: number
  is_calculated: boolean
  sign: string
  percentage_of_revenue?: number
}
export interface DREResult {
  version: string
  period: string
  lines: DRELineResult[]
  totals: {
    receita_liquida: number
    lucro_bruto: number
    resultado_operacional: number
    ebitda: number
    resultado_liquido: number
  }
}
export interface CtrlFieldDef {
  name: string
  label: string
  type: 'text' | 'number' | 'date' | 'select' | 'textarea' | 'switch'
  required?: boolean
  options?: string[]
  span?: 1 | 2
}
export interface CtrlScreenConfig {
  collection: string
  title: string
  nameLabel: string
  statusField?: string
  statusOptions?: readonly string[]
  fields: CtrlFieldDef[]
}
export const CTRL_SCREEN_CONFIGS: Record<string, CtrlScreenConfig> = {
  reclassifications: {
    collection: 'controladoria_reclassifications',
    title: 'Reclassificações Gerenciais',
    nameLabel: 'Conta Origem',
    statusField: 'status',
    statusOptions: ['pending', 'approved', 'rejected'],
    fields: [
      { name: 'period', label: 'Período', type: 'text', required: true },
      { name: 'source_account_code', label: 'Conta Origem (Código)', type: 'text', required: true },
      { name: 'source_account_name', label: 'Conta Origem (Nome)', type: 'text' },
      { name: 'target_dre_line', label: 'Linha DRE Destino', type: 'text', required: true },
      { name: 'original_dre_line', label: 'Linha DRE Original', type: 'text' },
      { name: 'value', label: 'Valor', type: 'text', required: true },
      { name: 'justification', label: 'Justificativa', type: 'textarea', span: 2, required: true },
      {
        name: 'status',
        label: 'Status',
        type: 'select',
        options: ['pending', 'approved', 'rejected'],
      },
      { name: 'company', label: 'Empresa', type: 'text' },
      { name: 'branch', label: 'Filial', type: 'text' },
    ],
  },
  materiality: {
    collection: 'controladoria_materiality',
    title: 'Motor de Materialidade',
    nameLabel: 'Indicador',
    fields: [
      { name: 'indicator_name', label: 'Indicador', type: 'text', required: true, span: 2 },
      { name: 'limit', label: 'Limite (%)', type: 'text', required: true },
      { name: 'tolerance', label: 'Tolerância (%)', type: 'text' },
      {
        name: 'criticality',
        label: 'Criticidade',
        type: 'select',
        options: ['baixa', 'media', 'alta', 'critica'],
      },
      { name: 'impact', label: 'Impacto', type: 'text' },
      {
        name: 'relevance',
        label: 'Relevância',
        type: 'select',
        options: ['baixa', 'media', 'alta'],
      },
      {
        name: 'severity',
        label: 'Severidade',
        type: 'select',
        options: ['info', 'warning', 'critical'],
      },
      { name: 'justification', label: 'Justificativa', type: 'textarea', span: 2 },
      { name: 'is_active', label: 'Ativo', type: 'switch' },
    ],
  },
  consolidation: {
    collection: 'controladoria_consolidation',
    title: 'Consolidação Empresarial',
    nameLabel: 'Grupo',
    statusField: 'status',
    statusOptions: ['draft', 'completed'],
    fields: [
      { name: 'group_name', label: 'Nome do Grupo', type: 'text', required: true, span: 2 },
      { name: 'consolidation_type', label: 'Tipo', type: 'select', options: ['parcial', 'total'] },
      { name: 'period', label: 'Período', type: 'text', required: true },
      { name: 'status', label: 'Status', type: 'select', options: ['draft', 'completed'] },
      { name: 'companies', label: 'Empresas (JSON)', type: 'textarea', span: 2 },
      { name: 'eliminations', label: 'Eliminações Intercompany (JSON)', type: 'textarea', span: 2 },
      { name: 'results', label: 'Resultados (JSON)', type: 'textarea', span: 2 },
    ],
  },
  result_centers: {
    collection: 'controladoria_result_centers',
    title: 'Centros de Resultado',
    nameLabel: 'Nome',
    statusField: 'is_active',
    fields: [
      { name: 'code', label: 'Código', type: 'text', required: true },
      { name: 'name', label: 'Nome', type: 'text', required: true, span: 2 },
      {
        name: 'type',
        label: 'Tipo',
        type: 'select',
        options: [
          'Distribuição',
          'Indústria',
          'E-commerce',
          'Loja',
          'Filial',
          'CD',
          'Unidade de Negócio',
        ],
      },
      { name: 'parent_code', label: 'Centro Superior', type: 'text' },
      { name: 'responsible', label: 'Responsável', type: 'text' },
      { name: 'company', label: 'Empresa', type: 'text' },
      { name: 'branch', label: 'Filial', type: 'text' },
      { name: 'is_active', label: 'Ativo', type: 'switch' },
    ],
  },
  ebitda: {
    collection: 'controladoria_ebitda_config',
    title: 'Configuração EBITDA',
    nameLabel: 'Nome',
    statusField: 'is_active',
    fields: [
      { name: 'name', label: 'Nome', type: 'text', required: true, span: 2 },
      { name: 'formula_expression', label: 'Fórmula', type: 'text', required: true, span: 2 },
      { name: 'margin_target', label: 'Meta Margem (%)', type: 'text' },
      { name: 'period', label: 'Período', type: 'text' },
      { name: 'description', label: 'Descrição', type: 'textarea', span: 2 },
      { name: 'is_active', label: 'Ativo', type: 'switch' },
    ],
  },
}

export interface ResultCenter {
  id: string
  code: string
  name: string
  type: string
  parent_code: string
  responsible: string
  is_active: boolean
  company: string
  branch: string
}
export interface EbitdaConfig {
  id: string
  name: string
  formula_expression: string
  components: Record<string, unknown>
  margin_target: string
  description: string
  is_active: boolean
  company: string
  period: string
}
export interface MarginResult {
  id: string
  dimension: string
  entity_id: string
  entity_name: string
  period: string
  revenue: string
  cost: string
  margin_value: string
  margin_percent: string
  methodology: string
  cost_breakdown: Record<string, unknown>
}
