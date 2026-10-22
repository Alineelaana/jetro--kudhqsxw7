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
  Info,
  Search,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  FolderOpen,
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
import { useAuth } from '@/hooks/use-auth'
import { canUserAccessReportModule } from '@/lib/permissions'
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
  recipients_bcc: string
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
  const { userRole } = useAuth()
  const isSup = userRole === 'SUP'

  // Filtrar apenas módulos que o usuário tem permissão para consultar
  const permittedModules = useMemo(() => {
    const all = getAllReportModules()
    if (isSup) return all
    return all.filter((m) => canUserAccessReportModule(userRole, m))
  }, [isSup, userRole])

  const defaultModule =
    initialData?.module && permittedModules.includes(initialData.module)
      ? initialData.module
      : permittedModules[0] || 'Comercial'
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
  const [searchModuleQuery, setSearchModuleQuery] = useState('')
  const [collapsedModules, setCollapsedModules] = useState<Record<string, boolean>>({})

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
    recipients_bcc: initialData?.recipients_bcc || '',
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

  // Alterna colapso do módulo na lista hierárquica esquerda
  const toggleCollapseModule = (modName: string) => {
    setCollapsedModules((prev) => ({
      ...prev,
      [modName]: !prev[modName],
    }))
  }

  // Seleciona um relatório clicado na lista esquerda
  const handleSelectReportSource = (reportId: string, moduleName: string) => {
    setFormData((prev) => ({
      ...prev,
      module: moduleName,
      report_id: reportId,
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
        title: 'Aviso na consulta da prévia',
        description: err?.message || 'Nenhum dado encontrado para os filtros selecionados.',
      })
      setPreviewResult({
        total_count: 0,
        sample_records: [],
        columns: currentReportDef?.columns || [],
      })
      setActiveTab('previa')
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
          recipients_bcc: formData.recipients_bcc,
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
        description: `${res.message} (${res.record_count} registros processados). Usuários SUP receberam cópia oculta (CCO).`,
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
        recipients_bcc: formData.recipients_bcc.trim(),
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

  // Filtragem e busca dos módulos e telas para a coluna lateral esquerda
  const filteredModulesList = useMemo(() => {
    const q = searchModuleQuery.trim().toLowerCase()
    return permittedModules
      .map((mod) => {
        const reps = getReportsByModule(mod)
        if (!q) return { module: mod, reports: reps }
        const matchedReps = reps.filter(
          (r) =>
            r.name.toLowerCase().includes(q) ||
            r.description.toLowerCase().includes(q) ||
            mod.toLowerCase().includes(q),
        )
        return { module: mod, reports: matchedReps }
      })
      .filter((item) => item.reports.length > 0)
  }, [permittedModules, searchModuleQuery])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl w-[96vw] h-[88vh] flex flex-col p-0 gap-0 overflow-hidden">
        {/* Cabeçalho Superior */}
        <DialogHeader className="px-6 py-3.5 border-b border-border bg-emerald-950/10 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#005B2E]/10 flex items-center justify-center text-[#005B2E]">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-[#005B2E]">
                  {formData.id
                    ? 'Editar Agendamento de Relatório'
                    : 'Novo Agendamento de Relatório'}
                </DialogTitle>
                <DialogDescription className="text-[11px] text-muted-foreground">
                  Automação corporativa com layout analítico, filtros da tela, cronograma e envio
                  seguro por e-mail com CCO institucional.
                </DialogDescription>
              </div>
            </div>
            <div className="flex items-center gap-3 pr-2">
              <span className="text-xs text-muted-foreground font-medium">Status:</span>
              <div className="flex items-center gap-2">
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
                <Badge
                  variant={formData.active ? 'default' : 'secondary'}
                  className={
                    formData.active
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white text-[11px]'
                      : 'bg-red-100 text-red-700 hover:bg-red-200 text-[11px]'
                  }
                >
                  {formData.active ? 'Ativo' : 'Pausado'}
                </Badge>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Corpo Principal em 2 Colunas */}
        <div className="flex-1 flex overflow-hidden">
          {/* COLUNA ESQUERDA: W-80 — Busca rápida + Lista hierárquica colapsável com badge da tela ativa */}
          <aside className="w-80 shrink-0 border-r border-border bg-muted/20 flex flex-col overflow-hidden">
            <div className="p-3 border-b border-border bg-background/60">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchModuleQuery}
                  onChange={(e) => setSearchModuleQuery(e.target.value)}
                  placeholder="Buscar módulo ou tela..."
                  className="pl-8 h-8 text-xs bg-background"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1 text-xs">
              {filteredModulesList.length === 0 ? (
                <div className="p-4 text-center text-xs text-muted-foreground">
                  Nenhuma tela encontrada para a busca "{searchModuleQuery}".
                </div>
              ) : (
                filteredModulesList.map((item) => {
                  const isCollapsed = !!collapsedModules[item.module]
                  const hasActiveReport = item.reports.some((r) => r.id === formData.report_id)

                  return (
                    <div
                      key={item.module}
                      className="rounded-md border border-border/40 overflow-hidden bg-background/50"
                    >
                      <button
                        type="button"
                        onClick={() => toggleCollapseModule(item.module)}
                        className={`w-full px-2.5 py-1.5 flex items-center justify-between text-left font-medium transition-colors hover:bg-muted/50 ${
                          hasActiveReport
                            ? 'text-[#005B2E] font-semibold bg-emerald-50/40 dark:bg-emerald-950/20'
                            : 'text-foreground'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          {isCollapsed ? (
                            <ChevronRight className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
                          )}
                          <FolderOpen className="w-3.5 h-3.5 shrink-0 text-emerald-700" />
                          <span className="truncate">{item.module}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground ml-1 shrink-0 bg-muted px-1.5 py-0.2 rounded-full">
                          {item.reports.length}
                        </span>
                      </button>

                      {!isCollapsed && (
                        <div className="pl-4 pr-1 py-1 space-y-0.5 border-t border-border/30 bg-muted/10">
                          {item.reports.map((rep) => {
                            const isSelected = rep.id === formData.report_id
                            return (
                              <button
                                key={rep.id}
                                type="button"
                                onClick={() => handleSelectReportSource(rep.id, item.module)}
                                className={`w-full px-2 py-1.5 text-left rounded text-[11px] flex items-center justify-between transition-colors ${
                                  isSelected
                                    ? 'bg-[#005B2E] text-white font-medium shadow-xs'
                                    : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground'
                                }`}
                              >
                                <span className="truncate pr-1">{rep.name}</span>
                                {isSelected && (
                                  <Badge className="bg-white/20 hover:bg-white/30 text-white text-[9px] px-1 py-0 h-4 border-0 shrink-0">
                                    Ativa
                                  </Badge>
                                )}
                              </button>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </div>

            <div className="p-2.5 border-t border-border bg-background/80 text-[11px] text-muted-foreground flex items-center justify-between">
              <span>Módulos autorizados:</span>
              <span className="font-semibold text-foreground">{permittedModules.length}</span>
            </div>
          </aside>

          {/* COLUNA DIREITA: Abas de Configuração e Prévia */}
          <main className="flex-1 flex flex-col overflow-hidden bg-background">
            <Tabs
              value={activeTab}
              onValueChange={(v) => setActiveTab(v as any)}
              className="flex-1 flex flex-col overflow-hidden"
            >
              <div className="px-6 pt-2.5 border-b border-border bg-muted/10 shrink-0">
                <TabsList className="grid grid-cols-5 h-9 bg-muted/40">
                  <TabsTrigger value="geral" className="text-xs">
                    Identificação
                  </TabsTrigger>
                  <TabsTrigger value="filtros" className="text-xs">
                    Filtros da Tela
                  </TabsTrigger>
                  <TabsTrigger value="frequencia" className="text-xs">
                    Frequência
                  </TabsTrigger>
                  <TabsTrigger value="email" className="text-xs">
                    Destinatários & CCO
                  </TabsTrigger>
                  <TabsTrigger value="previa" className="text-xs">
                    Prévia
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {/* ABA 1: IDENTIFICAÇÃO */}
                <TabsContent value="geral" className="m-0 space-y-4">
                  {currentReportDef && (
                    <div className="p-3.5 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-md border border-emerald-200 dark:border-emerald-800/40 text-xs flex items-start gap-2.5 text-foreground">
                      <CheckCircle2 className="w-4 h-4 text-[#005B2E] shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#005B2E] text-xs">
                            {currentReportDef.name}
                          </span>
                          <Badge
                            variant="outline"
                            className="text-[10px] py-0 border-emerald-600/40 text-emerald-800"
                          >
                            {currentReportDef.module}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {currentReportDef.description} — Tabela base:{' '}
                          <code className="bg-background px-1.5 py-0.5 rounded text-[11px] border">
                            {currentReportDef.collectionName}
                          </code>
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Nome do Agendamento *</Label>
                    <Input
                      placeholder="Ex.: Relatório Diário de Pedidos Faturados"
                      value={formData.name}
                      onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Descrição / Finalidade</Label>
                    <Textarea
                      placeholder="Ex.: Envio matinal para acompanhamento da diretoria executiva e gerência..."
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

                {/* ABA 2: FILTROS DA TELA */}
                <TabsContent value="filtros" className="m-0 space-y-5">
                  <div className="p-3.5 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-md border border-emerald-200 dark:border-emerald-800/40 space-y-2">
                    <div className="flex items-center gap-2 text-[#005B2E] dark:text-emerald-400 font-semibold text-xs">
                      <Clock className="w-4 h-4" />
                      <span>Período Dinâmico (Calculado no Momento da Execução)</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="md:col-span-2 space-y-1">
                        <Label className="text-[11px] font-medium text-muted-foreground">
                          Resolução Temporal
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
                          Pular se Vazio
                        </Label>
                        <div className="flex items-center gap-2 pt-1.5">
                          <Switch
                            checked={formData.skip_if_empty}
                            onCheckedChange={(c) =>
                              setFormData((p) => ({ ...p, skip_if_empty: c }))
                            }
                          />
                          <span className="text-xs text-muted-foreground">
                            {formData.skip_if_empty ? 'Não envia e-mail' : 'Envia aviso de vazio'}
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
                        Filtros Específicos: {currentReportDef.name}
                      </h4>
                      <span className="text-[11px] text-muted-foreground">
                        {currentReportDef.filters.length} filtro(s) disponíveis
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
                                  onCheckedChange={(checked) =>
                                    handleFilterValueChange(field, checked)
                                  }
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

                {/* ABA 3: FREQUÊNCIA */}
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
                        onChange={(e) =>
                          setFormData((p) => ({ ...p, time_of_day: e.target.value }))
                        }
                      />
                    </div>
                  </div>

                  {formData.frequency === 'daily' && (
                    <div className="p-3 bg-muted/30 border border-border rounded-md space-y-2">
                      <Label className="text-xs font-medium">Dias da semana:</Label>
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
                        Selecione Segunda a Sexta para dias úteis corporativos.
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
                              onClick={() =>
                                setFormData((p) => ({ ...p, days_of_week: [w.value] }))
                              }
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
                        O relatório será disparado nos dias 1º e 16 de cada mês.
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
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Data de Término (Opcional)</Label>
                      <Input
                        type="date"
                        value={formData.end_date}
                        onChange={(e) => setFormData((p) => ({ ...p, end_date: e.target.value }))}
                      />
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

                {/* ABA 4: DESTINATÁRIOS & CCO */}
                <TabsContent value="email" className="m-0 space-y-4">
                  {/* Banner informativo de CCO para SUPs */}
                  <div className="p-3 bg-blue-50/70 dark:bg-blue-950/20 rounded-md border border-blue-200 dark:border-blue-900/40 text-xs flex items-start gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-blue-950 dark:text-blue-200">
                        Auditoria & Supervisão Automática:
                      </span>{' '}
                      <span className="text-blue-900 dark:text-blue-300">
                        Usuários com perfil SUP (Superusuários) ativos recebem cópia oculta (CCO /
                        BCC) automaticamente em todos os disparos executados para governança do
                        sistema.
                      </span>
                    </div>
                  </div>

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
                            Anexo gerado nativamente no servidor
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
                            Formatada no corpo corporativo do e-mail
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">
                      Destinatários Principais (Para) *
                    </Label>
                    <Input
                      placeholder="diretoria@empresa.com.br, gerente@empresa.com.br"
                      value={formData.recipients}
                      onChange={(e) => setFormData((p) => ({ ...p, recipients: e.target.value }))}
                    />
                    <p className="text-[11px] text-muted-foreground">
                      Separe múltiplos e-mails por vírgula.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Cópia (CC)</Label>
                      <Input
                        placeholder="supervisor@empresa.com.br"
                        value={formData.recipients_cc}
                        onChange={(e) =>
                          setFormData((p) => ({ ...p, recipients_cc: e.target.value }))
                        }
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">
                        Cópia Oculta Adicional (CCO / BCC)
                      </Label>
                      <Input
                        placeholder="auditoria@empresa.com.br"
                        value={formData.recipients_bcc}
                        onChange={(e) =>
                          setFormData((p) => ({ ...p, recipients_bcc: e.target.value }))
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Assunto do E-mail (Opcional)</Label>
                    <Input
                      placeholder={`Padrão: HURAM — ${currentReportDef.name}: ${formData.name || 'Agendamento'}`}
                      value={formData.email_subject}
                      onChange={(e) =>
                        setFormData((p) => ({ ...p, email_subject: e.target.value }))
                      }
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Mensagem no Corpo do E-mail</Label>
                    <Textarea
                      placeholder="Prezados, segue o relatório analítico agendado..."
                      rows={3}
                      value={formData.email_message}
                      onChange={(e) =>
                        setFormData((p) => ({ ...p, email_message: e.target.value }))
                      }
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
                        Disparar Teste Imediato
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => setActiveTab('previa')}
                        className="bg-[#005B2E] hover:bg-[#004724] text-white"
                      >
                        Avançar para Prévia &rarr;
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                {/* ABA 5: PRÉVIA DOS DADOS */}
                <TabsContent value="previa" className="m-0 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-[#005B2E] uppercase">
                        Amostra Real da Consulta (Tabela: {currentReportDef.collectionName})
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Visualização direta da base de dados com as colunas oficiais e filtros
                        configurados.
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
                      Carregar Amostra Real
                    </Button>
                  </div>

                  {previewResult ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-3 gap-3 p-3 bg-muted/30 border border-border rounded-lg text-xs">
                        <div>
                          <span className="text-muted-foreground">Total de Linhas:</span>
                          <div className="text-base font-bold text-[#005B2E]">
                            {previewResult.total_count || 0}
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Total Calculado:</span>
                          <div className="text-base font-bold text-[#005B2E]">
                            {previewResult.total_sum || '—'}
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Período Avaliado:</span>
                          <div className="font-semibold text-foreground">
                            {previewResult.date_range?.label || 'Conforme agendamento'}
                          </div>
                        </div>
                      </div>

                      {previewResult.sample_records && previewResult.sample_records.length > 0 ? (
                        <div className="border border-border rounded-lg overflow-x-auto max-h-[38vh]">
                          <Table>
                            <TableHeader className="bg-[#005B2E] text-white sticky top-0">
                              <TableRow>
                                {(previewResult.columns || currentReportDef.columns)
                                  .slice(0, 8)
                                  .map((col: any) => (
                                    <TableHead
                                      key={col.key}
                                      className="text-white text-xs font-bold whitespace-nowrap"
                                    >
                                      {col.label}
                                    </TableHead>
                                  ))}
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {previewResult.sample_records.map((row: any, rIdx: number) => (
                                <TableRow key={row.id || rIdx}>
                                  {(previewResult.columns || currentReportDef.columns)
                                    .slice(0, 8)
                                    .map((col: any) => (
                                      <TableCell
                                        key={col.key}
                                        className="text-xs whitespace-nowrap"
                                      >
                                        {row[col.key] || '—'}
                                      </TableCell>
                                    ))}
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      ) : (
                        <div className="p-8 text-center text-xs text-muted-foreground bg-muted/20 border border-dashed rounded-lg space-y-1">
                          <Info className="w-5 h-5 mx-auto text-muted-foreground/70 mb-1" />
                          <div className="font-semibold text-foreground">
                            Nenhum dado encontrado para os filtros selecionados
                          </div>
                          <div>
                            Os filtros configurados não retornaram registros nesta empresa/período.
                            O agendamento está operacional.
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-10 text-center border border-dashed rounded-lg space-y-2 bg-muted/10">
                      <Eye className="w-8 h-8 mx-auto text-muted-foreground/60" />
                      <div className="text-xs font-medium text-foreground">
                        Nenhuma prévia consultada no momento
                      </div>
                      <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                        Clique no botão acima para inspecionar os dados reais da tabela antes de
                        salvar.
                      </p>
                    </div>
                  )}
                </TabsContent>
              </div>
            </Tabs>
          </main>
        </div>

        {/* Rodapé Inferior */}
        <DialogFooter className="px-6 py-3 border-t border-border bg-muted/10 flex items-center justify-between sm:justify-between shrink-0">
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
