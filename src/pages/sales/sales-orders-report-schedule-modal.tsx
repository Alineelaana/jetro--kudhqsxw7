import { useCallback, useEffect, useState } from 'react'
import {
  Calendar,
  Clock,
  Mail,
  FileSpreadsheet,
  FileText,
  Play,
  Trash2,
  Edit2,
  Plus,
  Loader2,
  CheckCircle2,
  XCircle,
  History,
  Info,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import pb from '@/lib/pocketbase/client'
import { cn } from '@/lib/utils'

export interface QueryFiltersState {
  operation_type: string
  client: string
  team: string
  rca: string
  customer_group: string
  city: string
  district: string
  address: string
  price_table: string
  order_number: string
  integration_number: string
  date_from: string
  date_to: string
  statuses: string[]
  is_balance: string
  generated_balance: string
  channel: string
  only_invoiced: boolean
}

export interface ReportSchedule {
  id: string
  name: string
  user_id: string
  user_email?: string
  user_name?: string
  user_role?: string
  empresa?: string
  filial?: string
  frequency: 'daily' | 'weekly'
  day_of_week?: number
  time_of_day: string
  timezone?: string
  recipients: string
  formats: ('xlsx' | 'pdf')[]
  filters: Partial<QueryFiltersState>
  filter_labels?: Record<string, string>
  skip_if_empty?: boolean
  active: boolean
  last_run_at?: string
  last_run_status?: 'success' | 'error' | 'skipped_empty' | ''
  last_run_error?: string
  last_run_count?: number
  last_run_total?: string
  execution_count?: number
  created?: string
  updated?: string
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Segunda-feira' },
  { value: 2, label: 'Terça-feira' },
  { value: 3, label: 'Quarta-feira' },
  { value: 4, label: 'Quinta-feira' },
  { value: 5, label: 'Sexta-feira' },
  { value: 6, label: 'Sábado' },
]

interface ReportScheduleManagerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentFilters: QueryFiltersState
  filterLabels: Record<string, string>
}

export function ReportScheduleManagerModal({
  open,
  onOpenChange,
  currentFilters,
  filterLabels,
}: ReportScheduleManagerModalProps) {
  const [activeTab, setActiveTab] = useState<'list' | 'form'>('list')
  const [schedules, setSchedules] = useState<ReportSchedule[]>([])
  const [loadingList, setLoadingList] = useState(false)
  const [saving, setSaving] = useState(false)
  const [triggeringId, setTriggeringId] = useState<string | null>(null)
  const [editingSchedule, setEditingSchedule] = useState<ReportSchedule | null>(null)

  // Campos do formulário
  const [formName, setFormName] = useState('')
  const [formFrequency, setFormFrequency] = useState<'daily' | 'weekly'>('daily')
  const [formDayOfWeek, setFormDayOfWeek] = useState<number>(1) // Segunda
  const [formTimeOfDay, setFormTimeOfDay] = useState('08:00')
  const [formRecipients, setFormRecipients] = useState('')
  const [formFormatXlsx, setFormFormatXlsx] = useState(true)
  const [formFormatPdf, setFormFormatPdf] = useState(false)
  const [formSkipIfEmpty, setFormSkipIfEmpty] = useState(false)
  const [formActive, setFormActive] = useState(true)
  const [formUseCurrentFilters, setFormUseCurrentFilters] = useState(true)

  const authUser = pb.authStore.record as
    | { id?: string; email?: string; name?: string; role?: string }
    | undefined

  const resetForm = useCallback(() => {
    setEditingSchedule(null)
    setFormName('Relatório Diário de Pedidos')
    setFormFrequency('daily')
    setFormDayOfWeek(1)
    setFormTimeOfDay('08:00')
    setFormRecipients(authUser?.email || '')
    setFormFormatXlsx(true)
    setFormFormatPdf(false)
    setFormSkipIfEmpty(false)
    setFormActive(true)
    setFormUseCurrentFilters(true)
  }, [authUser?.email])

  const loadSchedules = useCallback(async () => {
    if (!open) return
    setLoadingList(true)
    try {
      const records = (await pb.collection('sales_order_report_schedules').getFullList({
        sort: '-created',
      })) as unknown as ReportSchedule[]
      setSchedules(records || [])
    } catch (err) {
      console.error('Falha ao listar agendamentos', err)
      setSchedules([])
    } finally {
      setLoadingList(false)
    }
  }, [open])

  useEffect(() => {
    if (open) {
      loadSchedules()
      if (!editingSchedule) {
        resetForm()
      }
    }
  }, [open, loadSchedules, editingSchedule, resetForm])

  const startEdit = (sched: ReportSchedule) => {
    setEditingSchedule(sched)
    setFormName(sched.name || '')
    setFormFrequency(sched.frequency || 'daily')
    setFormDayOfWeek(sched.day_of_week ?? 1)
    setFormTimeOfDay(sched.time_of_day || '08:00')
    setFormRecipients(sched.recipients || '')
    setFormFormatXlsx(sched.formats?.includes('xlsx') ?? true)
    setFormFormatPdf(sched.formats?.includes('pdf') ?? false)
    setFormSkipIfEmpty(sched.skip_if_empty ?? false)
    setFormActive(sched.active ?? true)
    setFormUseCurrentFilters(false)
    setActiveTab('form')
  }

  const handleToggleActive = async (sched: ReportSchedule, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    const nextActive = !sched.active
    try {
      await pb.collection('sales_order_report_schedules').update(sched.id, {
        active: nextActive,
      })
      setSchedules((prev) =>
        prev.map((s) => (s.id === sched.id ? { ...s, active: nextActive } : s)),
      )
      toast.success(
        nextActive
          ? `Agendamento "${sched.name}" ativado com sucesso.`
          : `Agendamento "${sched.name}" pausado.`,
      )
    } catch {
      toast.error('Não foi possível alterar o status do agendamento.')
    }
  }

  const handleDelete = async (sched: ReportSchedule) => {
    if (!window.confirm(`Deseja excluir o agendamento "${sched.name}"?`)) return
    try {
      await pb.collection('sales_order_report_schedules').delete(sched.id)
      setSchedules((prev) => prev.filter((s) => s.id !== sched.id))
      toast.success('Agendamento excluído.')
    } catch {
      toast.error('Falha ao excluir agendamento.')
    }
  }

  const handleTriggerNow = async (sched: ReportSchedule) => {
    if (triggeringId) return
    setTriggeringId(sched.id)
    try {
      const resp = (await pb.send('/backend/v1/sales-order-schedules/trigger', {
        method: 'POST',
        body: { schedule_id: sched.id },
      })) as { success?: boolean; count?: number; message?: string }
      if (resp && resp.success) {
        toast.success(
          `Relatório enviado por e-mail com sucesso para ${sched.recipients}! (${resp.count ?? 0} pedido(s))`,
        )
      } else {
        toast.info(resp?.message || 'Execução concluída.')
      }
      loadSchedules()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao acionar envio imediato'
      toast.error(`Erro ao disparar e-mail: ${msg}`)
    } finally {
      setTriggeringId(null)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formName.trim()) {
      toast.error('Informe um nome para o agendamento.')
      return
    }

    const emailList = formRecipients
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0)

    if (emailList.length === 0) {
      toast.error('Informe ao menos um destinatário de e-mail.')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const invalidEmails = emailList.filter((em) => !emailRegex.test(em))
    if (invalidEmails.length > 0) {
      toast.error(`E-mail(s) com formato inválido: ${invalidEmails.join(', ')}`)
      return
    }

    const formats: ('xlsx' | 'pdf')[] = []
    if (formFormatXlsx) formats.push('xlsx')
    if (formFormatPdf) formats.push('pdf')
    if (formats.length === 0) {
      toast.error('Selecione pelo menos um formato de exportação (Excel ou PDF).')
      return
    }

    setSaving(true)
    try {
      const savedFilters =
        editingSchedule && !formUseCurrentFilters ? editingSchedule.filters : currentFilters

      const savedLabels =
        editingSchedule && !formUseCurrentFilters ? editingSchedule.filter_labels : filterLabels

      const payload = {
        name: formName.trim(),
        user_id: authUser?.id || '',
        user_email: authUser?.email || '',
        user_name: authUser?.name || '',
        user_role: authUser?.role || '',
        frequency: formFrequency,
        day_of_week: formFrequency === 'weekly' ? Number(formDayOfWeek) : null,
        time_of_day: formTimeOfDay,
        recipients: emailList.join(', '),
        formats,
        filters: savedFilters,
        filter_labels: savedLabels,
        skip_if_empty: formSkipIfEmpty,
        active: formActive,
      }

      if (editingSchedule) {
        await pb.collection('sales_order_report_schedules').update(editingSchedule.id, payload)
        toast.success(`Agendamento "${payload.name}" atualizado com sucesso!`)
      } else {
        await pb.collection('sales_order_report_schedules').create(payload)
        toast.success(`Agendamento "${payload.name}" criado com sucesso!`)
      }

      resetForm()
      setActiveTab('list')
      loadSchedules()
    } catch (err) {
      console.error(err)
      toast.error('Não foi possível salvar o agendamento. Verifique suas permissões.')
    } finally {
      setSaving(false)
    }
  }

  const activeFiltersCount = Object.entries(filterLabels || {}).filter(
    ([_, v]) => v && v !== '',
  ).length

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-3xl overflow-y-auto border-gray-200 p-0 sm:max-w-3xl">
        <DialogHeader className="border-b bg-[#005B2E] px-6 py-4 text-white">
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-[#C9A227]" />
            <DialogTitle className="text-lg font-bold text-white">
              Agendamento de Relatórios da Consulta de Pedidos
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-emerald-100">
            Envio automático da exportação por e-mail com os filtros aplicados, em frequência diária
            ou semanal.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 py-4">
          <Tabs
            value={activeTab}
            onValueChange={(val) => setActiveTab(val as 'list' | 'form')}
            className="w-full"
          >
            <div className="flex items-center justify-between border-b pb-2">
              <TabsList className="bg-gray-100">
                <TabsTrigger
                  value="list"
                  className="data-[state=active]:bg-[#005B2E] data-[state=active]:text-white"
                >
                  Meus Agendamentos ({schedules.length})
                </TabsTrigger>
                <TabsTrigger
                  value="form"
                  className="data-[state=active]:bg-[#005B2E] data-[state=active]:text-white"
                >
                  {editingSchedule ? 'Editar Agendamento' : 'Novo Agendamento'}
                </TabsTrigger>
              </TabsList>

              {activeTab === 'list' && (
                <Button
                  size="sm"
                  onClick={() => {
                    resetForm()
                    setActiveTab('form')
                  }}
                  className="bg-[#005B2E] text-white hover:bg-[#00401f]"
                >
                  <Plus className="mr-1 h-4 w-4" />
                  Novo Agendamento
                </Button>
              )}
            </div>

            {/* ABA 1: LISTAGEM */}
            <TabsContent value="list" className="mt-4">
              {loadingList && (
                <div className="flex items-center justify-center py-12 text-gray-500">
                  <Loader2 className="mr-2 h-5 w-5 animate-spin text-[#005B2E]" />
                  Carregando agendamentos...
                </div>
              )}

              {!loadingList && schedules.length === 0 && (
                <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center">
                  <Calendar className="mx-auto h-10 w-10 text-gray-400" />
                  <h3 className="mt-2 text-sm font-semibold text-gray-900">
                    Nenhum agendamento configurado
                  </h3>
                  <p className="mt-1 text-xs text-gray-500">
                    Crie um agendamento para receber a planilha de pedidos automaticamente no seu
                    e-mail.
                  </p>
                  <Button
                    size="sm"
                    onClick={() => {
                      resetForm()
                      setActiveTab('form')
                    }}
                    className="mt-4 bg-[#005B2E] text-white hover:bg-[#00401f]"
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    Criar primeiro agendamento
                  </Button>
                </div>
              )}

              {!loadingList && schedules.length > 0 && (
                <div className="flex flex-col gap-3">
                  {schedules.map((sched) => {
                    const isWeekly = sched.frequency === 'weekly'
                    const dayLabel =
                      DAYS_OF_WEEK.find((d) => d.value === sched.day_of_week)?.label || 'Segunda'
                    const isTriggering = triggeringId === sched.id

                    return (
                      <div
                        key={sched.id}
                        className={cn(
                          'rounded-lg border p-4 shadow-sm transition hover:border-[#005B2E]/50',
                          sched.active
                            ? 'border-gray-200 bg-white'
                            : 'border-gray-200 bg-gray-50 opacity-80',
                        )}
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="font-semibold text-gray-900">{sched.name}</h4>
                              <Badge
                                variant="outline"
                                className={cn(
                                  'border-transparent text-xs font-semibold',
                                  sched.frequency === 'daily'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-purple-100 text-purple-800',
                                )}
                              >
                                {sched.frequency === 'daily' ? 'Diário' : `Semanal (${dayLabel})`}
                              </Badge>
                              <Badge
                                variant="outline"
                                className="border-gray-200 bg-gray-100 text-xs text-gray-700"
                              >
                                <Clock className="mr-1 h-3 w-3 text-gray-500" />
                                {sched.time_of_day}
                              </Badge>
                              {sched.formats?.map((fmt) => (
                                <Badge
                                  key={fmt}
                                  variant="outline"
                                  className={cn(
                                    'border-transparent text-[11px] font-bold uppercase',
                                    fmt === 'xlsx'
                                      ? 'bg-emerald-100 text-[#005B2E]'
                                      : 'bg-amber-100 text-amber-800',
                                  )}
                                >
                                  {fmt === 'xlsx' ? 'Excel' : 'PDF (Resumo)'}
                                </Badge>
                              ))}
                            </div>

                            <p className="mt-1 text-xs text-gray-600">
                              <strong>Destinatários:</strong> {sched.recipients}
                            </p>

                            {/* Resumo de filtros salvos */}
                            {sched.filter_labels && Object.keys(sched.filter_labels).length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {Object.entries(sched.filter_labels)
                                  .slice(0, 4)
                                  .map(([k, v]) => (
                                    <span
                                      key={k}
                                      className="inline-flex items-center rounded bg-gray-100 px-2 py-0.5 text-[11px] text-gray-700"
                                    >
                                      <span className="font-medium text-gray-500">{k}:</span>&nbsp;
                                      {v}
                                    </span>
                                  ))}
                                {Object.keys(sched.filter_labels).length > 4 && (
                                  <span className="text-[11px] text-gray-500">
                                    +{Object.keys(sched.filter_labels).length - 4} outros
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Histórico da última execução */}
                            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <History className="h-3 w-3" />
                                Último envio:
                              </span>
                              {sched.last_run_at ? (
                                <span className="flex items-center gap-1">
                                  {sched.last_run_status === 'success' && (
                                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                                  )}
                                  {sched.last_run_status === 'error' && (
                                    <XCircle className="h-3.5 w-3.5 text-red-600" />
                                  )}
                                  {sched.last_run_status === 'skipped_empty' && (
                                    <Info className="h-3.5 w-3.5 text-gray-500" />
                                  )}
                                  <span>{new Date(sched.last_run_at).toLocaleString('pt-BR')}</span>
                                  {sched.last_run_count !== undefined && (
                                    <span className="text-gray-700">
                                      ({sched.last_run_count} pedidos
                                      {sched.last_run_total ? ` • ${sched.last_run_total}` : ''})
                                    </span>
                                  )}
                                </span>
                              ) : (
                                <span className="italic text-gray-400">Nunca executado</span>
                              )}

                              {sched.execution_count ? (
                                <span className="text-gray-400">
                                  • {sched.execution_count} envios realizados
                                </span>
                              ) : null}
                            </div>

                            {sched.last_run_error && (
                              <p className="mt-1 text-xs text-red-600">
                                Erro: {sched.last_run_error}
                              </p>
                            )}
                          </div>

                          {/* Controles de Ação com Toggle Verde #005B2E / Vermelho conforme tela de Validade */}
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-2 py-1 shadow-xs">
                              <Switch
                                checked={sched.active}
                                onCheckedChange={() => handleToggleActive(sched)}
                                className={cn(
                                  'data-[state=checked]:bg-[#005B2E] data-[state=unchecked]:bg-red-500',
                                )}
                                aria-label="Ativar ou pausar agendamento"
                              />
                              <span
                                className={cn(
                                  'text-xs font-semibold',
                                  sched.active ? 'text-[#005B2E]' : 'text-red-600',
                                )}
                              >
                                {sched.active ? 'Ativo' : 'Inativo'}
                              </span>
                            </div>

                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleTriggerNow(sched)}
                              disabled={isTriggering}
                              title="Enviar agora por e-mail"
                              className="h-8 border-[#C9A227] text-[#8a6e12] hover:bg-amber-50"
                            >
                              {isTriggering ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Play className="h-3.5 w-3.5" />
                              )}
                              <span className="ml-1 hidden sm:inline">Disparar Agora</span>
                            </Button>

                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => startEdit(sched)}
                              title="Editar"
                              className="h-8 w-8 p-0 text-gray-600 hover:text-gray-900"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </Button>

                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(sched)}
                              title="Excluir"
                              className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </TabsContent>

            {/* ABA 2: FORMULÁRIO (CRIAR / EDITAR) */}
            <TabsContent value="form" className="mt-4">
              <form onSubmit={handleSave} className="flex flex-col gap-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <Label htmlFor="sched-name" className="text-sm font-semibold text-gray-700">
                      Nome do Agendamento *
                    </Label>
                    <Input
                      id="sched-name"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="Ex.: Relatório Diário — Pedidos Faturados"
                      className="border-gray-200"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="sched-freq" className="text-sm font-semibold text-gray-700">
                      Frequência de Envio *
                    </Label>
                    <select
                      id="sched-freq"
                      value={formFrequency}
                      onChange={(e) => setFormFrequency(e.target.value as 'daily' | 'weekly')}
                      className="h-10 rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-700 shadow-sm outline-none focus:border-[#005B2E] focus:ring-1 focus:ring-[#005B2E]"
                    >
                      <option value="daily">Diária (Todos os dias)</option>
                      <option value="weekly">Semanal</option>
                    </select>
                  </div>

                  {formFrequency === 'weekly' ? (
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="sched-day" className="text-sm font-semibold text-gray-700">
                        Dia da Semana *
                      </Label>
                      <select
                        id="sched-day"
                        value={formDayOfWeek}
                        onChange={(e) => setFormDayOfWeek(Number(e.target.value))}
                        className="h-10 rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-700 shadow-sm outline-none focus:border-[#005B2E] focus:ring-1 focus:ring-[#005B2E]"
                      >
                        {DAYS_OF_WEEK.map((d) => (
                          <option key={d.value} value={d.value}>
                            {d.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="sched-time" className="text-sm font-semibold text-gray-700">
                        Horário de Envio (Horário de Brasília) *
                      </Label>
                      <Input
                        id="sched-time"
                        type="time"
                        value={formTimeOfDay}
                        onChange={(e) => setFormTimeOfDay(e.target.value)}
                        className="border-gray-200"
                        required
                      />
                    </div>
                  )}

                  {formFrequency === 'weekly' && (
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="sched-time" className="text-sm font-semibold text-gray-700">
                        Horário de Envio (Horário de Brasília) *
                      </Label>
                      <Input
                        id="sched-time"
                        type="time"
                        value={formTimeOfDay}
                        onChange={(e) => setFormTimeOfDay(e.target.value)}
                        className="border-gray-200"
                        required
                      />
                    </div>
                  )}

                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <Label
                      htmlFor="sched-recipients"
                      className="text-sm font-semibold text-gray-700"
                    >
                      Destinatário(s) de E-mail *
                    </Label>
                    <Input
                      id="sched-recipients"
                      value={formRecipients}
                      onChange={(e) => setFormRecipients(e.target.value)}
                      placeholder="exemplo@empresa.com.br, diretoria@empresa.com.br"
                      className="border-gray-200"
                      required
                    />
                    <span className="text-[11px] text-gray-500">
                      Separe múltiplos e-mails por vírgula. Pré-preenchido com o seu login.
                    </span>
                  </div>
                </div>

                {/* Formatos de anexo */}
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-3.5">
                  <Label className="text-sm font-semibold text-gray-800">
                    Formato do Relatório em Anexo
                  </Label>
                  <div className="mt-2 flex flex-wrap gap-4">
                    <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
                      <Checkbox
                        checked={formFormatXlsx}
                        onCheckedChange={(checked) => setFormFormatXlsx(!!checked)}
                      />
                      <FileSpreadsheet className="h-4 w-4 text-[#005B2E]" />
                      <span>Planilha Excel (.xlsx nativo)</span>
                    </label>

                    <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
                      <Checkbox
                        checked={formFormatPdf}
                        onCheckedChange={(checked) => setFormFormatPdf(!!checked)}
                      />
                      <FileText className="h-4 w-4 text-[#C9A227]" />
                      <span>PDF / Resumo tabular no e-mail</span>
                    </label>
                  </div>
                  <p className="mt-2 text-[11px] text-gray-500">
                    O formato Excel contém todos os pedidos até 10.000 linhas. Para PDF, uma
                    tabela-resumo executiva com os dados consolidados é anexada diretamente no corpo
                    do e-mail.
                  </p>
                </div>

                {/* Filtros fixados */}
                <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-3.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-[#005B2E]">
                        Filtros da Consulta Fixados no Agendamento
                      </h4>
                      <p className="text-xs text-emerald-800">
                        {activeFiltersCount > 0
                          ? `${activeFiltersCount} filtro(s) ativo(s) no momento:`
                          : 'Nenhum filtro específico aplicado — o relatório trará todos os pedidos do seu escopo de acesso.'}
                      </p>
                    </div>

                    {editingSchedule && (
                      <label className="flex cursor-pointer items-center gap-2 text-xs text-gray-700">
                        <Checkbox
                          checked={formUseCurrentFilters}
                          onCheckedChange={(c) => setFormUseCurrentFilters(!!c)}
                        />
                        <span>Substituir pelos filtros atuais da tela</span>
                      </label>
                    )}
                  </div>

                  {activeFiltersCount > 0 && (
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {Object.entries(filterLabels || {})
                        .filter(([_, v]) => v && v !== '')
                        .map(([k, v]) => (
                          <span
                            key={k}
                            className="inline-flex items-center rounded-md border border-emerald-300 bg-white px-2 py-0.5 text-xs text-emerald-900 shadow-2xs"
                          >
                            <span className="font-semibold text-emerald-700">{k}:</span>&nbsp;
                            {v}
                          </span>
                        ))}
                    </div>
                  )}
                </div>

                {/* Opções extras */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <label className="flex cursor-pointer items-center gap-2 text-xs text-gray-700">
                    <Checkbox
                      checked={formSkipIfEmpty}
                      onCheckedChange={(c) => setFormSkipIfEmpty(!!c)}
                    />
                    <span>Não enviar e-mail se a consulta retornar zero pedidos</span>
                  </label>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-700">Status inicial:</span>
                    <Switch
                      checked={formActive}
                      onCheckedChange={setFormActive}
                      className="data-[state=checked]:bg-[#005B2E] data-[state=unchecked]:bg-red-500"
                    />
                    <span
                      className={cn(
                        'text-xs font-semibold',
                        formActive ? 'text-[#005B2E]' : 'text-red-600',
                      )}
                    >
                      {formActive ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                </div>

                <DialogFooter className="mt-2 border-t pt-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      resetForm()
                      setActiveTab('list')
                    }}
                    disabled={saving}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={saving}
                    className="bg-[#005B2E] text-white hover:bg-[#00401f]"
                  >
                    {saving ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                    )}
                    {editingSchedule ? 'Atualizar Agendamento' : 'Salvar Agendamento'}
                  </Button>
                </DialogFooter>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}
