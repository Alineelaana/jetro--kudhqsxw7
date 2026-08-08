export type PerformanceModule =
  | 'comercial'
  | 'financeiro'
  | 'fiscal'
  | 'compras'
  | 'estoque'
  | 'logistica'
  | 'producao'
  | 'marketing'
  | 'rh'
  | 'ti'
  | 'administrativo'
  | 'estrategico'
  | 'geral'

export const MODULE_LABELS: Record<string, string> = {
  comercial: 'Performance Comercial',
  financeiro: 'Performance Financeira',
  fiscal: 'Performance Fiscal',
  compras: 'Performance Compras',
  estoque: 'Performance Estoque',
  logistica: 'Performance Logística',
  producao: 'Performance Produção',
  marketing: 'Performance Marketing',
  rh: 'Performance RH',
  ti: 'Performance TI',
  administrativo: 'Performance Administrativa',
  estrategico: 'Performance Estratégica',
  geral: 'Performance Geral da Empresa',
}

export const MODULE_ICONS: Record<string, string> = {
  comercial: '📈',
  financeiro: '💰',
  fiscal: '🧾',
  compras: '🛒',
  estoque: '📦',
  logistica: '🚚',
  producao: '🏭',
  marketing: '📣',
  rh: '👥',
  ti: '💻',
  administrativo: '📋',
  estrategico: '🎯',
  geral: '🏢',
}

export interface PerformanceKpi {
  id: string
  code: string
  name: string
  module: string
  category: string
  formula_source: string
  unit: string
  direction: string
  weight: number
  periodicity: string
  active: boolean
}

export interface PerformanceScore {
  id: string
  entity_type: string
  entity_id: string
  entity_name: string
  company: string
  branch: string
  period: string
  score: number
  components: Record<string, unknown>
}

export interface PerformanceAlert {
  id: string
  module: string
  entity_type: string
  entity_name: string
  severity: 'info' | 'warning' | 'critical'
  message: string
  reason: string
  suggested_action: string
  resolved: boolean
  created: string
}

export interface PerformancePrediction {
  id: string
  scenario: string
  entity_name: string
  period: string
  metric: string
  predicted_value: string
  current_value: string
  impact: Record<string, unknown>
  assumptions: unknown[]
  created: string
}

export interface PerformanceGamification {
  id: string
  type: string
  name: string
  description: string
  icon: string
  rules: Record<string, unknown>
  active: boolean
  company: string
}

export interface PerformanceConfig {
  id: string
  company: string
  branch: string
  indicators: string[]
  weights: Record<string, number>
  goals: Record<string, string>
  periodicity: string
  gamification_enabled: boolean
}

export interface PerformanceBenchmark {
  id: string
  entity_type: string
  metric: string
  value: string
  percentile: number
  period: string
}

export interface PerformanceAiAnalysis {
  id: string
  entity_name: string
  period: string
  conclusion: string
  reason: string
  suggested_actions: string[]
  risk_level: string
  created: string
}

export interface PerformanceChatMessage {
  role: 'user' | 'assistant'
  content: string
  citations?: Array<{ n: number; excerpt: string }>
}

export interface PerformanceConversation {
  id: string
  title: string
  created: string
  updated: string
}
