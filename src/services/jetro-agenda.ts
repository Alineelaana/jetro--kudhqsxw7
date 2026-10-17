import pb from '@/lib/pocketbase/client'
import type {
  AgendaAppointment,
  AgendaFilterOptions,
  CreateAppointmentInput,
  UpdateAppointmentInput,
  AppointmentRecurrence,
} from '@/types/jetro-agenda'
import { getBrasiliaDate } from './holidays'

const COLLECTION_NAME = 'jetro_agenda_appointments'

/**
 * Validação de segurança: verifica se a data/hora já passou
 * Retorna true se a data/hora alvo for anterior ao momento atual de Brasília
 */
export function isAppointmentInThePast(dateStr: string, timeStr?: string): boolean {
  if (!dateStr) return false
  const time = timeStr && timeStr.includes(':') ? timeStr.trim() : '23:59'
  const targetIso = `${dateStr}T${time}:00-03:00`
  const targetTime = new Date(targetIso).getTime()
  const nowBrasilia = getBrasiliaDate().getTime()
  return targetTime < nowBrasilia
}

/**
 * Gera as próximas datas com base na regra de recorrência
 */
export function calculateRecurrenceDates(
  startDateStr: string,
  recurrence: AppointmentRecurrence,
  endDateStr?: string,
  maxOccurrences = 24,
): string[] {
  if (!recurrence || recurrence === 'none') return []

  const dates: string[] = []
  const [startYear, startMonth, startDay] = startDateStr.split('-').map(Number)
  const current = new Date(Date.UTC(startYear, startMonth - 1, startDay))

  let maxLimitDate: Date
  if (endDateStr) {
    const [eYear, eMonth, eDay] = endDateStr.split('-').map(Number)
    maxLimitDate = new Date(Date.UTC(eYear, eMonth - 1, eDay))
  } else {
    // Por padrão gera até 6 meses para diária/semanal, 1 ano para mensal/quinzenal, 3 anos para anual
    maxLimitDate = new Date(current.getTime())
    if (recurrence === 'daily') maxLimitDate.setUTCDate(maxLimitDate.getUTCDate() + 60)
    else if (recurrence === 'weekly') maxLimitDate.setUTCDate(maxLimitDate.getUTCDate() + 180)
    else if (recurrence === 'biweekly') maxLimitDate.setUTCDate(maxLimitDate.getUTCDate() + 365)
    else if (recurrence === 'monthly') maxLimitDate.setUTCMonth(maxLimitDate.getUTCMonth() + 12)
    else if (recurrence === 'yearly') maxLimitDate.setUTCFullYear(maxLimitDate.getUTCFullYear() + 3)
  }

  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`)

  while (dates.length < maxOccurrences) {
    if (recurrence === 'daily') {
      current.setUTCDate(current.getUTCDate() + 1)
    } else if (recurrence === 'weekly') {
      current.setUTCDate(current.getUTCDate() + 7)
    } else if (recurrence === 'biweekly') {
      current.setUTCDate(current.getUTCDate() + 14)
    } else if (recurrence === 'monthly') {
      current.setUTCMonth(current.getUTCMonth() + 1)
    } else if (recurrence === 'yearly') {
      current.setUTCFullYear(current.getUTCFullYear() + 1)
    }

    if (current.getTime() > maxLimitDate.getTime()) break

    const y = current.getUTCFullYear()
    const m = pad(current.getUTCMonth() + 1)
    const d = pad(current.getUTCDate())
    dates.push(`${y}-${m}-${d}`)
  }

  return dates
}

export async function fetchUserAppointments(
  userId: string,
  filters?: AgendaFilterOptions,
): Promise<AgendaAppointment[]> {
  if (!userId) return []

  const filterParts: string[] = [`user_id = "${userId}"`]

  if (filters?.type && filters.type !== 'all') {
    filterParts.push(`type = "${filters.type}"`)
  }
  if (filters?.priority && filters.priority !== 'all') {
    filterParts.push(`priority = "${filters.priority}"`)
  }
  if (filters?.status && filters.status !== 'all') {
    filterParts.push(`status = "${filters.status}"`)
  }
  if (filters?.dateFrom) {
    filterParts.push(`date >= "${filters.dateFrom}"`)
  }
  if (filters?.dateTo) {
    filterParts.push(`date <= "${filters.dateTo}"`)
  }
  if (filters?.search && filters.search.trim()) {
    const s = filters.search.trim()
    filterParts.push(`(title ~ "${s}" || description ~ "${s}")`)
  }

  const filterQuery = filterParts.join(' && ')

  try {
    const records = await pb.collection(COLLECTION_NAME).getFullList({
      filter: filterQuery,
      sort: 'date,start_time',
      requestKey: null,
    })

    return records.map((r) => {
      let reminderConfigsParsed: string[] = []
      if (Array.isArray(r.reminder_configs)) {
        reminderConfigsParsed = r.reminder_configs
      } else if (typeof r.reminder_configs === 'string') {
        try {
          reminderConfigsParsed = JSON.parse(r.reminder_configs)
        } catch (_) {
          reminderConfigsParsed = []
        }
      }

      return {
        id: r.id,
        user_id: r.user_id,
        user_email: r.user_email,
        user_name: r.user_name,
        title: r.title,
        description: r.description,
        date: r.date,
        start_time: r.start_time,
        end_time: r.end_time,
        type: r.type,
        priority: r.priority,
        status: r.status,
        has_reminder: !!r.has_reminder,
        reminder_configs: reminderConfigsParsed,
        reminder_target_email: r.reminder_target_email,
        recurrence: r.recurrence || 'none',
        recurrence_end_date: r.recurrence_end_date,
        parent_appointment_id: r.parent_appointment_id,
        is_completed: !!r.is_completed || r.status === 'Concluido',
        completed_at: r.completed_at,
        reference_time_for_reminder: r.reference_time_for_reminder,
        created: r.created,
        updated: r.updated,
      } as AgendaAppointment
    })
  } catch (err) {
    console.error('Erro ao buscar compromissos da agenda:', err)
    return []
  }
}

export async function createAppointment(
  input: CreateAppointmentInput,
  currentUser: { id: string; email: string; name?: string },
): Promise<AgendaAppointment> {
  const payload = {
    user_id: currentUser.id,
    user_email: currentUser.email,
    user_name: currentUser.name || '',
    title: input.title,
    description: input.description || '',
    date: input.date,
    start_time: input.start_time || '',
    end_time: input.end_time || '',
    type: input.type,
    priority: input.priority,
    status: input.status,
    has_reminder: input.has_reminder,
    reminder_configs: input.reminder_configs || [],
    reminder_target_email: input.reminder_target_email || currentUser.email,
    recurrence: input.recurrence || 'none',
    recurrence_end_date: input.recurrence_end_date || '',
    is_completed: input.status === 'Concluido',
    completed_at: input.status === 'Concluido' ? new Date().toISOString() : '',
    reference_time_for_reminder: input.reference_time_for_reminder || '',
  }

  const record = await pb.collection(COLLECTION_NAME).create(payload)

  // Se houver recorrência configurada, cria as ocorrências filhas automaticamente
  if (input.recurrence && input.recurrence !== 'none') {
    const recurrentDates = calculateRecurrenceDates(
      input.date,
      input.recurrence,
      input.recurrence_end_date,
    )

    // Cria em lote as próximas ocorrências vinculadas ao pai
    for (const nextDate of recurrentDates) {
      try {
        await pb.collection(COLLECTION_NAME).create({
          ...payload,
          date: nextDate,
          parent_appointment_id: record.id,
          recurrence: 'none', // Apenas o pai controla a regra mestra
        })
      } catch (errRec) {
        console.warn('Erro ao gerar ocorrência recorrente para a data:', nextDate, errRec)
      }
    }
  }

  return {
    id: record.id,
    user_id: record.user_id,
    user_email: record.user_email,
    user_name: record.user_name,
    title: record.title,
    description: record.description,
    date: record.date,
    start_time: record.start_time,
    end_time: record.end_time,
    type: record.type,
    priority: record.priority,
    status: record.status,
    has_reminder: !!record.has_reminder,
    reminder_configs: input.reminder_configs || [],
    reminder_target_email: record.reminder_target_email,
    recurrence: record.recurrence,
    recurrence_end_date: record.recurrence_end_date,
    is_completed: record.is_completed,
    completed_at: record.completed_at,
    reference_time_for_reminder: record.reference_time_for_reminder,
    created: record.created,
    updated: record.updated,
  }
}

export async function updateAppointment(input: UpdateAppointmentInput): Promise<AgendaAppointment> {
  const updatePayload: Record<string, unknown> = {}

  if (input.title !== undefined) updatePayload.title = input.title
  if (input.description !== undefined) updatePayload.description = input.description
  if (input.date !== undefined) updatePayload.date = input.date
  if (input.start_time !== undefined) updatePayload.start_time = input.start_time
  if (input.end_time !== undefined) updatePayload.end_time = input.end_time
  if (input.type !== undefined) updatePayload.type = input.type
  if (input.priority !== undefined) updatePayload.priority = input.priority
  if (input.status !== undefined) {
    updatePayload.status = input.status
    if (input.status === 'Concluido') {
      updatePayload.is_completed = true
      updatePayload.completed_at = new Date().toISOString()
    } else {
      updatePayload.is_completed = false
      updatePayload.completed_at = ''
    }
  }
  if (input.has_reminder !== undefined) updatePayload.has_reminder = input.has_reminder
  if (input.reminder_configs !== undefined) updatePayload.reminder_configs = input.reminder_configs
  if (input.reminder_target_email !== undefined)
    updatePayload.reminder_target_email = input.reminder_target_email
  if (input.recurrence !== undefined) updatePayload.recurrence = input.recurrence
  if (input.recurrence_end_date !== undefined)
    updatePayload.recurrence_end_date = input.recurrence_end_date
  if (input.reference_time_for_reminder !== undefined)
    updatePayload.reference_time_for_reminder = input.reference_time_for_reminder
  if (input.is_completed !== undefined) {
    updatePayload.is_completed = input.is_completed
    updatePayload.status = input.is_completed ? 'Concluido' : 'Pendente'
    updatePayload.completed_at = input.is_completed ? new Date().toISOString() : ''
  }

  const record = await pb.collection(COLLECTION_NAME).update(input.id, updatePayload)

  let reminderConfigsParsed: string[] = []
  if (Array.isArray(record.reminder_configs)) {
    reminderConfigsParsed = record.reminder_configs
  } else if (typeof record.reminder_configs === 'string') {
    try {
      reminderConfigsParsed = JSON.parse(record.reminder_configs)
    } catch (_) {
      reminderConfigsParsed = []
    }
  }

  return {
    id: record.id,
    user_id: record.user_id,
    user_email: record.user_email,
    user_name: record.user_name,
    title: record.title,
    description: record.description,
    date: record.date,
    start_time: record.start_time,
    end_time: record.end_time,
    type: record.type,
    priority: record.priority,
    status: record.status,
    has_reminder: !!record.has_reminder,
    reminder_configs: reminderConfigsParsed,
    reminder_target_email: record.reminder_target_email,
    recurrence: record.recurrence,
    recurrence_end_date: record.recurrence_end_date,
    parent_appointment_id: record.parent_appointment_id,
    is_completed: !!record.is_completed,
    completed_at: record.completed_at,
    reference_time_for_reminder: record.reference_time_for_reminder,
    created: record.created,
    updated: record.updated,
  }
}

export async function deleteAppointment(appointmentId: string): Promise<boolean> {
  try {
    await pb.collection(COLLECTION_NAME).delete(appointmentId)
    return true
  } catch (err) {
    console.error('Erro ao excluir compromisso:', err)
    return false
  }
}

export async function toggleAppointmentStatus(
  appointment: AgendaAppointment,
): Promise<AgendaAppointment> {
  const isDone = appointment.status === 'Concluido'
  const newStatus = isDone ? 'Pendente' : 'Concluido'

  return updateAppointment({
    id: appointment.id,
    status: newStatus,
    is_completed: !isDone,
    completed_at: !isDone ? new Date().toISOString() : '',
  })
}
