import pb from '@/lib/pocketbase/client'

export async function getServicesOffered() {
  return pb.collection('services_offered').getFullList({ sort: '-created' })
}

export async function getActiveServicesOffered() {
  return pb.collection('services_offered').getFullList({
    filter: 'active = true',
    sort: 'name',
  })
}

export async function createServiceOffered(data: Record<string, unknown>) {
  return pb.collection('services_offered').create(data)
}

export async function updateServiceOffered(id: string, data: Record<string, unknown>) {
  return pb.collection('services_offered').update(id, data)
}

export async function deleteServiceOffered(id: string) {
  return pb.collection('services_offered').delete(id)
}

export async function toggleServiceOfferedActive(id: string, active: boolean) {
  return pb.collection('services_offered').update(id, { active })
}
