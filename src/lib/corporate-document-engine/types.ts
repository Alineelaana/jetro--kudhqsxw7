export type ExportFormat = 'pdf' | 'png' | 'jpg' | 'svg' | 'excel' | 'csv' | 'print' | 'html'

export interface CorporateStamp {
  empresa: string
  filial: string
  userName: string
  userRole: string
  module: string
  documentType: string
  filters?: Record<string, string>
  competencia?: string
}

export interface DocumentSection {
  title: string
  headers?: string[]
  rows?: (string | number)[][]
  summary?: { label: string; value: string | number }[]
  content?: string
}

export interface DocumentConfig {
  title: string
  module: string
  documentType: string
  format: ExportFormat
  sections: DocumentSection[]
  stamp: CorporateStamp
  recordCount?: number
  filters?: Record<string, string>
  templateId?: string
  logoUrl?: string
}

export interface GenerationResult {
  success: boolean
  jobId?: string
  format: ExportFormat
  fileName?: string
  error?: string
}

export interface GenerationJob {
  id: string
  document_type: string
  module: string
  title: string
  format: string
  status: string
  record_count: number
  empresa: string
  filial: string
  requesting_user_name: string
  created: string
  completed_at: string
  generation_time_ms: number
  file_name: string
}

export interface InventoryItem {
  file: string
  module: string
  formats: ExportFormat[]
  classification: 'reuse' | 'extend' | 'relate' | 'create'
  notes: string
}

export const ALL_FORMATS: ExportFormat[] = ['pdf', 'png', 'jpg', 'excel', 'csv', 'print', 'html']

export const FORMAT_LABELS: Record<ExportFormat, string> = {
  pdf: 'PDF',
  png: 'Imagem PNG',
  jpg: 'Imagem JPG',
  svg: 'SVG',
  excel: 'Excel',
  csv: 'CSV',
  print: 'Imprimir',
  html: 'HTML',
}
