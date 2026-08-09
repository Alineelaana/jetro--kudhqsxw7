export interface BlueprintVolume {
  id: string
  code: string
  title: string
  description: string
  display_order: number
  active: boolean
  tenant_id: string
  locale: string
  created: string
  updated: string
}

export interface BlueprintChapter {
  id: string
  volume_id: string
  parent_chapter_id: string
  code: string
  title: string
  summary: string
  content: string
  stable_id: string
  display_order: number
  editorial_status: string
  technical_validity: string
  version_number: string
  content_type: string
  knowledge_type: string
  content_nature: string
  authority_level: number
  confidence_level: string
  maturity_level: string
  perspective: string
  obsolescence_risk: string
  last_validated_at: string
  last_used_at: string
  release_introduced: string
  release_modified: string
  release_discontinued: string
  validity_start: string
  validity_end: string
  visibility_scope: string
  tenant_id: string
  locale: string
  api_enabled: boolean
  author: string
  owner_funcional: string
  owner_tecnico: string
  revisores: string[]
  aprovador: string
  proxima_revisao: string
  review_frequency: string
  last_reviewed_at: string
  orgao: string
  norma: string
  versao_norma: string
  publicacao: string
  vigencia_norma: string
  fonte_oficial: string
  data_ultima_validacao: string
  workflow_id: string
  knowledge_health_score: number
  active: boolean
  created: string
  updated: string
}

export interface BlueprintVersion {
  id: string
  chapter_id: string
  version_number: string
  version_label: string
  content_snapshot: string
  content: string
  author: string
  approver: string
  motivo: string
  change_type: string
  affected_relations: unknown
  previous_version_id: string
  published_at: string
  created: string
  updated: string
}

export interface BlueprintADR {
  id: string
  code: string
  title: string
  status: string
  decision: string
  motive: string
  alternatives: string[]
  approver: string
  effective_date: string
  impacted_modules: string[]
  chapter_id: string
  relation_ids: string[]
  author: string
  version: string
  superseded_by: string
  previous_adr_id: string
  created: string
  updated: string
}

export interface BlueprintGap {
  id: string
  gap_type: string
  gap_key: string
  gap_label: string
  description: string
  status: string
  detected_at: string
  resolved_at: string
  resolved_by: string
  created: string
  updated: string
}

export interface BlueprintScreenLink {
  id: string
  screen_route: string
  screen_label: string
  chapter_id: string
  section_id: string
  module_origin: string
  has_documentation: boolean
  created: string
  updated: string
}

export const EDITORIAL_STATUS_OPTIONS = [
  { value: 'Rascunho', label: 'Rascunho' },
  { value: 'Em Revisão', label: 'Em Revisão' },
  { value: 'Publicado', label: 'Publicado' },
]

export const TECHNICAL_VALIDITY_OPTIONS = [
  { value: 'Vigente', label: 'Vigente' },
  { value: 'Em validação', label: 'Em validação' },
  { value: 'Desatualizado', label: 'Desatualizado' },
  { value: 'Substituído', label: 'Substituído' },
  { value: 'Obsoleto', label: 'Obsoleto' },
]

export const CONTENT_TYPE_OPTIONS = [
  'Arquitetura',
  'Processos',
  'Políticas',
  'Procedimentos',
  'Normas',
  'Integrações',
  'APIs',
  'Entidades',
  'Casos de Uso',
  'Fluxos BPM',
  'Regras de Negócio',
  'Guias de Implantação',
  'Guias de Parametrização',
  'Guias Operacionais',
  'Guias Técnicos',
  'Tutoriais',
  'FAQ',
  'Runbooks',
  'Playbooks',
  'Checklists',
  'Troubleshooting',
  'Release Notes',
].map((v) => ({ value: v, label: v }))

export const VISIBILITY_SCOPE_OPTIONS = [
  'público',
  'cliente',
  'usuário interno',
  'implantação',
  'suporte',
  'consultoria',
  'desenvolvimento',
  'arquitetura',
  'administrativo',
  'restrito',
].map((v) => ({ value: v, label: v }))

export const ADR_STATUS_OPTIONS = [
  { value: 'proposta', label: 'Proposta' },
  { value: 'aceita', label: 'Aceita' },
  { value: 'rejeitada', label: 'Rejeitada' },
  { value: 'substituída', label: 'Substituída' },
  { value: 'obsoleta', label: 'Obsoleta' },
  { value: 'superseded', label: 'Superseded' },
]

export const GAP_STATUS_OPTIONS = [
  { value: 'pendente', label: 'Pendente' },
  { value: 'em_tratamento', label: 'Em Tratamento' },
  { value: 'resolvido', label: 'Resolvido' },
]

export function parseJsonArray(val: unknown): string[] {
  if (Array.isArray(val)) return val as string[]
  if (typeof val === 'string') {
    try {
      const r = JSON.parse(val)
      return Array.isArray(r) ? r : []
    } catch {
      return []
    }
  }
  return []
}
