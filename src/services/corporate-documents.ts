import pb from '@/lib/pocketbase/client'
import type { GenerationJob } from '@/lib/corporate-document-engine/types'

export interface ListGenerationsFilters {
  page?: number
  perPage?: number
  module?: string
  format?: string
  status?: string
  empresa?: string
  filial?: string
}

export async function listDocumentGenerations(
  filters: ListGenerationsFilters = {},
): Promise<{ items: GenerationJob[]; page: number; perPage: number }> {
  const params = new URLSearchParams()
  if (filters.page) params.set('page', String(filters.page))
  if (filters.perPage) params.set('perPage', String(filters.perPage))
  if (filters.module) params.set('module', filters.module)
  if (filters.format) params.set('format', filters.format)
  if (filters.status) params.set('status', filters.status)
  if (filters.empresa) params.set('empresa', filters.empresa)
  if (filters.filial) params.set('filial', filters.filial)

  return pb.send(`/backend/v1/corporate-doc?${params.toString()}`, { method: 'GET' })
}

export async function getGenerationStatus(jobId: string): Promise<Record<string, unknown>> {
  return pb.send(`/backend/v1/corporate-doc/status?jobId=${jobId}`, { method: 'GET' })
}
