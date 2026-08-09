export interface CopHealthMetric {
  status: 'healthy' | 'degraded' | 'down'
  label: string
  value?: string
  error?: string
}

export interface CopHealthResult {
  timestamp: string
  overall: 'Saudável' | 'Degradado' | 'Indisponível'
  metrics: Record<string, CopHealthMetric>
  summary: Record<string, number>
}

export interface CopMigration {
  name: string
  applied: boolean
  status: string
  immutable: boolean
  applied_at?: string
}

export interface CopRelease {
  id: string
  version: string
  environment: 'Desenvolvimento' | 'Homologação' | 'Produção'
  build_commit: string
  responsible: string
  associated_migrations: string[]
  features: string[]
  bug_fixes: string[]
  risks: string
  rollback_available: boolean
  status: string
  created: string
  updated: string
}

export interface CopErrorItem {
  id: string
  created: string
  user_name: string
  user_role: string
  action: string
  module: string
  target_summary: string
  target_id: string
  ip_address: string
  criticidade: string
  is_suspicious: boolean
  triage_status: string
  triage_responsible: string
  triage_recurrence_count: number
}

export interface TriageUpdate {
  triage_responsible?: string
  triage_status?: 'Novo' | 'Em análise' | 'Atribuído' | 'Resolvido' | 'Recorrente'
  triage_recurrence_count?: number
  triage_resolved_by?: string
  triage_resolved_at?: string
}

export const TRIAGE_STATUS_OPTIONS = [
  { value: 'Novo', label: 'Novo' },
  { value: 'Em análise', label: 'Em análise' },
  { value: 'Atribuído', label: 'Atribuído' },
  { value: 'Resolvido', label: 'Resolvido' },
  { value: 'Recorrente', label: 'Recorrente' },
] as const

export const ENVIRONMENT_OPTIONS = [
  { value: 'Desenvolvimento', label: 'Desenvolvimento' },
  { value: 'Homologação', label: 'Homologação' },
  { value: 'Produção', label: 'Produção' },
] as const
