import { useState, useEffect, useMemo } from 'react'
import {
  CalendarClock,
  Plus,
  Play,
  Copy,
  Pencil,
  Trash2,
  History,
  FileSpreadsheet,
  FileText,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Mail,
  Clock,
  Layers,
  ArrowUpDown,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { pb } from '@/lib/pocketbase/client'
import { useToast } from '@/hooks/use-toast'
import { ReportScheduleDialog, ReportScheduleFormData } from './report-schedule-dialog'
import { ExecutionHistoryDialog } from './report-schedule-history-dialog'
import {
  REPORT_SOURCES_REGISTRY,
  getAllReportModules,
  DYNAMIC_DATE_RANGES,
} from '@/lib/report-schedule-registry'

export default function ReportSchedulesPage() {
  const { toast } = useToast()

  const [schedules, setSchedules] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [moduleFilter, setModuleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  // Modais
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState<Partial<ReportScheduleFormData> | null>(
    null,
  )
  const [historyOpen, setHistoryOpen] = useState(false)
  const [selectedScheduleForHistory, setSelectedScheduleForHistory] = useState<any | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [executingId, setExecutingId] = useState<string | null>(null)

  const modules = getAllReportModules()

  const loadSchedules = async () => {
    setLoading(true)
    try {
      const res = await pb.collection('report_schedules').getFullList({
        sort: '-created',
      })
      setSchedules(res)
    } catch (err: any) {
      toast({
        title: 'Erro ao carregar agendamentos',
        description: err?.message || 'Falha ao buscar agendamentos de relatórios.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSchedules()
  }, [])

  // Filtragem dos agendamentos
  const filteredSchedules = useMemo(() => {
    return schedules.filter((s) => {
      if (moduleFilter !== 'all' && s.module !== moduleFilter) return false
      if (statusFilter === 'active' && (!s.active || s.status === 'paused')) return false
      if (statusFilter === 'paused' && s.active) return false
      if (statusFilter === 'error' && s.status !== 'error' && s.status !== 'needs_review')
        return false

      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase()
        const matchName = (s.name || '').toLowerCase().includes(term)
        const matchRecipients = (s.recipients || '').toLowerCase().includes(term)
        const matchReport = (s.report_id || '').toLowerCase().includes(term)
        return matchName || matchRecipients || matchReport
      }

      return true
    })
  }, [schedules, moduleFilter, statusFilter, searchTerm])

  // Ação: Ativar / Desativar
  const handleToggleActive = async (schedule: any, newActive: boolean) => {
    try {
      await pb.collection('report_schedules').update(schedule.id, {
        active: newActive,
        status: newActive ? 'active' : 'paused',
      })
      setSchedules((prev) =>
        prev.map((s) =>
          s.id === schedule.id
            ? { ...s, active: newActive, status: newActive ? 'active' : 'paused' }
            : s,
        ),
      )
      toast({
        title: newActive ? 'Agendamento Ativado' : 'Agendamento Pausado',
        description: `O agendamento "${schedule.name}" foi ${newActive ? 'ativado' : 'pausado'}.`,
      })
    } catch (err: any) {
      toast({
        title: 'Erro ao alterar status',
        description: err?.message,
        variant: 'destructive',
      })
    }
  }

  // Ação: Duplicar Agendamento
  const handleDuplicate = (schedule: any) => {
    const cloneData: Partial<ReportScheduleFormData> = {
      name: `${schedule.name} (Cópia)`,
      description: schedule.description || '',
      module: schedule.module,
      report_id: schedule.report_id,
      frequency: schedule.frequency,
      days_of_week: Array.isArray(schedule.days_of_week) ? schedule.days_of_week : [1, 2, 3, 4, 5],
      day_of_month: schedule.day_of_month || 1,
      start_date: schedule.start_date || '',
      end_date: schedule.end_date || '',
      time_of_day: schedule.time_of_day || '07:00',
      recipients: schedule.recipients || '',
      recipients_cc: schedule.recipients_cc || '',
      email_subject: schedule.email_subject || '',
      email_message: schedule.email_message || '',
      formats: Array.isArray(schedule.formats) ? schedule.formats : ['xlsx'],
      filters: schedule.filters || {},
      filter_labels: schedule.filter_labels || {},
      dynamic_date_range: schedule.dynamic_date_range || 'yesterday',
      skip_if_empty: schedule.skip_if_empty || false,
      active: true,
      status: 'active',
    }
    setEditingSchedule(cloneData)
    setDialogOpen(true)
  }

  // Ação: Executar Agora (Manual)
  const handleExecuteNow = async (schedule: any) => {
    setExecutingId(schedule.id)
    try {
      const res = await pb.send('/backend/v1/report-schedules/trigger', {
        method: 'POST',
        body: JSON.stringify({ schedule_id: schedule.id }),
      })
      toast({
        title: 'Relatório Executado e Enviado!',
        description: `${res.message} (${res.record_count} registros processados).`,
      })
      loadSchedules()
    } catch (err: any) {
      toast({
        title: 'Erro na execução imediata',
        description: err?.message || 'Falha ao processar o disparo manual.',
        variant: 'destructive',
      })
    } finally {
      setExecutingId(null)
    }
  }

  // Ação: Excluir Agendamento
  const handleDeleteConfirm = async () => {
    if (!deleteId) return
    try {
      await pb.collection('report_schedules').delete(deleteId)
      setSchedules((prev) => prev.filter((s) => s.id !== deleteId))
      toast({
        title: 'Agendamento excluído',
        description: 'O agendamento foi removido com sucesso.',
      })
    } catch (err: any) {
      toast({
        title: 'Erro ao excluir',
        description: err?.message,
        variant: 'destructive',
      })
    } finally {
      setDeleteId(null)
    }
  }

  // Helpers de Formatação
  const formatFrequency = (s: any) => {
    const f = s.frequency
    if (f === 'daily') {
      const days = Array.isArray(s.days_of_week) ? s.days_of_week : []
      if (days.length === 5 && !days.includes(0) && !days.includes(6)) return 'Diário (Seg-Sex)'
      if (days.length === 7 || days.length === 0) return 'Diário (Todos os dias)'
      return `Diário (${days.length} dias/sem)`
    }
    if (f === 'weekly') return 'Semanal'
    if (f === 'biweekly') return 'Quinzenal (15 dias)'
    if (f === 'monthly') return `Mensal (Dia ${s.day_of_month || 1})`
    return f
  }

  const formatDateTimeBR = (isoStr: string) => {
    if (!isoStr) return 'Nunca executado'
    return new Date(isoStr).toLocaleString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const renderStatusBadge = (s: any) => {
    if (s.status === 'error' || s.last_run_status === 'error') {
      return (
        <Badge variant="destructive" className="flex items-center gap-1 font-semibold">
          <XCircle className="w-3 h-3" /> Com Erro
        </Badge>
      )
    }
    if (s.status === 'needs_review') {
      return (
        <Badge className="bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 flex items-center gap-1">
          <AlertTriangle className="w-3 h-3 text-amber-600" /> Requer Revisão
        </Badge>
      )
    }
    if (!s.active || s.status === 'paused') {
      return (
        <Badge variant="outline" className="text-muted-foreground border-dashed">
          Pausado
        </Badge>
      )
    }
    return (
      <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 flex items-center gap-1">
        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Ativo
      </Badge>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header corporativo */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#005B2E]">
            <CalendarClock className="w-4 h-4" />
            <span>Administração &gt; Automações do Sistema</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#005B2E] mt-1">
            Agendamento de Relatórios
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure o envio automático periódico de relatórios por e-mail com filtros
            personalizados e dados atualizados no momento da execução.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={loadSchedules}
            disabled={loading}
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={() => {
              setEditingSchedule(null)
              setDialogOpen(true)
            }}
            className="bg-[#005B2E] hover:bg-[#004724] text-white font-semibold shadow-sm"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Novo Agendamento
          </Button>
        </div>
      </div>

      {/* Cards de Métricas / Resumo */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-background border border-border rounded-lg shadow-sm">
          <div className="text-xs text-muted-foreground font-medium uppercase">Total Agendados</div>
          <div className="text-2xl font-bold text-foreground mt-1">{schedules.length}</div>
        </div>
        <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 rounded-lg shadow-sm">
          <div className="text-xs text-[#005B2E] dark:text-emerald-400 font-semibold uppercase">
            Ativos
          </div>
          <div className="text-2xl font-bold text-[#005B2E] mt-1">
            {schedules.filter((s) => s.active && s.status !== 'paused').length}
          </div>
        </div>
        <div className="p-4 bg-background border border-border rounded-lg shadow-sm">
          <div className="text-xs text-muted-foreground font-medium uppercase">Pausados</div>
          <div className="text-2xl font-bold text-muted-foreground mt-1">
            {schedules.filter((s) => !s.active || s.status === 'paused').length}
          </div>
        </div>
        <div className="p-4 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-lg shadow-sm">
          <div className="text-xs text-amber-700 dark:text-amber-400 font-semibold uppercase">
            Com Erro / Revisão
          </div>
          <div className="text-2xl font-bold text-amber-700 mt-1">
            {schedules.filter((s) => s.status === 'error' || s.status === 'needs_review').length}
          </div>
        </div>
      </div>

      {/* Barra de Busca e Filtros */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-muted/20 border border-border rounded-lg">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, relatório ou destinatário..."
            className="pl-9 bg-background text-xs"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Select value={moduleFilter} onValueChange={setModuleFilter}>
            <SelectTrigger className="w-[160px] bg-background text-xs">
              <SelectValue placeholder="Módulo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Módulos</SelectItem>
              {modules.map((m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px] bg-background text-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos Status</SelectItem>
              <SelectItem value="active">Ativos</SelectItem>
              <SelectItem value="paused">Pausados</SelectItem>
              <SelectItem value="error">Com Erro</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabela de Agendamentos */}
      <div className="border border-border rounded-lg bg-background overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="text-xs font-bold text-foreground">Agendamento</TableHead>
              <TableHead className="text-xs font-bold text-foreground">Módulo / Tela</TableHead>
              <TableHead className="text-xs font-bold text-foreground">
                Frequência / Horário
              </TableHead>
              <TableHead className="text-xs font-bold text-foreground">Formato</TableHead>
              <TableHead className="text-xs font-bold text-foreground">Último Envio</TableHead>
              <TableHead className="text-xs font-bold text-foreground">Status</TableHead>
              <TableHead className="text-xs font-bold text-right text-foreground">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-xs text-muted-foreground">
                  <Loader2 className="w-6 h-6 mx-auto animate-spin mb-2 text-[#005B2E]" />
                  Carregando agendamentos...
                </TableCell>
              </TableRow>
            ) : filteredSchedules.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-xs text-muted-foreground">
                  <CalendarClock className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  Nenhum agendamento de relatório encontrado com os filtros selecionados.
                  <div className="mt-3">
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => {
                        setEditingSchedule(null)
                        setDialogOpen(true)
                      }}
                      className="bg-[#005B2E] text-white hover:bg-[#004724]"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Criar Primeiro Agendamento
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredSchedules.map((sched) => {
                const reportDef = REPORT_SOURCES_REGISTRY[sched.report_id]
                const formats = Array.isArray(sched.formats) ? sched.formats : ['xlsx']
                const isExecuting = executingId === sched.id

                return (
                  <TableRow key={sched.id} className="hover:bg-muted/30 transition-colors">
                    {/* Nome + Detalhes */}
                    <TableCell className="py-3">
                      <div className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                        {sched.name}
                      </div>
                      {sched.description && (
                        <div className="text-[11px] text-muted-foreground truncate max-w-[260px]">
                          {sched.description}
                        </div>
                      )}
                      <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Mail className="w-3 h-3 text-[#005B2E]" />
                        <span className="truncate max-w-[240px]" title={sched.recipients}>
                          {sched.recipients}
                        </span>
                      </div>
                    </TableCell>

                    {/* Módulo / Tela */}
                    <TableCell className="py-3">
                      <div className="text-xs font-semibold text-foreground">
                        {reportDef ? reportDef.name : sched.report_id}
                      </div>
                      <div className="text-[11px] text-muted-foreground">{sched.module}</div>
                    </TableCell>

                    {/* Frequência / Horário */}
                    <TableCell className="py-3">
                      <div className="text-xs font-medium text-foreground">
                        {formatFrequency(sched)}
                      </div>
                      <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        às {sched.time_of_day || '08:00'} (Brasília)
                      </div>
                    </TableCell>

                    {/* Formato */}
                    <TableCell className="py-3">
                      <div className="flex items-center gap-1.5">
                        {formats.includes('xlsx') && (
                          <Badge
                            variant="outline"
                            className="text-[10px] bg-emerald-50 text-emerald-800 border-emerald-300"
                          >
                            <FileSpreadsheet className="w-3 h-3 mr-0.5 text-emerald-600" /> Excel
                          </Badge>
                        )}
                        {formats.includes('pdf') && (
                          <Badge
                            variant="outline"
                            className="text-[10px] bg-amber-50 text-amber-800 border-amber-300"
                          >
                            <FileText className="w-3 h-3 mr-0.5 text-[#C9A227]" /> PDF
                          </Badge>
                        )}
                      </div>
                    </TableCell>

                    {/* Último Envio */}
                    <TableCell className="py-3 text-xs">
                      <div>{formatDateTimeBR(sched.last_run_at)}</div>
                      {sched.last_run_status && (
                        <div className="text-[11px] text-muted-foreground">
                          {sched.last_run_count !== undefined && `${sched.last_run_count} reg. `}
                          {sched.last_run_total && `(${sched.last_run_total})`}
                        </div>
                      )}
                    </TableCell>

                    {/* Status + Toggle */}
                    <TableCell className="py-3">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={sched.active}
                          onCheckedChange={(checked) => handleToggleActive(sched, checked)}
                          className="data-[state=checked]:bg-[#005B2E] data-[state=unchecked]:bg-red-500 scale-90"
                        />
                        {renderStatusBadge(sched)}
                      </div>
                    </TableCell>

                    {/* Ações */}
                    <TableCell className="py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-[#005B2E] hover:bg-emerald-50"
                          title="Executar Agora (Disparo Imediato)"
                          disabled={isExecuting}
                          onClick={() => handleExecuteNow(sched)}
                        >
                          {isExecuting ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Play className="w-4 h-4" />
                          )}
                        </Button>

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          title="Histórico de Envios"
                          onClick={() => {
                            setSelectedScheduleForHistory(sched)
                            setHistoryOpen(true)
                          }}
                        >
                          <History className="w-4 h-4" />
                        </Button>

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          title="Duplicar Agendamento"
                          onClick={() => handleDuplicate(sched)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          title="Editar Agendamento"
                          onClick={() => {
                            setEditingSchedule(sched)
                            setDialogOpen(true)
                          }}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-600 hover:bg-red-50"
                          title="Excluir Agendamento"
                          onClick={() => setDeleteId(sched.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modal de Cadastro / Edição / Duplicação */}
      {dialogOpen && (
        <ReportScheduleDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          initialData={editingSchedule}
          onSuccess={loadSchedules}
        />
      )}

      {/* Modal de Histórico */}
      {historyOpen && selectedScheduleForHistory && (
        <ExecutionHistoryDialog
          open={historyOpen}
          onOpenChange={setHistoryOpen}
          scheduleId={selectedScheduleForHistory.id}
          scheduleName={selectedScheduleForHistory.name}
        />
      )}

      {/* Confirmação de Exclusão */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive flex items-center gap-2">
              <Trash2 className="w-5 h-5" /> Excluir Agendamento?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação removerá permanentemente o agendamento de relatório e interromperá seus
              disparos automáticos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Sim, Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
