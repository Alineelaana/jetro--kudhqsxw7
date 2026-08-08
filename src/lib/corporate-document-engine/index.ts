import type { DocumentConfig, GenerationResult } from './types'
import { logGeneration, completeGeneration } from './audit'
import { renderHtmlDocument } from './html-renderer'
import { renderImageDocument } from './image-renderer'
import { renderCsvDocument, renderExcelDocument } from './data-renderer'

export * from './types'
export * from './identity'
export * from './stamp'
export * from './inventory'
export { CorporateExportBar } from '@/components/corporate-documents/corporate-export-bar'
export { useCorporateDocuments } from '@/hooks/use-corporate-documents'

export async function generateDocument(config: DocumentConfig): Promise<GenerationResult> {
  const startTime = Date.now()
  const { jobId } = await logGeneration(config)

  try {
    let fileName: string

    switch (config.format) {
      case 'pdf':
      case 'print':
      case 'html':
        fileName = renderHtmlDocument(config)
        break
      case 'png':
      case 'jpg':
        fileName = await renderImageDocument(config)
        break
      case 'csv':
        fileName = renderCsvDocument(config)
        break
      case 'excel':
        fileName = renderExcelDocument(config)
        break
      case 'svg':
        return {
          success: false,
          jobId,
          format: config.format,
          error: 'SVG format is structurally supported but not yet implemented',
        }
      default:
        return {
          success: false,
          jobId,
          format: config.format,
          error: `Unsupported format: ${config.format}`,
        }
    }

    await completeGeneration(jobId, { success: true, fileName })

    return {
      success: true,
      jobId,
      format: config.format,
      fileName,
    }
  } catch (error) {
    await completeGeneration(jobId, { success: false })
    return {
      success: false,
      jobId,
      format: config.format,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
