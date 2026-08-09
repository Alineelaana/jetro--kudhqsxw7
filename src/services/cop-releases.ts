import pb from '@/lib/pocketbase/client'
import type { CopRelease } from '@/lib/cop-types'

export async function getReleases(): Promise<CopRelease[]> {
  return pb.collection('cop_releases').getFullList({ sort: '-created' }) as Promise<CopRelease[]>
}

export async function createRelease(data: Partial<CopRelease>): Promise<CopRelease> {
  return pb.collection('cop_releases').create(data) as Promise<CopRelease>
}

export async function updateRelease(id: string, data: Partial<CopRelease>): Promise<CopRelease> {
  return pb.collection('cop_releases').update(id, data) as Promise<CopRelease>
}

export async function deleteRelease(id: string): Promise<void> {
  await pb.collection('cop_releases').delete(id)
}

export async function promoteRelease(id: string, justification: string): Promise<void> {
  await pb.send(`/backend/v1/cop/releases/${id}/promote`, {
    method: 'POST',
    body: JSON.stringify({ justification }),
    headers: { 'Content-Type': 'application/json' },
  })
}
