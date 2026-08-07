import pb from '@/lib/pocketbase/client'
import type {
  CertificationArtifact,
  ArtifactContent,
  ReviewChecklistItem,
  ArtifactStatus,
} from '@/lib/certification-types'

export async function getArtifacts(domain: string): Promise<CertificationArtifact[]> {
  const records = await pb.collection('certification_artifacts').getFullList({
    filter: `domain = "${domain}"`,
    sort: 'build_number',
  })
  return records as unknown as CertificationArtifact[]
}

export async function createArtifact(data: {
  domain: string
  build_number: number
  build_name: string
  status: ArtifactStatus
  content: ArtifactContent
  review_checklist: ReviewChecklistItem[]
  review_notes: string
  completed_at: string
  reviewer: string
}): Promise<CertificationArtifact> {
  const record = await pb.collection('certification_artifacts').create(data)
  return record as unknown as CertificationArtifact
}

export async function saveArtifact(
  id: string,
  data: Partial<{
    status: ArtifactStatus
    content: ArtifactContent
    review_checklist: ReviewChecklistItem[]
    review_notes: string
    completed_at: string
    reviewer: string
  }>,
): Promise<void> {
  await pb.collection('certification_artifacts').update(id, data as Record<string, unknown>)
}
