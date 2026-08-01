import pb from '@/lib/pocketbase/client'
import { CMS_DEFAULT_CONTENT } from '@/lib/cms-defaults'
import type { CmsContent, CmsVersion, CmsHistoryEntry, CmsMedia } from '@/lib/cms-types'

export async function getCmsContent(): Promise<CmsContent[]> {
  return pb.collection('cms_content').getFullList({ sort: 'section_key' })
}

export async function getCmsSection(sectionKey: string): Promise<CmsContent | null> {
  try {
    return await pb.collection('cms_content').getFirstListItem(`section_key = "${sectionKey}"`)
  } catch {
    return null
  }
}

export async function saveCmsDraft(
  sectionKey: string,
  data: Record<string, unknown>,
  userId: string,
): Promise<void> {
  const existing = await getCmsSection(sectionKey)
  if (existing) {
    await pb.collection('cms_content').update(existing.id, {
      draft_data: data,
      status: 'pending',
      updated_by: userId,
    })
  } else {
    await pb.collection('cms_content').create({
      section_key: sectionKey,
      draft_data: data,
      published_data: CMS_DEFAULT_CONTENT[sectionKey] || {},
      status: 'pending',
      updated_by: userId,
    })
  }
}

export async function discardDraft(sectionKey: string): Promise<void> {
  const existing = await getCmsSection(sectionKey)
  if (existing) {
    await pb.collection('cms_content').update(existing.id, {
      draft_data: existing.published_data,
      status: 'published',
    })
  }
}

export async function publishAllSections(userId: string): Promise<void> {
  const allContent = await getCmsContent()
  for (const content of allContent) {
    if (content.status === 'pending') {
      await pb.collection('cms_content').update(content.id, {
        published_data: content.draft_data,
        status: 'published',
      })
      await pb.collection('cms_versions').create({
        section_key: content.section_key,
        version_data: content.draft_data,
        version_number: Math.floor(Date.now() / 1000),
        published_by: userId,
        published_at: new Date().toISOString(),
        label: `Publicação ${new Date().toLocaleString('pt-BR')}`,
      })
    }
  }
  await updatePublicationState('published', userId, 0)
}

export async function getPublicationState() {
  try {
    const items = await pb.collection('cms_publication').getFullList()
    return items[0] || null
  } catch {
    return null
  }
}

async function updatePublicationState(
  status: string,
  userId: string,
  pending: number,
): Promise<void> {
  const existing = await getPublicationState()
  const payload = {
    status,
    last_published_at: new Date().toISOString(),
    last_published_by: userId,
    pending_changes: pending,
  }
  if (existing) {
    await pb.collection('cms_publication').update(existing.id, payload)
  } else {
    await pb.collection('cms_publication').create(payload)
  }
}

export async function getPendingChangesCount(): Promise<number> {
  const allContent = await getCmsContent()
  return allContent.filter((c) => c.status === 'pending').length
}

export async function getVersions(sectionKey: string): Promise<CmsVersion[]> {
  return pb.collection('cms_versions').getFullList({
    filter: `section_key = "${sectionKey}"`,
    sort: '-version_number',
  })
}

export async function restoreVersion(
  sectionKey: string,
  versionId: string,
  userId: string,
): Promise<void> {
  const version = await pb.collection('cms_versions').getOne(versionId)
  await saveCmsDraft(sectionKey, version.version_data as Record<string, unknown>, userId)
}

export async function getHistory(sectionKey?: string): Promise<CmsHistoryEntry[]> {
  const filter = sectionKey ? `section_key = "${sectionKey}"` : ''
  return pb.collection('cms_history').getFullList({ sort: '-created', filter })
}

export async function getMedia(): Promise<CmsMedia[]> {
  return pb.collection('cms_media').getFullList({ sort: '-created' })
}

export async function uploadMedia(formData: FormData): Promise<void> {
  await pb.collection('cms_media').create(formData)
}

export async function updateMedia(id: string, data: Record<string, unknown>): Promise<void> {
  await pb.collection('cms_media').update(id, data)
}

export async function deleteMedia(id: string): Promise<void> {
  await pb.collection('cms_media').delete(id)
}

export async function searchContent(
  query: string,
): Promise<Array<{ section: string; field: string; value: string }>> {
  const allContent = await getCmsContent()
  const results: Array<{ section: string; field: string; value: string }> = []
  const q = query.toLowerCase()
  for (const content of allContent) {
    const data = content.draft_data || content.published_data || {}
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string' && value.toLowerCase().includes(q)) {
        results.push({ section: content.section_key, field: key, value })
      }
    }
  }
  return results
}

export async function initializeCmsContent(userId: string): Promise<void> {
  const existing = await getCmsContent()
  if (existing.length > 0) return
  for (const [key, data] of Object.entries(CMS_DEFAULT_CONTENT)) {
    await pb.collection('cms_content').create({
      section_key: key,
      draft_data: data,
      published_data: data,
      status: 'published',
      updated_by: userId,
    })
  }
  await updatePublicationState('published', userId, 0)
}
