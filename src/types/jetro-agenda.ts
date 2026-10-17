export type AppointmentType = 'Tarefa' | 'Reuniao' | 'Compromisso' | 'Lembrete' | 'Outros'
export type AppointmentPriority = 'Baixa' | 'Media' | 'Alta' | 'Urgente'
export type AppointmentStatus = 'Pendente' | 'Em andamento' | 'Concluido' | 'Cancelado'
export type AppointmentRecurrence = 'none' | 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'yearly'

export interface AgendaAppointment {
  id: string
  user_id: string
  user_email?: string
  user_name?: string
  title: string
  description?: string
  date: string // YYYY-MM-DD
  start_time?: string // HH:mm
  end_time?: string // HH:mm
  type: AppointmentType
  priority: AppointmentPriority
  status: AppointmentStatus
  has_reminder: boolean
  reminder_configs?: string[] // ["15m", "30m", "1h", "2h", "6h", "12h", "1d", "2d", "1w", "custom:45m", etc.]
  reminder_target_email?: string
  recurrence?: AppointmentRecurrence
  recurrence_end_date?: string
  parent_appointment_id?: string
  is_completed?: boolean
  completed_at?: string
  reference_time_for_reminder?: string
  created?: string
  updated?: string
}

export interface AgendaFilterOptions {
  type?: AppointmentType | 'all'
  priority?: AppointmentPriority | 'all'
  status?: AppointmentStatus | 'all'
  dateFrom?: string
  dateTo?: string
  search?: string
}

export interface CreateAppointmentInput {
  title: string
  description?: string
  date: string
  start_time?: string
  end_time?: string
  type: AppointmentType
  priority: AppointmentPriority
  status: AppointmentStatus
  has_reminder: boolean
  reminder_configs?: string[]
  reminder_target_email?: string
  recurrence?: AppointmentRecurrence
  recurrence_end_date?: string
  reference_time_for_reminder?: string
}

export interface UpdateAppointmentInput extends Partial<CreateAppointmentInput> {
  id: string
  is_completed?: boolean
  completed_at?: string
}

export const REMINDER_PRESET_OPTIONS = [
  { value: '15m', label: '15 minutos antes' },
  { value: '30m', label: '30 minutos antes' },
  { value: '1h', label: '1 hora antes' },
  { value: '2h', label: '2 horas antes' },
  { value: '6h', label: '6 horas antes' },
  { value: '12h', label: '12 horas antes' },
  { value: '1d', label: '1 dia antes' },
  { value: '2d', label: '2 dias antes' },
  { value: '1w', label: '1 semana antes' },
] as const

/**
 * Cores temáticas por categoria conforme regra de negócio:
 * Tarefas azul; Reuniões roxo; Compromissos dourado; Lembretes verde; Urgentes vermelho.
 */
export const TYPE_COLORS: Record<
  AppointmentType,
  { bg: string; text: string; border: string; dot: string; label: string }
> = {
  Tarefa: {
    bg: 'bg-blue-50 text-blue-800 hover:bg-blue-100',
    text: 'text-blue-700',
    border: 'border-blue-200',
    dot: 'bg-blue-500',
    label: 'Tarefa',
  },
  Reuniao: {
    bg: 'bg-purple-50 text-purple-800 hover:bg-purple-100',
    text: 'text-purple-700',
    border: 'border-purple-200',
    dot: 'bg-purple-500',
    label: 'Reunião',
  },
  Compromisso: {
    bg: 'bg-amber-50 text-amber-900 hover:bg-amber-100',
    text: 'text-[#9A7B1C]',
    border: 'border-[#C9A227]/40',
    dot: 'bg-[#C9A227]',
    label: 'Compromisso',
  },
  Lembrete: {
    bg: 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100',
    text: 'text-[#005B2E]',
    border: 'border-emerald-200',
    dot: 'bg-[#005B2E]',
    label: 'Lembrete',
  },
  Outros: {
    bg: 'bg-gray-50 text-gray-800 hover:bg-gray-100',
    text: 'text-gray-700',
    border: 'border-gray-200',
    dot: 'bg-gray-500',
    label: 'Outros',
  },
}

export const PRIORITY_COLORS: Record<
  AppointmentPriority,
  { badge: string; text: string; bg: string }
> = {
  Baixa: {
    badge: 'bg-gray-100 text-gray-700 border-gray-200',
    text: 'text-gray-600',
    bg: 'bg-gray-50',
  },
  Media: {
    badge: 'bg-blue-100 text-blue-800 border-blue-200',
    text: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  Alta: {
    badge: 'bg-amber-100 text-amber-800 border-amber-200',
    text: 'text-amber-600',
    bg: 'bg-amber-50',
  },
  Urgente: {
    badge: 'bg-red-100 text-red-800 border-red-200 animate-pulse',
    text: 'text-red-600',
    bg: 'bg-red-50',
  },
}
