import pb from '@/lib/pocketbase/client'
import type { VitrineItem } from '@/lib/vitrine-types'

export async function getVitrineItems(): Promise<VitrineItem[]> {
  return pb.collection('vitrine_items').getFullList({ sort: 'display_order' })
}

export async function getVitrineItem(id: string): Promise<VitrineItem> {
  return pb.collection('vitrine_items').getOne(id)
}

export async function createVitrineItem(data: Partial<VitrineItem>): Promise<VitrineItem> {
  return pb.collection('vitrine_items').create(data)
}

export async function updateVitrineItem(
  id: string,
  data: Partial<VitrineItem>,
): Promise<VitrineItem> {
  return pb.collection('vitrine_items').update(id, data)
}

export async function deleteVitrineItem(id: string): Promise<void> {
  await pb.collection('vitrine_items').delete(id)
}

export async function duplicateVitrineItem(id: string): Promise<VitrineItem> {
  const item = await getVitrineItem(id)
  const { id: _id, created, updated, ...rest } = item as unknown as Record<string, unknown>
  return createVitrineItem({
    ...(rest as Partial<VitrineItem>),
    name: `${item.name} (cópia)`,
    status: 'rascunho',
    active: false,
    has_publish_history: false,
  })
}

export async function getPublishedVitrineItems(displayPage: string): Promise<VitrineItem[]> {
  return pb.collection('vitrine_items').getFullList({
    filter: `status = 'publicada' && active = true && (display_page = '${displayPage}' || display_page = 'all_pages')`,
    sort: 'display_order',
  })
}
