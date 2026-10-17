import { useState, useMemo, useEffect, useCallback } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Plus,
  ListTodo,
  CheckCircle2,
  Clock,
  Sparkles,
  Filter,
  RefreshCw,
  Bell,
  MapPin,
  Flag,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import type {
  AgendaAppointment,
  AppointmentType,
  AppointmentPriority,
  AppointmentStatus,
} from '@/types/jetro-agenda'
import { TYPE_COLORS, PRIORITY_COLORS } from '@/types/jetro-agenda'
import {
  getBrazilianHolidays,
  getHolidaysMapForYear,
  getBrasiliaDate,
  getBrasiliaYearMonth,
  formatHolidayDescription,
  BrazilianHoliday,
} from '@/services/holidays'
import { fetchUserAppointments, toggleAppointmentStatus } from '@/services/jetro-agenda'
import { AppointmentModal } from './appointment-modal'
import { TasksListViewModal } from './tasks-list-view-modal'
import { toast } from '@/hooks/use-toast'

interface JetroCalendarProps {
  currentUser?: {
    id: string
    email: string
    name?: string
  }
}

const MONTH_NAMES_PT = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
]

const WEEKDAYS_PT = [
  { short: 'Dom', full: 'Domingo', isWeekend: true },
  { short: 'Seg', full: 'Segunda-feira', isWeekend: false },
  { short: 'Ter', full: 'Terça-feira', isWeekend: false },
  { short: 'Qua', full: 'Quarta-feira', isWeekend: false },
  { short: 'Qui', full: 'Quinta-feira', isWeekend: false },
  { short: 'Sex', full: 'Sexta-feira', isWeekend: false },
  { short: 'Sáb', full: 'Sábado', isWeekend: true },
]

export function JetroCalendar({ currentUser }: JetroCalendarProps) {
  // Inicializa ano/mês pelo horário de Brasília
  const brasiliaCurrent = useMemo(() => getBrasiliaYearMonth(), [])

  const [currentYear, setCurrentYear] = useState<number>(brasiliaCurrent.year)
  const [currentMonth, setCurrentMonth] = useState<number>(brasiliaCurrent.month) // 0..11

  // Estado de compromissos
  const [appointments, setAppointments] = useState<AgendaAppointment[]>([])
  const [loading, setLoading] = useState(false)

  // Filtros rápidos
  const [filterType, setFilterType] = useState<AppointmentType | 'all'>('all')
  const [filterPriority, setFilterPriority] = useState<AppointmentPriority | 'all'>('all')
  const [filterStatus, setFilterStatus] = useState<AppointmentStatus | 'all'>('all')

  // Modais
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedDateForNew, setSelectedDateForNew] = useState<string>('')
  const [appointmentToEdit, setAppointmentToEdit] = useState<AgendaAppointment | null>(null)

  // Modal de Lista de Tarefas
  const [isListViewOpen, setIsListViewOpen] = useState(false)
  const [listViewInitialTab, setListViewInitialTab] = useState<'all' | 'today' | 'upcoming'>('all')

  // Modal de visualização "Ver mais" de um dia específico
  const [dayDetailsDate, setDayDetailsDate] = useState<string | null>(null)

  // Data atual de Brasília formatada YYYY-MM-DD
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`)
  const todayDateStr = `${brasiliaCurrent.year}-${pad(brasiliaCurrent.month + 1)}-${pad(brasiliaCurrent.day)}`

  // Usuário padrão de fallback caso não esteja logado
  const activeUser = currentUser || {
    id: 'guest',
    email: 'admin@jetro.com.br',
    name: 'Administrador Jetro',
  }

  // Carrega compromissos do usuário
  const loadAppointments = useCallback(async () => {
    if (!activeUser.id) return
    setLoading(true)
    try {
      const data = await fetchUserAppointments(activeUser.id)
      setAppointments(data)
    } catch (err) {
      console.error('Erro ao carregar compromissos:', err)
    } finally {
      setLoading(false)
    }
  }, [activeUser.id])

  useEffect(() => {
    loadAppointments()
  }, [loadAppointments])

  // Monitora mudança automática de mês com base no fuso de Brasília a cada minuto
  useEffect(() => {
    const timer = setInterval(() => {
      const live = getBrasiliaYearMonth()
      // Se virou o mês e o usuário estava vendo o mês que era atual antes, podemos sincronizar
      if (live.year !== brasiliaCurrent.year || live.month !== brasiliaCurrent.month) {
        // Virada detectada
      }
    }, 60000)
    return () => clearInterval(timer)
  }, [brasiliaCurrent])

  // Feriados do ano selecionado
  const holidaysMap = useMemo(() => {
    return getHolidaysMapForYear(currentYear)
  }, [currentYear])

  // Navegação
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear((y) => y - 1)
    } else {
      setCurrentMonth((m) => m - 1)
    }
  }

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear((y) => y + 1)
    } else {
      setCurrentMonth((m) => m + 1)
    }
  }

  const handleGoToday = () => {
    const live = getBrasiliaYearMonth()
    setCurrentYear(live.year)
    setCurrentMonth(live.month)
  }

  // Cálculo da grade do calendário (domingo a sábado)
  const calendarGrid = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1)
    const startingDayOfWeek = firstDayOfMonth.getDay() // 0 = Domingo, 6 = Sábado
    const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate()

    const cells: Array<{
      dateStr: string
      dayNumber: number
      isCurrentMonth: boolean
      isToday: boolean
      isWeekend: boolean
      holiday?: BrazilianHoliday
      appointments: AgendaAppointment[]
    }> = []

    // Dias do mês anterior para completar o início da semana
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i
      const prevMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear
      const prevMonthNum = currentMonth === 0 ? 12 : currentMonth
      const dStr = `${prevMonthYear}-${pad(prevMonthNum)}-${pad(dayNum)}`
      const dow = new Date(prevMonthYear, prevMonthNum - 1, dayNum).getDay()
      cells.push({
        dateStr: dStr,
        dayNumber: dayNum,
        isCurrentMonth: false,
        isToday: dStr === todayDateStr,
        isWeekend: dow === 0 || dow === 6,
        holiday: holidaysMap.get(dStr),
        appointments: [],
      })
    }

    // Dias do mês atual
    for (let dayNum = 1; dayNum <= daysInCurrentMonth; dayNum++) {
      const dStr = `${currentYear}-${pad(currentMonth + 1)}-${pad(dayNum)}`
      const dow = new Date(currentYear, currentMonth, dayNum).getDay()
      cells.push({
        dateStr: dStr,
        dayNumber: dayNum,
        isCurrentMonth: true,
        isToday: dStr === todayDateStr,
        isWeekend: dow === 0 || dow === 6,
        holiday: holidaysMap.get(dStr),
        appointments: [],
      })
    }

    // Dias do próximo mês para completar 35 ou 42 células (múltiplo de 7)
    const remaining = 7 - (cells.length % 7)
    if (remaining < 7) {
      for (let nextDay = 1; nextDay <= remaining; nextDay++) {
        const nextMonthYear = currentMonth === 11 ? currentYear + 1 : currentYear
        const nextMonthNum = currentMonth === 11 ? 1 : currentMonth + 2
        const dStr = `${nextMonthYear}-${pad(nextMonthNum)}-${pad(nextDay)}`
        const dow = new Date(nextMonthYear, nextMonthNum - 1, nextDay).getDay()
        cells.push({
          dateStr: dStr,
          dayNumber: nextDay,
          isCurrentMonth: false,
          isToday: dStr === todayDateStr,
          isWeekend: dow === 0 || dow === 6,
          holiday: holidaysMap.get(dStr),
          appointments: [],
        })
      }
    }

    // Vincula compromissos filtrados às células
    const apptMap = new Map<string, AgendaAppointment[]>()
    for (const appt of appointments) {
      if (filterType !== 'all' && appt.type !== filterType) continue
      if (filterPriority !== 'all' && appt.priority !== filterPriority) continue
      if (filterStatus !== 'all' && appt.status !== filterStatus) continue

      const list = apptMap.get(appt.date) || []
      list.push(appt)
      apptMap.set(appt.date, list)
    }

    for (const cell of cells) {
      cell.appointments = apptMap.get(cell.dateStr) || []
    }

    return cells
  }, [
    currentYear,
    currentMonth,
    todayDateStr,
    holidaysMap,
    appointments,
    filterType,
    filterPriority,
    filterStatus,
  ])

  // Abertura do modal para novo compromisso
  const handleOpenNewAppointment = (dateToUse?: string) => {
    setSelectedDateForNew(dateToUse || todayDateStr)
    setAppointmentToEdit(null)
    setIsModalOpen(true)
  }

  // Abertura do modal para editar compromisso existente
  const handleEditAppointment = (appt: AgendaAppointment, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    setAppointmentToEdit(appt)
    setIsModalOpen(true)
  }

  // Marcar como concluído diretamente
  const handleToggleCompleted = async (appt: AgendaAppointment, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await toggleAppointmentStatus(appt)
      toast({
        title: appt.status === 'Concluido' ? 'Tarefa reaberta' : 'Tarefa concluída!',
        description: `${appt.title} atualizada.`,
      })
      loadAppointments()
    } catch {
      /* intentionally ignored */
    }
  }

  // Feriados do mês atual para listagem informativa
  const currentMonthHolidays = useMemo(() => {
    const list = getBrazilianHolidays(currentYear)
    return list.filter((h) => h.month === currentMonth + 1)
  }, [currentYear, currentMonth])

  return (
    <div className="w-full bg-white rounded-2xl border border-gray-200/90 shadow-sm overflow-hidden my-6">
      <TooltipProvider>
        {/* ==================================================================== */}
        {/* CABEÇALHO DO CALENDÁRIO / AGENDA JETRO */}
        {/* ==================================================================== */}
        <div className="p-4 sm:p-6 border-b border-gray-200 bg-linear-to-r from-emerald-950/5 via-white to-amber-950/5">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Título e Mês/Ano em Destaque */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-linear-to-br from-[#005B2E] to-[#01361D] flex items-center justify-center text-white shadow-md shadow-emerald-900/10 shrink-0">
                <CalendarIcon className="w-6 h-6 text-[#C9A227]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                    {MONTH_NAMES_PT[currentMonth]} {currentYear}
                  </h2>
                  <Badge className="bg-[#005B2E] text-white text-[10px] uppercase font-bold tracking-wider px-2 py-0.5">
                    Agenda Jetro
                  </Badge>
                </div>
                <p className="text-xs text-gray-500 font-medium flex items-center gap-1.5 mt-0.5">
                  <Clock className="w-3.5 h-3.5 text-[#C9A227]" />
                  Horário Oficial de Brasília (America/Sao_Paulo) • Feriados Nacionais Oficiais
                </p>
              </div>
            </div>

            {/* Ações e Navegação */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Botões de Navegação */}
              <div className="flex items-center bg-gray-100 rounded-lg p-0.5 border border-gray-200">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePrevMonth}
                  title="Mês anterior"
                  className="h-8 w-8 p-0 text-gray-700 hover:text-gray-900 hover:bg-white rounded-md"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleGoToday}
                  className="h-8 px-3 text-xs font-bold text-gray-700 hover:text-[#005B2E] hover:bg-white rounded-md"
                >
                  Hoje
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleNextMonth}
                  title="Próximo mês"
                  className="h-8 w-8 p-0 text-gray-700 hover:text-gray-900 hover:bg-white rounded-md"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              {/* Botão Minhas Tarefas / Visões */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setListViewInitialTab('all')
                  setIsListViewOpen(true)
                }}
                className="h-8 text-xs font-bold border-gray-300 text-gray-700 hover:text-[#005B2E] hover:border-[#005B2E]"
              >
                <ListTodo className="w-3.5 h-3.5 mr-1.5 text-[#005B2E]" />
                Minhas Tarefas ({appointments.length})
              </Button>

              {/* Botão Novo Compromisso */}
              <Button
                size="sm"
                onClick={() => handleOpenNewAppointment(todayDateStr)}
                className="h-8 text-xs font-bold bg-[#005B2E] hover:bg-[#01361D] text-white shadow-xs px-3.5"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Novo Compromisso
              </Button>
            </div>
          </div>

          {/* Barra de Filtros e Legenda de Categorias */}
          <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            {/* Legenda de Categorias com cores corporativas */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-gray-400 font-bold text-[11px] uppercase tracking-wider mr-1">
                Categorias:
              </span>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 border border-blue-200 text-[11px] font-semibold">
                <span className="w-2 h-2 rounded-full bg-blue-500" /> Tarefas
              </span>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-purple-50 text-purple-800 border border-purple-200 text-[11px] font-semibold">
                <span className="w-2 h-2 rounded-full bg-purple-500" /> Reuniões
              </span>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-[#C9A227]/40 text-[11px] font-semibold">
                <span className="w-2 h-2 rounded-full bg-[#C9A227]" /> Compromissos
              </span>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-50 text-[#005B2E] border border-emerald-200 text-[11px] font-semibold">
                <span className="w-2 h-2 rounded-full bg-[#005B2E]" /> Lembretes
              </span>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-red-50 text-red-700 border border-red-200 text-[11px] font-semibold">
                <span className="w-2 h-2 rounded-full bg-red-500" /> Urgentes
              </span>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-rose-50 text-rose-800 border border-rose-200 text-[11px] font-semibold">
                <Flag className="w-2.5 h-2.5 text-rose-600" /> Feriados Nacionais
              </span>
            </div>

            {/* Filtros Dropdown Rápidos */}
            <div className="flex items-center gap-2">
              <Select
                value={filterType}
                onValueChange={(v) => setFilterType(v as AppointmentType | 'all')}
              >
                <SelectTrigger className="h-7 text-xs border-gray-200 w-28 bg-white">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos Tipos</SelectItem>
                  <SelectItem value="Tarefa">Tarefa</SelectItem>
                  <SelectItem value="Reuniao">Reunião</SelectItem>
                  <SelectItem value="Compromisso">Compromisso</SelectItem>
                  <SelectItem value="Lembrete">Lembrete</SelectItem>
                  <SelectItem value="Outros">Outros</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filterPriority}
                onValueChange={(v) => setFilterPriority(v as AppointmentPriority | 'all')}
              >
                <SelectTrigger className="h-7 text-xs border-gray-200 w-28 bg-white">
                  <SelectValue placeholder="Prioridade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas Prior.</SelectItem>
                  <SelectItem value="Baixa">Baixa</SelectItem>
                  <SelectItem value="Media">Média</SelectItem>
                  <SelectItem value="Alta">Alta</SelectItem>
                  <SelectItem value="Urgente">Urgente</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filterStatus}
                onValueChange={(v) => setFilterStatus(v as AppointmentStatus | 'all')}
              >
                <SelectTrigger className="h-7 text-xs border-gray-200 w-28 bg-white">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos Status</SelectItem>
                  <SelectItem value="Pendente">Pendente</SelectItem>
                  <SelectItem value="Em andamento">Em andamento</SelectItem>
                  <SelectItem value="Concluido">Concluído</SelectItem>
                  <SelectItem value="Cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="ghost"
                size="sm"
                onClick={loadAppointments}
                title="Recarregar agenda"
                className="h-7 w-7 p-0 text-gray-500 hover:text-[#005B2E]"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </div>

        {/* ==================================================================== */}
        {/* GRADE DO CALENDÁRIO MENSAL (DOMINGO A SÁBADO, LARGURA TOTAL) */}
        {/* ==================================================================== */}
        <div className="w-full">
          {/* Cabeçalho dos Dias da Semana */}
          <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50/80 text-center font-bold text-xs uppercase tracking-wider text-gray-600">
            {WEEKDAYS_PT.map((day) => (
              <div
                key={day.full}
                className={`py-3 px-1 border-r last:border-r-0 border-gray-200/80 ${
                  day.isWeekend ? 'bg-amber-50/40 text-[#9A7B1C]' : 'text-gray-700'
                }`}
              >
                <span className="hidden sm:inline">{day.full}</span>
                <span className="sm:hidden">{day.short}</span>
              </div>
            ))}
          </div>

          {/* Grade dos Dias */}
          <div className="grid grid-cols-7 auto-rows-fr bg-gray-200 gap-px">
            {calendarGrid.map((cell) => {
              const maxVisible = 2
              const visibleAppts = cell.appointments.slice(0, maxVisible)
              const remainingCount = cell.appointments.length - maxVisible

              return (
                <div
                  key={cell.dateStr}
                  onClick={() => handleOpenNewAppointment(cell.dateStr)}
                  className={`min-h-[110px] sm:min-h-[135px] p-1.5 sm:p-2 bg-white flex flex-col justify-between transition-all cursor-pointer group hover:bg-emerald-50/30 ${
                    !cell.isCurrentMonth ? 'bg-gray-50/60 text-gray-400 opacity-60' : ''
                  } ${cell.isWeekend && cell.isCurrentMonth ? 'bg-slate-50/50' : ''} ${
                    cell.isToday ? 'ring-2 ring-inset ring-[#005B2E] bg-emerald-50/20' : ''
                  }`}
                >
                  {/* Cabeçalho da Célula: Número do Dia + Indicadores */}
                  <div className="flex items-start justify-between gap-1 mb-1">
                    <div className="flex items-center gap-1">
                      <span
                        className={`text-xs sm:text-sm font-bold flex items-center justify-center rounded-full transition-transform ${
                          cell.isToday
                            ? 'w-6 h-6 sm:w-7 sm:h-7 bg-[#005B2E] text-white shadow-xs font-black'
                            : cell.isCurrentMonth
                              ? 'text-gray-800 group-hover:scale-110'
                              : 'text-gray-400'
                        }`}
                      >
                        {cell.dayNumber}
                      </span>
                      {cell.isToday && (
                        <span className="hidden md:inline text-[9px] font-bold text-[#005B2E] uppercase tracking-wide">
                          Hoje
                        </span>
                      )}
                    </div>

                    {/* Botão de Adicionar rápido visível no hover */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleOpenNewAppointment(cell.dateStr)
                      }}
                      className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-[#005B2E] hover:text-white text-gray-400 transition-opacity cursor-pointer"
                      title="Adicionar compromisso neste dia"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Feriado Nacional em Destaque */}
                  {cell.holiday && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="mb-1 px-1.5 py-0.5 rounded bg-rose-50 border border-rose-200 text-rose-800 text-[10px] font-bold truncate flex items-center gap-1 shadow-2xs cursor-default"
                        >
                          <Flag className="w-2.5 h-2.5 text-rose-600 shrink-0" />
                          <span className="truncate">{cell.holiday.name}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent
                        side="top"
                        className="bg-gray-900 text-white text-xs max-w-xs"
                      >
                        <p className="font-bold text-rose-300">Feriado Nacional Oficial</p>
                        <p>{formatHolidayDescription(cell.holiday)}</p>
                      </TooltipContent>
                    </Tooltip>
                  )}

                  {/* Lista de Atividades do Dia */}
                  <div className="space-y-1 flex-1 overflow-hidden">
                    {visibleAppts.map((appt) => {
                      const typeConfig = TYPE_COLORS[appt.type] || TYPE_COLORS.Outros
                      const isDone = appt.status === 'Concluido'
                      const isUrgent = appt.priority === 'Urgente'

                      return (
                        <div
                          key={appt.id}
                          onClick={(e) => handleEditAppointment(appt, e)}
                          title={`${appt.start_time ? appt.start_time + ' - ' : ''}${appt.title}`}
                          className={`text-[10px] sm:text-[11px] px-1.5 py-0.5 rounded border transition-all flex items-center justify-between gap-1 shadow-2xs cursor-pointer ${
                            isDone
                              ? 'bg-gray-100 text-gray-500 border-gray-200 line-through opacity-70'
                              : isUrgent
                                ? 'bg-red-50 text-red-900 border-red-300 font-bold hover:bg-red-100'
                                : `${typeConfig.bg} ${typeConfig.border} font-medium`
                          }`}
                        >
                          <div className="flex items-center gap-1 truncate min-w-0">
                            <span
                              className={`w-1.5 h-1.5 rounded-full shrink-0 ${isUrgent ? 'bg-red-500' : typeConfig.dot}`}
                            />
                            {appt.start_time && (
                              <span className="text-[9px] font-bold opacity-80 shrink-0">
                                {appt.start_time}
                              </span>
                            )}
                            <span className="truncate font-semibold">{appt.title}</span>
                          </div>

                          <div className="flex items-center gap-0.5 shrink-0">
                            {appt.has_reminder && <Bell className="w-2.5 h-2.5 text-[#C9A227]" />}
                            <button
                              type="button"
                              onClick={(e) => handleToggleCompleted(appt, e)}
                              title={isDone ? 'Reabrir' : 'Concluir'}
                              className="opacity-0 group-hover:opacity-100 hover:text-emerald-700 cursor-pointer"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      )
                    })}

                    {/* Botão "Ver mais" quando há muitas atividades no dia */}
                    {remainingCount > 0 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setDayDetailsDate(cell.dateStr)
                        }}
                        className="w-full text-center text-[10px] font-bold text-[#005B2E] hover:text-[#01361D] bg-emerald-50/80 hover:bg-emerald-100/80 rounded py-0.5 transition-colors cursor-pointer"
                      >
                        + Ver mais ({remainingCount})
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Rodapé Informativo dos Feriados do Mês */}
        {currentMonthHolidays.length > 0 && (
          <div className="p-4 bg-gray-50/60 border-t border-gray-200 flex flex-wrap items-center gap-2 text-xs">
            <span className="font-bold text-gray-700 flex items-center gap-1">
              <Flag className="w-3.5 h-3.5 text-rose-600" />
              Feriados em {MONTH_NAMES_PT[currentMonth]}:
            </span>
            {currentMonthHolidays.map((h) => (
              <span
                key={h.date}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border border-rose-200 text-rose-900 font-medium text-[11px] shadow-2xs"
              >
                <strong className="text-rose-700">Dia {h.day}:</strong> {h.name}
              </span>
            ))}
          </div>
        )}
      </TooltipProvider>

      {/* ==================================================================== */}
      {/* MODAL DE CADASTRO / EDIÇÃO DE COMPROMISSO */}
      {/* ==================================================================== */}
      <AppointmentModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        initialDate={selectedDateForNew}
        appointmentToEdit={appointmentToEdit}
        currentUser={activeUser}
        onSaved={loadAppointments}
      />

      {/* ==================================================================== */}
      {/* MODAL DE LISTA DE TAREFAS / VISÕES */}
      {/* ==================================================================== */}
      <TasksListViewModal
        open={isListViewOpen}
        onOpenChange={setIsListViewOpen}
        appointments={appointments}
        initialViewMode={listViewInitialTab}
        onSelectAppointment={(appt) => {
          setAppointmentToEdit(appt)
          setIsModalOpen(true)
        }}
        onNewAppointment={() => handleOpenNewAppointment(todayDateStr)}
        onRefresh={loadAppointments}
        todayDateStr={todayDateStr}
      />

      {/* ==================================================================== */}
      {/* MODAL "VER MAIS" DE UM DIA ESPECÍFICO */}
      {/* ==================================================================== */}
      {dayDetailsDate && (
        <TasksListViewModal
          open={!!dayDetailsDate}
          onOpenChange={(op) => !op && setDayDetailsDate(null)}
          appointments={appointments.filter((a) => a.date === dayDetailsDate)}
          initialViewMode="all"
          onSelectAppointment={(appt) => {
            setDayDetailsDate(null)
            setAppointmentToEdit(appt)
            setIsModalOpen(true)
          }}
          onNewAppointment={() => {
            const d = dayDetailsDate
            setDayDetailsDate(null)
            handleOpenNewAppointment(d)
          }}
          onRefresh={loadAppointments}
          todayDateStr={todayDateStr}
        />
      )}
    </div>
  )
}
