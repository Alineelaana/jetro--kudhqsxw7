import pb from '@/lib/pocketbase/client'
import type { GovernanceConfig, AiProfile, EnforcementResult } from '@/lib/adapta-governance-types'

export async function getGovernanceConfig(): Promise<GovernanceConfig | null> {
  try {
    const list = await pb.collection('adapta_governance').getFullList({
      filter: 'active = true',
      sort: '-created',
    })
    return (list[0] as unknown as GovernanceConfig) || null
  } catch {
    return null
  }
}

export async function saveGovernanceConfig(data: Partial<GovernanceConfig>): Promise<void> {
  await pb.send('/backend/v1/adapta-governance/save', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
  })
}

export async function getAiProfiles(): Promise<AiProfile[]> {
  try {
    const list = await pb.collection('adapta_ai_profiles').getFullList({ sort: 'profile_key' })
    return list as unknown as AiProfile[]
  } catch {
    return []
  }
}

export async function saveAiProfile(data: Partial<AiProfile>): Promise<void> {
  await pb.send('/backend/v1/adapta-governance/profiles/save', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
  })
}

export async function enforceGovernance(params: {
  module?: string
  action?: string
  data_types?: string[]
  policy_keys?: string[]
  empresa?: string
  filial?: string
}): Promise<EnforcementResult> {
  return pb.send('/backend/v1/adapta-governance/enforce', {
    method: 'POST',
    body: JSON.stringify(params),
    headers: { 'Content-Type': 'application/json' },
  })
}

export async function logAiInteraction(data: {
  question: string
  response: string
  modules_consulted: string[]
  response_time_ms: number
  records_analyzed: number
  export_occurred?: boolean
  simulation_occurred?: boolean
  recommendation_generated?: boolean
}): Promise<void> {
  await pb.send('/backend/v1/adapta-governance/audit', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
  })
}
