import { useState, useEffect, useMemo } from 'react'
import {
  type CommissionDeduction,
  type CommissionDeductionReason,
  type BeneficiarioProfissional,
  type StatusLancamento,
  listarDeducoes,
  listarMotivosDeducao,
  criarMotivoDeducao,
  listarProfissionaisERP,
  listarDevolucoesERP,
  criarDeducao,
  atualizarDeducao,
  excluirDeducao,
  atualizarStatusDeducao,
  verificarDevolucaoEstornada,
} from '@/services/comissao-premiacoes-deducoes'
import pb from '@/lib/pocketbase/client'
import { useToast } from '@/hooks/use-toast'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  MinusCircle,
  Search,
  Plus,
  Filter,
  FileSpreadsheet,
  Printer,
  History,
  CheckCircle2,
  XCircle,
  Clock,
  Ban,
  Trash2,
  Edit,
  Tag,
  AlertTriangle,
  Upload,
  Receipt,
  FileText,
  RotateCcw,
  ShieldAlert,
  TrendingDown,
} from 'lucide-react'

function formatMoeda(val: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(val || 0)
}

function formatData(dataStr?: string): string {
  if (!dataStr) return '—'
  const partes = dataStr.slice(0, 10).split('-')
  if (partes.length === 3) return `${partes[2]}/${partes[1]}/${partes[0]}`
  return dataStr
}

export function DescontosDeducoesPage() {
  const { toast } = useToast()

  // Estados principais
  const [loading, setLoading] = useState(true)
  const [deductions, setDeductions] = useState<CommissionDeduction[]>([])
  const [motivos, setMotivos] = useState<CommissionDeductionReason[]>([])
  const [profissionais, setProfissionais] = useState<BeneficiarioProfissional[]>([])
  const [devolucoesERP, setDevolucoesERP] = useState<any[]>([])

  // Filtros
  const [busca, setBusca] = useState('')
  const [filtroCompetencia, setFiltroCompetencia] = useState('2026-09')
  const [filtroStatus, setFiltroStatus] = useState('todos')
  const [filtroBeneficiario, setFiltroBeneficiario] = useState('todos')

  // Modais
  const [modalNovoOpen, setModalNovoOpen] = useState(false)
  const [modalEditOpen, setModalEditOpen] = useState(false)
  const [modalMotivoOpen, setModalMotivoOpen] = useState(false)
  const [modalHistoricoOpen, setModalHistoricoOpen] = useState(false)
  const [modalStatusOpen, setModalStatusOpen] = useState(false)

  // Seleções para ação
  const [itemSelecionado, setItemSelecionado] = useState<CommissionDeduction | null>(null)
  const [acaoStatus, setAcaoStatus] = useState<StatusLancamento>('Aprovado')
  const [justificativaStatus, setJustificativaStatus] = useState('')
  const [salvandoStatus, setSalvandoStatus] = useState(false)

  // Formulário de Cadastro / Edição
  const [formEmpresa, setFormEmpresa] = useState('Gran Romano / Jetro Matriz')
  const [formBeneficiarioId, setFormBeneficiarioId] = useState('')
  const [formCompetencia, setFormCompetencia] = useState('2026-09')
  const [formDataLancamento, setFormDataLancamento] = useState('2026-09-25')
  const [formMotivo, setFormMotivo] = useState('')
  const [formDescricao, setFormDescricao] = useState('')
  const [formValor, setFormValor] = useState('')
  const [formNumeroPedido, setFormNumeroPedido] = useState('')
  const [formNumeroNF, setFormNumeroNF] = useState('')
  const [formNomeCliente, setFormNomeCliente] = useState('')
  const [formDevolucaoId, setFormDevolucaoId] = useState('')
  const [formObservacoes, setFormObservacoes] = useState('')
  const [arquivosUpload, setArquivosUpload] = useState<File[]>([])
  const [salvandoForm, setSalvandoForm] = useState(false)

  // Validação em tempo real de devolução duplicada
  const [alertaDevolucao, setAlertaDevolucao] = useState<{
    bloqueado: boolean
    estornadoAutomaticamente: boolean
    motivo: string
  } | null>(null)

  // Formulário de Novo Motivo
  const [novoMotivoNome, setNovoMotivoNome] = useState('')
  const [novoMotivoDesc, setNovoMotivoDesc] = useState('')
  const [novoMotivoExigeDev, setNovoMotivoExigeDev] = useState(false)
  const [salvandoMotivo, setSalvandoMotivo] = useState(false)

  const currentUser = pb.authStore.model

  // Carregar dados
  const carregarTudo = async () => {
    setLoading(true)
    try {
      const [listDeds, listMotivos, listProfs, listDevs] = await Promise.all([
        listarDeducoes({
          competencia: filtroCompetencia || undefined,
          status: filtroStatus !== 'todos' ? filtroStatus : undefined,
          beneficiary_code: filtroBeneficiario !== 'todos' ? filtroBeneficiario : undefined,
        }),
        listarMotivosDeducao(),
        listarProfissionaisERP(),
        listarDevolucoesERP(),
      ])
      setDeductions(listDeds)
      setMotivos(listMotivos)
      setProfissionais(listProfs)
      setDevolucoesERP(listDevs)

      if (listMotivos.length > 0 && !formMotivo) {
        setFormMotivo(listMotivos[0].name)
      }
      if (listProfs.length > 0 && !formBeneficiarioId) {
        setFormBeneficiarioId(listProfs[0].id)
      }
    } catch (err: any) {
      toast({
        title: 'Erro ao carregar dados',
        description: err.message || 'Falha ao consultar banco.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarTudo()
  }, [filtroCompetencia, filtroStatus, filtroBeneficiario])

  // Filtragem local por texto
  const deductionsFiltradas = useMemo(() => {
    if (!busca.trim()) return deductions
    const t = busca.toLowerCase().trim()
    return deductions.filter(
      (d) =>
        d.beneficiary_name.toLowerCase().includes(t) ||
        (d.beneficiary_code && d.beneficiary_code.toLowerCase().includes(t)) ||
        d.reason.toLowerCase().includes(t) ||
        d.description.toLowerCase().includes(t) ||
        (d.order_number && d.order_number.toLowerCase().includes(t)) ||
        (d.invoice_number && d.invoice_number.toLowerCase().includes(t)) ||
        (d.client_name && d.client_name.toLowerCase().includes(t)) ||
        d.status.toLowerCase().includes(t),
    )
  }, [deductions, busca])

  // Totalizadores
  const totalizadores = useMemo(() => {
    const totalGeral = deductionsFiltradas.reduce((acc, d) => acc + (d.amount || 0), 0)
    const aprovados = deductionsFiltradas
      .filter((d) => d.status === 'Aprovado')
      .reduce((acc, d) => acc + (d.amount || 0), 0)
    const pendentes = deductionsFiltradas
      .filter((d) => d.status === 'Pendente')
      .reduce((acc, d) => acc + (d.amount || 0), 0)
    const rejeitados = deductionsFiltradas
      .filter((d) => d.status === 'Rejeitado')
      .reduce((acc, d) => acc + (d.amount || 0), 0)
    const cancelados = deductionsFiltradas
      .filter((d) => d.status === 'Cancelado')
      .reduce((acc, d) => acc + (d.amount || 0), 0)

    return { totalGeral, aprovados, pendentes, rejeitados, cancelados }
  }, [deductionsFiltradas])

  // Quando o usuário escolhe uma devolução existente no dropdown
  const handleSelecionarDevolucao = async (devId: string) => {
    setFormDevolucaoId(devId)
    setAlertaDevolucao(null)

    if (!devId || devId === 'sem_vinculo') return

    const dev = devolucoesERP.find((d) => d.id === devId)
    if (dev) {
      if (dev.invoice_number) setFormNumeroNF(dev.invoice_number)
      if (dev.order_number) setFormNumeroPedido(dev.order_number)
      if (dev.client_name) setFormNomeCliente(dev.client_name)
      if (dev.total_value && (!formValor || formValor === '0' || formValor === '0,00')) {
        setFormValor(dev.total_value.toFixed(2))
      }

      // Checagem no backend se já foi estornada automaticamente na Comissão Analítica
      const prof = profissionais.find((p) => p.id === formBeneficiarioId)
      const res = await verificarDevolucaoEstornada({
        devolution_id: dev.id,
        invoice_number: dev.invoice_number,
        competencia: formCompetencia,
        beneficiary_code: prof?.code,
      })

      if (res.bloqueado || res.estornadoAutomaticamente) {
        setAlertaDevolucao(res)
      }
    }
  }

  // Abrir Modal Novo
  const abrirNovoModal = () => {
    setItemSelecionado(null)
    setAlertaDevolucao(null)
    setFormEmpresa('Gran Romano / Jetro Matriz')
    if (profissionais.length > 0) setFormBeneficiarioId(profissionais[0].id)
    setFormCompetencia(filtroCompetencia || '2026-09')
    setFormDataLancamento(new Date().toISOString().slice(0, 10))
    if (motivos.length > 0) setFormMotivo(motivos[0].name)
    setFormDescricao('')
    setFormValor('')
    setFormNumeroPedido('')
    setFormNumeroNF('')
    setFormNomeCliente('')
    setFormDevolucaoId('')
    setFormObservacoes('')
    setArquivosUpload([])
    setModalNovoOpen(true)
  }

  // Abrir Edição
  const abrirEdicaoModal = (item: CommissionDeduction) => {
    if (item.status === 'Cancelado') {
      toast({
        title: 'Operação não permitida',
        description: 'Lançamentos cancelados não podem ser editados.',
        variant: 'destructive',
      })
      return
    }
    setItemSelecionado(item)
    setAlertaDevolucao(null)
    setFormEmpresa(item.company)
    setFormBeneficiarioId(item.beneficiary_id)
    setFormCompetencia(item.competencia)
    setFormDataLancamento(item.release_date)
    setFormMotivo(item.reason)
    setFormDescricao(item.description)
    setFormValor(String(item.amount))
    setFormNumeroPedido(item.order_number || '')
    setFormNumeroNF(item.invoice_number || '')
    setFormNomeCliente(item.client_name || '')
    setFormDevolucaoId(item.devolution_id || '')
    setFormObservacoes(item.observations || '')
    setArquivosUpload([])
    setModalEditOpen(true)
  }

  // Salvar Novo Lançamento de Dedução
  const handleSalvarNovo = async () => {
    const v = parseFloat(formValor.replace(',', '.'))
    if (!formDescricao.trim() || isNaN(v) || v <= 0) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Informe uma justificativa/descrição válida e um valor numérico positivo.',
        variant: 'destructive',
      })
      return
    }

    if (alertaDevolucao && alertaDevolucao.bloqueado) {
      toast({
        title: 'Lançamento Bloqueado',
        description: alertaDevolucao.motivo,
        variant: 'destructive',
      })
      return
    }

    const prof = profissionais.find((p) => p.id === formBeneficiarioId) || profissionais[0]
    const devRec = devolucoesERP.find((d) => d.id === formDevolucaoId)

    setSalvandoForm(true)
    try {
      await criarDeducao(
        {
          company: formEmpresa,
          beneficiary_id: prof.id,
          beneficiary_code: prof.code,
          beneficiary_name: prof.name,
          beneficiary_cpf_cnpj: prof.cpf_cnpj,
          role_name: prof.role_name,
          competencia: formCompetencia,
          release_date: formDataLancamento,
          deduction_type: formMotivo,
          reason: formMotivo,
          description: formDescricao,
          amount: v,
          order_number: formNumeroPedido || undefined,
          invoice_number: formNumeroNF || undefined,
          client_name: formNomeCliente || undefined,
          devolution_id:
            formDevolucaoId && formDevolucaoId !== 'sem_vinculo' ? formDevolucaoId : undefined,
          devolution_number: devRec?.devolution_number || undefined,
          observations: formObservacoes || undefined,
          status: 'Pendente',
        },
        arquivosUpload,
      )

      toast({
        title: 'Dedução cadastrada com sucesso',
        description: 'O lançamento foi registrado como "Pendente" para aprovação de alçada.',
      })
      setModalNovoOpen(false)
      carregarTudo()
    } catch (err: any) {
      toast({
        title: 'Erro ao cadastrar dedução',
        description:
          err.message || 'Verifique se não há duplicidade de lançamento ou devolução já estornada.',
        variant: 'destructive',
      })
    } finally {
      setSalvandoForm(false)
    }
  }

  // Salvar Edição
  const handleSalvarEdicao = async () => {
    if (!itemSelecionado) return
    const v = parseFloat(formValor.replace(',', '.'))
    if (!formDescricao.trim() || isNaN(v) || v <= 0) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Informe uma justificativa/descrição válida e um valor numérico positivo.',
        variant: 'destructive',
      })
      return
    }

    const prof = profissionais.find((p) => p.id === formBeneficiarioId) || {
      id: itemSelecionado.beneficiary_id,
      code: itemSelecionado.beneficiary_code || '',
      name: itemSelecionado.beneficiary_name,
      cpf_cnpj: itemSelecionado.beneficiary_cpf_cnpj || '',
      role_name: itemSelecionado.role_name,
    }

    setSalvandoForm(true)
    try {
      await atualizarDeducao(itemSelecionado.id, {
        company: formEmpresa,
        beneficiary_id: prof.id,
        beneficiary_code: prof.code,
        beneficiary_name: prof.name,
        beneficiary_cpf_cnpj: prof.cpf_cnpj,
        role_name: prof.role_name,
        competencia: formCompetencia,
        release_date: formDataLancamento,
        deduction_type: formMotivo,
        reason: formMotivo,
        description: formDescricao,
        amount: v,
        order_number: formNumeroPedido || undefined,
        invoice_number: formNumeroNF || undefined,
        client_name: formNomeCliente || undefined,
        observations: formObservacoes || undefined,
      })

      toast({
        title: 'Dedução atualizada',
        description: 'Alterações registradas na trilha de auditoria.',
      })
      setModalEditOpen(false)
      carregarTudo()
    } catch (err: any) {
      toast({
        title: 'Erro ao salvar alteração',
        description: err.message || 'Verifique se a apuração não está fechada.',
        variant: 'destructive',
      })
    } finally {
      setSalvandoForm(false)
    }
  }

  // Excluir Lançamento
  const handleExcluir = async (item: CommissionDeduction) => {
    if (item.status === 'Aprovado') {
      toast({
        title: 'Ação não permitida',
        description: 'Lançamentos já aprovados devem ser cancelados ou rejeitados pelo workflow.',
        variant: 'destructive',
      })
      return
    }
    if (!window.confirm(`Deseja realmente remover o lançamento #${item.id}?`)) return

    try {
      await excluirDeducao(item.id)
      toast({
        title: 'Lançamento excluído',
        description: 'Registro removido com sucesso.',
      })
      carregarTudo()
    } catch (err: any) {
      toast({
        title: 'Erro ao excluir',
        description: err.message || 'Não foi possível excluir o lançamento.',
        variant: 'destructive',
      })
    }
  }

  // Modal Alterar Status (Aprovar / Rejeitar / Cancelar)
  const abrirModalStatus = (item: CommissionDeduction, status: StatusLancamento) => {
    setItemSelecionado(item)
    setAcaoStatus(status)
    setJustificativaStatus('')
    setModalStatusOpen(true)
  }

  const handleConfirmarStatus = async () => {
    if (!itemSelecionado) return
    if ((acaoStatus === 'Rejeitado' || acaoStatus === 'Cancelado') && !justificativaStatus.trim()) {
      toast({
        title: 'Justificativa obrigatória',
        description: `Informe a justificativa formal para ${acaoStatus.toLowerCase()} esta dedução.`,
        variant: 'destructive',
      })
      return
    }

    setSalvandoStatus(true)
    try {
      await atualizarStatusDeducao(itemSelecionado.id, acaoStatus, justificativaStatus)
      toast({
        title: `Dedução ${acaoStatus}`,
        description: `Status atualizado com sucesso e registrado na auditoria.`,
      })
      setModalStatusOpen(false)
      carregarTudo()
    } catch (err: any) {
      toast({
        title: 'Falha ao alterar status',
        description: err.message || 'Verifique suas permissões de alçada.',
        variant: 'destructive',
      })
    } finally {
      setSalvandoStatus(false)
    }
  }

  // Criar Novo Motivo de Dedução
  const handleCriarMotivo = async () => {
    if (!novoMotivoNome.trim()) return
    setSalvandoMotivo(true)
    try {
      const created = await criarMotivoDeducao({
        name: novoMotivoNome,
        description: novoMotivoDesc,
        requires_devolution: novoMotivoExigeDev,
      })
      toast({
        title: 'Motivo cadastrado com sucesso',
        description: `O motivo "${created.name}" agora está disponível para seleção.`,
      })
      setMotivos((prev) => [...prev, created])
      setFormMotivo(created.name)
      setNovoMotivoNome('')
      setNovoMotivoDesc('')
      setNovoMotivoExigeDev(false)
      setModalMotivoOpen(false)
    } catch (err: any) {
      toast({
        title: 'Erro ao cadastrar motivo',
        description: err.message || 'Nome já existente.',
        variant: 'destructive',
      })
    } finally {
      setSalvandoMotivo(false)
    }
  }

  // Exportar Excel (CSV)
  const handleExportarExcel = () => {
    if (deductionsFiltradas.length === 0) {
      toast({ title: 'Aviso', description: 'Nenhum registro para exportar.' })
      return
    }
    const headers = [
      'ID',
      'Empresa',
      'Código Beneficiário',
      'Nome Beneficiário',
      'Cargo',
      'Competência',
      'Data Lançamento',
      'Motivo / Tipo',
      'Descrição / Justificativa',
      'Pedido',
      'Nota Fiscal',
      'Cliente',
      'Valor Descontado (R$)',
      'Status',
      'Responsável',
      'Aprovado Por',
      'Data Aprovação',
    ]

    const rows = deductionsFiltradas.map((d) => [
      d.id,
      `"${d.company || ''}"`,
      `"${d.beneficiary_code || ''}"`,
      `"${d.beneficiary_name || ''}"`,
      `"${d.role_name || ''}"`,
      `"${d.competencia || ''}"`,
      `"${d.release_date || ''}"`,
      `"${d.reason || ''}"`,
      `"${(d.description || '').replace(/"/g, '""')}"`,
      `"${d.order_number || ''}"`,
      `"${d.invoice_number || ''}"`,
      `"${d.client_name || ''}"`,
      d.amount.toFixed(2).replace('.', ','),
      `"${d.status}"`,
      `"${d.responsible_user_name || ''}"`,
      `"${d.approved_by_name || ''}"`,
      `"${d.approved_at || ''}"`,
    ])

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `Descontos_Deducoes_Comissoes_${filtroCompetencia || 'todas'}.csv`
    link.click()
    URL.revokeObjectURL(url)

    toast({
      title: 'Exportação Concluída',
      description: 'Arquivo de planilha gerado com sucesso.',
    })
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto print:p-0">
      {/* Cabeçalho Compacto Padrão ERP Jetro */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <MinusCircle className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Descontos e Deduções
            </h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Registre e controle descontos autorizados aplicados às comissões dos profissionais.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setModalMotivoOpen(true)}
            className="text-xs h-9 border-border"
          >
            <Tag className="w-3.5 h-3.5 mr-1 text-[#C9A227]" />
            Gerenciar Motivos
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportarExcel}
            className="text-xs h-9 border-border"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 mr-1 text-emerald-600" />
            Excel
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="text-xs h-9 border-border"
          >
            <Printer className="w-3.5 h-3.5 mr-1" />
            Imprimir
          </Button>

          <Button
            size="sm"
            onClick={abrirNovoModal}
            className="text-xs h-9 bg-rose-700 hover:bg-rose-800 text-white"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            Novo Desconto / Dedução
          </Button>
        </div>
      </div>

      {/* Totalizadores com Identidade Visual Jetro */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-card border border-border rounded-xl p-3 shadow-2xs">
          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <span>Aprovados (Deduzirão)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-lg font-bold text-rose-600 dark:text-rose-400 mt-1">
            - {formatMoeda(totalizadores.aprovados)}
          </div>
          <span className="text-[10px] text-muted-foreground">Subtraem na Comissão Analítica</span>
        </div>

        <div className="bg-card border border-border rounded-xl p-3 shadow-2xs">
          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <span>Pendentes</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-lg font-bold text-amber-600 mt-1">
            {formatMoeda(totalizadores.pendentes)}
          </div>
          <span className="text-[10px] text-muted-foreground">Aguardando aprovação de alçada</span>
        </div>

        <div className="bg-card border border-border rounded-xl p-3 shadow-2xs">
          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <span>Rejeitados</span>
            <XCircle className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-lg font-bold text-slate-600 mt-1">
            {formatMoeda(totalizadores.rejeitados)}
          </div>
          <span className="text-[10px] text-muted-foreground">Desconsiderados da comissão</span>
        </div>

        <div className="bg-card border border-border rounded-xl p-3 shadow-2xs">
          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <span>Cancelados</span>
            <Ban className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-lg font-bold text-slate-500 mt-1">
            {formatMoeda(totalizadores.cancelados)}
          </div>
          <span className="text-[10px] text-muted-foreground">Anulados por auditoria</span>
        </div>

        <div className="bg-card border border-rose-500/20 rounded-xl p-3 shadow-2xs col-span-2 sm:col-span-1 bg-rose-500/5">
          <div className="flex items-center justify-between text-rose-700 dark:text-rose-400 text-xs font-semibold">
            <span>Total Filtrado</span>
            <TrendingDown className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-lg font-extrabold text-rose-700 dark:text-rose-400 mt-1">
            - {formatMoeda(totalizadores.totalGeral)}
          </div>
          <span className="text-[10px] text-muted-foreground">
            {deductionsFiltradas.length} lançamentos
          </span>
        </div>
      </div>

      {/* Barra de Filtros e Pesquisa */}
      <div className="bg-card border border-border rounded-xl p-3.5 shadow-2xs space-y-3 print:hidden">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="space-y-1">
            <Label className="text-[11px] text-muted-foreground font-medium">Competência</Label>
            <Input
              type="month"
              value={filtroCompetencia}
              onChange={(e) => setFiltroCompetencia(e.target.value)}
              className="h-8 text-xs"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-[11px] text-muted-foreground font-medium">Status</Label>
            <Select value={filtroStatus} onValueChange={setFiltroStatus}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os status</SelectItem>
                <SelectItem value="Pendente">Pendente</SelectItem>
                <SelectItem value="Aprovado">Aprovado</SelectItem>
                <SelectItem value="Rejeitado">Rejeitado</SelectItem>
                <SelectItem value="Cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-[11px] text-muted-foreground font-medium">Profissional</Label>
            <Select value={filtroBeneficiario} onValueChange={setFiltroBeneficiario}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Todos os profissionais" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os colaboradores/RCAs</SelectItem>
                {profissionais.map((p) => (
                  <SelectItem key={p.id} value={p.code}>
                    {p.name} ({p.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-[11px] text-muted-foreground font-medium">Busca rápida</Label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por NF, pedido, cliente, motivo..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="h-8 text-xs pl-8"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tabela de Lançamentos de Descontos e Deduções */}
      <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#002817] text-white select-none">
                <th className="py-3 px-3 font-semibold whitespace-nowrap">Status</th>
                <th className="py-3 px-3 font-semibold whitespace-nowrap">Profissional</th>
                <th className="py-3 px-3 font-semibold whitespace-nowrap">Cargo / Função</th>
                <th className="py-3 px-3 font-semibold whitespace-nowrap">Competência</th>
                <th className="py-3 px-3 font-semibold whitespace-nowrap">Data</th>
                <th className="py-3 px-3 font-semibold whitespace-nowrap">Motivo / Tipo</th>
                <th className="py-3 px-3 font-semibold whitespace-nowrap">NF / Pedido / Cliente</th>
                <th className="py-3 px-3 font-semibold whitespace-nowrap">Justificativa</th>
                <th className="py-3 px-3 font-semibold text-right whitespace-nowrap">
                  Valor Descontado
                </th>
                <th className="py-3 px-3 font-semibold whitespace-nowrap">Responsável</th>
                <th className="py-3 px-3 font-semibold text-center whitespace-nowrap print:hidden">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-muted-foreground">
                    Carregando lançamentos de descontos e deduções...
                  </td>
                </tr>
              ) : deductionsFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-muted-foreground">
                    Nenhum desconto ou dedução encontrada para os filtros aplicados.
                  </td>
                </tr>
              ) : (
                deductionsFiltradas.map((item) => {
                  return (
                    <tr key={item.id} className="hover:bg-muted/40 transition-colors">
                      {/* Status */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-semibold ${
                            item.status === 'Aprovado'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/50'
                              : item.status === 'Pendente'
                                ? 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/50'
                                : item.status === 'Rejeitado'
                                  ? 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/50'
                                  : 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-900'
                          }`}
                        >
                          {item.status}
                        </Badge>
                      </td>

                      {/* Profissional Beneficiado */}
                      <td className="py-2.5 px-3 font-medium text-foreground whitespace-nowrap">
                        <div>{item.beneficiary_name}</div>
                        {item.beneficiary_code && (
                          <span className="text-[10px] text-muted-foreground font-mono">
                            Cód: {item.beneficiary_code}
                          </span>
                        )}
                      </td>

                      {/* Cargo */}
                      <td className="py-2.5 px-3 text-muted-foreground max-w-[150px] truncate">
                        {item.role_name}
                      </td>

                      {/* Competência */}
                      <td className="py-2.5 px-3 font-mono whitespace-nowrap">
                        {item.competencia}
                      </td>

                      {/* Data */}
                      <td className="py-2.5 px-3 text-muted-foreground whitespace-nowrap">
                        {formatData(item.release_date)}
                      </td>

                      {/* Motivo */}
                      <td className="py-2.5 px-3 whitespace-nowrap font-medium text-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Tag className="w-3 h-3 text-[#C9A227]" />
                          {item.reason}
                        </span>
                      </td>

                      {/* Vínculo NF / Pedido / Cliente */}
                      <td className="py-2.5 px-3 text-muted-foreground max-w-[180px] truncate">
                        {item.invoice_number && (
                          <span className="font-semibold text-foreground">
                            NF {item.invoice_number}
                          </span>
                        )}
                        {item.order_number && (
                          <span className="ml-1 text-[11px] font-mono">
                            | Ped: {item.order_number}
                          </span>
                        )}
                        {item.client_name && (
                          <div className="text-[10px] truncate">{item.client_name}</div>
                        )}
                        {!item.invoice_number && !item.order_number && !item.client_name && '—'}
                      </td>

                      {/* Justificativa */}
                      <td
                        className="py-2.5 px-3 max-w-[200px] truncate text-foreground"
                        title={item.description}
                      >
                        {item.description}
                      </td>

                      {/* Valor Descontado */}
                      <td className="py-2.5 px-3 text-right font-bold text-rose-600 dark:text-rose-400 whitespace-nowrap">
                        - {formatMoeda(item.amount)}
                      </td>

                      {/* Responsável */}
                      <td className="py-2.5 px-3 text-muted-foreground whitespace-nowrap text-[11px]">
                        {item.responsible_user_name || 'Sistema'}
                      </td>

                      {/* Ações */}
                      <td className="py-2.5 px-3 text-center whitespace-nowrap print:hidden">
                        <div className="flex items-center justify-center gap-1">
                          {/* Histórico */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setItemSelecionado(item)
                              setModalHistoricoOpen(true)
                            }}
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                            title="Ver trilha de auditoria e histórico"
                          >
                            <History className="w-3.5 h-3.5" />
                          </Button>

                          {/* Aprovar (se pendente) */}
                          {item.status === 'Pendente' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => abrirModalStatus(item, 'Aprovado')}
                              className="h-7 w-7 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950"
                              title="Aprovar dedução para subtrair da comissão"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </Button>
                          )}

                          {/* Rejeitar */}
                          {item.status === 'Pendente' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => abrirModalStatus(item, 'Rejeitado')}
                              className="h-7 w-7 p-0 text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950"
                              title="Rejeitar dedução com justificativa"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </Button>
                          )}

                          {/* Cancelar (se já aprovado) */}
                          {item.status === 'Aprovado' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => abrirModalStatus(item, 'Cancelado')}
                              className="h-7 w-7 p-0 text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                              title="Cancelar lançamento aprovado"
                            >
                              <Ban className="w-3.5 h-3.5" />
                            </Button>
                          )}

                          {/* Editar */}
                          {item.status !== 'Cancelado' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => abrirEdicaoModal(item)}
                              className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                              title="Editar lançamento"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </Button>
                          )}

                          {/* Excluir (apenas pendente/rejeitado) */}
                          {item.status !== 'Aprovado' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleExcluir(item)}
                              className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                              title="Excluir do sistema"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Novo Lançamento de Desconto/Dedução */}
      <Dialog open={modalNovoOpen} onOpenChange={setModalNovoOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold text-rose-600 dark:text-rose-400">
              <MinusCircle className="w-5 h-5" />
              Novo Lançamento de Desconto ou Dedução
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            {/* Empresa e Profissional */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Empresa *</Label>
                <Input
                  value={formEmpresa}
                  onChange={(e) => setFormEmpresa(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Profissional Beneficiado (RCA / Colaborador) *</Label>
                <Select value={formBeneficiarioId} onValueChange={setFormBeneficiarioId}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Selecione o profissional" />
                  </SelectTrigger>
                  <SelectContent>
                    {profissionais.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name} — {p.role_name} ({p.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Competência, Data e Motivo */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Competência (Mês/Ano) *</Label>
                <Input
                  type="month"
                  value={formCompetencia}
                  onChange={(e) => setFormCompetencia(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Data do Lançamento *</Label>
                <Input
                  type="date"
                  value={formDataLancamento}
                  onChange={(e) => setFormDataLancamento(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Motivo da Dedução *</Label>
                  <button
                    type="button"
                    onClick={() => setModalMotivoOpen(true)}
                    className="text-[10px] text-rose-600 dark:text-rose-400 underline font-semibold"
                  >
                    + Novo Motivo
                  </button>
                </div>
                <Select value={formMotivo} onValueChange={setFormMotivo}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Selecione o motivo" />
                  </SelectTrigger>
                  <SelectContent>
                    {motivos.map((m) => (
                      <SelectItem key={m.id} value={m.name}>
                        {m.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Vínculo com Devolução Real do ERP */}
            <div className="space-y-1 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                  <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                  Vincular à Devolução Real Registrada no ERP (opcional)
                </Label>
              </div>
              <Select value={formDevolucaoId} onValueChange={handleSelecionarDevolucao}>
                <SelectTrigger className="h-8 text-xs bg-background">
                  <SelectValue placeholder="Selecione uma devolução registrada no ERP para vincular..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sem_vinculo">Nenhuma devolução vinculada</SelectItem>
                  {devolucoesERP.map((dev) => (
                    <SelectItem key={dev.id} value={dev.id}>
                      Devolução #{dev.devolution_number} | NF {dev.invoice_number || 'S/N'} | Pedido{' '}
                      {dev.order_number || 'S/N'} — {formatMoeda(dev.total_value)} (
                      {dev.client_name || 'Cliente'})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* ALERTA CRÍTICO: Devolução já estornada na Comissão Analítica */}
              {alertaDevolucao && (
                <div
                  className={`mt-2 p-2 rounded text-[11px] flex items-start gap-2 ${
                    alertaDevolucao.bloqueado
                      ? 'bg-red-50 text-red-800 border border-red-300 dark:bg-red-950/60 dark:text-red-300'
                      : 'bg-amber-50 text-amber-800 border border-amber-300 dark:bg-amber-950/60 dark:text-amber-300'
                  }`}
                >
                  <ShieldAlert className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
                  <div>
                    <span className="font-bold">Atenção Crítica de Duplo Estorno: </span>
                    {alertaDevolucao.motivo}
                  </div>
                </div>
              )}
            </div>

            {/* Vínculo Comercial: Pedido, NF e Cliente */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Número do Pedido (quando houver)</Label>
                <Input
                  placeholder="Ex.: 1226456"
                  value={formNumeroPedido}
                  onChange={(e) => setFormNumeroPedido(e.target.value)}
                  className="h-8 text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Número da Nota Fiscal (quando houver)</Label>
                <Input
                  placeholder="Ex.: 173299"
                  value={formNumeroNF}
                  onChange={(e) => setFormNumeroNF(e.target.value)}
                  className="h-8 text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Cliente Relacionado (quando houver)</Label>
                <Input
                  placeholder="Ex.: COMERCIAL PROGRESSO LTDA"
                  value={formNomeCliente}
                  onChange={(e) => setFormNomeCliente(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
            </div>

            {/* Descrição e Valor */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 space-y-1">
                <Label className="text-xs">Justificativa / Descrição Detalhada *</Label>
                <Input
                  placeholder="Justifique o motivo do débito ou ajuste autorizado..."
                  value={formDescricao}
                  onChange={(e) => setFormDescricao(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Valor do Desconto (R$) *</Label>
                <Input
                  placeholder="0,00"
                  value={formValor}
                  onChange={(e) => setFormValor(e.target.value)}
                  className="h-8 text-xs font-semibold text-rose-600 dark:text-rose-400"
                />
              </div>
            </div>

            {/* Observações */}
            <div className="space-y-1">
              <Label className="text-xs">Observações adicionais e rastreabilidade</Label>
              <Textarea
                placeholder="Detalhes da autorização da gerência ou comitê comercial..."
                value={formObservacoes}
                onChange={(e) => setFormObservacoes(e.target.value)}
                rows={2}
                className="text-xs"
              />
            </div>

            {/* Upload de Anexos */}
            <div className="space-y-1">
              <Label className="text-xs">
                Anexos Comprobatórios (Laudos, E-mails de autorização)
              </Label>
              <div className="border border-dashed border-border rounded-lg p-3 text-center bg-muted/20">
                <Upload className="w-5 h-5 mx-auto text-muted-foreground mb-1" />
                <p className="text-[11px] text-muted-foreground mb-2">
                  Selecione comprovantes da devolução, solicitação de estorno ou autorização
                  financeira.
                </p>
                <input
                  type="file"
                  multiple
                  accept=".pdf,image/*"
                  onChange={(e) => {
                    if (e.target.files) {
                      setArquivosUpload(Array.from(e.target.files))
                    }
                  }}
                  className="text-xs file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-rose-700 file:text-white"
                />
                {arquivosUpload.length > 0 && (
                  <p className="text-[10px] text-rose-600 mt-2 font-medium">
                    {arquivosUpload.length} arquivo(s) selecionado(s) para upload
                  </p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setModalNovoOpen(false)}
              disabled={salvandoForm}
              className="text-xs"
            >
              Cancelar
            </Button>
            <Button
              size="sm"
              onClick={handleSalvarNovo}
              disabled={salvandoForm || alertaDevolucao?.bloqueado === true}
              className="text-xs bg-rose-700 hover:bg-rose-800 text-white"
            >
              {salvandoForm ? 'Salvando...' : 'Salvar Dedução'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Edição de Dedução */}
      <Dialog open={modalEditOpen} onOpenChange={setModalEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold text-rose-600 dark:text-rose-400">
              <Edit className="w-5 h-5" />
              Editar Dedução #{itemSelecionado?.id}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Empresa</Label>
                <Input
                  value={formEmpresa}
                  onChange={(e) => setFormEmpresa(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Profissional Beneficiado</Label>
                <Select value={formBeneficiarioId} onValueChange={setFormBeneficiarioId}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Selecione o profissional" />
                  </SelectTrigger>
                  <SelectContent>
                    {profissionais.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name} — {p.role_name} ({p.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Competência</Label>
                <Input
                  type="month"
                  value={formCompetencia}
                  onChange={(e) => setFormCompetencia(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Data do Lançamento</Label>
                <Input
                  type="date"
                  value={formDataLancamento}
                  onChange={(e) => setFormDataLancamento(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Motivo da Dedução</Label>
                <Select value={formMotivo} onValueChange={setFormMotivo}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Selecione o motivo" />
                  </SelectTrigger>
                  <SelectContent>
                    {motivos.map((m) => (
                      <SelectItem key={m.id} value={m.name}>
                        {m.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Pedido</Label>
                <Input
                  value={formNumeroPedido}
                  onChange={(e) => setFormNumeroPedido(e.target.value)}
                  className="h-8 text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Nota Fiscal</Label>
                <Input
                  value={formNumeroNF}
                  onChange={(e) => setFormNumeroNF(e.target.value)}
                  className="h-8 text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Cliente</Label>
                <Input
                  value={formNomeCliente}
                  onChange={(e) => setFormNomeCliente(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 space-y-1">
                <Label className="text-xs">Justificativa / Descrição</Label>
                <Input
                  value={formDescricao}
                  onChange={(e) => setFormDescricao(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Valor Descontado (R$)</Label>
                <Input
                  value={formValor}
                  onChange={(e) => setFormValor(e.target.value)}
                  className="h-8 text-xs font-semibold text-rose-600 dark:text-rose-400"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Observações adicionais</Label>
              <Textarea
                value={formObservacoes}
                onChange={(e) => setFormObservacoes(e.target.value)}
                rows={2}
                className="text-xs"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setModalEditOpen(false)}
              disabled={salvandoForm}
              className="text-xs"
            >
              Cancelar
            </Button>
            <Button
              size="sm"
              onClick={handleSalvarEdicao}
              disabled={salvandoForm}
              className="text-xs bg-rose-700 hover:bg-rose-800 text-white"
            >
              {salvandoForm ? 'Atualizando...' : 'Atualizar Dedução'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Trilha de Auditoria e Histórico */}
      <Dialog open={modalHistoricoOpen} onOpenChange={setModalHistoricoOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold text-rose-600 dark:text-rose-400">
              <History className="w-5 h-5" />
              Trilha de Auditoria — Dedução #{itemSelecionado?.id}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div className="p-3 bg-muted/40 rounded-lg space-y-1">
              <div className="font-semibold text-foreground">
                {itemSelecionado?.beneficiary_name}
              </div>
              <div className="text-muted-foreground">
                Motivo: <b>{itemSelecionado?.reason}</b> | Valor:{' '}
                <b>- {formatMoeda(itemSelecionado?.amount || 0)}</b> | Competência:{' '}
                <b>{itemSelecionado?.competencia}</b>
              </div>
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {itemSelecionado?.history && itemSelecionado.history.length > 0 ? (
                itemSelecionado.history.map((h, i) => (
                  <div key={i} className="border border-border rounded-lg p-2.5 space-y-1">
                    <div className="flex items-center justify-between font-semibold">
                      <span className="text-rose-600 dark:text-rose-400">{h.acao}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {formatData(h.data)}
                      </span>
                    </div>
                    <div className="text-muted-foreground text-[11px]">
                      Usuário: <b>{h.usuario_nome || 'Sistema'}</b>
                      {h.usuario_role && ` (${h.usuario_role})`}
                    </div>
                    {h.detalhes && <div className="text-foreground text-[11px]">{h.detalhes}</div>}
                    {h.justificativa && (
                      <div className="text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 p-1.5 rounded text-[11px]">
                        Justificativa: {h.justificativa}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  Nenhum registro prévio de auditoria encontrado.
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setModalHistoricoOpen(false)}
              className="text-xs"
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Alterar Status (Aprovar / Rejeitar / Cancelar) */}
      <Dialog open={modalStatusOpen} onOpenChange={setModalStatusOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold text-foreground">
              {acaoStatus === 'Aprovado' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              ) : acaoStatus === 'Rejeitado' ? (
                <XCircle className="w-5 h-5 text-rose-600" />
              ) : (
                <Ban className="w-5 h-5 text-slate-500" />
              )}
              {acaoStatus} Dedução
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <p className="text-muted-foreground">
              {acaoStatus === 'Aprovado' &&
                'Ao aprovar esta dedução, o valor será subtraído do total líquido a pagar na tela Comissão Analítica da respectiva competência.'}
              {acaoStatus === 'Rejeitado' &&
                'Ao rejeitar, a dedução é mantida no histórico para fins de rastreabilidade, sem impacto no valor financeiro.'}
              {acaoStatus === 'Cancelado' &&
                'Ao cancelar, este desconto aprovado anteriormente será anulado do fechamento.'}
            </p>

            <div className="p-2.5 bg-muted/40 rounded border border-border text-foreground space-y-0.5">
              <div>
                Profissional: <b>{itemSelecionado?.beneficiary_name}</b>
              </div>
              <div>
                Valor Descontado: <b>- {formatMoeda(itemSelecionado?.amount || 0)}</b>
              </div>
              <div>
                Motivo: <b>{itemSelecionado?.reason}</b>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">
                Justificativa / Parecer de Alçada{' '}
                {acaoStatus !== 'Aprovado' ? '(Obrigatório)' : '(Opcional)'}
              </Label>
              <Textarea
                placeholder="Insira as razões da decisão ou despacho da gerência..."
                value={justificativaStatus}
                onChange={(e) => setJustificativaStatus(e.target.value)}
                rows={3}
                className="text-xs"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setModalStatusOpen(false)}
              disabled={salvandoStatus}
              className="text-xs"
            >
              Voltar
            </Button>
            <Button
              size="sm"
              onClick={handleConfirmarStatus}
              disabled={salvandoStatus}
              className={`text-xs text-white ${
                acaoStatus === 'Aprovado'
                  ? 'bg-emerald-700 hover:bg-emerald-800'
                  : acaoStatus === 'Rejeitado'
                    ? 'bg-rose-700 hover:bg-rose-800'
                    : 'bg-slate-700 hover:bg-slate-800'
              }`}
            >
              {salvandoStatus ? 'Processando...' : `Confirmar ${acaoStatus}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Gerenciamento / Cadastro de Novos Motivos de Dedução */}
      <Dialog open={modalMotivoOpen} onOpenChange={setModalMotivoOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold text-foreground">
              <Tag className="w-5 h-5 text-[#C9A227]" />
              Motivos de Dedução de Comissão
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            {/* Lista de motivos existentes */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Motivos Disponíveis</Label>
              <div className="max-h-40 overflow-y-auto divide-y divide-border border border-border rounded-lg">
                {motivos.map((m) => (
                  <div key={m.id} className="p-2 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-foreground">{m.name}</div>
                      {m.description && (
                        <div className="text-[10px] text-muted-foreground">{m.description}</div>
                      )}
                    </div>
                    <Badge variant="outline" className="text-[9px] bg-rose-50 text-rose-700">
                      {m.requires_devolution ? 'Exige Devolução' : 'Padrão'}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Cadastrar novo motivo */}
            <div className="border-t border-border pt-3 space-y-2">
              <Label className="text-xs font-semibold text-foreground">Cadastrar Novo Motivo</Label>
              <Input
                placeholder="Nome do novo motivo (ex.: Cancelamento Tardio de Pedido)"
                value={novoMotivoNome}
                onChange={(e) => setNovoMotivoNome(e.target.value)}
                className="h-8 text-xs"
              />
              <Input
                placeholder="Descrição resumida do motivo (opcional)"
                value={novoMotivoDesc}
                onChange={(e) => setNovoMotivoDesc(e.target.value)}
                className="h-8 text-xs"
              />
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="chkDev"
                  checked={novoMotivoExigeDev}
                  onChange={(e) => setNovoMotivoExigeDev(e.target.checked)}
                  className="rounded text-rose-600"
                />
                <label
                  htmlFor="chkDev"
                  className="text-[11px] text-muted-foreground cursor-pointer"
                >
                  Este motivo exige obrigatoriamente vínculo com uma devolução real
                </label>
              </div>
              <Button
                size="sm"
                onClick={handleCriarMotivo}
                disabled={salvandoMotivo || !novoMotivoNome.trim()}
                className="w-full text-xs bg-rose-700 hover:bg-rose-800 text-white"
              >
                {salvandoMotivo ? 'Salvando...' : 'Adicionar Novo Motivo'}
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setModalMotivoOpen(false)}
              className="text-xs"
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
export default DescontosDeducoesPage
