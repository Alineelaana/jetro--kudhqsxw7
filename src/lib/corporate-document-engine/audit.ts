import pb from '@/lib/pocketbase/client'
import type { DocumentConfig, GenerationResult } from './types'

export async function logGeneration(config: DocumentConfig): Promise<{ jobId?: string }> {
  try {
    const res = await pb.send('/backend/v1/corporate-doc/request', {
      method: 'POST',
      body: JSON.stringify({
        documentType: config.documentType,
        module: config.module,
        title: config.title,
        format: config.format,
        filters: config.filters || {},
        recordCount: config.recordCount || 0,
        empresa: config.stamp.empresa,
        filial: config.stamp.filial,
        requestOrigin: 'frontend',
      }),
      headers: { 'Content-Type': 'application/json' },
    })
    return { jobId: res.jobId }
  } catch {
    return {}
  }
}

export async function completeGeneration(
  jobId: string | undefined,
  result: Partial<GenerationResult>,
): Promise<void> {
  if (!jobId) return
  try {
    await pb.send('/backend/v1/corporate-doc/complete', {
      method: 'POST',
      body: JSON.stringify({
        jobId,
        status: result.success ? 'completed' : 'failed',
        fileName: result.fileName,
      }),
      headers: { 'Content-Type': 'application/json' },
    })
  } catch {
    /* audit completion is best-effort */
  }
}
