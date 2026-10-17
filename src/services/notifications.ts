import pb from '@/lib/pocketbase/client'

export interface Notification {
  id: string
  title: string
  message: string
  type: string
  recipient: string
  read: boolean
  link: string
  created: string
}

export async function getNotifications(): Promise<Notification[]> {
  const userId = pb.authStore.record?.id
  if (!userId) return []
  return pb.collection('notifications').getFullList({
    filter: `recipient = "${userId}"`,
    sort: '-created',
  }) as Promise<Notification[]>
}

export async function getUnreadCount(): Promise<number> {
  const userId = pb.authStore.record?.id
  if (!userId) return 0
  const res = await pb
    .collection('notifications')
    .getList(1, 1, { filter: `recipient = "${userId}" && read = false` })
  return res.totalItems || 0
}

export async function markNotificationAsRead(id: string): Promise<void> {
  await pb.collection('notifications').update(id, { read: true })
}
