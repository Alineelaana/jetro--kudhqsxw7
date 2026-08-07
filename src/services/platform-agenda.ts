import pb from '@/lib/pocketbase/client'
import type {
  PlatformAgendaEvent,
  AgendaEventType,
  AgendaEventStatus,
} from '@/lib/platform-layer-types'

export async function getAgendaEvents(filters?: {
  startDate?: string
  endDate?: string
  eventType?: AgendaEventType
  assignedTo?: string
  status?: AgendaEventStatus
}): Promise<PlatformAgendaEvent[]> {
  const parts: string[] = []
  if (filters?.startDate) parts.push(`start_date >= "${filters.startDate}"`)
  if (filters?.endDate) parts.push(`start_date <= "${filters.endDate}"`)
  if (filters?.eventType) parts.push(`event_type = "${filters.eventType}"`)
  if (filters?.assignedTo) parts.push(`assigned_to = "${filters.assignedTo}"`)
  if (filters?.status) parts.push(`status = "${filters.status}"`)
  return pb.collection('platform_agenda_events').getFullList({
    sort: 'start_date',
    filter: parts.length ? parts.join(' && ') : undefined,
  }) as Promise<PlatformAgendaEvent[]>
}

export async function getAgendaEvent(id: string): Promise<PlatformAgendaEvent> {
  return pb.collection('platform_agenda_events').getOne(id) as Promise<PlatformAgendaEvent>
}

export async function createAgendaEvent(data: {
  title: string
  description?: string
  event_type: AgendaEventType
  module_origin: string
  start_date: string
  end_date?: string
  all_day?: boolean
  location?: string
  assigned_to?: string
  assigned_name?: string
  related_entity_type?: string
  related_entity_id?: string
  priority?: 'low' | 'medium' | 'high' | 'critical'
  company?: string
  branch?: string
}): Promise<PlatformAgendaEvent> {
  const user = pb.authStore.record as Record<string, unknown> | null
  return pb.collection('platform_agenda_events').create({
    ...data,
    status: 'scheduled',
    created_by: user?.id || '',
  }) as Promise<PlatformAgendaEvent>
}

export async function updateAgendaEvent(
  id: string,
  data: Partial<PlatformAgendaEvent>,
): Promise<PlatformAgendaEvent> {
  return pb.collection('platform_agenda_events').update(id, data) as Promise<PlatformAgendaEvent>
}

export async function deleteAgendaEvent(id: string): Promise<void> {
  await pb.collection('platform_agenda_events').delete(id)
}

export async function getUpcomingEvents(days: number = 7): Promise<PlatformAgendaEvent[]> {
  const now = new Date()
  const future = new Date(now.getTime() + days * 86400000)
  return getAgendaEvents({
    startDate: now.toISOString().substring(0, 19).replace('T', ' '),
    endDate: future.toISOString().substring(0, 19).replace('T', ' '),
    status: 'scheduled',
  })
}
