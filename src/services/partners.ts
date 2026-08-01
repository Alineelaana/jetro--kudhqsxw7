import pb from '@/lib/pocketbase/client'
import type { FinancialEntry, RestrictionEntry } from '@/lib/partner-types'

export async function getPartners() {
  return pb.collection('partners').getFullList({ sort: '-created' })
}

export async function getPartner(id: string) {
  return pb.collection('partners').getOne(id)
}

export async function createPartner(formData: FormData) {
  return pb.collection('partners').create(formData)
}

export async function updatePartner(id: string, formData: FormData) {
  return pb.collection('partners').update(id, formData)
}

export async function updatePartnerField(id: string, data: Record<string, unknown>) {
  return pb.collection('partners').update(id, data)
}

export async function deletePartner(id: string) {
  return pb.collection('partners').delete(id)
}

export async function createClientForPartner(
  email: string,
  password: string,
  name: string,
  partnerId: string,
) {
  const client = await pb.collection('clients').create({
    email,
    password,
    passwordConfirm: password,
    name,
    partner_id: partnerId,
  })
  await pb.collection('partners').update(partnerId, { client_id: client.id })
  return client
}

export async function updateClientPassword(clientId: string, password: string) {
  await pb.collection('clients').update(clientId, { password, passwordConfirm: password })
}

export async function updateFinancialHistory(partnerId: string, history: FinancialEntry[]) {
  return pb.collection('partners').update(partnerId, { financial_history: history })
}

export async function toggleFinancialRestriction(
  partnerId: string,
  action: 'activate' | 'remove',
  reason: string,
  responsibleUser: string,
): Promise<void> {
  const partner = await pb.collection('partners').getOne(partnerId)
  const existingHistory =
    (partner as unknown as { restriction_history?: RestrictionEntry[] }).restriction_history || []
  const newEntry: RestrictionEntry = {
    id: crypto.randomUUID(),
    action,
    reason,
    responsible_user: responsibleUser,
    date: new Date().toISOString(),
  }
  await pb.collection('partners').update(partnerId, {
    financial_restriction: action === 'activate',
    restriction_reason: reason,
    restriction_history: [...existingHistory, newEntry],
  })
}
