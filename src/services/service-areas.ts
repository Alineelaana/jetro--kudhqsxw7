import pb from '@/lib/pocketbase/client'

export interface ServiceArea {
  id: string
  name: string
}

export async function getServiceAreas(): Promise<ServiceArea[]> {
  try {
    const records = await pb.collection('service_areas').getFullList({ sort: 'name' })
    return records.map((r) => ({
      id: r.id,
      name: (r as Record<string, unknown>).name as string,
    }))
  } catch {
    return []
  }
}
