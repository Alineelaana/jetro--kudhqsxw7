export type ArtifactStatus = 'pendente' | 'em_elaboracao' | 'em_revisao' | 'concluido'

export interface BuildFieldDef {
  key: string
  label: string
  multiline?: boolean
}

export interface InstitutionalSection {
  id: string
  title: string
  description: string
}

export interface BuildDef {
  number: number
  name: string
  description: string
  itemFields: BuildFieldDef[]
  reviewChecklist: string[]
  institutionalSections?: InstitutionalSection[]
}

export interface ArtifactItem {
  [key: string]: string
}

export interface ArtifactContent {
  items: ArtifactItem[]
  summary: string
  institutionalNotes?: Record<string, string>
}

export interface ReviewChecklistItem {
  label: string
  checked: boolean
  notes: string
}

export interface CertificationArtifact {
  id: string
  domain: string
  build_number: number
  build_name: string
  status: ArtifactStatus
  content: ArtifactContent | null
  review_checklist: ReviewChecklistItem[] | null
  review_notes: string
  completed_at: string
  reviewer: string
  created: string
  updated: string
}

export const STATUS_LABELS: Record<ArtifactStatus, string> = {
  pendente: 'Pendente',
  em_elaboracao: 'Em elaboração',
  em_revisao: 'Em revisão',
  concluido: 'Concluído',
}

export const STATUS_COLORS: Record<ArtifactStatus, string> = {
  pendente: 'bg-gray-100 text-gray-600 border-gray-200',
  em_elaboracao: 'bg-blue-100 text-blue-700 border-blue-200',
  em_revisao: 'bg-amber-100 text-amber-700 border-amber-200',
  concluido: 'bg-green-100 text-green-700 border-green-200',
}
