import pb from '@/lib/pocketbase/client'

export function sstGetList(collection: string) {
  return pb.collection(collection).getFullList({ sort: '-created' })
}
export function sstCreate(collection: string, data: Record<string, unknown>) {
  return pb.collection(collection).create(data)
}
export function sstUpdate(collection: string, id: string, data: Record<string, unknown>) {
  return pb.collection(collection).update(id, data)
}
export function sstDelete(collection: string, id: string) {
  return pb.collection(collection).delete(id)
}
