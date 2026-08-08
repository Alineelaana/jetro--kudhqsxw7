import pb from '@/lib/pocketbase/client'

export const COMMISSION_ROLES = ['RCA', 'Televendas', 'Responsavel Comercial Digital'] as const
export type CommissionRole = (typeof COMMISSION_ROLES)[number]

export interface CommissionRule {
  id: string
  role: string
  percentage: string
  split_percentage: string
  priority: number
  applicability: string
  active: boolean
  empresa: string
  filial: string
  created: string
  updated: string
}

export async function getCommissionRules(): Promise<CommissionRule[]> {
  return pb.collection('commission_rules').getFullList({ sort: 'priority' })
}

export async function getActiveCommissionRules(): Promise<CommissionRule[]> {
  return pb.collection('commission_rules').getFullList({
    filter: 'active = true',
    sort: 'priority',
  })
}

export async function createCommissionRule(
  data: Omit<CommissionRule, 'id' | 'created' | 'updated'>,
): Promise<CommissionRule> {
  return pb.collection('commission_rules').create(data)
}

export async function updateCommissionRule(
  id: string,
  data: Partial<Omit<CommissionRule, 'id' | 'created' | 'updated'>>,
): Promise<CommissionRule> {
  return pb.collection('commission_rules').update(id, data)
}

export async function deleteCommissionRule(id: string): Promise<void> {
  await pb.collection('commission_rules').delete(id)
}

export async function getRulesByRole(role: CommissionRole): Promise<CommissionRule[]> {
  return pb.collection('commission_rules').getFullList({
    filter: `role = "${role}" && active = true`,
    sort: 'priority',
  })
}
