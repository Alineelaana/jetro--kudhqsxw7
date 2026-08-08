import pb from '@/lib/pocketbase/client'

export function mkGetList(collection: string) {
  return pb.collection(collection).getFullList({ sort: '-created' })
}

export function mkGetOne(collection: string, id: string) {
  return pb.collection(collection).getOne(id)
}

export function mkCreate(collection: string, data: Record<string, unknown>) {
  const user = pb.authStore.record as Record<string, unknown> | null
  return pb.collection(collection).create({
    ...data,
    responsible_id: user?.id || '',
    responsible_name: (user?.name as string) || '',
  })
}

export function mkUpdate(collection: string, id: string, data: Record<string, unknown>) {
  return pb.collection(collection).update(id, data)
}

export function mkDelete(collection: string, id: string) {
  return pb.collection(collection).delete(id)
}

export function logMkAudit(action: string, targetId: string, summary: string) {
  pb.send('/backend/v1/audit/create', {
    method: 'POST',
    body: JSON.stringify({
      action,
      module: 'trade_marketing',
      target_collection: 'trade_marketing',
      target_id: targetId,
      target_summary: summary,
    }),
    headers: { 'Content-Type': 'application/json' },
  }).catch(() => {})
}
