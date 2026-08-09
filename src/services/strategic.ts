import pb from '@/lib/pocketbase/client'

export function getStrategicList(collection: string, filter?: string) {
  return pb.collection(collection).getFullList({ sort: '-created', filter })
}
export function getStrategicRecord(collection: string, id: string) {
  return pb.collection(collection).getOne(id)
}
export function createStrategicRecord(collection: string, data: Record<string, unknown>) {
  return pb.collection(collection).create(data)
}
export function updateStrategicRecord(
  collection: string,
  id: string,
  data: Record<string, unknown>,
) {
  return pb.collection(collection).update(id, data)
}
export function deleteStrategicRecord(collection: string, id: string) {
  return pb.collection(collection).delete(id)
}

export function logStrategicAudit(action: string, targetId: string, summary: string) {
  pb.send('/backend/v1/audit/create', {
    method: 'POST',
    body: JSON.stringify({
      action,
      module: 'strategic',
      target_collection: 'strategic',
      target_id: targetId,
      target_summary: summary,
    }),
    headers: { 'Content-Type': 'application/json' },
  }).catch(() => {})
}

export const STRATEGIC_COLLECTIONS = [
  'strategic_initiatives',
  'strategic_okrs',
  'strategic_key_results',
  'strategic_roadmap',
  'strategic_projects',
  'business_cases',
  'growth_experiments',
  'market_intelligence',
  'strategic_decisions',
  'strategic_indicators',
] as const
