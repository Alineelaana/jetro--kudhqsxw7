import pb from '@/lib/pocketbase/client'
import type {
  MkRequest,
  MkJob,
  MkContentPiece,
  MkMediaCampaign,
  MkBrandAsset,
  MkResultAttribution,
  MkBriefingTemplate,
} from '@/lib/marketing-types'

function genNumber(prefix: string): string {
  const d = new Date()
  const r = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `${prefix}-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}-${r}`
}

export async function getMkRequests(filter?: string): Promise<MkRequest[]> {
  return pb.collection('mk_requests').getFullList({ sort: '-created', filter }) as Promise<
    MkRequest[]
  >
}
export async function getMkRequest(id: string): Promise<MkRequest> {
  return pb.collection('mk_requests').getOne(id) as Promise<MkRequest>
}
export async function createMkRequest(data: Record<string, unknown>): Promise<MkRequest> {
  const user = pb.authStore.record as Record<string, unknown> | null
  return pb.collection('mk_requests').create({
    ...data,
    request_number: genNumber('MR'),
    status: data.status || 'rascunho',
    requester: user?.name || '',
    requester_id: user?.id || '',
  }) as Promise<MkRequest>
}
export async function updateMkRequest(
  id: string,
  data: Record<string, unknown>,
): Promise<MkRequest> {
  return pb.collection('mk_requests').update(id, data) as Promise<MkRequest>
}
export async function deleteMkRequest(id: string): Promise<void> {
  await pb.collection('mk_requests').delete(id)
}

export async function getMkJobs(filter?: string): Promise<MkJob[]> {
  return pb.collection('mk_jobs').getFullList({ sort: '-created', filter }) as Promise<MkJob[]>
}
export async function createMkJob(data: Record<string, unknown>): Promise<MkJob> {
  const user = pb.authStore.record as Record<string, unknown> | null
  return pb.collection('mk_jobs').create({
    ...data,
    job_number: genNumber('JOB'),
    status: data.status || 'briefing',
    version: 1,
    created_by: user?.id || '',
    created_by_name: (user?.name as string) || '',
  }) as Promise<MkJob>
}
export async function updateMkJob(id: string, data: Record<string, unknown>): Promise<MkJob> {
  return pb.collection('mk_jobs').update(id, data) as Promise<MkJob>
}

export async function getMkPieces(filter?: string): Promise<MkContentPiece[]> {
  return pb.collection('mk_content_pieces').getFullList({ sort: '-created', filter }) as Promise<
    MkContentPiece[]
  >
}
export async function createMkPiece(data: Record<string, unknown>): Promise<MkContentPiece> {
  return pb.collection('mk_content_pieces').create({
    ...data,
    status: 'criacao',
    current_version: 1,
  }) as Promise<MkContentPiece>
}
export async function updateMkPiece(
  id: string,
  data: Record<string, unknown>,
): Promise<MkContentPiece> {
  return pb.collection('mk_content_pieces').update(id, data) as Promise<MkContentPiece>
}
export async function getMkVersions(pieceId: string): Promise<Record<string, unknown>[]> {
  return pb.collection('mk_content_versions').getFullList({
    sort: '-version',
    filter: `piece_id = "${pieceId}"`,
  })
}
export async function createMkVersion(data: Record<string, unknown>): Promise<void> {
  await pb.collection('mk_content_versions').create(data)
}

export async function getMkMediaCampaigns(filter?: string): Promise<MkMediaCampaign[]> {
  return pb.collection('mk_media_campaigns').getFullList({ sort: '-created', filter }) as Promise<
    MkMediaCampaign[]
  >
}
export async function createMkMediaCampaign(
  data: Record<string, unknown>,
): Promise<MkMediaCampaign> {
  return pb.collection('mk_media_campaigns').create(data) as Promise<MkMediaCampaign>
}
export async function updateMkMediaCampaign(
  id: string,
  data: Record<string, unknown>,
): Promise<MkMediaCampaign> {
  return pb.collection('mk_media_campaigns').update(id, data) as Promise<MkMediaCampaign>
}

export async function getMkBrandAssets(filter?: string): Promise<MkBrandAsset[]> {
  return pb.collection('mk_brand_assets').getFullList({ sort: '-created', filter }) as Promise<
    MkBrandAsset[]
  >
}
export async function createMkBrandAsset(data: Record<string, unknown>): Promise<MkBrandAsset> {
  return pb.collection('mk_brand_assets').create(data) as Promise<MkBrandAsset>
}
export async function updateMkBrandAsset(
  id: string,
  data: Record<string, unknown>,
): Promise<MkBrandAsset> {
  return pb.collection('mk_brand_assets').update(id, data) as Promise<MkBrandAsset>
}

export async function getMkAttributions(filter?: string): Promise<MkResultAttribution[]> {
  return pb
    .collection('mk_result_attributions')
    .getFullList({ sort: '-created', filter }) as Promise<MkResultAttribution[]>
}
export async function createMkAttribution(
  data: Record<string, unknown>,
): Promise<MkResultAttribution> {
  return pb.collection('mk_result_attributions').create(data) as Promise<MkResultAttribution>
}

export async function getMkList(
  collection: string,
  filter?: string,
): Promise<Record<string, unknown>[]> {
  return pb.collection(collection).getFullList({ sort: '-created', filter })
}
export async function getMkBriefingTemplates(): Promise<MkBriefingTemplate[]> {
  return pb.collection('mk_briefing_templates').getFullList({ sort: '-created' }) as Promise<
    MkBriefingTemplate[]
  >
}
export async function createMkBriefingTemplate(
  data: Record<string, unknown>,
): Promise<MkBriefingTemplate> {
  return pb.collection('mk_briefing_templates').create(data) as Promise<MkBriefingTemplate>
}
export async function updateMkBriefingTemplate(
  id: string,
  data: Record<string, unknown>,
): Promise<MkBriefingTemplate> {
  return pb.collection('mk_briefing_templates').update(id, data) as Promise<MkBriefingTemplate>
}
export async function deleteMkBriefingTemplate(id: string): Promise<void> {
  await pb.collection('mk_briefing_templates').delete(id)
}

export async function getMkSocialPosts(filter?: string): Promise<Record<string, unknown>[]> {
  return pb.collection('mk_social_posts').getFullList({ sort: 'planned_date', filter })
}
export async function createMkSocialPost(data: Record<string, unknown>): Promise<unknown> {
  return pb.collection('mk_social_posts').create(data)
}

export function logMkAudit(action: string, targetId: string, summary: string): void {
  pb.send('/backend/v1/audit/create', {
    method: 'POST',
    body: JSON.stringify({
      action,
      module: 'marketing_enterprise',
      target_collection: 'mk_requests',
      target_id: targetId,
      target_summary: summary,
    }),
    headers: { 'Content-Type': 'application/json' },
  }).catch(() => {})
}

export async function getMkCockpitData() {
  const [requests, jobs, pieces, media, attributions] = await Promise.all([
    getMkRequests().catch(() => []),
    getMkJobs().catch(() => []),
    getMkPieces().catch(() => []),
    getMkMediaCampaigns().catch(() => []),
    getMkAttributions().catch(() => []),
  ])
  const pendingApproval = pieces.filter((p) =>
    ['revisao_marketing', 'compliance', 'gestor'].includes(p.status),
  )
  const lateJobs = jobs.filter(
    (j) =>
      j.deadline &&
      new Date(j.deadline) < new Date() &&
      !['encerrado', 'cancelado'].includes(j.status),
  )
  const totalInvestment = media.reduce((s, m) => s + (parseFloat(m.investment) || 0), 0)
  const totalRevenue = attributions.reduce((s, a) => s + (parseFloat(a.revenue) || 0), 0)
  const totalLeads = media.reduce((s, m) => s + (m.leads || 0), 0)
  const totalConversions = media.reduce((s, m) => s + (m.conversions || 0), 0)
  const roi = totalInvestment > 0 ? ((totalRevenue - totalInvestment) / totalInvestment) * 100 : 0
  const cpl = totalLeads > 0 ? totalInvestment / totalLeads : 0
  const cac = totalConversions > 0 ? totalInvestment / totalConversions : 0
  const byChannel = Object.entries(
    media.reduce(
      (acc, m) => {
        const k = m.channel || '—'
        acc[k] = (acc[k] || 0) + (parseFloat(m.investment) || 0)
        return acc
      },
      {} as Record<string, number>,
    ),
  ).sort((a, b) => b[1] - a[1])
  return {
    totalRequests: requests.length,
    pendingApproval: pendingApproval.length,
    lateJobs: lateJobs.length,
    activeJobs: jobs.filter((j) => !['encerrado', 'cancelado'].includes(j.status)).length,
    totalInvestment,
    totalRevenue,
    totalLeads,
    totalConversions,
    roi,
    cpl,
    cac,
    byChannel,
    mediaCampaigns: media.length,
  }
}
