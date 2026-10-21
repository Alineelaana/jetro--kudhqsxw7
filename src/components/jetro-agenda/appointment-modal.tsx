import { useState, useEffect, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  Calendar as CalendarIcon,
  Clock,
  Bell,
  Mail,
  Repeat,
  AlertCircle,
  Plus,
  Trash2,
  CheckCircle2,
  Loader2,
  Users,
  Search,
  UserCheck,
} from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import type {
  AgendaAppointment,
  AppointmentType,
  AppointmentPriority,
  AppointmentStatus,
  AppointmentRecurrence,
  CreateAppointmentInput,
  CompanyUserOption,
} from '@/types/jetro-agenda'
import { REMINDER_PRESET_OPTIONS } from '@/types/jetro-agenda'
import {
  createAppointment,
  updateAppointment,
  deleteAppointment,
  isAppointmentInThePast,
  fetchCompanyUsersForInvite,
  fetchAppointmentInvitations,
} from '@/services/jetro-agenda'

interface AppointmentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialDate?: string
  appointmentToEdit?: AgendaAppointment | null
  currentUser: { id: string; email: string; name?: string }
  onSaved: () => void
}

export function AppointmentModal({
  open,
  onOpenChange,
  initialDate,
  appointmentToEdit,
  currentUser,
  onSaved,
}: AppointmentModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [type, setType] = useState<AppointmentType>('Compromisso')
  const [priority, setPriority] = useState<AppointmentPriority>('Media')
  const [status, setStatus] = useState<AppointmentStatus>('Pendente')
  const [hasReminder, setHasReminder] = useState(false)
  const [selectedReminders, setSelectedReminders] = useState<string[]>([])
  const [customOffsetValue, setCustomOffsetValue] = useState('')
  const [customOffsetUnit, setCustomOffsetUnit] = useState<'m' | 'h' | 'd'>('m')
  const [targetEmail, setTargetEmail] = useState('')
  const [recurrence, setRecurrence] = useState<AppointmentRecurrence>('none')
  const [recurrenceEndDate, setRecurrenceEndDate] = useState('')
  const [referenceTime, setReferenceTime] = useState('09:00')

  // Participantes / Convites
  const [enableInvite, setEnableInvite] = useState(false)
  const [companyUsers, setCompanyUsers] = useState<CompanyUserOption[]>([])
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])
  const [userSearchQuery, setUserSearchQuery] = useState('')
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [existingInvitedIds, setExistingInvitedIds] = useState<string[]>([])

  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const isEditing = !!appointmentToEdit

  // Carrega lista de usuários da empresa ao abrir o modal (apenas 1 vez por abertura)
  const usersLoadedForOpenRef = useRef(false)
  useEffect(() => {
    if (!open) {
      usersLoadedForOpenRef.current = false
      return
    }
    if (usersLoadedForOpenRef.current) return
    usersLoadedForOpenRef.current = true

    setLoadingUsers(true)
    fetchCompanyUsersForInvite()
      .then((users) => {
        // Exclui o próprio usuário logado da lista selecionável
        const filtered = users.filter((u) => u.id !== currentUser.id)
        setCompanyUsers(filtered)
      })
      .catch((err) => {
        console.warn('Erro ao carregar usuários:', err)
      })
      .finally(() => {
        setLoadingUsers(false)
      })
  }, [open, currentUser.id])

  // Controla quando o formulário deve ser inicializado:
  // Somente quando o modal acaba de abrir (transição false -> true)
  // ou quando o compromisso em edição é alterado especificamente.
  // Garante que o que o usuário digita (título, descrição, data, hora, etc.)
  // permaneça 100% intacto mesmo em re-renders do componente ou do pai.
  const prevOpenRef = useRef(false)
  const prevEditIdRef = useRef<string | null | undefined>(undefined)

  useEffect(() => {
    if (!open) {
      prevOpenRef.current = false
      prevEditIdRef.current = undefined
      setConfirmDelete(false)
      setSelectedUserIds([])
      setUserSearchQuery('')
      setEnableInvite(false)
      setExistingInvitedIds([])
      return
    }

    const currentEditId = appointmentToEdit ? appointmentToEdit.id : null
    const justOpened = !prevOpenRef.current && open
    const changedAppointment = prevOpenRef.current && currentEditId !== prevEditIdRef.current

    if (justOpened || changedAppointment) {
      prevOpenRef.current = true
      prevEditIdRef.current = currentEditId
      setConfirmDelete(false)
      setUserSearchQuery('')

      if (appointmentToEdit) {
        setTitle(appointmentToEdit.title || '')
        setDescription(appointmentToEdit.description || '')
        setDate(appointmentToEdit.date || '')
        setStartTime(appointmentToEdit.start_time || '')
        setEndTime(appointmentToEdit.end_time || '')
        setType(appointmentToEdit.type || 'Compromisso')
        setPriority(appointmentToEdit.priority || 'Media')
        setStatus(appointmentToEdit.status || 'Pendente')
        setHasReminder(!!appointmentToEdit.has_reminder)
        setSelectedReminders(appointmentToEdit.reminder_configs || [])
        setTargetEmail(appointmentToEdit.reminder_target_email || currentUser.email)
        setRecurrence(appointmentToEdit.recurrence || 'none')
        setRecurrenceEndDate(appointmentToEdit.recurrence_end_date || '')
        setReferenceTime(appointmentToEdit.reference_time_for_reminder || '09:00')

        // Carrega convites existentes se houver
        fetchAppointmentInvitations(appointmentToEdit.id)
          .then((invs) => {
            const ids = invs.map((i) => i.user_id)
            setExistingInvitedIds(ids)
            if (ids.length > 0) {
              setEnableInvite(true)
              setSelectedUserIds(ids)
            } else {
              setEnableInvite(false)
              setSelectedUserIds([])
            }
          })
          .catch((err) => {
            console.warn('Erro ao carregar convites do compromisso:', err)
          })
      } else {
        setTitle('')
        setDescription('')
        setDate(initialDate || new Date().toISOString().substring(0, 10))
        setStartTime('09:00')
        setEndTime('10:00')
        setType('Compromisso')
        setPriority('Media')
        setStatus('Pendente')
        setHasReminder(false)
        setSelectedReminders(['30m', '1h'])
        setTargetEmail(currentUser.email)
        setRecurrence('none')
        setRecurrenceEndDate('')
        setReferenceTime('09:00')
        setEnableInvite(false)
        setSelectedUserIds([])
        setExistingInvitedIds([])
      }
    }
  }, [open, appointmentToEdit, initialDate, currentUser.email])

  const toggleReminderPreset = (val: string) => {
    if (selectedReminders.includes(val)) {
      setSelectedReminders(selectedReminders.filter((r) => r !== val))
    } else {
      setSelectedReminders([...selectedReminders, val])
    }
  }

  const addCustomReminder = () => {
    const num = parseInt(customOffsetValue, 10)
    if (!num || num <= 0) return
    const customKey = `custom:${num}${customOffsetUnit}`
    if (!selectedReminders.includes(customKey)) {
      setSelectedReminders([...selectedReminders, customKey])
    }
    setCustomOffsetValue('')
  }

  const removeReminder = (keyToRemove: string) => {
    setSelectedReminders(selectedReminders.filter((k) => k !== keyToRemove))
  }

  const toggleSelectUser = (userId: string) => {
    if (selectedUserIds.includes(userId)) {
      setSelectedUserIds(selectedUserIds.filter((id) => id !== userId))
    } else {
      setSelectedUserIds([...selectedUserIds, userId])
    }
  }

  const filteredCompanyUsers = companyUsers.filter((u) => {
    if (!userSearchQuery.trim()) return true
    const q = userSearchQuery.toLowerCase()
    return (
      (u.name || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      (u.cargo || '').toLowerCase().includes(q)
    )
  })

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      toast({
        title: 'Título obrigatório',
        description: 'Informe o título do compromisso.',
        variant: 'destructive',
      })
      return
    }

    if (!date) {
      toast({
        title: 'Data obrigatória',
        description: 'Selecione uma data para o compromisso.',
        variant: 'destructive',
      })
      return
    }

    // Regra de segurança de lembretes: se hasReminder está ativo e a data/hora já passou
    if (hasReminder && isAppointmentInThePast(date, startTime || referenceTime)) {
      toast({
        title: 'Aviso sobre lembretes',
        description:
          'O horário programado já passou. Lembretes não serão disparados para eventos passados.',
        variant: 'destructive',
      })
    }

    setSaving(true)
    try {
      // Participantes adicionados (se a opção estiver marcada)
      const invitedIds = enableInvite ? selectedUserIds : []

      const payload: CreateAppointmentInput = {
        title: title.trim(),
        description: description.trim(),
        date,
        start_time: startTime || undefined,
        end_time: endTime || undefined,
        type,
        priority,
        status,
        has_reminder: hasReminder,
        reminder_configs: hasReminder ? selectedReminders : [],
        reminder_target_email: hasReminder ? targetEmail.trim() || currentUser.email : undefined,
        recurrence,
        recurrence_end_date: recurrence !== 'none' ? recurrenceEndDate || undefined : undefined,
        reference_time_for_reminder: !startTime ? referenceTime : undefined,
        invited_user_ids: invitedIds,
      }

      if (isEditing && appointmentToEdit) {
        // Envia apenas os novos que ainda não tinham sido convidados
        const newInvited = invitedIds.filter((id) => !existingInvitedIds.includes(id))
        await updateAppointment({
          id: appointmentToEdit.id,
          ...payload,
          invited_user_ids: newInvited,
        })
        toast({
          title: 'Compromisso atualizado',
          description:
            newInvited.length > 0
              ? `Alterações salvas e ${newInvited.length} participante(s) notificado(s).`
              : 'Alterações salvas com sucesso na sua Agenda HURAM.',
        })
      } else {
        await createAppointment(payload, currentUser)
        toast({
          title: 'Compromisso criado',
          description:
            invitedIds.length > 0
              ? `Compromisso agendado com sucesso e ${invitedIds.length} participante(s) notificado(s).`
              : 'A atividade já está disponível no seu calendário.',
        })
      }

      onSaved()
      onOpenChange(false)
    } catch (err) {
      console.error('Erro ao salvar compromisso:', err)
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar a atividade na agenda.',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!appointmentToEdit) return
    setDeleting(true)
    try {
      await deleteAppointment(appointmentToEdit.id)
      toast({
        title: 'Compromisso excluído',
        description: 'A atividade e seus lembretes associados foram cancelados.',
      })
      onSaved()
      onOpenChange(false)
    } catch (err) {
      console.error('Erro ao excluir:', err)
      toast({
        title: 'Erro ao excluir',
        description: 'Não foi possível excluir o compromisso.',
        variant: 'destructive',
      })
    } finally {
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  const handleToggleCompleted = async () => {
    if (!appointmentToEdit) return
    const newStatus: AppointmentStatus = status === 'Concluido' ? 'Pendente' : 'Concluido'
    setStatus(newStatus)
    try {
      await updateAppointment({
        id: appointmentToEdit.id,
        status: newStatus,
      })
      toast({
        title: newStatus === 'Concluido' ? 'Atividade concluída!' : 'Atividade reaberta',
        description: `Status alterado para "${newStatus}".`,
      })
      onSaved()
    } catch {
      /* intentionally ignored */
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto sm:p-6">
        <DialogHeader className="border-b pb-4">
          <div className="flex items-center justify-between pr-6">
            <DialogTitle className="text-xl font-black text-gray-900 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-[#005B2E]" />
              {isEditing ? 'Editar Compromisso' : 'Novo Compromisso / Tarefa'}
            </DialogTitle>
            {isEditing && (
              <Badge
                variant="outline"
                className={
                  status === 'Concluido'
                    ? 'border-emerald-500 text-emerald-700 bg-emerald-50'
                    : 'border-[#C9A227] text-[#9A7B1C] bg-amber-50'
                }
              >
                {status}
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Agenda Inteligente Pessoal — vinculada com segurança ao seu usuário ({currentUser.email}
            )
          </p>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-4 pt-2">
          {/* Título */}
          <div className="space-y-1.5">
            <Label
              htmlFor="appt-title"
              className="text-xs font-bold text-gray-700 uppercase tracking-wider"
            >
              Título da Atividade <span className="text-red-500">*</span>
            </Label>
            <Input
              id="appt-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex.: Reunião de Fechamento Comercial, Enviar Relatório, etc."
              className="text-sm border-gray-300 focus-visible:ring-[#005B2E]"
              required
            />
          </div>

          {/* Descrição */}
          <div className="space-y-1.5">
            <Label
              htmlFor="appt-desc"
              className="text-xs font-bold text-gray-700 uppercase tracking-wider"
            >
              Descrição / Pauta
            </Label>
            <Textarea
              id="appt-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalhes, participantes, links ou observações da atividade..."
              rows={2}
              className="text-sm border-gray-300 focus-visible:ring-[#005B2E]"
            />
          </div>

          {/* Data e Horários */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label
                htmlFor="appt-date"
                className="text-xs font-bold text-gray-700 uppercase tracking-wider"
              >
                Data <span className="text-red-500">*</span>
              </Label>
              <Input
                id="appt-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="text-sm border-gray-300 focus-visible:ring-[#005B2E]"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label
                htmlFor="appt-start"
                className="text-xs font-bold text-gray-700 uppercase tracking-wider"
              >
                Início (HH:mm)
              </Label>
              <Input
                id="appt-start"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="text-sm border-gray-300 focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1.5">
              <Label
                htmlFor="appt-end"
                className="text-xs font-bold text-gray-700 uppercase tracking-wider"
              >
                Término (opcional)
              </Label>
              <Input
                id="appt-end"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="text-sm border-gray-300 focus-visible:ring-[#005B2E]"
              />
            </div>
          </div>

          {/* Tipo, Prioridade e Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                Tipo da Atividade
              </Label>
              <Select value={type} onValueChange={(v) => setType(v as AppointmentType)}>
                <SelectTrigger className="text-sm border-gray-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Tarefa">🔵 Tarefa</SelectItem>
                  <SelectItem value="Reuniao">🟣 Reunião</SelectItem>
                  <SelectItem value="Compromisso">🟡 Compromisso</SelectItem>
                  <SelectItem value="Lembrete">🟢 Lembrete</SelectItem>
                  <SelectItem value="Outros">⚪ Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                Prioridade
              </Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as AppointmentPriority)}>
                <SelectTrigger className="text-sm border-gray-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Baixa">Baixa</SelectItem>
                  <SelectItem value="Media">Média</SelectItem>
                  <SelectItem value="Alta">Alta</SelectItem>
                  <SelectItem value="Urgente">🔴 Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                Status
              </Label>
              <Select value={status} onValueChange={(v) => setStatus(v as AppointmentStatus)}>
                <SelectTrigger className="text-sm border-gray-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pendente">Pendente</SelectItem>
                  <SelectItem value="Em andamento">Em andamento</SelectItem>
                  <SelectItem value="Concluido">Concluído</SelectItem>
                  <SelectItem value="Cancelado">Cancelado</SelectItem>
                  <SelectItem value="Reagendado">Reagendado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* CONVIDAR PARTICIPANTES */}
          <div className="p-3.5 rounded-xl bg-sky-50/70 border border-sky-200/90 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="chk-invite-participants"
                  checked={enableInvite}
                  onCheckedChange={(c) => setEnableInvite(!!c)}
                  className="data-[state=checked]:bg-sky-600 data-[state=checked]:border-sky-600"
                />
                <label
                  htmlFor="chk-invite-participants"
                  className="text-xs font-bold text-sky-950 uppercase tracking-wider cursor-pointer flex items-center gap-1.5"
                >
                  <Users className="w-3.5 h-3.5 text-sky-600" />
                  Convidar Participantes
                </label>
              </div>
              <Badge
                variant="outline"
                className="bg-white text-sky-800 border-sky-300 text-[11px] font-semibold"
              >
                {selectedUserIds.length} selecionado(s)
              </Badge>
            </div>

            {enableInvite && (
              <div className="space-y-2.5 pt-1 border-t border-sky-200/60">
                <p className="text-[11px] text-sky-900 leading-relaxed">
                  Selecione quantos participantes desejar. Cada participante receberá uma
                  notificação no sistema, o compromisso aparecerá em sua agenda e poderá ser{' '}
                  <strong>Aceito</strong> ou <strong>Recusado</strong>.
                </p>

                {/* Campo de pesquisa por nome */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-gray-400" />
                  <Input
                    type="text"
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    placeholder="Pesquisar participante por nome, e-mail ou cargo..."
                    className="text-xs pl-8 h-8 bg-white border-sky-200 focus-visible:ring-sky-500"
                  />
                </div>

                {/* Lista com todos os usuários cadastrados na empresa */}
                <div className="max-h-44 overflow-y-auto rounded-lg border border-sky-200 bg-white divide-y divide-gray-100 p-1">
                  {loadingUsers ? (
                    <div className="p-4 text-center text-xs text-gray-500 flex items-center justify-center gap-2">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-600" />
                      Carregando usuários da empresa...
                    </div>
                  ) : filteredCompanyUsers.length === 0 ? (
                    <div className="p-3 text-center text-xs text-gray-400">
                      Nenhum usuário encontrado na empresa para o termo pesquisado.
                    </div>
                  ) : (
                    filteredCompanyUsers.map((user) => {
                      const isSelected = selectedUserIds.includes(user.id)
                      const wasAlreadyInvited = existingInvitedIds.includes(user.id)

                      return (
                        <div
                          key={user.id}
                          onClick={() => toggleSelectUser(user.id)}
                          className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors text-xs ${
                            isSelected
                              ? 'bg-sky-50/90 text-sky-950 font-medium'
                              : 'hover:bg-gray-50 text-gray-700'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0 pr-2">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => toggleSelectUser(user.id)}
                              className="data-[state=checked]:bg-sky-600 data-[state=checked]:border-sky-600"
                            />
                            <div className="min-w-0">
                              <div className="truncate font-medium flex items-center gap-1.5">
                                <span>{user.name}</span>
                                {wasAlreadyInvited && (
                                  <Badge
                                    variant="outline"
                                    className="text-[9px] px-1 py-0 bg-emerald-50 text-emerald-700 border-emerald-300"
                                  >
                                    Já convidado
                                  </Badge>
                                )}
                              </div>
                              <div className="text-[10px] text-gray-500 truncate">{user.email}</div>
                            </div>
                          </div>
                          {user.cargo && (
                            <span className="text-[10px] text-gray-400 shrink-0 bg-gray-100 px-1.5 py-0.5 rounded">
                              {user.cargo}
                            </span>
                          )}
                        </div>
                      )
                    })
                  )}
                </div>

                {/* Resumo dos participantes selecionados em badges */}
                {selectedUserIds.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1 pt-1">
                    {selectedUserIds.map((uid) => {
                      const u = companyUsers.find((cu) => cu.id === uid)
                      return (
                        <span
                          key={uid}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] bg-sky-100 text-sky-800 border border-sky-200"
                        >
                          <UserCheck className="w-2.5 h-2.5" />
                          <span className="max-w-[140px] truncate">{u?.name || uid}</span>
                          <button
                            type="button"
                            onClick={(ev) => {
                              ev.stopPropagation()
                              toggleSelectUser(uid)
                            }}
                            className="hover:text-red-600 ml-0.5 font-bold cursor-pointer"
                          >
                            ×
                          </button>
                        </span>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Recorrência */}
          <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                <Repeat className="w-3.5 h-3.5 text-[#005B2E]" />
                Recorrência Automática
              </Label>
              <span className="text-[11px] text-gray-500">
                Gera as próximas ocorrências no calendário
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Select
                value={recurrence}
                onValueChange={(v) => setRecurrence(v as AppointmentRecurrence)}
              >
                <SelectTrigger className="text-sm bg-white border-gray-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Não se repete</SelectItem>
                  <SelectItem value="daily">Diária (todos os dias)</SelectItem>
                  <SelectItem value="weekly">Semanal (a cada 7 dias)</SelectItem>
                  <SelectItem value="biweekly">Quinzenal (a cada 14 dias)</SelectItem>
                  <SelectItem value="monthly">Mensal (mesmo dia do mês)</SelectItem>
                  <SelectItem value="yearly">Anual (mesma data do ano)</SelectItem>
                </SelectContent>
              </Select>

              {recurrence !== 'none' && (
                <div>
                  <Input
                    type="date"
                    value={recurrenceEndDate}
                    onChange={(e) => setRecurrenceEndDate(e.target.value)}
                    placeholder="Data limite (opcional)"
                    className="text-sm bg-white border-gray-300"
                  />
                  <span className="text-[10px] text-gray-400 mt-0.5 block">
                    Repetir até (opcional)
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Lembretes por E-mail */}
          <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="chk-reminder"
                  checked={hasReminder}
                  onCheckedChange={(c) => setHasReminder(!!c)}
                  className="data-[state=checked]:bg-[#005B2E] data-[state=checked]:border-[#005B2E]"
                />
                <label
                  htmlFor="chk-reminder"
                  className="text-xs font-bold text-[#005B2E] uppercase tracking-wider cursor-pointer flex items-center gap-1.5"
                >
                  <Bell className="w-3.5 h-3.5 text-[#C9A227]" />
                  Ativar lembrete por e-mail no servidor
                </label>
              </div>
              <Badge className="bg-[#005B2E] text-white text-[10px] font-semibold">
                Disparo Automático
              </Badge>
            </div>

            {hasReminder && (
              <div className="space-y-3 pt-1 border-t border-emerald-100">
                {/* E-mail de Destino */}
                <div className="space-y-1">
                  <Label
                    htmlFor="rem-email"
                    className="text-xs text-gray-700 font-semibold flex items-center gap-1"
                  >
                    <Mail className="w-3 h-3 text-emerald-600" />
                    E-mail de destino padrão:
                  </Label>
                  <Input
                    id="rem-email"
                    type="email"
                    value={targetEmail}
                    onChange={(e) => setTargetEmail(e.target.value)}
                    placeholder="seu.email@empresa.com"
                    className="text-xs bg-white border-emerald-300 focus-visible:ring-[#005B2E]"
                  />
                </div>

                {!startTime && (
                  <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                    <div className="flex-1">
                      <span>
                        Como esta atividade não tem horário de início, informe o horário de
                        referência:
                      </span>
                      <Input
                        type="time"
                        value={referenceTime}
                        onChange={(e) => setReferenceTime(e.target.value)}
                        className="h-7 text-xs w-28 bg-white border-amber-300 mt-1 inline-block ml-2"
                      />
                    </div>
                  </div>
                )}

                {/* Opções de múltiplos lembretes */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-800">
                      Antecedência do aviso (múltiplos permitidos):
                    </span>
                    <span className="text-[11px] text-gray-500">
                      {selectedReminders.length} selecionado(s)
                    </span>
                  </div>

                  {/* Grid de Presets */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                    {REMINDER_PRESET_OPTIONS.map((opt) => {
                      const isSelected = selectedReminders.includes(opt.value)
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => toggleReminderPreset(opt.value)}
                          className={`text-xs px-2.5 py-1.5 rounded-lg border text-left transition-colors cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? 'bg-[#005B2E] text-white border-[#005B2E] font-medium shadow-2xs'
                              : 'bg-white hover:bg-emerald-50 text-gray-700 border-emerald-200'
                          }`}
                        >
                          <span className="truncate">{opt.label}</span>
                          {isSelected && <CheckCircle2 className="w-3 h-3 shrink-0 ml-1" />}
                        </button>
                      )
                    })}
                  </div>

                  {/* Lembrete Personalizado */}
                  <div className="pt-2 flex flex-wrap items-center gap-2">
                    <span className="text-xs text-gray-600 font-medium">Personalizado:</span>
                    <Input
                      type="number"
                      min="1"
                      placeholder="Valor"
                      value={customOffsetValue}
                      onChange={(e) => setCustomOffsetValue(e.target.value)}
                      className="w-20 h-7 text-xs bg-white border-emerald-300"
                    />
                    <Select
                      value={customOffsetUnit}
                      onValueChange={(v) => setCustomOffsetUnit(v as 'm' | 'h' | 'd')}
                    >
                      <SelectTrigger className="w-24 h-7 text-xs bg-white border-emerald-300">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="m">Minutos</SelectItem>
                        <SelectItem value="h">Horas</SelectItem>
                        <SelectItem value="d">Dias</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      size="sm"
                      onClick={addCustomReminder}
                      disabled={!customOffsetValue}
                      className="h-7 text-xs bg-[#C9A227] hover:bg-[#b59020] text-[#00381C] font-semibold px-2.5"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Adicionar
                    </Button>
                  </div>

                  {/* Badges dos lembretes selecionados */}
                  {selectedReminders.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {selectedReminders.map((remKey) => (
                        <span
                          key={remKey}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-100 text-[#005B2E] border border-emerald-200"
                        >
                          <Bell className="w-2.5 h-2.5 text-[#C9A227]" />
                          {remKey.startsWith('custom:')
                            ? `Personalizado: ${remKey.replace('custom:', '')}`
                            : REMINDER_PRESET_OPTIONS.find((p) => p.value === remKey)?.label ||
                              remKey}
                          <button
                            type="button"
                            onClick={() => removeReminder(remKey)}
                            className="hover:text-red-600 ml-0.5 cursor-pointer font-bold"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Diálogo de Confirmação de Exclusão */}
          {confirmDelete && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-900 space-y-2">
              <div className="flex items-center gap-2 font-bold">
                <AlertCircle className="w-4 h-4 text-red-600" />
                Confirma a exclusão deste compromisso?
              </div>
              <p className="text-red-700">
                Esta ação cancelará todos os lembretes programados e não poderá ser desfeita.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <Button
                  type="button"
                  size="sm"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="bg-red-600 hover:bg-red-700 text-white text-xs h-7"
                >
                  {deleting ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
                  Sim, excluir definitivamente
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setConfirmDelete(false)}
                  className="text-xs h-7"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}

          <DialogFooter className="flex flex-col sm:flex-row items-center justify-between gap-2 border-t pt-4">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              {isEditing && (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleToggleCompleted}
                    className="text-xs h-9 border-gray-300"
                  >
                    <CheckCircle2
                      className={`w-3.5 h-3.5 mr-1.5 ${
                        status === 'Concluido' ? 'text-emerald-600' : 'text-gray-400'
                      }`}
                    />
                    {status === 'Concluido' ? 'Reabrir Atividade' : 'Marcar como Concluída'}
                  </Button>
                  {!confirmDelete && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setConfirmDelete(true)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 text-xs h-9"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1" />
                      Excluir
                    </Button>
                  )}
                </>
              )}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="text-xs h-9"
              >
                Fechar
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={saving}
                className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold text-xs h-9 px-5 shadow-xs"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                    Salvando...
                  </>
                ) : (
                  'Salvar Compromisso'
                )}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
