import { useState, useMemo } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CheckCircle2, Clock, Calendar, Plus, Search, Filter, Check } from 'lucide-react'
import type {
  AgendaAppointment,
  AppointmentType,
  AppointmentPriority,
  AppointmentStatus,
} from '@/types/jetro-agenda'
import { TYPE_COLORS, PRIORITY_COLORS } from '@/types/jetro-agenda'
import { toggleAppointmentStatus } from '@/services/jetro-agenda'
import { toast } from '@/hooks/use-toast'

interface TasksListViewModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  appointments: AgendaAppointment[]
  initialViewMode?: 'all' | 'today' | 'upcoming'
  onSelectAppointment: (appointment: AgendaAppointment) => void
  onNewAppointment: () => void
  onRefresh: () => void
  todayDateStr: string
}

export function TasksListViewModal({
  open,
  onOpenChange,
  appointments,
  initialViewMode = 'all',
  onSelectAppointment,
  onNewAppointment,
  onRefresh,
  todayDateStr,
}: TasksListViewModalProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'today' | 'upcoming'>(initialViewMode)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<AppointmentType | 'all'>('all')
  const [filterPriority, setFilterPriority] = useState<AppointmentPriority | 'all'>('all')
  const [filterStatus, setFilterStatus] = useState<AppointmentStatus | 'all'>('all')

  const filteredList = useMemo(() => {
    return appointments.filter((appt) => {
      // Tab de tempo
      if (activeTab === 'today') {
        if (appt.date !== todayDateStr) return false
      } else if (activeTab === 'upcoming') {
        if (appt.date < todayDateStr) return false
      }

      // Filtro tipo
      if (filterType !== 'all' && appt.type !== filterType) return false
      // Filtro prioridade
      if (filterPriority !== 'all' && appt.priority !== filterPriority) return false
      // Filtro status
      if (filterStatus !== 'all' && appt.status !== filterStatus) return false

      // Busca texto
      if (searchTerm.trim()) {
        const s = searchTerm.toLowerCase()
        const t = (appt.title || '').toLowerCase()
        const d = (appt.description || '').toLowerCase()
        if (!t.includes(s) && !d.includes(s)) return false
      }

      return true
    })
  }, [appointments, activeTab, todayDateStr, filterType, filterPriority, filterStatus, searchTerm])

  const handleToggle = async (e: React.MouseEvent, appt: AgendaAppointment) => {
    e.stopPropagation()
    try {
      await toggleAppointmentStatus(appt)
      toast({
        title: appt.status === 'Concluido' ? 'Tarefa reaberta' : 'Tarefa concluída!',
        description: `Status atualizado com sucesso.`,
      })
      onRefresh()
    } catch {
      /* intentionally ignored */
    }
  }

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return ''
    const [y, m, d] = dateStr.split('-')
    return `${d}/${m}/${y}`
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
        {/* Cabeçalho */}
        <DialogHeader className="p-6 pb-4 border-b bg-gray-50/70 shrink-0">
          <div className="flex flex-wrap items-center justify-between gap-3 pr-6">
            <div>
              <DialogTitle className="text-xl font-black text-gray-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#005B2E]" />
                Central de Atividades & Tarefas
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Visão consolidada de compromissos, reuniões e lembretes da sua agenda
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => {
                onOpenChange(false)
                onNewAppointment()
              }}
              className="bg-[#005B2E] hover:bg-[#01361D] text-white text-xs font-bold h-8 px-3.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Novo Compromisso
            </Button>
          </div>

          {/* Abas Superiores */}
          <div className="flex items-center gap-1.5 pt-4">
            <button
              onClick={() => setActiveTab('all')}
              className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-[#005B2E] text-white shadow-2xs'
                  : 'bg-white hover:bg-gray-200/70 text-gray-700 border border-gray-200'
              }`}
            >
              Minhas Tarefas ({appointments.length})
            </button>
            <button
              onClick={() => setActiveTab('today')}
              className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                activeTab === 'today'
                  ? 'bg-[#005B2E] text-white shadow-2xs'
                  : 'bg-white hover:bg-gray-200/70 text-gray-700 border border-gray-200'
              }`}
            >
              Tarefas de Hoje ({appointments.filter((a) => a.date === todayDateStr).length})
            </button>
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                activeTab === 'upcoming'
                  ? 'bg-[#005B2E] text-white shadow-2xs'
                  : 'bg-white hover:bg-gray-200/70 text-gray-700 border border-gray-200'
              }`}
            >
              Próximos Compromissos ({appointments.filter((a) => a.date >= todayDateStr).length})
            </button>
          </div>
        </DialogHeader>

        {/* Barra de Filtros e Busca */}
        <div className="p-4 border-b bg-white flex flex-wrap items-center gap-2 shrink-0">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por título ou descrição..."
              className="text-xs pl-8.5 h-8 bg-gray-50 border-gray-200"
            />
          </div>

          <div className="flex items-center gap-2">
            <Select
              value={filterType}
              onValueChange={(v) => setFilterType(v as AppointmentType | 'all')}
            >
              <SelectTrigger className="h-8 text-xs border-gray-200 w-32">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Tipos</SelectItem>
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
              <SelectTrigger className="h-8 text-xs border-gray-200 w-32">
                <SelectValue placeholder="Prioridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas Prioridades</SelectItem>
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
              <SelectTrigger className="h-8 text-xs border-gray-200 w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos Status</SelectItem>
                <SelectItem value="Pendente">Pendente</SelectItem>
                <SelectItem value="Em andamento">Em andamento</SelectItem>
                <SelectItem value="Concluido">Concluído</SelectItem>
                <SelectItem value="Cancelado">Cancelado</SelectItem>
                <SelectItem value="Reagendado">Reagendado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Lista Rolável */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filteredList.map((appt) => {
            const isDone = appt.status === 'Concluido'
            const typeConfig = TYPE_COLORS[appt.type] || TYPE_COLORS.Outros
            const priorityConfig = PRIORITY_COLORS[appt.priority] || PRIORITY_COLORS.Media

            return (
              <div
                key={appt.id}
                onClick={() => {
                  onOpenChange(false)
                  onSelectAppointment(appt)
                }}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 group ${
                  isDone
                    ? 'bg-gray-50/80 border-gray-200 opacity-60'
                    : 'bg-white hover:bg-emerald-50/20 hover:border-[#005B2E]/60 border-gray-200 shadow-2xs hover:shadow-xs'
                }`}
              >
                {/* Checkbox de Concluir */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={(e) => handleToggle(e, appt)}
                    title={isDone ? 'Reabrir tarefa' : 'Concluir tarefa'}
                    className={`w-6 h-6 rounded-md border flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                      isDone
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-gray-300 hover:border-[#005B2E] text-transparent hover:text-gray-400'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-xs font-bold truncate ${
                          isDone
                            ? 'line-through text-gray-500'
                            : 'text-gray-900 group-hover:text-[#005B2E]'
                        }`}
                      >
                        {appt.title}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.2 rounded-full border ${typeConfig.bg} ${typeConfig.border}`}
                      >
                        {typeConfig.label}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-1.5 py-0.2 rounded border ${priorityConfig.badge}`}
                      >
                        {appt.priority}
                      </span>
                    </div>

                    {appt.description && (
                      <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">
                        {appt.description}
                      </p>
                    )}

                    <div className="flex items-center gap-3 text-[11px] text-gray-400 mt-1">
                      <span className="flex items-center gap-1 font-medium text-gray-600">
                        <Calendar className="w-3 h-3 text-[#005B2E]" />
                        {formatDisplayDate(appt.date)}
                      </span>
                      {appt.start_time && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[#C9A227]" />
                          {appt.start_time}
                          {appt.end_time ? ` - ${appt.end_time}` : ''}
                        </span>
                      )}
                      {appt.has_reminder && (
                        <span className="text-emerald-600 font-semibold text-[10px]">
                          🔔 Lembrete ativo
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status Badge com cores verde/vermelho/azul */}
                <div className="shrink-0 flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={`text-[10px] font-bold ${
                      isDone
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : appt.status === 'Cancelado' || appt.invitation_status === 'recusado'
                          ? 'bg-red-100 text-red-800 border-red-300'
                          : appt.status === 'Reagendado'
                            ? 'bg-blue-100 text-blue-800 border-blue-300'
                            : 'bg-gray-50 text-gray-600 border-gray-200'
                    }`}
                  >
                    {appt.invitation_status === 'recusado' ? 'Convite Recusado' : appt.status}
                  </Badge>
                </div>
              </div>
            )
          })}

          {filteredList.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <CheckCircle2 className="w-10 h-10 mx-auto text-gray-300 mb-2" />
              <p className="text-sm font-semibold text-gray-600">Nenhuma atividade encontrada</p>
              <p className="text-xs text-gray-400 mt-0.5">
                Altere os filtros acima ou crie um novo compromisso na sua agenda.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
