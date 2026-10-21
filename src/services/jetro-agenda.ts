import pb from '@/lib/pocketbase/client'
import type {
  AgendaAppointment,
  AgendaFilterOptions,
  CreateAppointmentInput,
  UpdateAppointmentInput,
  AppointmentRecurrence,
  AgendaInvitation,
  CompanyUserOption,
} from '@/types/jetro-agenda'
import { getBrasiliaDate } from './holidays'
import { registerAuditLog } from './audit-logs'
import { createInAppNotification } from './notifications'

const COLLECTION_NAME = 'jetro_agenda_appointments'
const INVITATIONS_COLLECTION = 'jetro_agenda_invitations'

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

function parseAppointmentRecord(r: any): AgendaAppointment {
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
    empresa_id: r.empresa_id,
    rescheduled_from_id: r.rescheduled_from_id,
    rescheduled_at: r.rescheduled_at,
    created: r.created,
    updated: r.updated,
  }
}

export async function fetchUserAppointments(
  userId: string,
  filters?: AgendaFilterOptions,
): Promise<AgendaAppointment[]> {
  if (!userId) return []

  try {
    // 1. Compromissos criados diretamente pelo usuário
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

    const ownRecords = await pb.collection(COLLECTION_NAME).getFullList({
      filter: filterParts.join(' && '),
      sort: 'date,start_time',
      requestKey: null,
    })

    const ownAppointments = ownRecords.map(parseAppointmentRecord)

    // 2. Convites recebidos pelo usuário (status pendente ou aceito aparecem no calendário; recusados não poluem o calendário principal)
    let invitedAppointments: AgendaAppointment[] = []
    try {
      const invFilter = `user_id = "${userId}" && status != "recusado"`
      const invRecords = await pb.collection(INVITATIONS_COLLECTION).getFullList({
        filter: invFilter,
        requestKey: null,
      })

      if (invRecords.length > 0) {
        // Carrega compromissos vinculados aos convites
        const apptIds = Array.from(new Set(invRecords.map((i) => i.appointment_id)))
        const apptPromises = apptIds.map(async (apptId) => {
          try {
            const rawAppt = await pb.collection(COLLECTION_NAME).getOne(apptId)
            const inv = invRecords.find((i) => i.appointment_id === apptId)
            const parsed = parseAppointmentRecord(rawAppt)
            parsed.invitation_id = inv?.id
            parsed.invitation_status = inv?.status as 'pendente' | 'aceito' | 'recusado'
            parsed.invited_by_name = inv?.invited_by_name || 'Organizador'
            parsed.is_invited_participant = true
            return parsed
          } catch {
            return null
          }
        })
        const loaded = await Promise.all(apptPromises)
        invitedAppointments = loaded.filter((a): a is AgendaAppointment => a !== null)

        // Aplica os mesmos filtros nos convites
        if (filters?.type && filters.type !== 'all') {
          invitedAppointments = invitedAppointments.filter((a) => a.type === filters.type)
        }
        if (filters?.priority && filters.priority !== 'all') {
          invitedAppointments = invitedAppointments.filter((a) => a.priority === filters.priority)
        }
        if (filters?.status && filters.status !== 'all') {
          invitedAppointments = invitedAppointments.filter((a) => a.status === filters.status)
        }
        if (filters?.dateFrom) {
          invitedAppointments = invitedAppointments.filter((a) => a.date >= filters.dateFrom!)
        }
        if (filters?.dateTo) {
          invitedAppointments = invitedAppointments.filter((a) => a.date <= filters.dateTo!)
        }
        if (filters?.search && filters.search.trim()) {
          const s = filters.search.toLowerCase().trim()
          invitedAppointments = invitedAppointments.filter(
            (a) =>
              (a.title || '').toLowerCase().includes(s) ||
              (a.description || '').toLowerCase().includes(s),
          )
        }
      }
    } catch (errInv) {
      console.warn('Erro ao carregar convites do usuário:', errInv)
    }

    // Combina e remove duplicatas (se o próprio criador também foi inserido em convite)
    const combinedMap = new Map<string, AgendaAppointment>()
    for (const a of ownAppointments) {
      combinedMap.set(a.id, a)
    }
    for (const a of invitedAppointments) {
      if (!combinedMap.has(a.id)) {
        combinedMap.set(a.id, a)
      }
    }

    const all = Array.from(combinedMap.values())
    all.sort((a, b) => {
      const cmpDate = a.date.localeCompare(b.date)
      if (cmpDate !== 0) return cmpDate
      return (a.start_time || '').localeCompare(b.start_time || '')
    })

    return all
  } catch (err) {
    console.error('Erro ao buscar compromissos da agenda:', err)
    return []
  }
}

export async function createAppointment(
  input: CreateAppointmentInput,
  currentUser: { id: string; email: string; name?: string },
): Promise<AgendaAppointment> {
  const authRecord = pb.authStore.record as {
    empresa_id?: string
  } | null

  const empresaId = input.empresa_id || authRecord?.empresa_id || ''

  const payload = {
    user_id: currentUser.id,
    user_email: currentUser.email,
    user_name: currentUser.name || '',
    empresa_id: empresaId,
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
    rescheduled_from_id: input.rescheduled_from_id || '',
  }

  const record = await pb.collection(COLLECTION_NAME).create(payload)

  // Auditoria: criação
  await registerAuditLog({
    action: 'create',
    module: 'agenda',
    target_collection: COLLECTION_NAME,
    target_id: record.id,
    target_summary: `Criou compromisso/tarefa: "${record.title}" para ${record.date} às ${record.start_time || 'dia todo'}`,
    new_value: {
      title: record.title,
      date: record.date,
      start_time: record.start_time,
      type: record.type,
      priority: record.priority,
      status: record.status,
    },
    criticidade: 'Baixa',
  })

  // Convite de participantes especificados
  if (input.invited_user_ids && input.invited_user_ids.length > 0) {
    await inviteParticipantsToAppointment(
      record.id,
      record.title,
      input.invited_user_ids,
      currentUser,
      empresaId,
    )
  }

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

  return parseAppointmentRecord(record)
}

export async function updateAppointment(input: UpdateAppointmentInput): Promise<AgendaAppointment> {
  let previousRecord: any = null
  try {
    previousRecord = await pb.collection(COLLECTION_NAME).getOne(input.id)
  } catch {
    /* intentionally ignored */
  }

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
  if (input.rescheduled_at !== undefined) updatePayload.rescheduled_at = input.rescheduled_at
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

  // Auditoria: determina ação específica
  let auditAction = 'update'
  let summary = `Atualizou compromisso: "${record.title}"`
  if (input.status === 'Concluido') {
    auditAction = 'concluir_tarefa'
    summary = `Concluiu a tarefa: "${record.title}"`
  } else if (input.status === 'Cancelado') {
    auditAction = 'cancelar_tarefa'
    summary = `Cancelou a tarefa: "${record.title}"`
  } else if (input.status === 'Reagendado') {
    auditAction = 'reagendar_tarefa'
    summary = `Reagendou a tarefa: "${record.title}" para ${record.date} ${record.start_time || ''}`
  }

  await registerAuditLog({
    action: auditAction,
    module: 'agenda',
    target_collection: COLLECTION_NAME,
    target_id: record.id,
    target_summary: summary,
    previous_value: previousRecord
      ? {
          title: previousRecord.title,
          date: previousRecord.date,
          start_time: previousRecord.start_time,
          status: previousRecord.status,
        }
      : null,
    new_value: {
      title: record.title,
      date: record.date,
      start_time: record.start_time,
      status: record.status,
    },
    criticidade: 'Baixa',
  })

  // Convite de novos participantes se fornecidos
  if (input.invited_user_ids && input.invited_user_ids.length > 0) {
    const authRecord = pb.authStore.record as {
      id?: string
      name?: string
      email?: string
      empresa_id?: string
    } | null
    await inviteParticipantsToAppointment(
      record.id,
      record.title,
      input.invited_user_ids,
      {
        id: authRecord?.id || record.user_id,
        email: authRecord?.email || record.user_email || '',
        name: authRecord?.name || record.user_name || '',
      },
      (record.empresa_id || authRecord?.empresa_id) as string,
    )
  }

  return parseAppointmentRecord(record)
}

export async function deleteAppointment(appointmentId: string): Promise<boolean> {
  try {
    let appt: any = null
    try {
      appt = await pb.collection(COLLECTION_NAME).getOne(appointmentId)
    } catch {
      /* intentionally ignored */
    }

    await pb.collection(COLLECTION_NAME).delete(appointmentId)

    await registerAuditLog({
      action: 'delete',
      module: 'agenda',
      target_collection: COLLECTION_NAME,
      target_id: appointmentId,
      target_summary: `Excluiu compromisso/tarefa: "${appt?.title || appointmentId}"`,
      previous_value: appt ? { title: appt.title, date: appt.date, status: appt.status } : null,
      criticidade: 'Média',
    })

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
  const newStatus: AppointmentStatus = isDone ? 'Pendente' : 'Concluido'

  return updateAppointment({
    id: appointment.id,
    status: newStatus,
    is_completed: !isDone,
    completed_at: !isDone ? new Date().toISOString() : '',
  })
}

/**
 * Conclui uma tarefa com identificação visual na cor verde e registro de auditoria
 */
export async function concludeTask(task: AgendaAppointment): Promise<AgendaAppointment> {
  return updateAppointment({
    id: task.id,
    status: 'Concluido',
    is_completed: true,
    completed_at: new Date().toISOString(),
  })
}

/**
 * Cancela uma tarefa com identificação visual na cor vermelha e registro de auditoria
 */
export async function cancelTask(task: AgendaAppointment): Promise<AgendaAppointment> {
  return updateAppointment({
    id: task.id,
    status: 'Cancelado',
    is_completed: false,
    completed_at: '',
  })
}

/**
 * Reagenda uma tarefa para uma nova data e novo horário:
 * Mantém o status 'Reagendado' (identificado em azul) e cria/atualiza os detalhes
 */
export async function rescheduleTask(
  task: AgendaAppointment,
  newDate: string,
  newStartTime?: string,
  newEndTime?: string,
): Promise<AgendaAppointment> {
  const nowIso = new Date().toISOString()
  return updateAppointment({
    id: task.id,
    date: newDate,
    start_time: newStartTime || task.start_time || '',
    end_time: newEndTime || task.end_time || '',
    status: 'Reagendado',
    rescheduled_at: nowIso,
  })
}

/**
 * Busca os usuários da empresa ativa do usuário autenticado para o seletor de participantes.
 * Regra de Multitenancy:
 * - Usuários SUP podem convidar usuários de qualquer empresa.
 * - Usuários comuns só podem convidar membros cadastrados na sua própria empresa.
 */
export async function fetchCompanyUsersForInvite(): Promise<CompanyUserOption[]> {
  try {
    const authRecord = pb.authStore.record as {
      id?: string
      role?: string
      perfil_acesso?: string
      empresa_id?: string
    } | null

    const isSup = authRecord?.role === 'SUP' || authRecord?.perfil_acesso === 'SUP'
    let filter = 'active = true'

    if (!isSup && authRecord?.empresa_id) {
      filter += ` && (empresa_id = "${authRecord.empresa_id}" || empresas_ids ~ "${authRecord.empresa_id}")`
    }

    const records = await pb.collection('users').getFullList({
      filter,
      sort: 'name,email',
      requestKey: null,
    })

    return records.map((u) => ({
      id: u.id,
      name: u.name || u.email || 'Usuário',
      email: u.email || '',
      role: u.role || u.perfil_acesso,
      empresa_id: u.empresa_id,
      cargo: u.cargo,
    }))
  } catch (err) {
    console.error('Erro ao buscar usuários da empresa para convite:', err)
    return []
  }
}

/**
 * Envia convites para participantes de um compromisso e cria notificações in-app para cada um
 */
export async function inviteParticipantsToAppointment(
  appointmentId: string,
  appointmentTitle: string,
  participantUserIds: string[],
  invitedBy: { id: string; name?: string; email: string },
  empresaId?: string,
): Promise<void> {
  if (!participantUserIds || participantUserIds.length === 0) return

  for (const userId of participantUserIds) {
    if (userId === invitedBy.id) continue // Não convidar a si mesmo

    try {
      // Verifica se já existe convite para evitar duplicatas
      const existing = await pb.collection(INVITATIONS_COLLECTION).getList(1, 1, {
        filter: `appointment_id = "${appointmentId}" && user_id = "${userId}"`,
      })

      if (existing.totalItems > 0) continue

      // Dados do participante
      let partName = ''
      let partEmail = ''
      try {
        const partUser = await pb.collection('users').getOne(userId)
        partName = partUser.name || ''
        partEmail = partUser.email || ''
      } catch {
        /* intentionally ignored */
      }

      const invRecord = await pb.collection(INVITATIONS_COLLECTION).create({
        appointment_id: appointmentId,
        user_id: userId,
        user_name: partName,
        user_email: partEmail,
        invited_by_id: invitedBy.id,
        invited_by_name: invitedBy.name || invitedBy.email,
        empresa_id: empresaId || '',
        status: 'pendente',
      })

      // 1. Notificação in-app para o participante convidado
      await createInAppNotification({
        title: 'Novo convite de compromisso',
        message: `${invitedBy.name || 'Um colega'} convidou você para o compromisso: "${appointmentTitle}". Verifique sua agenda para aceitar ou recusar.`,
        recipient: userId,
        link: '/admin',
        type: 'agenda_reminder',
      })

      // 2. Auditoria do envio de convite
      await registerAuditLog({
        action: 'enviar_convite',
        module: 'agenda',
        target_collection: INVITATIONS_COLLECTION,
        target_id: invRecord.id,
        target_summary: `Enviou convite do compromisso "${appointmentTitle}" para o usuário ${partName || partEmail}`,
        new_value: {
          appointment_id: appointmentId,
          invited_user: partName || partEmail,
          status: 'pendente',
        },
        criticidade: 'Baixa',
      })
    } catch (err) {
      console.warn(`Erro ao convidar participante ${userId}:`, err)
    }
  }
}

/**
 * Busca convites existentes de um compromisso
 */
export async function fetchAppointmentInvitations(
  appointmentId: string,
): Promise<AgendaInvitation[]> {
  try {
    const records = await pb.collection(INVITATIONS_COLLECTION).getFullList({
      filter: `appointment_id = "${appointmentId}"`,
      sort: '-created',
      requestKey: null,
    })

    return records.map((r) => ({
      id: r.id,
      appointment_id: r.appointment_id,
      user_id: r.user_id,
      user_name: r.user_name,
      user_email: r.user_email,
      invited_by_id: r.invited_by_id,
      invited_by_name: r.invited_by_name,
      empresa_id: r.empresa_id,
      status: r.status as 'pendente' | 'aceito' | 'recusado',
      responded_at: r.responded_at,
      rejection_reason: r.rejection_reason,
      created: r.created,
      updated: r.updated,
    }))
  } catch (err) {
    console.warn('Erro ao carregar convites do compromisso:', err)
    return []
  }
}

/**
 * Aceitar convite: o compromisso permanece na agenda do participante como confirmado
 */
export async function acceptInvitation(invitationId: string): Promise<void> {
  const inv = await pb.collection(INVITATIONS_COLLECTION).getOne(invitationId)
  const nowIso = new Date().toISOString()

  await pb.collection(INVITATIONS_COLLECTION).update(invitationId, {
    status: 'aceito',
    responded_at: nowIso,
  })

  // Obtém detalhes do compromisso para a auditoria
  let apptTitle = 'Compromisso'
  try {
    const appt = await pb.collection(COLLECTION_NAME).getOne(inv.appointment_id)
    apptTitle = appt.title
  } catch {
    /* intentionally ignored */
  }

  // Auditoria do aceite
  await registerAuditLog({
    action: 'aceitar_convite',
    module: 'agenda',
    target_collection: INVITATIONS_COLLECTION,
    target_id: invitationId,
    target_summary: `Aceitou o convite para o compromisso: "${apptTitle}"`,
    previous_value: { status: inv.status },
    new_value: { status: 'aceito', responded_at: nowIso },
    criticidade: 'Baixa',
  })
}

/**
 * Recusar convite: o agendamento deverá ser identificado na cor vermelha e
 * encaminhado para a área específica "Convites Recusados"
 */
export async function rejectInvitation(
  invitationId: string,
  rejectionReason?: string,
): Promise<void> {
  const inv = await pb.collection(INVITATIONS_COLLECTION).getOne(invitationId)
  const nowIso = new Date().toISOString()

  await pb.collection(INVITATIONS_COLLECTION).update(invitationId, {
    status: 'recusado',
    responded_at: nowIso,
    rejection_reason: rejectionReason || '',
  })

  let apptTitle = 'Compromisso'
  try {
    const appt = await pb.collection(COLLECTION_NAME).getOne(inv.appointment_id)
    apptTitle = appt.title
  } catch {
    /* intentionally ignored */
  }

  // Auditoria da recusa
  await registerAuditLog({
    action: 'recusar_convite',
    module: 'agenda',
    target_collection: INVITATIONS_COLLECTION,
    target_id: invitationId,
    target_summary: `Recusou o convite para o compromisso: "${apptTitle}"${rejectionReason ? ` (Motivo: ${rejectionReason})` : ''}`,
    previous_value: { status: inv.status },
    new_value: {
      status: 'recusado',
      responded_at: nowIso,
      rejection_reason: rejectionReason || '',
    },
    criticidade: 'Baixa',
  })
}

/**
 * Busca todos os convites recusados do usuário atual (para a área Convites Recusados)
 */
export async function fetchRejectedInvitations(userId: string): Promise<AgendaInvitation[]> {
  if (!userId) return []

  try {
    const records = await pb.collection(INVITATIONS_COLLECTION).getFullList({
      filter: `user_id = "${userId}" && status = "recusado"`,
      sort: '-responded_at',
      requestKey: null,
    })

    const list: AgendaInvitation[] = []
    for (const r of records) {
      let appointment: AgendaAppointment | undefined = undefined
      try {
        const rawAppt = await pb.collection(COLLECTION_NAME).getOne(r.appointment_id)
        appointment = parseAppointmentRecord(rawAppt)
      } catch {
        /* intentionally ignored */
      }

      list.push({
        id: r.id,
        appointment_id: r.appointment_id,
        user_id: r.user_id,
        user_name: r.user_name,
        user_email: r.user_email,
        invited_by_id: r.invited_by_id,
        invited_by_name: r.invited_by_name,
        empresa_id: r.empresa_id,
        status: 'recusado',
        responded_at: r.responded_at,
        rejection_reason: r.rejection_reason,
        created: r.created,
        updated: r.updated,
        appointment,
      })
    }

    return list
  } catch (err) {
    console.error('Erro ao buscar convites recusados:', err)
    return []
  }
}

/**
 * Busca convites pendentes do usuário atual
 */
export async function fetchPendingInvitations(userId: string): Promise<AgendaInvitation[]> {
  if (!userId) return []

  try {
    const records = await pb.collection(INVITATIONS_COLLECTION).getFullList({
      filter: `user_id = "${userId}" && status = "pendente"`,
      sort: '-created',
      requestKey: null,
    })

    const list: AgendaInvitation[] = []
    for (const r of records) {
      let appointment: AgendaAppointment | undefined = undefined
      try {
        const rawAppt = await pb.collection(COLLECTION_NAME).getOne(r.appointment_id)
        appointment = parseAppointmentRecord(rawAppt)
      } catch {
        /* intentionally ignored */
      }

      list.push({
        id: r.id,
        appointment_id: r.appointment_id,
        user_id: r.user_id,
        user_name: r.user_name,
        user_email: r.user_email,
        invited_by_id: r.invited_by_id,
        invited_by_name: r.invited_by_name,
        empresa_id: r.empresa_id,
        status: 'pendente',
        responded_at: r.responded_at,
        created: r.created,
        updated: r.updated,
        appointment,
      })
    }

    return list
  } catch (err) {
    console.error('Erro ao buscar convites pendentes:', err)
    return []
  }
}
