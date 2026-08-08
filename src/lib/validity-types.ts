export interface ValidityRule {
  id: string
  name: string
  module: string
  entity_type: string
  entity_label: string
  validity_field: string
  antecedent_days: number[]
  criticidade_mapping: Record<string, string>
  recipients: Record<string, unknown>
  escalation_config: Record<string, unknown>
  recurrence_days: number
  channels: string[]
  active: boolean
  company: string
  branch: string
  created: string
  updated: string
}

export interface ValidityAlert {
  id: string
  rule_id: string
  entity_type: string
  entity_id: string
  entity_name: string
  validity_field: string
  validity_date: string
  days_remaining: number
  criticidade: string
  status: string
  assignee: string
  company: string
  branch: string
  module: string
  timeline: Array<Record<string, unknown>>
  snooze_until: string
  justification: string
  resolution_note: string
  metadata: Record<string, unknown>
  created: string
  updated: string
  expand?: Record<string, unknown>
}

export interface CorporateDocument {
  id: string
  tipo: string
  numero: string
  titular: string
  emissao: string
  validade: string
  orgao_emissor: string
  responsavel: string
  anexo: string
  status: string
  empresa: string
  filial: string
  created: string
  updated: string
}

export const CRITICIDADE_OPTIONS = ['Informativo', 'Atenção', 'Urgente', 'Crítico', 'Vencido']
export const ALERT_STATUS_OPTIONS = [
  'Novo',
  'Visualizado',
  'Em Tratamento',
  'Resolvido',
  'Ignorado',
  'Vencido',
]
export const MODULE_OPTIONS = [
  { value: 'estoque', label: 'Estoque' },
  { value: 'rh', label: 'RH' },
  { value: 'sst', label: 'SST' },
  { value: 'logistica', label: 'Logística' },
  { value: 'comercial', label: 'Comercial' },
  { value: 'administrativo', label: 'Administrativo' },
  { value: 'financeiro', label: 'Financeiro' },
]
