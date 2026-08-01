import pb from '@/lib/pocketbase/client'

export async function getPartnerTypes(): Promise<string[]> {
  const records = await pb.collection('partner_types').getFullList({ sort: 'name' })
  return records.map((r) => r.name)
}

export async function getAllPartnerTypeRecords() {
  return pb.collection('partner_types').getFullList({ sort: 'name' })
}

export async function createPartnerType(name: string) {
  return pb.collection('partner_types').create({ name })
}

export async function deletePartnerType(id: string) {
  return pb.collection('partner_types').delete(id)
}
