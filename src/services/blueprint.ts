import pb from '@/lib/pocketbase/client'
import type {
  BlueprintVolume,
  BlueprintChapter,
  BlueprintVersion,
  BlueprintADR,
  BlueprintGap,
  BlueprintScreenLink,
} from '@/lib/blueprint-types'

export async function getVolumes(): Promise<BlueprintVolume[]> {
  return pb.collection('blueprint_volumes').getFullList({ sort: 'display_order' }) as Promise<
    BlueprintVolume[]
  >
}

export async function createVolume(data: Partial<BlueprintVolume>): Promise<BlueprintVolume> {
  return pb.collection('blueprint_volumes').create(data) as Promise<BlueprintVolume>
}

export async function updateVolume(
  id: string,
  data: Partial<BlueprintVolume>,
): Promise<BlueprintVolume> {
  return pb.collection('blueprint_volumes').update(id, data) as Promise<BlueprintVolume>
}

export async function deleteVolume(id: string): Promise<void> {
  await pb.collection('blueprint_volumes').delete(id)
}

export async function getChapters(volumeId?: string): Promise<BlueprintChapter[]> {
  const filter = volumeId ? `volume_id = "${volumeId}"` : undefined
  return pb
    .collection('blueprint_chapters')
    .getFullList({ sort: 'display_order', filter }) as Promise<BlueprintChapter[]>
}

export async function getChapter(id: string): Promise<BlueprintChapter> {
  return pb.collection('blueprint_chapters').getOne(id) as Promise<BlueprintChapter>
}

export async function createChapter(data: Partial<BlueprintChapter>): Promise<BlueprintChapter> {
  return pb.collection('blueprint_chapters').create(data) as Promise<BlueprintChapter>
}

export async function updateChapter(
  id: string,
  data: Partial<BlueprintChapter>,
): Promise<BlueprintChapter> {
  return pb.collection('blueprint_chapters').update(id, data) as Promise<BlueprintChapter>
}

export async function deleteChapter(id: string): Promise<void> {
  await pb.collection('blueprint_chapters').delete(id)
}

export async function getVersions(chapterId: string): Promise<BlueprintVersion[]> {
  return pb.collection('blueprint_versions').getFullList({
    sort: '-published_at',
    filter: `chapter_id = "${chapterId}"`,
  }) as Promise<BlueprintVersion[]>
}

export async function getADRs(): Promise<BlueprintADR[]> {
  return pb.collection('blueprint_adrs').getFullList({ sort: '-effective_date' }) as Promise<
    BlueprintADR[]
  >
}

export async function createADR(data: Partial<BlueprintADR>): Promise<BlueprintADR> {
  return pb.collection('blueprint_adrs').create(data) as Promise<BlueprintADR>
}

export async function updateADR(id: string, data: Partial<BlueprintADR>): Promise<BlueprintADR> {
  return pb.collection('blueprint_adrs').update(id, data) as Promise<BlueprintADR>
}

export async function getGaps(): Promise<BlueprintGap[]> {
  return pb.collection('blueprint_gaps').getFullList({ sort: '-created' }) as Promise<
    BlueprintGap[]
  >
}

export async function resolveGap(id: string): Promise<void> {
  await pb.collection('blueprint_gaps').update(id, {
    status: 'resolvido',
    resolved_at: new Date().toISOString(),
    resolved_by: ((pb.authStore.record as Record<string, unknown>)?.name as string) || 'Sistema',
  })
}

export async function getScreenLinks(): Promise<BlueprintScreenLink[]> {
  return pb.collection('blueprint_screen_links').getFullList({ sort: 'screen_label' }) as Promise<
    BlueprintScreenLink[]
  >
}

export async function linkScreen(route: string, label: string, chapterId: string): Promise<void> {
  try {
    const existing = await pb
      .collection('blueprint_screen_links')
      .getFirstListItem(`screen_route = "${route}"`)
    await pb
      .collection('blueprint_screen_links')
      .update(existing.id, { chapter_id: chapterId, has_documentation: true })
  } catch {
    await pb.collection('blueprint_screen_links').create({
      screen_route: route,
      screen_label: label,
      chapter_id: chapterId,
      has_documentation: true,
    })
  }
}

export interface BlueprintDashboardStats {
  totalVolumes: number
  totalChapters: number
  publishedChapters: number
  pendingChapters: number
  overdueChapters: number
  totalGaps: number
  pendingGaps: number
  totalADRs: number
  orphanScreens: number
  avgHealthScore: number
  totalCertifications: number
  certifiedChapters: number
}

export async function publishChapter(id: string): Promise<BlueprintChapter> {
  return pb.collection('blueprint_chapters').update(id, {
    editorial_status: 'Publicado',
    last_reviewed_at: new Date().toISOString(),
  }) as Promise<BlueprintChapter>
}

export async function searchBlueprint(query: string, k?: number): Promise<unknown> {
  return pb.send('/backend/v1/blueprint/search', {
    method: 'POST',
    body: JSON.stringify({ query, k }),
    headers: { 'Content-Type': 'application/json' },
  })
}

export async function getDashboardStats(): Promise<BlueprintDashboardStats> {
  const [volumes, chapters, gaps, adrs, screenLinks] = await Promise.all([
    getVolumes(),
    getChapters(),
    getGaps().catch(() => []),
    getADRs().catch(() => []),
    getScreenLinks().catch(() => []),
  ])

  const published = chapters.filter((c) => c.editorial_status === 'Publicado')
  const pending = chapters.filter((c) => c.editorial_status !== 'Publicado')
  const overdue = chapters.filter((c) => {
    if (!c.proxima_revisao) return false
    return new Date(c.proxima_revisao) < new Date()
  })
  const orphanScreens = screenLinks.filter((s) => !s.chapter_id)
  const healthScores = chapters
    .filter((c) => c.knowledge_health_score > 0)
    .map((c) => c.knowledge_health_score)
  const avgHealth =
    healthScores.length > 0
      ? Math.round(healthScores.reduce((a, b) => a + b, 0) / healthScores.length)
      : 0

  return {
    totalVolumes: volumes.length,
    totalChapters: chapters.length,
    publishedChapters: published.length,
    pendingChapters: pending.length,
    overdueChapters: overdue.length,
    totalGaps: gaps.length,
    pendingGaps: gaps.filter((g) => g.status === 'pendente').length,
    totalADRs: adrs.length,
    orphanScreens: orphanScreens.length,
    avgHealthScore: avgHealth,
    totalCertifications: 0,
    certifiedChapters: 0,
  }
}
