import pb from '@/lib/pocketbase/client'

export function dpGetList(collection: string, filter?: string) {
  return pb.collection(collection).getFullList({ sort: '-created', filter: filter || undefined })
}
export function dpCreate(collection: string, data: Record<string, unknown>) {
  return pb.collection(collection).create(data)
}
export function dpUpdate(collection: string, id: string, data: Record<string, unknown>) {
  return pb.collection(collection).update(id, data)
}
export function dpDelete(collection: string, id: string) {
  return pb.collection(collection).delete(id)
}
