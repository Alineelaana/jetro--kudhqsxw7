import pb from '@/lib/pocketbase/client'

export const VR_COLLECTIONS = {
  rules: 'commission_rules',
  apurations: 'commission_apurations',
  approvals: 'commission_approvals',
  contests: 'commission_contests',
  campaigns: 'incentive_campaigns',
  goals: 'sales_goals',
  awards: 'goal_awards',
  communications: 'goal_communications',
  simulations: 'commission_simulations',
} as const

export function vrGetList(collection: string) {
  return pb.collection(collection).getFullList({ sort: '-created' })
}
export function vrCreate(collection: string, data: Record<string, unknown>) {
  return pb.collection(collection).create(data)
}
export function vrUpdate(collection: string, id: string, data: Record<string, unknown>) {
  return pb.collection(collection).update(id, data)
}
export function vrDelete(collection: string, id: string) {
  return pb.collection(collection).delete(id)
}

export const getRules = () => vrGetList(VR_COLLECTIONS.rules)
export const createRule = (d: Record<string, unknown>) => vrCreate(VR_COLLECTIONS.rules, d)
export const updateRule = (id: string, d: Record<string, unknown>) =>
  vrUpdate(VR_COLLECTIONS.rules, id, d)
export const deleteRule = (id: string) => vrDelete(VR_COLLECTIONS.rules, id)

export const getApurations = () => vrGetList(VR_COLLECTIONS.apurations)
export const createApuration = (d: Record<string, unknown>) =>
  vrCreate(VR_COLLECTIONS.apurations, d)
export const updateApuration = (id: string, d: Record<string, unknown>) =>
  vrUpdate(VR_COLLECTIONS.apurations, id, d)

export const getApprovals = () => vrGetList(VR_COLLECTIONS.approvals)
export const createApproval = (d: Record<string, unknown>) => vrCreate(VR_COLLECTIONS.approvals, d)
export const updateApproval = (id: string, d: Record<string, unknown>) =>
  vrUpdate(VR_COLLECTIONS.approvals, id, d)

export const getContests = () => vrGetList(VR_COLLECTIONS.contests)
export const createContest = (d: Record<string, unknown>) => vrCreate(VR_COLLECTIONS.contests, d)
export const updateContest = (id: string, d: Record<string, unknown>) =>
  vrUpdate(VR_COLLECTIONS.contests, id, d)

export const getCampaigns = () => vrGetList(VR_COLLECTIONS.campaigns)
export const createCampaign = (d: Record<string, unknown>) => vrCreate(VR_COLLECTIONS.campaigns, d)
export const updateCampaign = (id: string, d: Record<string, unknown>) =>
  vrUpdate(VR_COLLECTIONS.campaigns, id, d)
export const deleteCampaign = (id: string) => vrDelete(VR_COLLECTIONS.campaigns, id)

export const getGoals = () => vrGetList(VR_COLLECTIONS.goals)
export const createGoal = (d: Record<string, unknown>) => vrCreate(VR_COLLECTIONS.goals, d)
export const updateGoal = (id: string, d: Record<string, unknown>) =>
  vrUpdate(VR_COLLECTIONS.goals, id, d)
export const deleteGoal = (id: string) => vrDelete(VR_COLLECTIONS.goals, id)

export const getAwards = () => vrGetList(VR_COLLECTIONS.awards)
export const createAward = (d: Record<string, unknown>) => vrCreate(VR_COLLECTIONS.awards, d)
export const updateAward = (id: string, d: Record<string, unknown>) =>
  vrUpdate(VR_COLLECTIONS.awards, id, d)
export const deleteAward = (id: string) => vrDelete(VR_COLLECTIONS.awards, id)

export const getCommunications = () => vrGetList(VR_COLLECTIONS.communications)
export const createCommunication = (d: Record<string, unknown>) =>
  vrCreate(VR_COLLECTIONS.communications, d)

export const getSimulations = () => vrGetList(VR_COLLECTIONS.simulations)
export const createSimulation = (d: Record<string, unknown>) =>
  vrCreate(VR_COLLECTIONS.simulations, d)

export async function apurateCommissions(filters: Record<string, string>): Promise<any[]> {
  return pb.send('/backend/v1/vr/apurate', {
    method: 'POST',
    body: JSON.stringify(filters),
    headers: { 'Content-Type': 'application/json' },
  })
}

export async function closeGoals(competencia: string): Promise<any> {
  return pb.send('/backend/v1/vr/close-goals', {
    method: 'POST',
    body: JSON.stringify({ competencia }),
    headers: { 'Content-Type': 'application/json' },
  })
}

export async function sendParcial(
  targetScope: string,
  targetId: string,
  competencia: string,
): Promise<any> {
  return pb.send('/backend/v1/vr/send-parcial', {
    method: 'POST',
    body: JSON.stringify({ target_scope: targetScope, target_id: targetId, competencia }),
    headers: { 'Content-Type': 'application/json' },
  })
}

export function logVRAudit(
  action: string,
  module: string,
  targetId: string,
  summary: string,
  prev?: unknown,
  next?: unknown,
) {
  pb.send('/backend/v1/audit/create', {
    method: 'POST',
    body: JSON.stringify({
      action,
      module,
      target_collection: module,
      target_id: targetId,
      target_summary: summary,
      previous_value: prev,
      new_value: next,
    }),
    headers: { 'Content-Type': 'application/json' },
  }).catch(() => {})
}
