import { useCallback } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useOrgFilter } from '@/hooks/use-org-filter'
import { generateDocument } from '@/lib/corporate-document-engine'
import { buildStamp } from '@/lib/corporate-document-engine/stamp'
import type {
  DocumentConfig,
  ExportFormat,
  GenerationResult,
  DocumentSection,
} from '@/lib/corporate-document-engine/types'
import {
  listDocumentGenerations,
  type ListGenerationsFilters,
} from '@/services/corporate-documents'

export function useCorporateDocuments() {
  const { user } = useAuth()
  const { empresaId, filialId } = useOrgFilter()

  const generate = useCallback(
    async (params: {
      title: string
      module: string
      documentType: string
      format: ExportFormat
      sections: DocumentSection[]
      recordCount?: number
      filters?: Record<string, string>
    }): Promise<GenerationResult> => {
      const stamp = buildStamp({
        user,
        empresaId,
        filialId,
        module: params.module,
        documentType: params.documentType,
        filters: params.filters,
      })

      const config: DocumentConfig = {
        title: params.title,
        module: params.module,
        documentType: params.documentType,
        format: params.format,
        sections: params.sections,
        stamp,
        recordCount: params.recordCount,
        filters: params.filters,
      }

      return generateDocument(config)
    },
    [user, empresaId, filialId],
  )

  const listGenerations = useCallback(
    async (filters?: ListGenerationsFilters) => listDocumentGenerations(filters),
    [],
  )

  return { generate, listGenerations }
}
