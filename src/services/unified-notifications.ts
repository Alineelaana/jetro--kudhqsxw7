import pb from '@/lib/pocketbase/client'
import { getApprovals, updateApproval } from '@/services/pricing'
import {
  getNotifications,
  markNotificationAsRead,
  type Notification,
} from '@/services/notifications'
import { getPriceTablesList } from '@/services/price-tables'

export interface UnifiedNotification {
  id: string
  type: 'approval' | 'expiration' | 'system'
  title: string
  message: string
  link?: string
  created: string
  read: boolean
  resolved: boolean
  relatedId?: string
}

export async function getUnifiedNotifications(): Promise<UnifiedNotification[]> {
  const [approvals, tables, notifications] = await Promise.all([
    getApprovals('pending').catch(() => []),
    getPriceTablesList().catch(() => []),
    getNotifications().catch(() => []),
  ])

  const items: UnifiedNotification[] = []

  for (const a of approvals as Record<string, unknown>[]) {
    items.push({
      id: `approval-${a.id}`,
      type: 'approval',
      title: `Aprovação Pendente: ${a.product_name || 'Produto'}`,
      message: `Preço solicitado: R$ ${a.requested_price || '0'} — ${a.product_code || ''}`,
      created: (a.created as string) || '',
      read: false,
      resolved: a.status !== 'pending',
      relatedId: a.id as string,
    })
  }

  const now = new Date()
  const sevenDays = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  for (const t of tables as Record<string, unknown>[]) {
    const finalStr = t.data_final as string
    if (!finalStr) continue
    const endDate = new Date(finalStr)
    if (endDate >= now && endDate <= sevenDays) {
      items.push({
        id: `expiration-${t.id}`,
        type: 'expiration',
        title: `Tabela Expirando: ${t.table_name || 'Tabela'}`,
        message: `Expira em ${endDate.toLocaleDateString('pt-BR')}`,
        link: '/admin/tabelas-precos',
        created: (t.updated as string) || (t.created as string) || '',
        read: false,
        resolved: t.status !== 'ativa',
        relatedId: t.id as string,
      })
    }
  }

  for (const n of notifications as Notification[]) {
    items.push({
      id: `system-${n.id}`,
      type: 'system',
      title: n.title,
      message: n.message || '',
      link: n.link || undefined,
      created: n.created || '',
      read: n.read,
      resolved: n.read,
      relatedId: n.id,
    })
  }

  items.sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime())
  return items
}

export async function resolveUnifiedNotification(
  notif: UnifiedNotification,
  action: 'approve' | 'reject' | 'read',
): Promise<void> {
  if (notif.type === 'approval' && notif.relatedId) {
    if (action === 'approve' || action === 'reject') {
      await updateApproval(notif.relatedId, {
        status: action === 'approve' ? 'approved' : 'rejected',
        approved_at: new Date().toISOString(),
      })
    }
  } else if (notif.type === 'system' && notif.relatedId) {
    await markNotificationAsRead(notif.relatedId)
  }
}

export async function markUnifiedAsRead(notif: UnifiedNotification): Promise<void> {
  if (notif.type === 'system' && notif.relatedId) {
    await markNotificationAsRead(notif.relatedId)
  }
}
