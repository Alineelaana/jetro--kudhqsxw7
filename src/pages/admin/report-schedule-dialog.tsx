import { useState, useMemo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Calendar,
  Clock,
  Mail,
  FileSpreadsheet,
  FileText,
  Eye,
  Send,
  Save,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Info,
} from 'lucide-react'
import {
  REPORT_SOURCES_REGISTRY,
  getAllReportModules,
  getReportsByModule,
  DYNAMIC_DATE_RANGES,
  DynamicDateRangeKey,
  ReportFilterFieldDef,
} from '@/lib/report-schedule-registry'
import pb from '@/lib/pocketbase/client'
import { useToast } from '@/hooks/use-toast'

export interface ReportScheduleFormData {
  id?: string
  name: string
  description: string
  module: string
  report_id: string
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly'
  days_of_week: number[]
  day_of_month: number
  start_date: string
  end_date: string
  time_of_day: string
  recipients: string
  recipients_cc: string
  email_subject: string
  email_message: string
  formats: ('xlsx' | 'pdf')[]
  filters: Record<string, unknown>
  filter_labels: Record<string, string>
  dynamic_date_range: DynamicDateRangeKey
  skip_if_empty: boolean
  active: boolean
  status: 'active' | 'paused' | 'error' | 'needs_review'
}

interface ReportScheduleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: Partial<ReportScheduleFormData> | null
  onSuccess: () => void
}

const WEEKDAYS = [
  { value: 0, label: 'Dom' },
  { value: 1, label: 'Seg' },
  { value: 2, label: 'Ter' },
  { value: 3, label: 'Qua' },
  { value: 4, label: 'Qui' },
  { value: 5, label: 'Sex' },
  { value: 6, label: 'Sáb' },
]

export function ReportScheduleDialog({
  open,
  onOpenChange,
  initialData,
  onSuccess,
}: ReportScheduleDialogProps) {
  const { toast } = useToast()
  const { user, userRole } = useAuth()
  const isSup = userRole === 'SUP'

  // Filtrar apenas módulos que o usuário tem permissão para consultar
  const modules = useMemo(() => {
    const all = getAllReportModules()
    if (isSup) return all
    return all.filter((m) => canUserAccessReportModule(userRole, m))
  }, [isSup, userRole])

  const defaultModule =
    initialData?.module && modules.includes(initialData.module)
      ? initialData.module
      : modules[0] || 'Comercial'
  const reportsInDefaultModule = getReportsByModule(defaultModule)
  const defaultReportId =
    initialData?.report_id || reportsInDefaultModule[0]?.id || 'comercial-consulta-pedidos'

  const [activeTab, setActiveTab] = useState<
    'geral' | 'filtros' | 'frequencia' | 'email' | 'previa'
  >('geral')
  const [isSaving, setIsSaving] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [isPreviewing, setIsPreviewing] = useState(false)
  const [previewResult, setPreviewResult] = useState<any | null>(null)

  const [formData, setFormData] = useState<ReportScheduleFormData>(() => ({
    id: initialData?.id,
    name: initialData?.name || '',
    description: initialData?.description || '',
    module: defaultModule,
    report_id: defaultReportId,
    frequency: initialData?.frequency || 'daily',
    days_of_week: initialData?.days_of_week || [1, 2, 3, 4, 5],
    day_of_month: initialData?.day_of_month || 1,
    start_date: initialData?.start_date || '',
    end_date: initialData?.end_date || '',
    time_of_day: initialData?.time_of_day || '07:00',
    recipients: initialData?.recipients || pb.authStore.record?.email || '',
    recipients_cc: initialData?.recipients_cc || '',
    email_subject: initialData?.email_subject || '',
    email_message: initialData?.email_message || '',
    formats:
      initialData?.formats && initialData.formats.length > 0 ? initialData.formats : ['xlsx'],
    filters: initialData?.filters || {},
    filter_labels: initialData?.filter_labels || {},
    dynamic_date_range: (initialData?.dynamic_date_range as DynamicDateRangeKey) || 'yesterday',
    skip_if_empty: initialData?.skip_if_empty !== undefined ? initialData.skip_if_empty : false,
    active: initialData?.active !== undefined ? initialData.active : true,
    status: initialData?.status || 'active',
  }))

  const currentReportDef =
    REPORT_SOURCES_REGISTRY[formData.report_id] ||
    REPORT_SOURCES_REGISTRY['comercial-consulta-pedidos']
  const availableReports = getReportsByModule(formData.module)

  const handleModuleChange = (newModule: string) => {
    const list = getReportsByModule(newModule)
    const firstRep = list[0]?.id || 'comercial-consulta-pedidos'
    setFormData((prev) => ({
      ...prev,
      module: newModule,
      report_id: firstRep,
      filters: {},
      filter_labels: {},
    }))
    setPreviewResult(null)
  }

  const handleReportChange = (newReportId: string) => {
    setFormData((prev) => ({
      ...prev,
      report_id: newReportId,
      filters: {},
      filter_labels: {},
    }))
    setPreviewResult(null)
  }

  const handleFilterValueChange = (
    field: ReportFilterFieldDef,
    val: unknown,
    labelText?: string,
  ) => {
    setFormData((prev) => {
      const nextFilters = { ...prev.filters, [field.key]: val }
      const nextLabels = { ...prev.filter_labels }
      if (labelText !== undefined) {
        nextLabels[field.key] = labelText
      } else if (typeof val === 'string' || typeof val === 'number') {
        nextLabels[field.key] = String(val)
      } else if (Array.isArray(val)) {
        nextLabels[field.key] = val.join(', ')
      } else if (typeof val === 'boolean') {
        nextLabels[field.key] = val ? 'Sim' : 'Não'
      }
      return {
        ...prev,
        filters: nextFilters,
        filter_labels: nextLabels,
      }
    })
  }

  const toggleDayOfWeek = (day: number) => {
    setFormData((prev) => {
      const exists = prev.days_of_week.includes(day)
      const nextDays = exists
        ? prev.days_of_week.filter((d) => d !== day)
        : [...prev.days_of_week, day].sort()
      return { ...prev, days_of_week: nextDays }
    })
  }

  const toggleFormat = (fmt: 'xlsx' | 'pdf') => {
    setFormData((prev) => {
      const exists = prev.formats.includes(fmt)
      if (exists && prev.formats.length === 1) {
        toast({
          title: 'Atenção',
          description: 'Pelo menos um formato (Excel ou PDF) deve permanecer selecionado.',
          variant: 'destructive',
        })
        return prev
      }
      const nextFormats = exists ? prev.formats.filter((f) => f !== fmt) : [...prev.formats, fmt]
      return { ...prev, formats: nextFormats }
    })
  }

  // Pré-visualização dos dados com os filtros aplicados
  const handlePreviewReport = async () => {
    setIsPreviewing(true)
    try {
      const payload = {
        preview_only: true,
        test_config: {
          name: formData.name || 'Prévia',
          module: formData.module,
          report_id: formData.report_id,
          dynamic_date_range: formData.dynamic_date_range,
          filters: formData.filters,
          filter_labels: formData.filter_labels,
          formats: formData.formats,
        },
      }

      const res = await pb.send('/backend/v1/report-schedules/trigger', {
        method: 'POST',
        body: JSON.stringify(payload),
      })

      setPreviewResult(res)
      setActiveTab('previa')
      toast({
        title: 'Prévia carregada',
        description: `Encontrados ${res.total_count} registro(s) no período ${res.date_range?.label || ''}.`,
      })
    } catch (err: any) {
      toast({
        title: 'Erro na prévia',
        description: err?.message || 'Falha ao consultar prévia dos dados.',
        variant: 'destructive',
      })
    } finally {
      setIsPreviewing(false)
    }
  }

  // Disparo de teste imediato por e-mail
  const handleSendTest = async () => {
    if (!formData.recipients || formData.recipients.trim().length === 0) {
      toast({
        title: 'Destinatário obrigatório',
        description: 'Informe ao menos um e-mail válido para o envio de teste.',
        variant: 'destructive',
      })
      setActiveTab('email')
      return
    }

    setIsTesting(true)
    try {
      const payload = {
        test_config: {
          name: formData.name || 'Teste de Agendamento',
          module: formData.module,
          report_id: formData.report_id,
          dynamic_date_range: formData.dynamic_date_range,
          filters: formData.filters,
          filter_labels: formData.filter_labels,
          recipients: formData.recipients,
          recipients_cc: formData.recipients_cc,
          email_subject: formData.email_subject,
          email_message: formData.email_message,
          formats: formData.formats,
          skip_if_empty: formData.skip_if_empty,
        },
      }

      const res = await pb.send('/backend/v1/report-schedules/trigger', {
        method: 'POST',
        body: JSON.stringify(payload),
      })

      toast({
        title: 'E-mail de teste enviado!',
        description: `${res.message} (${res.record_count} registros anexados/exibidos).`,
      })
    } catch (err: any) {
      toast({
        title: 'Falha no envio de teste',
        description: err?.message || 'Verifique as configurações de e-mail e tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setIsTesting(false)
    }
  }

  // Salvar agendamento
  const handleSaveSchedule = async () => {
    if (!formData.name.trim()) {
      toast({
        title: 'Nome obrigatório',
        description: 'Dê um nome identificador para este agendamento (ex: "Vendas Diárias").',
        variant: 'destructive',
      })
      setActiveTab('geral')
      return
    }

    if (!formData.recipients.trim()) {
      toast({
        title: 'Destinatários obrigatórios',
        description: 'Informe os e-mails que receberão o relatório.',
        variant: 'destructive',
      })
      setActiveTab('email')
      return
    }

    if (!formData.time_of_day) {
      toast({
        title: 'Horário obrigatório',
        description: 'Defina o horário programado para o disparo.',
        variant: 'destructive',
      })
      setActiveTab('frequencia')
      return
    }

    // Validação de segurança no client: módulo permitido
    if (!isSup && !canUserAccessReportModule(userRole, formData.module)) {
      toast({
        title: 'Módulo não autorizado',
        description: 'Você não tem permissão para agendar relatórios deste módulo.',
        variant: 'destructive',
      })
      return
    }

    setIsSaving(true)
    try {
      const authUser = pb.authStore.record
      // Se não for SUP, injeta obrigatoriamente a empresa/filial do usuário nos filtros para garantir que não acesse dados alheios
      const effectiveFilters = { ...formData.filters }
      if (!isSup && authUser?.empresa) {
        effectiveFilters.empresa = authUser.empresa
      }
      if (!isSup && authUser?.filial) {
        effectiveFilters.filial = authUser.filial
      }

      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        module: formData.module,
        report_id: formData.report_id,
        user_id: authUser?.id || '',
        user_email: authUser?.email || '',
        user_name: authUser?.name || '',
        user_role: authUser?.role || '',
        empresa: authUser?.empresa || '',
        filial: authUser?.filial || '',
        frequency: formData.frequency,
        days_of_week: formData.days_of_week,
        day_of_month: Number(formData.day_of_month) || 1,
        start_date: formData.start_date || '',
        end_date: formData.end_date || '',
        time_of_day: formData.time_of_day,
        timezone: 'America/Sao_Paulo',
        recipients: formData.recipients.trim(),
        recipients_cc: formData.recipients_cc.trim(),
        email_subject: formData.email_subject.trim(),
        email_message: formData.email_message.trim(),
        formats: formData.formats,
        filters: effectiveFilters,
        filter_labels: formData.filter_labels,
        dynamic_date_range: formData.dynamic_date_range,
        skip_if_empty: formData.skip_if_empty,
        active: formData.active,
        status: formData.active ? 'active' : 'paused',
      }
        frequency: formData.frequency,
        days_of_week: formData.days_of_week,
        day_of_month: Number(formData.day_of_month) || 1,
        start_date: formData.start_date || '',
        end_date: formData.end_date || '',
        time_of_day: formData.time_of_day,
        timezone: 'America/Sao_Paulo',
        recipients: formData.recipients.trim(),
        recipients_cc: formData.recipients_cc.trim(),
        email_subject: formData.email_subject.trim(),
        email_message: formData.email_message.trim(),
        formats: formData.formats,
        filters: formData.filters,
        filter_labels: formData.filter_labels,
        dynamic_date_range: formData.dynamic_date_range,
        skip_if_empty: formData.skip_if_empty,
        active: formData.active,
        status: formData.active ? 'active' : 'paused',
      }

      if (formData.id) {
        await pb.collection('report_schedules').update(formData.id, payload)
        toast({
          title: 'Agendamento atualizado!',
          description: `O agendamento "${formData.name}" foi salvo com sucesso.`,
        })
      } else {
        await pb.collection('report_schedules').create(payload)
        toast({
          title: 'Agendamento cadastrado!',
          description: `O relatório será enviado automaticamente nos horários programados.`,
        })
      }

      onSuccess()
      onOpenChange(false)
    } catch (err: any) {
      toast({
        title: 'Erro ao salvar',
        description: err?.message || 'Falha ao salvar configuração do agendamento.',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b border-border bg-emerald-950/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#005B2E]" />
              <DialogTitle className="text-lg font-bold text-[#005B2E]">
                {formData.id ? 'Editar Agendamento de Relatório' : 'Novo Agendamento de Relatório'}
              </DialogTitle>
            </div>
            <div className="flex items-center gap-2 pr-4">
              <span className="text-xs text-muted-foreground">Status:</span>
              <div className="flex items-center gap-1.5">
                <Switch
                  checked={formData.active}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({
                      ...prev,
                      active: checked,
                      status: checked ? 'active' : 'paused',
                    }))
                  }
                  className="data-[state=checked]:bg-[#005B2E] data-[state=unchecked]:bg-red-500"
                />
                <span
                  className={`text-xs font-semibold ${
                    formData.active ? 'text-emerald-700' : 'text-red-600'
                  }`}
                >
                  {formData.active ? 'Ativo' : 'Inativo'}
                </span>
              </div>
            </div>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Configure envio automático por e-mail com filtros aplicados e dados atualizados no
            momento de cada execução.
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as any)}
          className="flex-1 flex flex-col overflow-hidden"
        >
          <div className="px-6 pt-2 border-b border-border bg-muted/20">
            <TabsList className="grid grid-cols-5 h-9">
              <TabsTrigger value="geral" className="text-xs">
                1. Identificação
              </TabsTrigger>
              <TabsTrigger value="filtros" className="text-xs">
                2. Filtros e Período
              </TabsTrigger>
              <TabsTrigger value="frequencia" className="text-xs">
                3. Frequência
              </TabsTrigger>
              <TabsTrigger value="email" className="text-xs">
                4. E-mail e Anexos
              </TabsTrigger>
              <TabsTrigger value="previa" className="text-xs">
                5. Prévia dos Dados
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {/* TAB 1: IDENTIFICAÇÃO */}
            <TabsContent value="geral" className="m-0 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Módulo do Sistema *</Label>
                  <Select value={formData.module} onValueChange={handleModuleChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o módulo" />
                    </SelectTrigger>
                    <SelectContent>
                      {modules.map((mod) => (
                        <SelectItem key={mod} value={mod}>
                          {mod}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Tela / Relatório de Origem *</Label>
                  <Select value={formData.report_id} onValueChange={handleReportChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a tela de origem" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableReports.map((rep) => (
                        <SelectItem key={rep.id} value={rep.id}>
                          {rep.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {currentReportDef && (
                <div className="p-3 bg-muted/40 rounded-md border border-border text-xs flex items-start gap-2 text-muted-foreground">
                  <Info className="w-4 h-4 text-[#005B2E] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-foreground">{currentReportDef.name}:</span>{' '}
                    {currentReportDef.description} — Rota de origem:{' '}
                    <code className="bg-background px-1 py-0.5 rounded text-[11px]">
                      {currentReportDef.route}
                    </code>
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Nome do Agendamento *</Label>
                <Input
                  placeholder="Ex.: Vendas Diárias - Diretoria Comercial"
                  value={formData.name}
                  onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Descrição / Observações Internas</Label>
                <Textarea
                  placeholder="Objetivo do agendamento, quem solicitou, regras adicionais..."
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                />
              </div>

              <div className="pt-2 flex justify-end">
                <Button
                  type="button"
                  size="sm"
                  onClick={() => setActiveTab('filtros')}
                  className="bg-[#005B2E] hover:bg-[#004724] text-white"
                >
                  Avançar para Filtros &rarr;
                </Button>
              </div>
            </TabsContent>

            {/* TAB 2: FILTROS E PERÍODO */}
            <TabsContent value="filtros" className="m-0 space-y-5">
              <div className="p-3.5 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-md border border-emerald-200 dark:border-emerald-800/40 space-y-2">
                <div className="flex items-center gap-2 text-[#005B2E] dark:text-emerald-400 font-semibold text-xs">
                  <Clock className="w-4 h-4" />
                  <span>
                    Resolução Dinâmica de Período (Atualizado automaticamente a cada envio)
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-2 space-y-1">
                    <Label className="text-[11px] font-medium text-muted-foreground">
                      Período Dinâmico de Execução
                    </Label>
                    <Select
                      value={formData.dynamic_date_range}
                      onValueChange={(val: DynamicDateRangeKey) =>
                        setFormData((p) => ({ ...p, dynamic_date_range: val }))
                      }
                    >
                      <SelectTrigger className="bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DYNAMIC_DATE_RANGES.map((r) => (
                          <SelectItem key={r.key} value={r.key}>
                            {r.label} —{' '}
                            <span className="text-[11px] text-muted-foreground">
                              {r.description}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] font-medium text-muted-foreground">
                      Pular envio se vazio
                    </Label>
                    <div className="flex items-center gap-2 pt-1.5">
                      <Switch
                        checked={formData.skip_if_empty}
                        onCheckedChange={(c) => setFormData((p) => ({ ...p, skip_if_empty: c }))}
                      />
                      <span className="text-xs text-muted-foreground">
                        {formData.skip_if_empty ? 'Sim, não envia e-mail' : 'Não, envia aviso'}
                      </span>
                    </div>
                  </div>
                </div>

                {formData.dynamic_date_range === 'custom' && (
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-emerald-200/50">
                    <div className="space-y-1">
                      <Label className="text-[11px]">Data Inicial Fixa</Label>
                      <Input
                        type="datetime-local"
                        value={(formData.filters.date_from as string) || ''}
                        onChange={(e) =>
                          handleFilterValueChange(
                            { key: 'date_from', label: 'Data De', type: 'datetime' },
                            e.target.value,
                          )
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[11px]">Data Final Fixa</Label>
                      <Input
                        type="datetime-local"
                        value={(formData.filters.date_to as string) || ''}
                        onChange={(e) =>
                          handleFilterValueChange(
                            { key: 'date_to', label: 'Data Até', type: 'datetime' },
                            e.target.value,
                          )
                        }
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                    Filtros da Tela "{currentReportDef.name}"
                  </h4>
                  <span className="text-[11px] text-muted-foreground">
                    Carregados automaticamente pelo registro da tela
                  </span>
                </div>

                <div className="grid grid-cols-12 gap-3 p-4 bg-muted/20 border border-border rounded-lg">
                  {currentReportDef.filters
                    .filter(
                      (f) =>
                        f.key !== 'dynamic_date_range' &&
                        f.key !== 'date_from' &&
                        f.key !== 'date_to',
                    )
                    .map((field) => {
                      const colSpan = field.gridSpan || 6
                      const val = formData.filters[field.key]

                      if (field.type === 'select') {
                        return (
                          <div
                            key={field.key}
                            className={`col-span-12 md:col-span-${colSpan} space-y-1.5`}
                            style={{ gridColumn: `span ${colSpan} / span ${colSpan}` }}
                          >
                            <Label className="text-xs font-semibold">{field.label}</Label>
                            <Select
                              value={(val as string) || 'all'}
                              onValueChange={(newVal) => {
                                const opt = field.options?.find((o) => o.value === newVal)
                                handleFilterValueChange(field, newVal, opt?.label)
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione..." />
                              </SelectTrigger>
                              <SelectContent>
                                {field.options?.map((opt) => (
                                  <SelectItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )
                      }

                      if (field.type === 'multi-select') {
                        const selectedList: string[] = Array.isArray(val) ? val : []
                        return (
                          <div
                            key={field.key}
                            className={`col-span-12 md:col-span-${colSpan} space-y-1.5`}
                            style={{ gridColumn: `span ${colSpan} / span ${colSpan}` }}
                          >
                            <Label className="text-xs font-semibold">{field.label}</Label>
                            <div className="flex flex-wrap gap-1.5 p-2 bg-background border border-border rounded-md min-h-[38px]">
                              {field.options?.map((opt) => {
                                const active = selectedList.includes(opt.value)
                                return (
                                  <Badge
                                    key={opt.value}
                                    variant={active ? 'default' : 'outline'}
                                    className={`cursor-pointer text-[11px] transition-colors ${
                                      active
                                        ? 'bg-[#005B2E] hover:bg-[#004724] text-white'
                                        : 'hover:bg-muted'
                                    }`}
                                    onClick={() => {
                                      const next = active
                                        ? selectedList.filter((s) => s !== opt.value)
                                        : [...selectedList, opt.value]
                                      handleFilterValueChange(field, next, next.join(', '))
                                    }}
                                  >
                                    {opt.label}
                                  </Badge>
                                )
                              })}
                            </div>
                          </div>
                        )
                      }

                      if (field.type === 'boolean') {
                        return (
                          <div
                            key={field.key}
                            className={`col-span-12 md:col-span-${colSpan} flex items-center justify-between p-3 bg-background border border-border rounded-md`}
                            style={{ gridColumn: `span ${colSpan} / span ${colSpan}` }}
                          >
                            <Label className="text-xs font-semibold cursor-pointer">
                              {field.label}
                            </Label>
                            <Switch
                              checked={!!val}
                              onCheckedChange={(checked) => handleFilterValueChange(field, checked)}
                            />
                          </div>
                        )
                      }

                      return (
                        <div
                          key={field.key}
                          className={`col-span-12 md:col-span-${colSpan} space-y-1.5`}
                          style={{ gridColumn: `span ${colSpan} / span ${colSpan}` }}
                        >
                          <Label className="text-xs font-semibold">{field.label}</Label>
                          <Input
                            placeholder={
                              field.placeholder || `Filtrar por ${field.label.toLowerCase()}...`
                            }
                            value={(val as string) || ''}
                            onChange={(e) => handleFilterValueChange(field, e.target.value)}
                          />
                        </div>
                      )
                    })}
                </div>
              </div>

              <div className="pt-2 flex justify-between items-center">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab('geral')}
                >
                  &larr; Voltar
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => setActiveTab('frequencia')}
                  className="bg-[#005B2E] hover:bg-[#004724] text-white"
                >
                  Avançar para Frequência &rarr;
                </Button>
              </div>
            </TabsContent>

            {/* TAB 3: FREQUÊNCIA E CRONOGRAMA */}
            <TabsContent value="frequencia" className="m-0 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Frequência de Envio *</Label>
                  <Select
                    value={formData.frequency}
                    onValueChange={(val: 'daily' | 'weekly' | 'biweekly' | 'monthly') =>
                      setFormData((p) => ({ ...p, frequency: val }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Diariamente</SelectItem>
                      <SelectItem value="weekly">Semanalmente</SelectItem>
                      <SelectItem value="biweekly">Quinzenalmente (a cada 15 dias)</SelectItem>
                      <SelectItem value="monthly">Mensalmente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">
                    Horário de Disparo (Brasília UTC-3) *
                  </Label>
                  <Input
                    type="time"
                    value={formData.time_of_day}
                    onChange={(e) => setFormData((p) => ({ ...p, time_of_day: e.target.value }))}
                  />
                </div>
              </div>

              {/* Detalhes específicos de cada frequência */}
              {formData.frequency === 'daily' && (
                <div className="p-3 bg-muted/30 border border-border rounded-md space-y-2">
                  <Label className="text-xs font-medium">Dias de envio da semana:</Label>
                  <div className="flex flex-wrap gap-2">
                    {WEEKDAYS.map((w) => {
                      const sel = formData.days_of_week.includes(w.value)
                      return (
                        <Button
                          key={w.value}
                          type="button"
                          variant={sel ? 'default' : 'outline'}
                          size="sm"
                          className={sel ? 'bg-[#005B2E] text-white hover:bg-[#004724]' : ''}
                          onClick={() => toggleDayOfWeek(w.value)}
                        >
                          {w.label}
                        </Button>
                      )
                    })}
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Ex.: Selecione Segunda a Sexta para dias úteis ou todos para segunda a domingo.
                  </p>
                </div>
              )}

              {formData.frequency === 'weekly' && (
                <div className="p-3 bg-muted/30 border border-border rounded-md space-y-2">
                  <Label className="text-xs font-medium">Dia da semana do envio:</Label>
                  <div className="flex flex-wrap gap-2">
                    {WEEKDAYS.map((w) => {
                      const sel = formData.days_of_week.includes(w.value)
                      return (
                        <Button
                          key={w.value}
                          type="button"
                          variant={sel ? 'default' : 'outline'}
                          size="sm"
                          className={sel ? 'bg-[#005B2E] text-white hover:bg-[#004724]' : ''}
                          onClick={() => setFormData((p) => ({ ...p, days_of_week: [w.value] }))}
                        >
                          {w.label}
                        </Button>
                      )
                    })}
                  </div>
                </div>
              )}

              {formData.frequency === 'biweekly' && (
                <div className="p-3 bg-muted/30 border border-border rounded-md space-y-2">
                  <Label className="text-xs font-medium">Regra quinzenal:</Label>
                  <p className="text-xs text-muted-foreground">
                    O relatório será enviado nos dias 1º e 16 de cada mês, ou a cada 15 dias
                    corridos a partir da data de início programada.
                  </p>
                </div>
              )}

              {formData.frequency === 'monthly' && (
                <div className="p-3 bg-muted/30 border border-border rounded-md space-y-2">
                  <Label className="text-xs font-medium">Dia do mês (1 a 31):</Label>
                  <Input
                    type="number"
                    min={1}
                    max={31}
                    className="w-32"
                    value={formData.day_of_month}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, day_of_month: Number(e.target.value) || 1 }))
                    }
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Exemplo do usuário: "Desempenho dos RCAs todo dia 1º às 07:00".
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Data de Início da Vigência</Label>
                  <Input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData((p) => ({ ...p, start_date: e.target.value }))}
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Opcional. Se vazio, inicia imediatamente.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Data de Término (Opcional)</Label>
                  <Input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData((p) => ({ ...p, end_date: e.target.value }))}
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Após essa data, o envio é pausado automaticamente.
                  </p>
                </div>
              </div>

              <div className="pt-2 flex justify-between items-center">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab('filtros')}
                >
                  &larr; Voltar
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => setActiveTab('email')}
                  className="bg-[#005B2E] hover:bg-[#004724] text-white"
                >
                  Avançar para E-mail &rarr;
                </Button>
              </div>
            </TabsContent>

            {/* TAB 4: E-MAIL E ANEXOS */}
            <TabsContent value="email" className="m-0 space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Formato do Relatório *</Label>
                <div className="flex gap-4">
                  <div
                    onClick={() => toggleFormat('xlsx')}
                    className={`flex-1 p-3 border rounded-lg cursor-pointer transition-all flex items-center gap-3 ${
                      formData.formats.includes('xlsx')
                        ? 'border-[#005B2E] bg-emerald-50 dark:bg-emerald-950/20'
                        : 'border-border hover:bg-muted/30'
                    }`}
                  >
                    <FileSpreadsheet
                      className={`w-6 h-6 ${
                        formData.formats.includes('xlsx')
                          ? 'text-[#005B2E]'
                          : 'text-muted-foreground'
                      }`}
                    />
                    <div>
                      <div className="text-xs font-bold">Planilha Excel (.xlsx)</div>
                      <div className="text-[11px] text-muted-foreground">
                        Arquivo gerado nativamente no servidor anexado ao e-mail
                      </div>
                    </div>
                  </div>

                  <div
                    onClick={() => toggleFormat('pdf')}
                    className={`flex-1 p-3 border rounded-lg cursor-pointer transition-all flex items-center gap-3 ${
                      formData.formats.includes('pdf')
                        ? 'border-[#C9A227] bg-amber-50 dark:bg-amber-950/20'
                        : 'border-border hover:bg-muted/30'
                    }`}
                  >
                    <FileText
                      className={`w-6 h-6 ${
                        formData.formats.includes('pdf')
                          ? 'text-[#C9A227]'
                          : 'text-muted-foreground'
                      }`}
                    />
                    <div>
                      <div className="text-xs font-bold">PDF / Tabela Executiva</div>
                      <div className="text-[11px] text-muted-foreground">
                        Tabela formatada no corpo corporativo do e-mail
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Destinatários Principais (Para) *</Label>
                <Input
                  placeholder="diretoria@empresa.com.br, gerente@empresa.com.br"
                  value={formData.recipients}
                  onChange={(e) => setFormData((p) => ({ ...p, recipients: e.target.value }))}
                />
                <p className="text-[11px] text-muted-foreground">
                  Separe múltiplos e-mails por vírgula.
                </p>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Destinatários em Cópia (CC)</Label>
                <Input
                  placeholder="auditoria@empresa.com.br, supervisor@empresa.com.br"
                  value={formData.recipients_cc}
                  onChange={(e) => setFormData((p) => ({ ...p, recipients_cc: e.target.value }))}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Assunto do E-mail (Opcional)</Label>
                <Input
                  placeholder={`Padrão: Jetro — ${currentReportDef.name}: ${formData.name || 'Nome'}`}
                  value={formData.email_subject}
                  onChange={(e) => setFormData((p) => ({ ...p, email_subject: e.target.value }))}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Mensagem Personalizada no Corpo</Label>
                <Textarea
                  placeholder="Prezados, segue em anexo o relatório atualizado de pedidos faturados..."
                  rows={3}
                  value={formData.email_message}
                  onChange={(e) => setFormData((p) => ({ ...p, email_message: e.target.value }))}
                />
              </div>

              <div className="pt-2 flex justify-between items-center">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab('frequencia')}
                >
                  &larr; Voltar
                </Button>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isTesting}
                    onClick={handleSendTest}
                    className="border-emerald-600 text-[#005B2E] hover:bg-emerald-50"
                  >
                    {isTesting ? (
                      <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4 mr-1.5" />
                    )}
                    Enviar Teste Agora
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setActiveTab('previa')}
                    className="bg-[#005B2E] hover:bg-[#004724] text-white"
                  >
                    Ver Prévia &rarr;
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* TAB 5: PRÉVIA */}
            <TabsContent value="previa" className="m-0 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[#005B2E] uppercase">
                    Simulação dos Dados da Execução
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Verifique os registros que seriam incluídos na próxima geração de acordo com os
                    filtros configurados.
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  disabled={isPreviewing}
                  onClick={handlePreviewReport}
                  className="bg-[#005B2E] hover:bg-[#004724] text-white"
                >
                  {isPreviewing ? (
                    <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                  ) : (
                    <Eye className="w-4 h-4 mr-1.5" />
                  )}
                  Recarregar Prévia
                </Button>
              </div>

              {previewResult ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-3 p-3 bg-muted/30 border border-border rounded-lg text-xs">
                    <div>
                      <span className="text-muted-foreground">Total de Registros:</span>
                      <div className="text-base font-bold text-[#005B2E]">
                        {previewResult.total_count}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Valor Somado:</span>
                      <div className="text-base font-bold text-[#005B2E]">
                        {previewResult.total_sum}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Período Resolvido:</span>
                      <div className="font-semibold text-foreground">
                        {previewResult.date_range?.label}
                      </div>
                    </div>
                  </div>

                  {previewResult.sample_records && previewResult.sample_records.length > 0 ? (
                    <div className="border border-border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader className="bg-[#005B2E] text-white">
                          <TableRow>
                            {previewResult.columns.slice(0, 6).map((col: any) => (
                              <TableHead key={col.key} className="text-white text-xs font-bold">
                                {col.label}
                              </TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {previewResult.sample_records.map((row: any, rIdx: number) => (
                            <TableRow key={row.id || rIdx}>
                              {previewResult.columns.slice(0, 6).map((col: any) => (
                                <TableCell key={col.key} className="text-xs">
                                  {row[col.key] || '—'}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="p-6 text-center text-xs text-muted-foreground border border-dashed rounded-lg">
                      Nenhum registro encontrado no período configurado.
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-8 text-center border border-dashed rounded-lg space-y-2">
                  <Eye className="w-8 h-8 mx-auto text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">
                    Clique no botão acima para carregar a prévia instantânea diretamente do backend.
                  </p>
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>

        <DialogFooter className="px-6 py-3 border-t border-border bg-muted/10 flex items-center justify-between sm:justify-between">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isTesting}
              onClick={handleSendTest}
              className="text-[#005B2E] border-emerald-600 hover:bg-emerald-50"
            >
              {isTesting ? (
                <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
              ) : (
                <Send className="w-4 h-4 mr-1.5" />
              )}
              Enviar Teste
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={isPreviewing}
              onClick={handlePreviewReport}
            >
              <Eye className="w-4 h-4 mr-1.5" />
              Visualizar Relatório
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={isSaving}
              onClick={handleSaveSchedule}
              className="bg-[#005B2E] hover:bg-[#004724] text-white font-semibold"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-1.5" />
              )}
              Salvar Agendamento
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
