export type WorkflowStatus =
  | 'pending'
  | 'in_progress'
  | 'approved'
  | 'rejected'
  | 'cancelled'
  | 'completed'

export interface WorkflowStep {
  key: string
  label: string
  role: string
  action: 'approve' | 'reject' | 'review' | 'execute' | 'close'
  assigned_to?: string
  completed_at?: string
  completed_by?: string
  result?: string
  notes?: string
}

export interface PlatformWorkflow {
  id: string
  workflow_key: string
  entity_type: string
  entity_id: string
  entity_number: string
  entity_summary: string
  current_step: string
  steps: WorkflowStep[]
  history: Array<{ step: string; action: string; user: string; date: string; notes: string }>
  status: WorkflowStatus
  assigned_to: string
  assigned_role: string
  module_origin: string
  company: string
  branch: string
  created_by: string
  created_by_name: string
  created: string
  updated: string
}

export type AgendaEventType =
  | 'meeting'
  | 'visit'
  | 'training'
  | 'maintenance'
  | 'production'
  | 'approval'
  | 'commitment'
  | 'fiscal_deadline'
  | 'rh_event'
  | 'crm_activity'
  | 'financial_deadline'
  | 'project_milestone'
  | 'other'

export type AgendaEventStatus =
  | 'scheduled'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'postponed'

export interface PlatformAgendaEvent {
  id: string
  title: string
  description: string
  event_type: AgendaEventType
  module_origin: string
  start_date: string
  end_date: string
  all_day: boolean
  location: string
  assigned_to: string
  assigned_name: string
  related_entity_type: string
  related_entity_id: string
  status: AgendaEventStatus
  priority: 'low' | 'medium' | 'high' | 'critical'
  company: string
  branch: string
  created_by: string
  created: string
  updated: string
}

export type MonitoringServiceType =
  | 'cron'
  | 'job'
  | 'queue'
  | 'integration'
  | 'webhook'
  | 'ai'
  | 'bi'
  | 'cache'
  | 'workflow'
  | 'notification'
  | 'scheduler'

export type MonitoringStatus = 'healthy' | 'degraded' | 'down' | 'unknown'

export interface PlatformMonitoringEntry {
  id: string
  service_name: string
  service_type: MonitoringServiceType
  status: MonitoringStatus
  last_run_at: string
  next_run_at: string
  last_result: string
  error_count: number
  success_count: number
  avg_duration_ms: number
  details: Record<string, unknown>
  company: string
  branch: string
  created: string
  updated: string
}

export const WORKFLOW_TEMPLATES: Record<string, WorkflowStep[]> = {
  sales_order: [
    { key: 'create', label: 'Criação do Pedido', role: 'PADRAO', action: 'execute' },
    { key: 'approve', label: 'Aprovação Comercial', role: 'COMERCIAL', action: 'approve' },
    { key: 'financial', label: 'Liberção Financeira', role: 'FINANCEIRO', action: 'approve' },
    { key: 'production', label: 'Produção', role: 'PADRAO', action: 'execute' },
    { key: 'expedition', label: 'Expedição', role: 'PADRAO', action: 'execute' },
    { key: 'fiscal', label: 'Fiscal', role: 'FINANCEIRO', action: 'execute' },
    { key: 'close', label: 'Fechamento', role: 'SUP', action: 'close' },
  ],
  purchase_order: [
    { key: 'create', label: 'Criação do Pedido', role: 'PADRAO', action: 'execute' },
    { key: 'approve', label: 'Aprovação', role: 'COMERCIAL', action: 'approve' },
    { key: 'financial', label: 'Liberação Financeira', role: 'FINANCEIRO', action: 'approve' },
    { key: 'receive', label: 'Recebimento', role: 'PADRAO', action: 'execute' },
    { key: 'close', label: 'Fechamento', role: 'SUP', action: 'close' },
  ],
  price_change: [
    { key: 'request', label: 'Solicitação', role: 'PADRAO', action: 'execute' },
    { key: 'approve', label: 'Aprovação', role: 'COMERCIAL', action: 'approve' },
    { key: 'close', label: 'Aplicação', role: 'SUP', action: 'close' },
  ],
  generic: [
    { key: 'create', label: 'Início', role: 'PADRAO', action: 'execute' },
    { key: 'approve', label: 'Aprovação', role: 'COMERCIAL', action: 'approve' },
    { key: 'close', label: 'Conclusão', role: 'SUP', action: 'close' },
  ],
}
