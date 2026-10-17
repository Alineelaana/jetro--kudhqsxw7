export type KnowledgeArea =
  | 'Administração'
  | 'Comercial'
  | 'DP & RH'
  | 'Financeiro'
  | 'Fiscal'
  | 'Inteligência'
  | 'Logística e Operações'
  | 'Marketing e Trade Marketing'
  | 'Projetos Estratégicos'
  | 'Processos e Procedimentos'
  | 'Tecnologia e Sistemas'
  | 'Reuniões e Decisões'
  | 'Políticas e Normas Internas'

export const KNOWLEDGE_AREAS: KnowledgeArea[] = [
  'Administração',
  'Comercial',
  'DP & RH',
  'Financeiro',
  'Fiscal',
  'Inteligência',
  'Logística e Operações',
  'Marketing e Trade Marketing',
  'Projetos Estratégicos',
  'Processos e Procedimentos',
  'Tecnologia e Sistemas',
  'Reuniões e Decisões',
  'Políticas e Normas Internas',
]

export type ConfidentialityLevel = 'Publico' | 'Interno' | 'Estrategico' | 'Confidencial'

export interface SegundoCerebroDoc {
  id: string
  title: string
  path: string
  area: KnowledgeArea
  category?: string
  project?: string
  tags?: string[]
  wikilinks?: string[]
  content: string
  summary?: string
  content_hash: string
  sync_date?: string
  sync_source?: 'obsidian_file' | 'obsidian_zip' | 'manual_editor' | 'erp_sync'
  confidentiality: ConfidentialityLevel
  status: 'ativo' | 'pendente_revisao' | 'desatualizado' | 'arquivado'
  author_id?: string
  author_name?: string
  metadata?: Record<string, unknown>
  created: string
  updated: string
}

export type DecisionClassification =
  | 'Decisão aprovada'
  | 'Proposta em análise'
  | 'Sugestão'
  | 'Decisão revogada'
  | 'Pendente'

export interface SegundoCerebroDecision {
  id: string
  subject: string
  date: string
  context?: string
  responsibles?: string[]
  decision: string
  justification?: string
  impacts?: string
  next_steps?: string
  document_source_id?: string
  document_source_title?: string
  classification: DecisionClassification
  has_conflict?: boolean
  conflict_notes?: string
  conflict_sources?: Array<{ title?: string; excerpt?: string }>
  area?: string
  project?: string
  created: string
  updated: string
}

export type OpportunityType =
  | 'Redução de custos'
  | 'Automação'
  | 'Risco operacional'
  | 'Inconsistência documental'
  | 'Oportunidade comercial'

export type OpportunityStatus = 'Em análise' | 'Aprovada' | 'Descartada' | 'Implementada'

export interface SegundoCerebroOpportunity {
  id: string
  title: string
  area: string
  type: OpportunityType
  description: string
  evidence: string
  potential_impact?: string
  priority: 'Alta' | 'Média' | 'Baixa'
  recommendation: string
  sources?: Array<{ doc_id?: string; title?: string; excerpt?: string }>
  status: OpportunityStatus
  status_notes?: string
  evaluated_by?: string
  evaluated_at?: string
  created: string
  updated: string
}

export interface SegundoCerebroInsight {
  id: string
  title: string
  department: string
  category:
    | 'Oportunidade'
    | 'Risco'
    | 'Informação Contraditória'
    | 'Processo Duplicado'
    | 'Etapa Desnecessária'
    | 'Falta de Documentação'
    | 'Recomendação'
  content: string
  evidence: string
  recommendations?: string
  sources?: Array<{ doc_id?: string; title?: string }>
  status: 'Em análise' | 'Validado' | 'Descartado' | 'Implementado'
  active: boolean
  created: string
  updated: string
}

export interface SegundoCerebroSyncLog {
  id: string
  user_id: string
  user_name?: string
  source_type: 'file' | 'zip'
  file_name?: string
  total_files: number
  added_files: number
  updated_files: number
  unchanged_files: number
  deleted_files: number
  errors?: string[]
  status: 'sucesso' | 'parcial' | 'erro'
  summary?: string
  created: string
  updated: string
}

export interface SegundoCerebroChat {
  id: string
  user_id: string
  title: string
  conversation_id?: string
  mode?: 'geral' | 'conselheiro' | 'projeto'
  subject_or_project?: string
  is_favorite?: boolean
  last_message?: string
  message_count?: number
  created: string
  updated: string
}

export interface SegundoCerebroMessage {
  id: string
  chat_id: string
  user_id: string
  role: 'user' | 'assistant'
  content: string
  citations?: Array<{
    id?: string
    title?: string
    path?: string
    area?: string
    excerpt?: string
  }>
  is_favorite?: boolean
  created: string
  updated: string
}

export interface SegundoCerebroMetrics {
  totalDocs: number
  totalAreas: number
  totalProjects: number
  totalDecisions: number
  totalOpportunities: number
  pendingReviews: number
  lastSyncDate: string | null
}
