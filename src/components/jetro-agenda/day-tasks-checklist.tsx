import { useState } from 'react'
import {
  CheckCircle2,
  XCircle,
  CalendarClock,
  Clock,
  AlertCircle,
  Check,
  X,
  Calendar,
  Sparkles,
  ArrowRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/hooks/use-toast'
import type { AgendaAppointment } from '@/types/jetro-agenda'
import { concludeTask, cancelTask, rescheduleTask } from '@/services/jetro-agenda'

interface DayTasksChecklistProps {
  selectedDate: string
  appointments?: AgendaAppointment[]
  currentUser?: {
    id: string
    email: string
    name?: string
  }
  onRefresh?: () => void
  onOpenAppointmentModal?: (dateStr: string) => void
  onEditAppointment?: (appt: AgendaAppointment) => void
  onAddNewTask?: () => void
  onOpenRejectedInvitations?: () => void
}

export function DayTasksChecklist({
  selectedDate,
  appointments = [],
  currentUser,
  onRefresh,
  onOpenAppointmentModal,
  onEditAppointment,
  onAddNewTask,
  onOpenRejectedInvitations,
}: DayTasksChecklistProps) {
  // Filtra as tarefas e compromissos agendados para o dia selecionado
  const dayTasks = appointments.filter((a) => a.date === selectedDate)

  // Estado para o modal de Reagendar / Reprogramar
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false)
  const [taskToReschedule, setTaskToReschedule] = useState<AgendaAppointment | null>(null)
  const [newDate, setNewDate] = useState('')
  const [newStartTime, setNewStartTime] = useState('')
  const [newEndTime, setNewEndTime] = useState('')
  const [submittingAction, setSubmittingAction] = useState(false)

  // Formata o dia para exibição amigável
  const formatFriendlyDate = (dateStr: string) => {
    if (!dateStr) return ''
    try {
      const parts = dateStr.split('-')
      if (parts.length === 3) {
        const [year, month, day] = parts
        const dateObj = new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10))
        return dateObj.toLocaleDateString('pt-BR', {
          weekday: 'long',
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        })
      }
    } catch {
      /* intentionally ignored */
    }
    return dateStr
  }

  // Ação 1: Concluído (identificada na cor verde)
  const handleConclude = async (task: AgendaAppointment, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    setSubmittingAction(true)
    try {
      await concludeTask(task)
      toast({
        title: 'Tarefa concluída com sucesso',
        description: `"${task.title}" finalizada e identificada na cor verde.`,
      })
      onRefresh?.()
    } catch (err) {
      console.error('Erro ao concluir tarefa:', err)
      toast({
        title: 'Erro ao concluir tarefa',
        description: 'Não foi possível finalizar a tarefa.',
        variant: 'destructive',
      })
    } finally {
      setSubmittingAction(false)
    }
  }

  // Ação 2: Cancelado (identificada na cor vermelha)
  const handleCancel = async (task: AgendaAppointment, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    setSubmittingAction(true)
    try {
      await cancelTask(task)
      toast({
        title: 'Tarefa cancelada',
        description: `"${task.title}" finalizada e identificada na cor vermelha.`,
        variant: 'destructive',
      })
      onRefresh?.()
    } catch (err) {
      console.error('Erro ao cancelar tarefa:', err)
      toast({
        title: 'Erro ao cancelar tarefa',
        description: 'Não foi possível cancelar a tarefa.',
        variant: 'destructive',
      })
    } finally {
      setSubmittingAction(false)
    }
  }

  // Ação 3: Reprogramar / Reagendar (identificada na cor azul)
  const handleOpenReschedule = (task: AgendaAppointment, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    setTaskToReschedule(task)
    setNewDate(task.date || selectedDate)
    setNewStartTime(task.start_time || '09:00')
    setNewEndTime(task.end_time || '')
    setRescheduleModalOpen(true)
  }

  const handleConfirmReschedule = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!taskToReschedule || !newDate) {
      toast({
        title: 'Nova data obrigatória',
        description: 'Selecione uma data para reagendar a tarefa.',
        variant: 'destructive',
      })
      return
    }

    setSubmittingAction(true)
    try {
      await rescheduleTask(taskToReschedule, newDate, newStartTime, newEndTime)
      toast({
        title: 'Tarefa reagendada com sucesso',
        description: `"${taskToReschedule.title}" reagendada para ${newDate} e identificada na cor azul.`,
      })
      setRescheduleModalOpen(false)
      setTaskToReschedule(null)
      onRefresh?.()
    } catch (err) {
      console.error('Erro ao reagendar tarefa:', err)
      toast({
        title: 'Erro ao reagendar tarefa',
        description: 'Não foi possível reprogramar a tarefa.',
        variant: 'destructive',
      })
    } finally {
      setSubmittingAction(false)
    }
  }

  // Helper de estilização conforme status especificado pelo usuário:
  // - Concluído: identificado na cor verde
  // - Cancelado: identificado na cor vermelha
  // - Reagendado: identificado na cor azul
  const getTaskVisualState = (task: AgendaAppointment) => {
    if (task.status === 'Concluido') {
      return {
        badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        cardBg: 'bg-emerald-50/70 border-emerald-300 hover:bg-emerald-50',
        textColor: 'text-emerald-950',
        dotColor: 'bg-emerald-600',
        label: 'Concluído (Verde)',
        isDone: true,
      }
    }
    if (task.status === 'Cancelado') {
      return {
        badgeBg: 'bg-red-100 text-red-800 border-red-300',
        cardBg: 'bg-red-50/70 border-red-300 hover:bg-red-50',
        textColor: 'text-red-950',
        dotColor: 'bg-red-600',
        label: 'Cancelado (Vermelho)',
        isDone: true,
      }
    }
    if (task.status === 'Reagendado') {
      return {
        badgeBg: 'bg-blue-100 text-blue-800 border-blue-300',
        cardBg: 'bg-blue-50/70 border-blue-300 hover:bg-blue-50',
        textColor: 'text-blue-950',
        dotColor: 'bg-blue-600',
        label: 'Reagendado (Azul)',
        isDone: false,
      }
    }
    return {
      badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
      cardBg: 'bg-white border-gray-200 hover:border-gray-300',
      textColor: 'text-gray-900',
      dotColor: 'bg-amber-500',
      label: task.status || 'Pendente',
      isDone: false,
    }
  }

  return (
    <div className="border-t border-gray-200 bg-gray-50/60 p-4 sm:p-5">
      {/* Cabeçalho do checklist do dia */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm sm:text-base font-extrabold text-gray-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#005B2E]" />
              Checklist de Tarefas do Dia:
              <span className="capitalize text-[#005B2E] font-black">
                {formatFriendlyDate(selectedDate)}
              </span>
            </h3>
            <Badge variant="outline" className="bg-white border-gray-300 text-xs font-bold">
              {dayTasks.length} {dayTasks.length === 1 ? 'tarefa' : 'tarefas'}
            </Badge>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Gerencie as tarefas do dia selecionado com ações rápidas de{' '}
            <strong className="text-emerald-700">Conclusão (Verde)</strong>,{' '}
            <strong className="text-red-700">Cancelamento (Vermelho)</strong> e{' '}
            <strong className="text-blue-700">Reprogramação (Azul)</strong> com auditoria integrada.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {onOpenRejectedInvitations && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onOpenRejectedInvitations}
              className="h-8 text-xs font-bold border-red-200 text-red-700 hover:bg-red-50 hover:text-red-900 shadow-2xs"
            >
              <X className="w-3.5 h-3.5 mr-1" />
              Convites Recusados
            </Button>
          )}
          <Button
            type="button"
            size="sm"
            onClick={() => {
              if (onAddNewTask) {
                onAddNewTask()
              } else if (onOpenAppointmentModal) {
                onOpenAppointmentModal(selectedDate)
              }
            }}
            className="h-8 text-xs font-bold bg-[#005B2E] hover:bg-[#01361D] text-white shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1" />
            Agendar Tarefa neste Dia
          </Button>
        </div>
      </div>

      {/* Lista de tarefas ou estado vazio */}
      {dayTasks.length === 0 ? (
        <div className="p-6 text-center rounded-xl bg-white border border-dashed border-gray-300">
          <CalendarClock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-xs font-bold text-gray-700">
            Nenhuma tarefa agendada para {formatFriendlyDate(selectedDate)}.
          </p>
          <p className="text-[11px] text-gray-500 mt-0.5">
            Clique no botão acima ou selecione outro dia no calendário para visualizar as tarefas.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {dayTasks.map((task) => {
            const visual = getTaskVisualState(task)

            return (
              <div
                key={task.id}
                onClick={() => onEditAppointment?.(task)}
                className={`p-3 sm:p-3.5 rounded-xl border transition-all cursor-pointer shadow-2xs flex flex-col md:flex-row md:items-center md:justify-between gap-3 ${visual.cardBg}`}
              >
                {/* Informações da Tarefa */}
                <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                  <span
                    className={`w-2.5 h-2.5 rounded-full shrink-0 mt-1 sm:mt-0 ${visual.dotColor}`}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-xs sm:text-sm font-bold truncate ${
                          task.status === 'Concluido'
                            ? 'line-through text-gray-500'
                            : visual.textColor
                        }`}
                      >
                        {task.title}
                      </span>
                      <Badge
                        variant="outline"
                        className={`text-[10px] px-2 py-0 font-bold border ${visual.badgeBg}`}
                      >
                        {visual.label}
                      </Badge>
                      {task.priority === 'Urgente' && (
                        <Badge className="bg-red-600 text-white text-[9px] px-1.5 py-0 font-bold">
                          Urgente
                        </Badge>
                      )}
                      {task.is_invited_participant && (
                        <Badge
                          variant="outline"
                          className="bg-sky-50 text-sky-800 border-sky-300 text-[10px]"
                        >
                          Convidado por {task.invited_by_name || 'colega'}
                        </Badge>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-gray-500 mt-1">
                      {task.start_time ? (
                        <span className="flex items-center gap-1 font-semibold text-gray-700">
                          <Clock className="w-3 h-3 text-[#005B2E]" />
                          {task.start_time}
                          {task.end_time ? ` - ${task.end_time}` : ''}
                        </span>
                      ) : (
                        <span className="text-gray-400">Dia todo</span>
                      )}

                      {task.description && (
                        <span className="truncate max-w-md text-gray-600" title={task.description}>
                          • {task.description}
                        </span>
                      )}

                      {task.rescheduled_at && (
                        <span className="text-blue-700 font-medium">• Reagendado recentemente</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Três botões de ação especificados:
                    1. Concluído: finalizada e identificada na cor verde
                    2. Cancelado: finalizada, identificada na cor vermelha
                    3. Reprogramar / Reagendar: abre agenda para nova data e horário, identificada em azul
                */}
                <div className="flex flex-wrap items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-gray-200">
                  {/* Botão Concluído */}
                  <Button
                    type="button"
                    size="sm"
                    disabled={submittingAction || task.status === 'Concluido'}
                    onClick={(e) => handleConclude(task, e)}
                    className="h-7 sm:h-8 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs px-2.5 transition-colors"
                    title="Concluir tarefa (Identificada na cor verde)"
                  >
                    <Check className="w-3.5 h-3.5 mr-1" />
                    Concluído
                  </Button>

                  {/* Botão Cancelado */}
                  <Button
                    type="button"
                    size="sm"
                    disabled={submittingAction || task.status === 'Cancelado'}
                    onClick={(e) => handleCancel(task, e)}
                    className="h-7 sm:h-8 text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-2xs px-2.5 transition-colors"
                    title="Cancelar tarefa (Identificada na cor vermelha)"
                  >
                    <X className="w-3.5 h-3.5 mr-1" />
                    Cancelado
                  </Button>

                  {/* Botão Reprogramar / Reagendar */}
                  <Button
                    type="button"
                    size="sm"
                    disabled={submittingAction}
                    onClick={(e) => handleOpenReschedule(task, e)}
                    className="h-7 sm:h-8 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-2xs px-2.5 transition-colors"
                    title="Reprogramar / Reagendar para nova data e horário (Identificada na cor azul)"
                  >
                    <CalendarClock className="w-3.5 h-3.5 mr-1" />
                    Reprogramar / Reagendar
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL DE REPROGRAMAR / REAGENDAR TAREFA */}
      {/* ==================================================================== */}
      <Dialog open={rescheduleModalOpen} onOpenChange={setRescheduleModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader className="border-b pb-3">
            <DialogTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
              <CalendarClock className="w-5 h-5 text-blue-600" />
              Reprogramar / Reagendar Tarefa
            </DialogTitle>
            <p className="text-xs text-gray-500">
              Selecione a nova data e o novo horário. A tarefa será identificada na{' '}
              <strong className="text-blue-700">cor azul</strong> na agenda.
            </p>
          </DialogHeader>

          {taskToReschedule && (
            <form onSubmit={handleConfirmReschedule} className="space-y-4 pt-2">
              {/* Resumo da tarefa atual */}
              <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-xs">
                <span className="font-bold text-blue-900">Tarefa:</span>{' '}
                <span className="text-blue-950 font-semibold">{taskToReschedule.title}</span>
                <div className="text-[11px] text-blue-800 mt-0.5">
                  Data atual: <strong>{taskToReschedule.date}</strong>{' '}
                  {taskToReschedule.start_time ? `às ${taskToReschedule.start_time}` : ''}
                </div>
              </div>

              {/* Nova Data */}
              <div className="space-y-1.5">
                <Label htmlFor="resched-date" className="text-xs font-bold text-gray-700">
                  Nova Data <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="resched-date"
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="text-sm border-gray-300 focus-visible:ring-blue-500"
                  required
                />
              </div>

              {/* Novo Horário */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="resched-start" className="text-xs font-bold text-gray-700">
                    Novo Horário Início
                  </Label>
                  <Input
                    id="resched-start"
                    type="time"
                    value={newStartTime}
                    onChange={(e) => setNewStartTime(e.target.value)}
                    className="text-sm border-gray-300 focus-visible:ring-blue-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="resched-end" className="text-xs font-bold text-gray-700">
                    Novo Horário Término
                  </Label>
                  <Input
                    id="resched-end"
                    type="time"
                    value={newEndTime}
                    onChange={(e) => setNewEndTime(e.target.value)}
                    className="text-sm border-gray-300 focus-visible:ring-blue-500"
                  />
                </div>
              </div>

              <DialogFooter className="border-t pt-3 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setRescheduleModalOpen(false)}
                  className="text-xs"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={submittingAction}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4"
                >
                  <CalendarClock className="w-3.5 h-3.5 mr-1" />
                  Confirmar Reagendamento
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
