import pb from '@/lib/pocketbase/client'

export interface ServiceArea {
  id: string
  name: string
  is_default: boolean
}

export async function getServiceAreas(): Promise<ServiceArea[]> {
  const records = await pb.collection('service_areas').getFullList({ sort: 'name' })
  return records as unknown as ServiceArea[]
}

export async function createServiceArea(name: string): Promise<ServiceArea> {
  const record = await pb.collection('service_areas').create({ name, is_default: false })
  return record as unknown as ServiceArea
}
