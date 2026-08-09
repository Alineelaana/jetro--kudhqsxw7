export interface StrategicInitiative {
  id: string
  title: string
  objective: string
  description: string
  justification: string
  problem: string
  opportunity: string
  expected_impact: string
  area: string
  responsible: string
  team: string
  priority: string
  effort: string
  deadline: string
  status: string
  indicators: unknown
  investment: string
  expected_roi: string
  actual_roi: string
  risks: unknown
  dependencies: unknown
  attachments: unknown
  comments: unknown
  history: unknown
  company: string
  branch: string
  created: string
  updated: string
}
export interface StrategicOkr {
  id: string
  objective: string
  description: string
  responsible: string
  team: string
  period: string
  quarter: string
  status: string
  area: string
  indicators: unknown
  target: string
  current: string
  percent: number
  deadline: string
  comments: unknown
  company: string
  branch: string
  created: string
  updated: string
}
export interface StrategicKeyResult {
  id: string
  okr_id: string
  title: string
  metric: string
  target: string
  current: string
  percent: number
  deadline: string
  responsible: string
  status: string
  comments: unknown
  indicator_id: string
  company: string
  branch: string
  created: string
  updated: string
}
export interface StrategicProject {
  id: string
  name: string
  description: string
  type: string
  origin: string
  area: string
  responsible: string
  team: string
  priority: string
  status: string
  start_date: string
  end_date: string
  investment: string
  expected_roi: string
  actual_roi: string
  budget: string
  spent: string
  progress: number
  health: string
  related_module: string
  company: string
  branch: string
  created: string
  updated: string
}
export interface BusinessCase {
  id: string
  title: string
  problem: string
  objective: string
  hypothesis: string
  market: string
  audience: string
  solution: string
  investment: string
  expected_revenue: string
  costs: string
  roi: string
  payback: string
  risks: unknown
  assumptions: unknown
  swot: unknown
  opinion: string
  approval_status: string
  approver: string
  approval_date: string
  attachments: unknown
  company: string
  branch: string
  created: string
  updated: string
}
export interface GrowthExperiment {
  id: string
  title: string
  hypothesis: string
  objective: string
  segment: string
  products: unknown
  clients: unknown
  start_date: string
  end_date: string
  primary_metric: string
  target_value: string
  actual_value: string
  result: string
  conclusion: string
  decision: string
  status: string
  company: string
  branch: string
  created: string
  updated: string
}
export interface MarketIntelligence {
  id: string
  type: string
  title: string
  description: string
  competitors: unknown
  brands: unknown
  news: unknown
  products: unknown
  trends: unknown
  benchmarks: unknown
  opportunities: unknown
  threats: unknown
  analyses: unknown
  files: unknown
  links: unknown
  company: string
  branch: string
  created: string
  updated: string
}
export interface StrategicDecision {
  id: string
  decision: string
  reason: string
  responsible: string
  impact: string
  results: string
  documents: unknown
  approval_status: string
  approver: string
  approval_date: string
  history: unknown
  company: string
  branch: string
  created: string
  updated: string
}
export interface StrategicIndicator {
  id: string
  name: string
  description: string
  formula: string
  data_source: string
  periodicity: string
  responsible: string
  area: string
  target: string
  current_value: string
  history: unknown
  drill_down_route: string
  unit: string
  direction: string
  category: string
  source_collection: string
  active: boolean
  company: string
  branch: string
  created: string
  updated: string
}

export interface StrategicFieldDef {
  name: string
  label: string
  type: 'text' | 'textarea' | 'number' | 'select' | 'date'
  required?: boolean
  options?: string[]
  span?: 1 | 2
}
export interface StrategicCrudConfig {
  collection: string
  title: string
  nameLabel: string
  statusField?: string
  statusOptions?: string[]
  fields: StrategicFieldDef[]
}

export const INITIATIVES_CONFIG: StrategicCrudConfig = {
  collection: 'strategic_initiatives',
  title: 'Iniciativas Estratégicas',
  nameLabel: 'title',
  statusField: 'status',
  statusOptions: ['rascunho', 'planejada', 'em_andamento', 'concluida', 'cancelada', 'pausada'],
  fields: [
    { name: 'title', label: 'Título', type: 'text', required: true, span: 2 },
    { name: 'objective', label: 'Objetivo', type: 'text' },
    { name: 'area', label: 'Área', type: 'text' },
    { name: 'responsible', label: 'Responsável', type: 'text' },
    {
      name: 'priority',
      label: 'Prioridade',
      type: 'select',
      options: ['baixa', 'media', 'alta', 'critica'],
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      options: ['rascunho', 'planejada', 'em_andamento', 'concluida', 'cancelada', 'pausada'],
    },
    { name: 'deadline', label: 'Prazo', type: 'date' },
    { name: 'investment', label: 'Investimento', type: 'text' },
    { name: 'expected_roi', label: 'ROI Esperado', type: 'text' },
    { name: 'description', label: 'Descrição', type: 'textarea', span: 2 },
    { name: 'expected_impact', label: 'Impacto Esperado', type: 'textarea', span: 2 },
  ],
}
export const BUSINESS_CASES_CONFIG: StrategicCrudConfig = {
  collection: 'business_cases',
  title: 'Business Cases',
  nameLabel: 'title',
  statusField: 'approval_status',
  statusOptions: ['pendente', 'aprovado', 'rejeitado'],
  fields: [
    { name: 'title', label: 'Título', type: 'text', required: true, span: 2 },
    { name: 'problem', label: 'Problema', type: 'textarea', span: 2 },
    { name: 'objective', label: 'Objetivo', type: 'text' },
    { name: 'hypothesis', label: 'Hipótese', type: 'text' },
    { name: 'investment', label: 'Investimento', type: 'text' },
    { name: 'expected_revenue', label: 'Receita Esperada', type: 'text' },
    { name: 'roi', label: 'ROI', type: 'text' },
    { name: 'payback', label: 'Payback', type: 'text' },
    {
      name: 'approval_status',
      label: 'Status Aprovação',
      type: 'select',
      options: ['pendente', 'aprovado', 'rejeitado'],
    },
    { name: 'solution', label: 'Solução', type: 'textarea', span: 2 },
  ],
}
export const GROWTH_CONFIG: StrategicCrudConfig = {
  collection: 'growth_experiments',
  title: 'Experimentos de Growth',
  nameLabel: 'title',
  statusField: 'status',
  statusOptions: ['planejado', 'em_andamento', 'concluido', 'cancelado'],
  fields: [
    { name: 'title', label: 'Título', type: 'text', required: true, span: 2 },
    { name: 'hypothesis', label: 'Hipótese', type: 'textarea', span: 2 },
    { name: 'objective', label: 'Objetivo', type: 'text' },
    { name: 'segment', label: 'Segmento', type: 'text' },
    { name: 'primary_metric', label: 'Métrica Principal', type: 'text' },
    { name: 'target_value', label: 'Meta', type: 'text' },
    { name: 'actual_value', label: 'Resultado', type: 'text' },
    {
      name: 'decision',
      label: 'Decisão',
      type: 'select',
      options: ['escalar', 'cancelar', 'repetir'],
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      options: ['planejado', 'em_andamento', 'concluido', 'cancelado'],
    },
    { name: 'conclusion', label: 'Conclusão', type: 'textarea', span: 2 },
  ],
}
export const MARKET_INTEL_CONFIG: StrategicCrudConfig = {
  collection: 'market_intelligence',
  title: 'Inteligência de Mercado',
  nameLabel: 'title',
  statusField: 'type',
  fields: [
    { name: 'title', label: 'Título', type: 'text', required: true, span: 2 },
    {
      name: 'type',
      label: 'Tipo',
      type: 'select',
      options: [
        'concorrente',
        'marca',
        'novidade',
        'produto',
        'tendencia',
        'benchmark',
        'oportunidade',
        'ameaca',
        'analise',
      ],
    },
    { name: 'description', label: 'Descrição', type: 'textarea', span: 2 },
  ],
}
export const DECISIONS_CONFIG: StrategicCrudConfig = {
  collection: 'strategic_decisions',
  title: 'Decisões Estratégicas',
  nameLabel: 'decision',
  statusField: 'approval_status',
  statusOptions: ['pendente', 'aprovado', 'rejeitado'],
  fields: [
    { name: 'decision', label: 'Decisão', type: 'text', required: true, span: 2 },
    { name: 'reason', label: 'Motivo', type: 'textarea', span: 2 },
    { name: 'responsible', label: 'Responsável', type: 'text' },
    { name: 'impact', label: 'Impacto', type: 'text' },
    {
      name: 'approval_status',
      label: 'Status',
      type: 'select',
      options: ['pendente', 'aprovado', 'rejeitado'],
    },
    { name: 'results', label: 'Resultados', type: 'textarea', span: 2 },
  ],
}
export const INDICATORS_CONFIG: StrategicCrudConfig = {
  collection: 'strategic_indicators',
  title: 'Indicadores Estratégicos',
  nameLabel: 'name',
  statusField: 'category',
  fields: [
    { name: 'name', label: 'Nome', type: 'text', required: true, span: 2 },
    { name: 'description', label: 'Descrição', type: 'textarea', span: 2 },
    { name: 'formula', label: 'Fórmula', type: 'text' },
    { name: 'data_source', label: 'Origem dos Dados', type: 'text' },
    {
      name: 'periodicity',
      label: 'Periodicidade',
      type: 'select',
      options: ['diaria', 'semanal', 'mensal', 'trimestral', 'anual'],
    },
    { name: 'responsible', label: 'Responsável', type: 'text' },
    { name: 'area', label: 'Área', type: 'text' },
    { name: 'target', label: 'Meta', type: 'text' },
    { name: 'current_value', label: 'Valor Atual', type: 'text' },
    { name: 'unit', label: 'Unidade', type: 'text' },
    {
      name: 'direction',
      label: 'Direção',
      type: 'select',
      options: ['higher_is_better', 'lower_is_better'],
    },
    {
      name: 'category',
      label: 'Categoria',
      type: 'select',
      options: ['financeiro', 'comercial', 'operacional', 'rh', 'estrategico', 'digital'],
    },
    { name: 'drill_down_route', label: 'Rota Drill-Down', type: 'text' },
  ],
}
