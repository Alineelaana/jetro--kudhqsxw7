import { useState, useEffect, useMemo } from 'react'
import {
  type CommissionAward,
  type CommissionAwardType,
  type BeneficiarioProfissional,
  type StatusLancamento,
  listarPremiacoes,
  listarTiposPremiacao,
  criarTipoPremiacao,
  listarProfissionaisERP,
  listarCampanhasERP,
  criarPremiacao,
  atualizarPremiacao,
  excluirPremiacao,
  atualizarStatusPremiacao,
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
  Award,
  Search,
  Plus,
  Filter,
  FileSpreadsheet,
  FileDown,
  Printer,
  History,
  CheckCircle2,
  XCircle,
  Clock,
  Ban,
  Trash2,
  Edit,
  ExternalLink,
  Tag,
  AlertTriangle,
  FileText,
  Upload,
  UserCheck,
  Building2,
  TrendingUp,
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

export function PremiacoesPage() {
  const { toast } = useToast()

  // Estados principais
  const [loading, setLoading] = useState(true)
  const [awards, setAwards] = useState<CommissionAward[]>([])
  const [tipos, setTipos] = useState<CommissionAwardType[]>([])
  const [profissionais, setProfissionais] = useState<BeneficiarioProfissional[]>([])
  const [campanhas, setCampanhas] = useState<{ id: string; name: string }[]>([])

  // Filtros
  const [busca, setBusca] = useState('')
  const [filtroCompetencia, setFiltroCompetencia] = useState('2026-09')
  const [filtroStatus, setFiltroStatus] = useState('todos')
  const [filtroBeneficiario, setFiltroBeneficiario] = useState('todos')

  // Modais
  const [modalNovoOpen, setModalNovoOpen] = useState(false)
  const [modalEditOpen, setModalEditOpen] = useState(false)
  const [modalTipoOpen, setModalTipoOpen] = useState(false)
  const [modalHistoricoOpen, setModalHistoricoOpen] = useState(false)
  const [modalStatusOpen, setModalStatusOpen] = useState(false)

  // Seleções para ação
  const [itemSelecionado, setItemSelecionado] = useState<CommissionAward | null>(null)
  const [acaoStatus, setAcaoStatus] = useState<StatusLancamento>('Aprovado')
  const [justificativaStatus, setJustificativaStatus] = useState('')
  const [salvandoStatus, setSalvandoStatus] = useState(false)

  // Formulário de Cadastro / Edição
  const [formEmpresa, setFormEmpresa] = useState('Gran Romano / Jetro Matriz')
  const [formBeneficiarioId, setFormBeneficiarioId] = useState('')
  const [formCompetencia, setFormCompetencia] = useState('2026-09')
  const [formDataLancamento, setFormDataLancamento] = useState('2026-09-25')
  const [formTipo, setFormTipo] = useState('')
  const [formDescricao, setFormDescricao] = useState('')
  const [formValor, setFormValor] = useState('')
  const [formCampanha, setFormCampanha] = useState('')
  const [formObservacoes, setFormObservacoes] = useState('')
  const [arquivosUpload, setArquivosUpload] = useState<File[]>([])
  const [salvandoForm, setSalvandoForm] = useState(false)

  // Formulário de Novo Tipo
  const [novoTipoNome, setNovoTipoNome] = useState('')
  const [novoTipoDesc, setNovoTipoDesc] = useState('')
  const [salvandoTipo, setSalvandoTipo] = useState(false)

  // Usuário atual
  const currentUser = pb.authStore.model

  // Carregar dados
  const carregarTudo = async () => {
    setLoading(true)
    try {
      const [listAwards, listTipos, listProfs, listCamps] = await Promise.all([
        listarPremiacoes({
          competencia: filtroCompetencia || undefined,
          status: filtroStatus !== 'todos' ? filtroStatus : undefined,
          beneficiary_code: filtroBeneficiario !== 'todos' ? filtroBeneficiario : undefined,
        }),
        listarTiposPremiacao(),
        listarProfissionaisERP(),
        listarCampanhasERP(),
      ])
      setAwards(listAwards)
      setTipos(listTipos)
      setProfissionais(listProfs)
      setCampanhas(listCamps)

      if (listTipos.length > 0 && !formTipo) {
        setFormTipo(listTipos[0].name)
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
  const awardsFiltrados = useMemo(() => {
    if (!busca.trim()) return awards
    const t = busca.toLowerCase().trim()
    return awards.filter(
      (a) =>
        a.beneficiary_name.toLowerCase().includes(t) ||
        (a.beneficiary_code && a.beneficiary_code.toLowerCase().includes(t)) ||
        a.award_type.toLowerCase().includes(t) ||
        a.description.toLowerCase().includes(t) ||
        (a.campaign_name && a.campaign_name.toLowerCase().includes(t)) ||
        a.status.toLowerCase().includes(t),
    )
  }, [awards, busca])

  // Totalizadores
  const totalizadores = useMemo(() => {
    const totalGeral = awardsFiltrados.reduce((acc, a) => acc + (a.amount || 0), 0)
    const aprovados = awardsFiltrados
      .filter((a) => a.status === 'Aprovado')
      .reduce((acc, a) => acc + (a.amount || 0), 0)
    const pendentes = awardsFiltrados
      .filter((a) => a.status === 'Pendente')
      .reduce((acc, a) => acc + (a.amount || 0), 0)
    const rejeitados = awardsFiltrados
      .filter((a) => a.status === 'Rejeitado')
      .reduce((acc, a) => acc + (a.amount || 0), 0)
    const cancelados = awardsFiltrados
      .filter((a) => a.status === 'Cancelado')
      .reduce((acc, a) => acc + (a.amount || 0), 0)

    return { totalGeral, aprovados, pendentes, rejeitados, cancelados }
  }, [awardsFiltrados])

  // Abrir Modal Novo
  const abrirNovoModal = () => {
    setItemSelecionado(null)
    setFormEmpresa('Gran Romano / Jetro Matriz')
    if (profissionais.length > 0) setFormBeneficiarioId(profissionais[0].id)
    setFormCompetencia(filtroCompetencia || '2026-09')
    setFormDataLancamento(new Date().toISOString().slice(0, 10))
    if (tipos.length > 0) setFormTipo(tipos[0].name)
    setFormDescricao('')
    setFormValor('')
    setFormCampanha('')
    setFormObservacoes('')
    setArquivosUpload([])
    setModalNovoOpen(true)
  }

  // Abrir Edição
  const abrirEdicaoModal = (item: CommissionAward) => {
    if (item.status === 'Cancelado') {
      toast({
        title: 'Operação não permitida',
        description: 'Lançamentos cancelados não podem ser editados.',
        variant: 'destructive',
      })
      return
    }
    setItemSelecionado(item)
    setFormEmpresa(item.company)
    setFormBeneficiarioId(item.beneficiary_id)
    setFormCompetencia(item.competencia)
    setFormDataLancamento(item.release_date)
    setFormTipo(item.award_type)
    setFormDescricao(item.description)
    setFormValor(String(item.amount))
    setFormCampanha(item.campaign_name || '')
    setFormObservacoes(item.observations || '')
    setArquivosUpload([])
    setModalEditOpen(true)
  }

  // Salvar Novo Lançamento
  const handleSalvarNovo = async () => {
    const v = parseFloat(formValor.replace(',', '.'))
    if (!formDescricao.trim() || isNaN(v) || v <= 0) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Informe uma descrição válida e um valor numérico positivo.',
        variant: 'destructive',
      })
      return
    }

    const prof = profissionais.find((p) => p.id === formBeneficiarioId) || profissionais[0]

    setSalvandoForm(true)
    try {
      await criarPremiacao(
        {
          company: formEmpresa,
          beneficiary_id: prof.id,
          beneficiary_code: prof.code,
          beneficiary_name: prof.name,
          beneficiary_cpf_cnpj: prof.cpf_cnpj,
          role_name: prof.role_name,
          competencia: formCompetencia,
          release_date: formDataLancamento,
          award_type: formTipo,
          description: formDescricao,
          amount: v,
          campaign_name: formCampanha || undefined,
          observations: formObservacoes || undefined,
          status: 'Pendente',
        },
        arquivosUpload,
      )

      toast({
        title: 'Premiação cadastrada com sucesso',
        description: 'O lançamento foi registrado com status "Pendente" para aprovação.',
      })
      setModalNovoOpen(false)
      carregarTudo()
    } catch (err: any) {
      toast({
        title: 'Erro ao cadastrar premiação',
        description: err.message || 'Verifique se não há duplicidade de lançamento.',
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
        description: 'Informe uma descrição válida e um valor numérico positivo.',
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
      await atualizarPremiacao(itemSelecionado.id, {
        company: formEmpresa,
        beneficiary_id: prof.id,
        beneficiary_code: prof.code,
        beneficiary_name: prof.name,
        beneficiary_cpf_cnpj: prof.cpf_cnpj,
        role_name: prof.role_name,
        competencia: formCompetencia,
        release_date: formDataLancamento,
        award_type: formTipo,
        description: formDescricao,
        amount: v,
        campaign_name: formCampanha || undefined,
        observations: formObservacoes || undefined,
      })

      toast({
        title: 'Premiação atualizada',
        description: 'Alterações registradas na trilha de auditoria.',
      })
      setModalEditOpen(false)
      carregarTudo()
    } catch (err: any) {
      toast({
        title: 'Erro ao salvar alteração',
        description: err.message || 'Verifique permissões e status da apuração.',
        variant: 'destructive',
      })
    } finally {
      setSalvandoForm(false)
    }
  }

  // Excluir Lançamento
  const handleExcluir = async (item: CommissionAward) => {
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
      await excluirPremiacao(item.id)
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
  const abrirModalStatus = (item: CommissionAward, status: StatusLancamento) => {
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
        description: `Informe a justificativa para ${acaoStatus.toLowerCase()} este lançamento.`,
        variant: 'destructive',
      })
      return
    }

    setSalvandoStatus(true)
    try {
      await atualizarStatusPremiacao(itemSelecionado.id, acaoStatus, justificativaStatus)
      toast({
        title: `Lançamento ${acaoStatus}`,
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

  // Criar Novo Tipo de Premiação
  const handleCriarTipo = async () => {
    if (!novoTipoNome.trim()) return
    setSalvandoTipo(true)
    try {
      const created = await criarTipoPremiacao({
        name: novoTipoNome,
        description: novoTipoDesc,
      })
      toast({
        title: 'Tipo de premiação cadastrado',
        description: `O tipo "${created.name}" agora está disponível para seleção.`,
      })
      setTipos((prev) => [...prev, created])
      setFormTipo(created.name)
      setNovoTipoNome('')
      setNovoTipoDesc('')
      setModalTipoOpen(false)
    } catch (err: any) {
      toast({
        title: 'Erro ao cadastrar tipo',
        description: err.message || 'Nome já existente.',
        variant: 'destructive',
      })
    } finally {
      setSalvandoTipo(false)
    }
  }

  // Exportar Excel (CSV)
  const handleExportarExcel = () => {
    if (awardsFiltrados.length === 0) {
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
      'Tipo de Premiação',
      'Descrição',
      'Campanha',
      'Valor (R$)',
      'Status',
      'Responsável',
      'Aprovado Por',
      'Data Aprovação',
    ]

    const rows = awardsFiltrados.map((a) => [
      a.id,
      `"${a.company || ''}"`,
      `"${a.beneficiary_code || ''}"`,
      `"${a.beneficiary_name || ''}"`,
      `"${a.role_name || ''}"`,
      `"${a.competencia || ''}"`,
      `"${a.release_date || ''}"`,
      `"${a.award_type || ''}"`,
      `"${(a.description || '').replace(/"/g, '""')}"`,
      `"${a.campaign_name || ''}"`,
      a.amount.toFixed(2).replace('.', ','),
      `"${a.status}"`,
      `"${a.responsible_user_name || ''}"`,
      `"${a.approved_by_name || ''}"`,
      `"${a.approved_at || ''}"`,
    ])

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `Premiacoes_Comissoes_${filtroCompetencia || 'todas'}.csv`
    link.click()
    URL.revokeObjectURL(url)

    toast({
      title: 'Exportação Concluída',
      description: 'Arquivo de planilha gerado com sucesso.',
    })
  }

  // Exportar PDF / Impressão
  const handleImprimir = () => {
    window.print()
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto print:p-0">
      {/* Cabeçalho Compacto Padrão ERP Jetro */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-[#002817]/10 dark:bg-[#002817]/40 text-[#002817] dark:text-[#E4C46A]">
              <Award className="w-5 h-5 text-[#C9A227]" />
            </span>
            <h1 className="text-xl font-bold tracking-tight text-foreground">Premiações</h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Registre e acompanhe premiações, campanhas e pagamentos extras da equipe comercial.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setModalTipoOpen(true)}
            className="text-xs h-9 border-border"
          >
            <Tag className="w-3.5 h-3.5 mr-1 text-[#C9A227]" />
            Gerenciar Tipos
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
            onClick={handleImprimir}
            className="text-xs h-9 border-border"
          >
            <Printer className="w-3.5 h-3.5 mr-1" />
            Imprimir
          </Button>

          <Button
            size="sm"
            onClick={abrirNovoModal}
            className="text-xs h-9 bg-[#002817] hover:bg-[#00381C] text-white"
          >
            <Plus className="w-3.5 h-3.5 mr-1 text-[#E4C46A]" />
            Nova Premiação
          </Button>
        </div>
      </div>

      {/* Totalizadores com Identidade Visual Jetro */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-card border border-border rounded-xl p-3 shadow-2xs">
          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <span>Aprovados (Comporão)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-lg font-bold text-emerald-700 dark:text-emerald-400 mt-1">
            {formatMoeda(totalizadores.aprovados)}
          </div>
          <span className="text-[10px] text-muted-foreground">Somam na Comissão Analítica</span>
        </div>

        <div className="bg-card border border-border rounded-xl p-3 shadow-2xs">
          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <span>Pendentes</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-lg font-bold text-amber-600 mt-1">
            {formatMoeda(totalizadores.pendentes)}
          </div>
          <span className="text-[10px] text-muted-foreground">Aguardando aprovação formal</span>
        </div>

        <div className="bg-card border border-border rounded-xl p-3 shadow-2xs">
          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <span>Rejeitados</span>
            <XCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-lg font-bold text-rose-600 mt-1">
            {formatMoeda(totalizadores.rejeitados)}
          </div>
          <span className="text-[10px] text-muted-foreground">Desconsiderados do fechamento</span>
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

        <div className="bg-card border border-[#002817]/20 rounded-xl p-3 shadow-2xs col-span-2 sm:col-span-1 bg-[#002817]/5">
          <div className="flex items-center justify-between text-[#002817] dark:text-[#E4C46A] text-xs font-semibold">
            <span>Total Filtrado</span>
            <TrendingUp className="w-4 h-4 text-[#C9A227]" />
          </div>
          <div className="text-lg font-extrabold text-[#002817] dark:text-[#E4C46A] mt-1">
            {formatMoeda(totalizadores.totalGeral)}
          </div>
          <span className="text-[10px] text-muted-foreground">
            {awardsFiltrados.length} lançamentos
          </span>
        </div>
      </div>

      {/* Barra de Filtros e Pesquisa */}
      <div className="bg-card border border-border rounded-xl p-3.5 shadow-2xs space-y-3 print:hidden">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {/* Competência */}
          <div className="space-y-1">
            <Label className="text-[11px] text-muted-foreground font-medium">Competência</Label>
            <Input
              type="month"
              value={filtroCompetencia}
              onChange={(e) => setFiltroCompetencia(e.target.value)}
              className="h-8 text-xs"
            />
          </div>

          {/* Status */}
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

          {/* Profissional Beneficiado */}
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

          {/* Pesquisa Livre */}
          <div className="space-y-1">
            <Label className="text-[11px] text-muted-foreground font-medium">Busca rápida</Label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por descrição, tipo, campanha..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="h-8 text-xs pl-8"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tabela de Lançamentos de Premiações */}
      <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#002817] text-white select-none">
                <th className="py-3 px-3 font-semibold whitespace-nowrap">Status</th>
                <th className="py-3 px-3 font-semibold whitespace-nowrap">
                  Profissional Beneficiado
                </th>
                <th className="py-3 px-3 font-semibold whitespace-nowrap">Cargo / Função</th>
                <th className="py-3 px-3 font-semibold whitespace-nowrap">Competência</th>
                <th className="py-3 px-3 font-semibold whitespace-nowrap">Data</th>
                <th className="py-3 px-3 font-semibold whitespace-nowrap">Tipo</th>
                <th className="py-3 px-3 font-semibold whitespace-nowrap">Descrição / Motivo</th>
                <th className="py-3 px-3 font-semibold whitespace-nowrap">Campanha</th>
                <th className="py-3 px-3 font-semibold text-right whitespace-nowrap">Valor</th>
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
                    Carregando lançamentos de premiações...
                  </td>
                </tr>
              ) : awardsFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-muted-foreground">
                    Nenhuma premiação encontrada para os filtros aplicados.
                  </td>
                </tr>
              ) : (
                awardsFiltrados.map((item) => {
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

                      {/* Tipo */}
                      <td className="py-2.5 px-3 whitespace-nowrap font-medium text-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Tag className="w-3 h-3 text-[#C9A227]" />
                          {item.award_type}
                        </span>
                      </td>

                      {/* Descrição */}
                      <td
                        className="py-2.5 px-3 max-w-[220px] truncate text-foreground"
                        title={item.description}
                      >
                        {item.description}
                        {item.observations && (
                          <div
                            className="text-[10px] text-muted-foreground truncate"
                            title={item.observations}
                          >
                            Obs: {item.observations}
                          </div>
                        )}
                      </td>

                      {/* Campanha */}
                      <td className="py-2.5 px-3 text-muted-foreground whitespace-nowrap">
                        {item.campaign_name || '—'}
                      </td>

                      {/* Valor */}
                      <td className="py-2.5 px-3 text-right font-bold text-emerald-700 dark:text-emerald-400 whitespace-nowrap">
                        {formatMoeda(item.amount)}
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
                              title="Aprovar premiação para compor comissão"
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
                              title="Rejeitar premiação com justificativa"
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

      {/* Modal: Novo Lançamento de Premiação */}
      <Dialog open={modalNovoOpen} onOpenChange={setModalNovoOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold text-[#002817] dark:text-[#E4C46A]">
              <Award className="w-5 h-5 text-[#C9A227]" />
              Novo Lançamento de Premiação
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            {/* Empresa */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Empresa *</Label>
                <Input
                  value={formEmpresa}
                  onChange={(e) => setFormEmpresa(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

              {/* Profissional Beneficiado */}
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

            {/* Competência e Data */}
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
                  <Label className="text-xs">Tipo de Premiação *</Label>
                  <button
                    type="button"
                    onClick={() => setModalTipoOpen(true)}
                    className="text-[10px] text-[#002817] dark:text-[#E4C46A] underline font-semibold"
                  >
                    + Novo Tipo
                  </button>
                </div>
                <Select value={formTipo} onValueChange={setFormTipo}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {tipos.map((t) => (
                      <SelectItem key={t.id} value={t.name}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Descrição e Valor */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 space-y-1">
                <Label className="text-xs">Descrição / Motivo da Premiação *</Label>
                <Input
                  placeholder="Ex.: Bônus de superação de meta regional linha Belliz"
                  value={formDescricao}
                  onChange={(e) => setFormDescricao(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Valor (R$) *</Label>
                <Input
                  placeholder="0,00"
                  value={formValor}
                  onChange={(e) => setFormValor(e.target.value)}
                  className="h-8 text-xs font-semibold text-emerald-700 dark:text-emerald-400"
                />
              </div>
            </div>

            {/* Campanha Relacionada */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Campanha Relacionada (quando houver)</Label>
                <Select value={formCampanha} onValueChange={setFormCampanha}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Vincular a uma campanha comercial" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sem_campanha">Nenhuma campanha vinculada</SelectItem>
                    {campanhas.map((c) => (
                      <SelectItem key={c.id} value={c.name}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Responsável automático */}
              <div className="space-y-1">
                <Label className="text-xs">Usuário Responsável (Automático)</Label>
                <Input
                  disabled
                  value={currentUser?.name || currentUser?.email || 'Usuário Atual'}
                  className="h-8 text-xs bg-muted/50 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Observações */}
            <div className="space-y-1">
              <Label className="text-xs">Observações adicionais</Label>
              <Textarea
                placeholder="Observações complementares, critérios acordados ou autorizações..."
                value={formObservacoes}
                onChange={(e) => setFormObservacoes(e.target.value)}
                rows={2}
                className="text-xs"
              />
            </div>

            {/* Upload de Anexos Comprobatórios */}
            <div className="space-y-1">
              <Label className="text-xs">Anexos Comprobatórios (PDF, Imagens)</Label>
              <div className="border border-dashed border-border rounded-lg p-3 text-center bg-muted/20">
                <Upload className="w-5 h-5 mx-auto text-muted-foreground mb-1" />
                <p className="text-[11px] text-muted-foreground mb-2">
                  Selecione comprovantes de metas, planilhas assinadas ou relatórios de autorização.
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
                  className="text-xs file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-[#002817] file:text-white"
                />
                {arquivosUpload.length > 0 && (
                  <p className="text-[10px] text-emerald-600 mt-2 font-medium">
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
              disabled={salvandoForm}
              className="text-xs bg-[#002817] hover:bg-[#00381C] text-white"
            >
              {salvandoForm ? 'Salvando...' : 'Salvar Premiação'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Edição de Premiação */}
      <Dialog open={modalEditOpen} onOpenChange={setModalEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold text-[#002817] dark:text-[#E4C46A]">
              <Edit className="w-5 h-5 text-[#C9A227]" />
              Editar Premiação #{itemSelecionado?.id}
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
                <Label className="text-xs">Tipo de Premiação</Label>
                <Select value={formTipo} onValueChange={setFormTipo}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {tipos.map((t) => (
                      <SelectItem key={t.id} value={t.name}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 space-y-1">
                <Label className="text-xs">Descrição / Motivo</Label>
                <Input
                  value={formDescricao}
                  onChange={(e) => setFormDescricao(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Valor (R$)</Label>
                <Input
                  value={formValor}
                  onChange={(e) => setFormValor(e.target.value)}
                  className="h-8 text-xs font-semibold text-emerald-700 dark:text-emerald-400"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Campanha Relacionada</Label>
              <Select value={formCampanha} onValueChange={setFormCampanha}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Vincular a uma campanha comercial" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sem_campanha">Nenhuma campanha vinculada</SelectItem>
                  {campanhas.map((c) => (
                    <SelectItem key={c.id} value={c.name}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              className="text-xs bg-[#002817] hover:bg-[#00381C] text-white"
            >
              {salvandoForm ? 'Atualizando...' : 'Atualizar Lançamento'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Trilha de Auditoria e Histórico */}
      <Dialog open={modalHistoricoOpen} onOpenChange={setModalHistoricoOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold text-[#002817] dark:text-[#E4C46A]">
              <History className="w-5 h-5 text-[#C9A227]" />
              Trilha de Auditoria — Premiação #{itemSelecionado?.id}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div className="p-3 bg-muted/40 rounded-lg space-y-1">
              <div className="font-semibold text-foreground">
                {itemSelecionado?.beneficiary_name}
              </div>
              <div className="text-muted-foreground">
                Tipo: <b>{itemSelecionado?.award_type}</b> | Valor:{' '}
                <b>{formatMoeda(itemSelecionado?.amount || 0)}</b> | Competência:{' '}
                <b>{itemSelecionado?.competencia}</b>
              </div>
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {itemSelecionado?.history && itemSelecionado.history.length > 0 ? (
                itemSelecionado.history.map((h, i) => (
                  <div key={i} className="border border-border rounded-lg p-2.5 space-y-1">
                    <div className="flex items-center justify-between font-semibold">
                      <span className="text-[#002817] dark:text-[#E4C46A]">{h.acao}</span>
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
            <DialogTitle className="flex items-center gap-2 text-base font-bold text-[#002817] dark:text-[#E4C46A]">
              {acaoStatus === 'Aprovado' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              ) : acaoStatus === 'Rejeitado' ? (
                <XCircle className="w-5 h-5 text-rose-600" />
              ) : (
                <Ban className="w-5 h-5 text-slate-500" />
              )}
              {acaoStatus} Premiação
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <p className="text-muted-foreground">
              {acaoStatus === 'Aprovado' &&
                'Ao aprovar esta premiação, o valor comporá automaticamente o total líquido a pagar na tela Comissão Analítica da competência correspondente.'}
              {acaoStatus === 'Rejeitado' &&
                'Ao rejeitar, a premiação é mantida no histórico para auditoria, mas não afetará o fechamento financeiro.'}
              {acaoStatus === 'Cancelado' &&
                'Ao cancelar, este lançamento aprovado anteriormente será anulado do fechamento.'}
            </p>

            <div className="p-2.5 bg-muted/40 rounded border border-border text-foreground space-y-0.5">
              <div>
                Beneficiário: <b>{itemSelecionado?.beneficiary_name}</b>
              </div>
              <div>
                Valor: <b>{formatMoeda(itemSelecionado?.amount || 0)}</b>
              </div>
              <div>
                Tipo: <b>{itemSelecionado?.award_type}</b>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">
                Justificativa / Parecer do Gestor{' '}
                {acaoStatus !== 'Aprovado' ? '(Obrigatório)' : '(Opcional)'}
              </Label>
              <Textarea
                placeholder="Insira os motivos ou referências da decisão..."
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

      {/* Modal: Gerenciamento / Cadastro de Novos Tipos de Premiação */}
      <Dialog open={modalTipoOpen} onOpenChange={setModalTipoOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold text-[#002817] dark:text-[#E4C46A]">
              <Tag className="w-5 h-5 text-[#C9A227]" />
              Tipos de Premiações
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            {/* Lista de tipos existentes */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Tipos Disponíveis</Label>
              <div className="max-h-40 overflow-y-auto divide-y divide-border border border-border rounded-lg">
                {tipos.map((t) => (
                  <div key={t.id} className="p-2 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-foreground">{t.name}</div>
                      {t.description && (
                        <div className="text-[10px] text-muted-foreground">{t.description}</div>
                      )}
                    </div>
                    <Badge variant="outline" className="text-[9px] bg-emerald-50 text-emerald-700">
                      Ativo
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Cadastrar novo tipo */}
            <div className="border-t border-border pt-3 space-y-2">
              <Label className="text-xs font-semibold text-[#002817] dark:text-[#E4C46A]">
                Cadastrar Novo Tipo
              </Label>
              <Input
                placeholder="Nome do novo tipo (ex.: Campanha Safra Especial)"
                value={novoTipoNome}
                onChange={(e) => setNovoTipoNome(e.target.value)}
                className="h-8 text-xs"
              />
              <Input
                placeholder="Descrição resumida do objetivo (opcional)"
                value={novoTipoDesc}
                onChange={(e) => setNovoTipoDesc(e.target.value)}
                className="h-8 text-xs"
              />
              <Button
                size="sm"
                onClick={handleCriarTipo}
                disabled={salvandoTipo || !novoTipoNome.trim()}
                className="w-full text-xs bg-[#002817] hover:bg-[#00381C] text-white"
              >
                {salvandoTipo ? 'Salvando...' : 'Adicionar Novo Tipo'}
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setModalTipoOpen(false)}
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
export default PremiacoesPage
