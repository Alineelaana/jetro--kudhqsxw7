import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
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
import { useAuth } from '@/hooks/use-auth'
import { toast } from '@/hooks/use-toast'
import { JetroTable, type JetroColumnDef } from '@/components/jetro-table'
import {
  getRcaHierarchy,
  checkDocumentDuplicity,
  listSolicitacoes,
  createSolicitacao,
  updateSolicitacao,
  type RcaHierarchy,
} from '@/services/client-workflow'
import type { SolicitacaoClienteRecord, SolicitacaoStatus } from '@/lib/client-workflow-types'
import {
  UserCheck,
  Building2,
  MapPin,
  Phone,
  FileText,
  AlertTriangle,
  Plus,
  Save,
  Send,
  Eye,
  History,
  XCircle,
  FileDown,
  RefreshCw,
  Search,
  CheckCircle2,
  Clock,
  Edit,
} from 'lucide-react'

export function InserirClientesScreen() {
  const { user } = useAuth()
  const [hierarchy, setHierarchy] = useState<RcaHierarchy | null>(null)
  const [loadingHierarchy, setLoadingHierarchy] = useState(true)
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoClienteRecord[]>([])
  const [loadingList, setLoadingList] = useState(false)
  const [searchFilter, setSearchFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Estado do formulário
  const [formOpen, setFormOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<SolicitacaoClienteRecord | null>(null)
  const [saving, setSaving] = useState(false)

  // Campos do formulário
  const [tipoPessoa, setTipoPessoa] = useState<'PF' | 'PJ'>('PJ')
  const [cpfCnpj, setCpfCnpj] = useState('')
  const [razaoSocial, setRazaoSocial] = useState('')
  const [nomeFantasia, setNomeFantasia] = useState('')
  const [inscricaoEstadual, setInscricaoEstadual] = useState('')
  const [situacaoIe, setSituacaoIe] = useState<'contribuinte' | 'isento' | 'nao_contribuinte'>(
    'contribuinte',
  )
  const [cnae, setCnae] = useState('')
  const [dataFundacao, setDataFundacao] = useState('')
  const [origemConsulta, setOrigemConsulta] = useState('Receita Federal')
  const [dataConsulta, setDataConsulta] = useState(new Date().toISOString().split('T')[0])
  const [duplicityWarning, setDuplicityWarning] = useState<string | null>(null)

  // Endereço
  const [cep, setCep] = useState('')
  const [uf, setUf] = useState('ES')
  const [municipio, setMunicipio] = useState('')
  const [bairro, setBairro] = useState('')
  const [logradouro, setLogradouro] = useState('')
  const [numeroEnd, setNumeroEnd] = useState('')
  const [complemento, setComplemento] = useState('')
  const [pontoReferencia, setPontoReferencia] = useState('')
  const [enderecoEntregaDiferente, setEnderecoEntregaDiferente] = useState(false)

  // Contatos
  const [telefone, setTelefone] = useState('')
  const [telefoneAdicional, setTelefoneAdicional] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [responsavelEstabelecimento, setResponsavelEstabelecimento] = useState('')
  const [email, setEmail] = useState('')
  const [emailXml, setEmailXml] = useState('')
  const [contatoComercial, setContatoComercial] = useState('')

  // Complementares
  const [motivoSolicitacao, setMotivoSolicitacao] = useState('')
  const [observacoesVendedor, setObservacoesVendedor] = useState('')
  const [limitePretendido, setLimitePretendido] = useState('')
  const [condicaoPagamentoSolicitada, setCondicaoPagamentoSolicitada] = useState('')

  // Modais de Visualização e Histórico
  const [viewRecord, setViewRecord] = useState<SolicitacaoClienteRecord | null>(null)
  const [historyRecord, setHistoryRecord] = useState<SolicitacaoClienteRecord | null>(null)
  const [cancelRecord, setCancelRecord] = useState<SolicitacaoClienteRecord | null>(null)
  const [motivoCancelamento, setMotivoCancelamento] = useState('')

  // 1. Carregar hierarquia organizacional oficial do usuário logado
  const loadHierarchy = async () => {
    if (!user?.id) return
    setLoadingHierarchy(true)
    const hier = await getRcaHierarchy(user.id, (user.name as string) || (user.email as string))
    setHierarchy(hier)
    setLoadingHierarchy(false)
  }

  // 2. Carregar solicitações do RCA
  const loadSolicitacoes = async () => {
    setLoadingList(true)
    try {
      // Se for admin/SUP ou Comercial, pode ver todas ou filtrar; se vendedor, filtra pelo RCA
      const data = await listSolicitacoes('', '-created')
      setSolicitacoes(data)
    } catch {
      toast({ title: 'Erro ao carregar solicitações', variant: 'destructive' })
    }
    setLoadingList(false)
  }

  useEffect(() => {
    loadHierarchy()
    loadSolicitacoes()
  }, [user?.id])

  // Checagem de duplicidade ao digitar CPF/CNPJ
  const handleCheckDuplicity = async (val: string) => {
    setCpfCnpj(val)
    const clean = val.replace(/\D/g, '')
    if (clean.length === 11 || clean.length === 14) {
      const res = await checkDocumentDuplicity(clean, editingRecord?.id)
      if (res.isDuplicate) {
        if (res.tipo === 'cliente_oficial') {
          setDuplicityWarning(
            `ATENÇÃO: Já existe um Cliente Oficial com este documento: ${res.nome} (Código: ${res.codigo}, Status: ${res.status}). Verifique antes de continuar.`,
          )
        } else {
          setDuplicityWarning(
            `ATENÇÃO: Já existe uma Solicitação de Pré-Cadastro em andamento com este documento: ${res.nome} (Número: ${res.codigo}, Status: ${res.status}).`,
          )
        }
      } else {
        setDuplicityWarning(null)
      }
    } else {
      setDuplicityWarning(null)
    }
  }

  // Consulta simples de CEP
  const handleCepLookup = async () => {
    const cleanCep = cep.replace(/\D/g, '')
    if (cleanCep.length !== 8) return
    try {
      const resp = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)
      const data = await resp.json()
      if (!data.erro) {
        setLogradouro(data.logradouro || '')
        setBairro(data.bairro || '')
        setMunicipio(data.localidade || '')
        setUf(data.uf || '')
        toast({ title: 'Endereço localizado pelo CEP' })
      }
    } catch {
      /* intentionally ignored */
    }
  }

  const handleOpenNew = () => {
    setEditingRecord(null)
    setTipoPessoa('PJ')
    setCpfCnpj('')
    setRazaoSocial('')
    setNomeFantasia('')
    setInscricaoEstadual('')
    setSituacaoIe('contribuinte')
    setCnae('')
    setDataFundacao('')
    setDuplicityWarning(null)
    setCep('')
    setUf('ES')
    setMunicipio('')
    setBairro('')
    setLogradouro('')
    setNumeroEnd('')
    setComplemento('')
    setPontoReferencia('')
    setEnderecoEntregaDiferente(false)
    setTelefone('')
    setTelefoneAdicional('')
    setWhatsapp('')
    setResponsavelEstabelecimento('')
    setEmail('')
    setEmailXml('')
    setContatoComercial('')
    setMotivoSolicitacao('')
    setObservacoesVendedor('')
    setLimitePretendido('')
    setCondicaoPagamentoSolicitada('')
    setFormOpen(true)
  }

  const handleEditDraft = (rec: SolicitacaoClienteRecord) => {
    setEditingRecord(rec)
    setTipoPessoa(rec.tipo_pessoa || 'PJ')
    setCpfCnpj(rec.cpf_cnpj || '')
    setRazaoSocial(rec.razao_social || '')
    setNomeFantasia(rec.nome_fantasia || '')
    setInscricaoEstadual(rec.inscricao_estadual || '')
    setSituacaoIe(rec.situacao_ie || 'contribuinte')
    setCnae(rec.cnae || '')
    setDataFundacao(rec.data_fundacao || '')
    setDuplicityWarning(null)
    setCep(rec.cep || '')
    setUf(rec.uf || 'ES')
    setMunicipio(rec.municipio || '')
    setBairro(rec.bairro || '')
    setLogradouro(rec.logradouro || '')
    setNumeroEnd(rec.numero_end || '')
    setComplemento(rec.complemento || '')
    setPontoReferencia(rec.ponto_referencia || '')
    setEnderecoEntregaDiferente(rec.endereco_entrega_diferente || false)
    setTelefone(rec.telefone || '')
    setTelefoneAdicional(rec.telefone_adicional || '')
    setWhatsapp(rec.whatsapp || '')
    setResponsavelEstabelecimento(rec.responsavel_estabelecimento || '')
    setEmail(rec.email || '')
    setEmailXml(rec.email_xml || '')
    setContatoComercial(rec.contato_comercial || '')
    setMotivoSolicitacao(rec.motivo_solicitacao || '')
    setObservacoesVendedor(rec.observacoes_vendedor || '')
    setLimitePretendido(rec.limite_pretendido || '')
    setCondicaoPagamentoSolicitada(rec.condicao_pagamento_solicitada || '')
    setFormOpen(true)
  }

  const handleSaveForm = async (statusDestino: 'rascunho' | 'aguardando_validacao') => {
    if (!hierarchy || hierarchy.inconsistente) {
      toast({
        title: 'Inconsistência Organizacional',
        description: 'Não é possível prosseguir sem vínculo válido de RCA e Gerente Comercial.',
        variant: 'destructive',
      })
      return
    }

    if (statusDestino === 'aguardando_validacao') {
      if (!razaoSocial.trim()) {
        toast({ title: 'Razão Social / Nome Completo é obrigatório', variant: 'destructive' })
        return
      }
      if (!cpfCnpj.trim()) {
        toast({ title: 'CPF / CNPJ é obrigatório', variant: 'destructive' })
        return
      }
      if (!email.trim() && !telefone.trim() && !whatsapp.trim()) {
        toast({
          title: 'Informe ao menos um contato (E-mail, Telefone ou WhatsApp)',
          variant: 'destructive',
        })
        return
      }
    }

    setSaving(true)
    try {
      const payload: Partial<SolicitacaoClienteRecord> = {
        tipo_pessoa: tipoPessoa,
        cpf_cnpj: cpfCnpj,
        razao_social: razaoSocial,
        nome_fantasia: nomeFantasia || razaoSocial,
        inscricao_estadual: inscricaoEstadual,
        situacao_ie: situacaoIe,
        cnae,
        data_fundacao: dataFundacao,
        origem_consulta: origemConsulta,
        data_consulta: dataConsulta,
        cep,
        uf,
        municipio,
        bairro,
        logradouro,
        numero_end: numeroEnd,
        complemento,
        ponto_referencia: pontoReferencia,
        endereco_entrega_diferente: enderecoEntregaDiferente,
        telefone,
        telefone_adicional: telefoneAdicional,
        whatsapp,
        responsavel_estabelecimento: responsavelEstabelecimento,
        email,
        email_xml: emailXml || email,
        contato_comercial: contatoComercial,
        motivo_solicitacao: motivoSolicitacao,
        observacoes_vendedor: observacoesVendedor,
        limite_pretendido: limitePretendido,
        condicao_pagamento_solicitada: condicaoPagamentoSolicitada,
        status: statusDestino,
      }

      const userName = (user?.name as string) || (user?.email as string) || 'Usuário'

      if (editingRecord) {
        // Atualizar
        const hist = editingRecord.historico || []
        hist.push({
          data_hora: new Date().toISOString(),
          usuario_id: user?.id || '',
          usuario_nome: userName,
          acao:
            statusDestino === 'aguardando_validacao'
              ? editingRecord.status === 'em_correcao'
                ? 'Solicitação corrigida e reenviada para validação comercial'
                : 'Solicitação enviada para validação comercial'
              : 'Rascunho atualizado pelo vendedor',
          status: statusDestino,
        })
        payload.historico = hist

        await updateSolicitacao(editingRecord.id, payload)
        toast({
          title:
            statusDestino === 'aguardando_validacao'
              ? 'Enviado com sucesso para o Comercial'
              : 'Rascunho salvo',
        })
      } else {
        // Criar nova solicitação
        payload.rca_id = hierarchy.rcaId
        payload.rca_nome = hierarchy.rcaNome
        payload.rca_codigo = hierarchy.rcaCodigo
        payload.gerente_id = hierarchy.gerenteId
        payload.gerente_nome = hierarchy.gerenteNome
        payload.gerente_codigo = hierarchy.gerenteCodigo
        payload.solicitante_id = user?.id || ''
        payload.solicitante_nome = userName

        await createSolicitacao(payload)
        toast({
          title:
            statusDestino === 'aguardando_validacao'
              ? 'Solicitação criada e enviada ao Comercial'
              : 'Rascunho criado com sucesso',
        })
      }

      setFormOpen(false)
      loadSolicitacoes()
    } catch (err: any) {
      toast({
        title: 'Erro ao salvar solicitação',
        description: err?.message || 'Tente novamente.',
        variant: 'destructive',
      })
    }
    setSaving(false)
  }

  const handleConfirmCancel = async () => {
    if (!cancelRecord) return
    if (!motivoCancelamento.trim()) {
      toast({ title: 'Justificativa de cancelamento é obrigatória', variant: 'destructive' })
      return
    }

    try {
      const hist = cancelRecord.historico || []
      hist.push({
        data_hora: new Date().toISOString(),
        usuario_id: user?.id || '',
        usuario_nome: (user?.name as string) || (user?.email as string) || 'Usuário',
        acao: 'Solicitação cancelada pelo vendedor',
        status: 'cancelado',
        motivo: motivoCancelamento,
      })

      await updateSolicitacao(cancelRecord.id, {
        status: 'cancelado',
        historico: hist,
      })
      toast({ title: 'Solicitação cancelada com sucesso' })
      setCancelRecord(null)
      setMotivoCancelamento('')
      loadSolicitacoes()
    } catch (err: any) {
      toast({ title: 'Erro ao cancelar', description: err?.message, variant: 'destructive' })
    }
  }

  // Filtros da tabela
  const filteredSolicitacoes = useMemo(() => {
    return solicitacoes.filter((s) => {
      const q = searchFilter.toLowerCase().trim()
      const matchesSearch =
        !q ||
        (s.numero || '').toLowerCase().includes(q) ||
        (s.razao_social || '').toLowerCase().includes(q) ||
        (s.nome_fantasia || '').toLowerCase().includes(q) ||
        (s.cpf_cnpj || '').includes(q) ||
        (s.rca_nome || '').toLowerCase().includes(q)

      const matchesStatus = statusFilter === 'all' || s.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [solicitacoes, searchFilter, statusFilter])

  const getStatusBadge = (st: SolicitacaoStatus) => {
    switch (st) {
      case 'rascunho':
        return (
          <Badge className="bg-slate-500/20 text-slate-700 border-slate-300">
            Em preenchimento (Rascunho)
          </Badge>
        )
      case 'aguardando_validacao':
        return (
          <Badge className="bg-amber-500/20 text-amber-800 border-amber-300">
            Aguardando Validação
          </Badge>
        )
      case 'em_correcao':
        return (
          <Badge className="bg-red-500/20 text-red-800 border-red-300">
            Devolvido para Correção
          </Badge>
        )
      case 'em_analise':
        return (
          <Badge className="bg-blue-500/20 text-blue-800 border-blue-300">
            Em Análise Comercial
          </Badge>
        )
      case 'concluido':
        return (
          <Badge className="bg-emerald-500/20 text-emerald-800 border-emerald-300">
            Concluído (Oficial)
          </Badge>
        )
      case 'rejeitado':
        return <Badge className="bg-rose-500/20 text-rose-800 border-rose-300">Rejeitado</Badge>
      case 'cancelado':
        return <Badge className="bg-gray-500/20 text-gray-700 border-gray-300">Cancelado</Badge>
      default:
        return <Badge variant="outline">{st}</Badge>
    }
  }

  // Definição das colunas para JetroTable
  const columns: JetroColumnDef<SolicitacaoClienteRecord>[] = [
    {
      id: 'numero',
      title: 'Número',
      accessorKey: 'numero',
      sortable: true,
      minWidth: 140,
      cell: ({ row }) => (
        <span className="font-mono font-bold text-[#005B2E]">{row.numero || 'SOL-NOVA'}</span>
      ),
    },
    {
      id: 'data_solicitacao',
      title: 'Data Envio',
      accessorKey: 'data_solicitacao',
      sortable: true,
      minWidth: 120,
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">
          {row.data_solicitacao ? new Date(row.data_solicitacao).toLocaleDateString('pt-BR') : '-'}
        </span>
      ),
    },
    {
      id: 'razao_social',
      title: 'Cliente / Razão Social',
      accessorKey: 'razao_social',
      sortable: true,
      minWidth: 220,
      cell: ({ row }) => (
        <div>
          <p className="font-bold text-foreground text-sm leading-tight">
            {row.razao_social || '-'}
          </p>
          {row.nome_fantasia && row.nome_fantasia !== row.razao_social && (
            <p className="text-xs text-muted-foreground">{row.nome_fantasia}</p>
          )}
        </div>
      ),
    },
    {
      id: 'cpf_cnpj',
      title: 'CPF / CNPJ',
      accessorKey: 'cpf_cnpj',
      sortable: true,
      minWidth: 150,
      cell: ({ row }) => <span className="font-mono text-xs">{row.cpf_cnpj || '-'}</span>,
    },
    {
      id: 'rca_nome',
      title: 'RCA Principal',
      accessorKey: 'rca_nome',
      sortable: true,
      minWidth: 160,
      cell: ({ row }) => (
        <div>
          <p className="text-xs font-semibold text-foreground">{row.rca_nome || '-'}</p>
          <p className="text-[10px] text-muted-foreground">Gerente: {row.gerente_nome || '-'}</p>
        </div>
      ),
    },
    {
      id: 'status',
      title: 'Situação',
      accessorKey: 'status',
      sortable: true,
      minWidth: 180,
      cell: ({ row }) => getStatusBadge(row.status),
    },
    {
      id: 'pendencias',
      title: 'Pendências / Correções',
      minWidth: 180,
      cell: ({ row }) =>
        row.status === 'em_correcao' && row.pendencias_correcao ? (
          <div className="bg-red-50 p-1.5 rounded border border-red-200 text-xs text-red-800">
            <span className="font-bold">Ajustar: </span>
            {row.pendencias_correcao}
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">-</span>
        ),
    },
    {
      id: 'acoes',
      title: 'Ações',
      minWidth: 160,
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            title="Visualizar Detalhes"
            onClick={() => setViewRecord(row)}
            className="h-8 w-8 p-0 text-[#005B2E]"
          >
            <Eye className="w-4 h-4" />
          </Button>

          {['rascunho', 'em_correcao'].includes(row.status) && (
            <Button
              size="sm"
              variant="ghost"
              title="Editar / Corrigir"
              onClick={() => handleEditDraft(row)}
              className="h-8 w-8 p-0 text-amber-700"
            >
              <Edit className="w-4 h-4" />
            </Button>
          )}

          <Button
            size="sm"
            variant="ghost"
            title="Histórico de Eventos"
            onClick={() => setHistoryRecord(row)}
            className="h-8 w-8 p-0 text-[#C9A227]"
          >
            <History className="w-4 h-4" />
          </Button>

          {['rascunho', 'aguardando_validacao', 'em_correcao'].includes(row.status) && (
            <Button
              size="sm"
              variant="ghost"
              title="Cancelar Solicitação"
              onClick={() => {
                setCancelRecord(row)
                setMotivoCancelamento('')
              }}
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
            >
              <XCircle className="w-4 h-4" />
            </Button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* CABEÇALHO DO MÓDULO */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
            <Building2 className="w-7 h-7 text-[#005B2E]" />
            Inserir Clientes (Pré-Cadastro de Vendas)
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Solicitação oficial pelo RCA para validação do Comercial e aprovação financeira. Base
            única e histórico imutável.
          </p>
        </div>
        <Button
          onClick={handleOpenNew}
          className="bg-[#005B2E] hover:bg-[#004724] text-white font-bold shadow-sm"
        >
          <Plus className="w-4 h-4 mr-2" /> Novo Pré-Cadastro
        </Button>
      </div>

      {/* QUADRO: RESPONSÁVEL PELA SOLICITAÇÃO (REGRA OBRIGATÓRIA PRIORITÁRIA) */}
      <Card className="border-2 border-[#005B2E]/20 bg-emerald-50/40">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold text-[#005B2E] uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-[#005B2E]" />
              Responsável pela Solicitação (Identificação Organizacional Automática)
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={loadHierarchy}
              disabled={loadingHierarchy}
              className="h-7 text-xs text-[#005B2E]"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1 ${loadingHierarchy ? 'animate-spin' : ''}`} />
              Recarregar Vínculo
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingHierarchy ? (
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Clock className="w-4 h-4 animate-spin text-[#005B2E]" /> Consultando estrutura
              comercial...
            </p>
          ) : hierarchy?.inconsistente ? (
            <div className="bg-amber-100 border border-amber-300 text-amber-900 p-3 rounded-lg text-sm flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Inconsistência Organizacional Identificada</p>
                <p className="text-xs mt-0.5">{hierarchy.motivoInconsistencia}</p>
                <p className="text-xs mt-1 text-amber-800">
                  Por regra de governança do ERP Jetro, nenhum pré-cadastro pode ser submetido com
                  gerente aleatório ou sem RCA válido.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="bg-white p-3 rounded-lg border border-emerald-200">
                <span className="text-[11px] font-bold text-muted-foreground uppercase block">
                  RCA 1 (Vendedor Principal)
                </span>
                <span className="font-black text-foreground text-base block mt-0.5">
                  {hierarchy?.rcaNome}
                </span>
                <span className="text-xs text-[#005B2E] font-mono font-semibold">
                  Cód: {hierarchy?.rcaCodigo}
                </span>
              </div>
              <div className="bg-white p-3 rounded-lg border border-emerald-200">
                <span className="text-[11px] font-bold text-muted-foreground uppercase block">
                  Gerente Comercial
                </span>
                <span className="font-black text-foreground text-base block mt-0.5">
                  {hierarchy?.gerenteNome}
                </span>
                <span className="text-xs text-muted-foreground font-mono">
                  {hierarchy?.gerenteCodigo}
                </span>
              </div>
              <div className="bg-white p-3 rounded-lg border border-emerald-200">
                <span className="text-[11px] font-bold text-muted-foreground uppercase block">
                  Data / Hora Atual
                </span>
                <span className="font-bold text-foreground text-sm block mt-1">
                  {new Date().toLocaleDateString('pt-BR')} —{' '}
                  {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </span>
                <span className="text-[11px] text-emerald-700 font-semibold">
                  Horário de Brasília
                </span>
              </div>
              <div className="bg-white p-3 rounded-lg border border-emerald-200">
                <span className="text-[11px] font-bold text-muted-foreground uppercase block">
                  Status de Submissão
                </span>
                <div className="mt-1 flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Pronto para Solicitações
                </div>
                <span className="text-[11px] text-muted-foreground">
                  Vínculo verificado e permanente
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ACOMPANHAMENTO PELO VENDEDOR NA PRÓPRIA TELA */}
      <Card className="border border-border">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base font-bold text-foreground">
                Minhas Solicitações de Clientes
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Acompanhe o andamento da validação comercial e análise financeira em tempo real.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-64">
                <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="Buscar número, cliente, CPF/CNPJ..."
                  className="pl-8 text-xs h-8"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-8 text-xs w-44">
                  <SelectValue placeholder="Todas as situações" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as situações</SelectItem>
                  <SelectItem value="rascunho">Em preenchimento (Rascunho)</SelectItem>
                  <SelectItem value="aguardando_validacao">Aguardando Validação</SelectItem>
                  <SelectItem value="em_correcao">Devolvido para Correção</SelectItem>
                  <SelectItem value="em_analise">Em Análise Comercial</SelectItem>
                  <SelectItem value="concluido">Concluído (Oficial)</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <JetroTable
            columns={columns}
            data={filteredSolicitacoes}
            loading={loadingList}
            pageSize={10}
            preferenceKey="vendas_inserir_clientes_grid"
            exportTitle="Solicitacoes_Clientes_Vendas_Jetro"
          />
        </CardContent>
      </Card>

      {/* MODAL DO FORMULÁRIO DE PRÉ-CADASTRO (EM SEÇÕES SIMPLES A, B, C, D, E) */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-foreground flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#005B2E]" />
              {editingRecord
                ? `Editar Solicitação #${editingRecord.numero}`
                : 'Novo Pré-Cadastro de Cliente'}
            </DialogTitle>
          </DialogHeader>

          {/* ALERTA DE DUPLICIDADE EM TEMPO REAL */}
          {duplicityWarning && (
            <div className="bg-amber-100 border-2 border-amber-400 p-3 rounded-lg text-sm text-amber-950 flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Aviso de Unicidade Cadastral</p>
                <p className="text-xs mt-0.5">{duplicityWarning}</p>
              </div>
            </div>
          )}

          {/* SEÇÃO E: RESPONSÁVEIS COMERCIAIS AUTOMÁTICOS (FIXOS) */}
          <div className="bg-muted/40 p-3 rounded-lg border border-border">
            <span className="text-xs font-bold text-[#005B2E] uppercase block mb-1">
              (E) Vínculo Comercial Automático (Não editável pelo vendedor)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-muted-foreground block">RCA 1 (Principal):</span>
                <span className="font-bold text-foreground">
                  {editingRecord?.rca_nome || hierarchy?.rcaNome} (
                  {editingRecord?.rca_codigo || hierarchy?.rcaCodigo})
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block">Gerente Comercial:</span>
                <span className="font-bold text-foreground">
                  {editingRecord?.gerente_nome || hierarchy?.gerenteNome}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block">Solicitante Oficial:</span>
                <span className="font-bold text-foreground">{user?.name || user?.email}</span>
              </div>
            </div>
          </div>

          <div className="space-y-6 pt-2">
            {/* SEÇÃO A: IDENTIFICAÇÃO */}
            <div className="space-y-3">
              <h3 className="text-sm font-black text-foreground uppercase tracking-wide border-b border-border pb-1 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-[#005B2E]" /> (A) Identificação da Empresa /
                Pessoa
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-bold">Tipo de Pessoa *</Label>
                  <Select value={tipoPessoa} onValueChange={(v: 'PF' | 'PJ') => setTipoPessoa(v)}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PJ">Pessoa Jurídica (PJ)</SelectItem>
                      <SelectItem value="PF">Pessoa Física (PF)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <Label className="text-xs font-bold">
                    {tipoPessoa === 'PJ' ? 'CNPJ *' : 'CPF *'}
                  </Label>
                  <Input
                    value={cpfCnpj}
                    onChange={(e) => handleCheckDuplicity(e.target.value)}
                    placeholder={tipoPessoa === 'PJ' ? '00.000.000/0000-00' : '000.000.000-00'}
                    className="h-9 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-bold">
                    {tipoPessoa === 'PJ' ? 'Razão Social *' : 'Nome Completo *'}
                  </Label>
                  <Input
                    value={razaoSocial}
                    onChange={(e) => setRazaoSocial(e.target.value)}
                    placeholder="Razão Social completa"
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-bold">Nome Fantasia</Label>
                  <Input
                    value={nomeFantasia}
                    onChange={(e) => setNomeFantasia(e.target.value)}
                    placeholder="Nome de fachada / marca"
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-bold">
                    {tipoPessoa === 'PJ' ? 'Inscrição Estadual (IE)' : 'RG'}
                  </Label>
                  <Input
                    value={inscricaoEstadual}
                    onChange={(e) => setInscricaoEstadual(e.target.value)}
                    placeholder="Número da IE ou RG"
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-bold">Situação da IE</Label>
                  <Select
                    value={situacaoIe}
                    onValueChange={(v: 'contribuinte' | 'isento' | 'nao_contribuinte') =>
                      setSituacaoIe(v)
                    }
                  >
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="contribuinte">Contribuinte ICMS</SelectItem>
                      <SelectItem value="isento">Isento de Inscrição</SelectItem>
                      <SelectItem value="nao_contribuinte">Não Contribuinte</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-bold">CNAE Principal</Label>
                  <Input
                    value={cnae}
                    onChange={(e) => setCnae(e.target.value)}
                    placeholder="Ex: 4771-7/01"
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-bold">
                    {tipoPessoa === 'PJ' ? 'Data de Fundação' : 'Data de Nascimento'}
                  </Label>
                  <Input
                    type="date"
                    value={dataFundacao}
                    onChange={(e) => setDataFundacao(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-bold">Origem da Consulta</Label>
                  <Input
                    value={origemConsulta}
                    onChange={(e) => setOrigemConsulta(e.target.value)}
                    className="h-9 text-xs bg-muted/40"
                    readOnly
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-bold">Data da Consulta</Label>
                  <Input
                    type="date"
                    value={dataConsulta}
                    onChange={(e) => setDataConsulta(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* SEÇÃO B: ENDEREÇO */}
            <div className="space-y-3">
              <h3 className="text-sm font-black text-foreground uppercase tracking-wide border-b border-border pb-1 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#005B2E]" /> (B) Endereço e Localização
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-bold">CEP</Label>
                  <div className="flex gap-1">
                    <Input
                      value={cep}
                      onChange={(e) => setCep(e.target.value)}
                      onBlur={handleCepLookup}
                      placeholder="00000-000"
                      className="h-9 text-xs font-mono"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={handleCepLookup}
                      className="h-9 px-2 text-xs"
                    >
                      Buscar
                    </Button>
                  </div>
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <Label className="text-xs font-bold">Município</Label>
                  <Input
                    value={municipio}
                    onChange={(e) => setMunicipio(e.target.value)}
                    placeholder="Cidade"
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-bold">UF</Label>
                  <Input
                    value={uf}
                    onChange={(e) => setUf(e.target.value.toUpperCase())}
                    placeholder="UF"
                    maxLength={2}
                    className="h-9 text-xs uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="space-y-1 sm:col-span-2">
                  <Label className="text-xs font-bold">Logradouro (Rua / Av.)</Label>
                  <Input
                    value={logradouro}
                    onChange={(e) => setLogradouro(e.target.value)}
                    placeholder="Logradouro"
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-bold">Número</Label>
                  <Input
                    value={numeroEnd}
                    onChange={(e) => setNumeroEnd(e.target.value)}
                    placeholder="Nº"
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-bold">Bairro</Label>
                  <Input
                    value={bairro}
                    onChange={(e) => setBairro(e.target.value)}
                    placeholder="Bairro"
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-bold">Complemento</Label>
                  <Input
                    value={complemento}
                    onChange={(e) => setComplemento(e.target.value)}
                    placeholder="Sala, galpão, bloco..."
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-bold">Ponto de Referência</Label>
                  <Input
                    value={pontoReferencia}
                    onChange={(e) => setPontoReferencia(e.target.value)}
                    placeholder="Próximo a..."
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <Switch
                  checked={enderecoEntregaDiferente}
                  onCheckedChange={setEnderecoEntregaDiferente}
                />
                <span className="text-xs font-bold text-foreground">
                  Possui endereço de entrega diferente da sede?
                </span>
              </div>
            </div>

            {/* SEÇÃO C: CONTATOS */}
            <div className="space-y-3">
              <h3 className="text-sm font-black text-foreground uppercase tracking-wide border-b border-border pb-1 flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-[#005B2E]" /> (C) Contatos do Estabelecimento
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-bold">Telefone Principal</Label>
                  <Input
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    placeholder="(00) 0000-0000"
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-bold">WhatsApp Comercial</Label>
                  <Input
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="(00) 90000-0000"
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-bold">Telefone Adicional</Label>
                  <Input
                    value={telefoneAdicional}
                    onChange={(e) => setTelefoneAdicional(e.target.value)}
                    placeholder="Opcional"
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-bold">E-mail Principal</Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="comercial@cliente.com"
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-bold">E-mail para XML / DANFE</Label>
                  <Input
                    type="email"
                    value={emailXml}
                    onChange={(e) => setEmailXml(e.target.value)}
                    placeholder="nfe@cliente.com (se diferente)"
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-bold">Responsável / Comprador</Label>
                  <Input
                    value={responsavelEstabelecimento}
                    onChange={(e) => setResponsavelEstabelecimento(e.target.value)}
                    placeholder="Nome do contato principal"
                    className="h-9 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* SEÇÃO D: COMPLEMENTARES / CONTEXTO DA SOLICITAÇÃO */}
            <div className="space-y-3">
              <h3 className="text-sm font-black text-foreground uppercase tracking-wide border-b border-border pb-1 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-[#005B2E]" /> (D) Informações Complementares &
                Comercial
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-bold">
                    Limite Pretendido (Solicitação inicial)
                  </Label>
                  <Input
                    value={limitePretendido}
                    onChange={(e) => setLimitePretendido(e.target.value)}
                    placeholder="Ex: R$ 15.000,00"
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-bold">Condição de Pagamento Desejada</Label>
                  <Input
                    value={condicaoPagamentoSolicitada}
                    onChange={(e) => setCondicaoPagamentoSolicitada(e.target.value)}
                    placeholder="Ex: 28 dias boleto"
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold">Motivo / Contexto da Solicitação</Label>
                <Input
                  value={motivoSolicitacao}
                  onChange={(e) => setMotivoSolicitacao(e.target.value)}
                  placeholder="Ex: Novo cliente captado em rota, potencial farmácia de médio porte..."
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold">Observações do Vendedor</Label>
                <Textarea
                  value={observacoesVendedor}
                  onChange={(e) => setObservacoesVendedor(e.target.value)}
                  placeholder="Informações adicionais para a validação do Comercial e análise de crédito..."
                  rows={2}
                  className="text-xs"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => setFormOpen(false)}
              disabled={saving}
              className="w-full sm:w-auto"
            >
              Fechar
            </Button>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleSaveForm('rascunho')}
                disabled={saving}
                className="w-full sm:w-auto border-slate-300"
              >
                <Save className="w-4 h-4 mr-1.5" /> Salvar Rascunho
              </Button>
              <Button
                type="button"
                onClick={() => handleSaveForm('aguardando_validacao')}
                disabled={saving}
                className="w-full sm:w-auto bg-[#005B2E] hover:bg-[#004724] text-white font-bold"
              >
                <Send className="w-4 h-4 mr-1.5" /> Enviar para Validação
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL DE VISUALIZAÇÃO COMPLETA */}
      <Dialog open={!!viewRecord} onOpenChange={() => setViewRecord(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-foreground">
              Solicitação #{viewRecord?.numero} — Detalhes
            </DialogTitle>
          </DialogHeader>
          {viewRecord && (
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between bg-muted/40 p-3 rounded-lg">
                <div>
                  <span className="text-muted-foreground block">Situação Cadastral:</span>
                  <div className="mt-1">{getStatusBadge(viewRecord.status)}</div>
                </div>
                <div className="text-right">
                  <span className="text-muted-foreground block">RCA 1 / Gerente:</span>
                  <span className="font-bold text-foreground">
                    {viewRecord.rca_nome} | {viewRecord.gerente_nome}
                  </span>
                </div>
              </div>

              {viewRecord.status === 'em_correcao' && viewRecord.pendencias_correcao && (
                <div className="bg-red-50 border border-red-300 p-3 rounded text-red-900 font-bold">
                  Pendência apontada pelo Comercial: {viewRecord.pendencias_correcao}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="font-bold text-muted-foreground">Razão Social:</span>
                  <p className="font-bold text-foreground text-sm">{viewRecord.razao_social}</p>
                </div>
                <div>
                  <span className="font-bold text-muted-foreground">Nome Fantasia:</span>
                  <p className="text-foreground">{viewRecord.nome_fantasia || '-'}</p>
                </div>
                <div>
                  <span className="font-bold text-muted-foreground">CPF / CNPJ:</span>
                  <p className="font-mono">{viewRecord.cpf_cnpj}</p>
                </div>
                <div>
                  <span className="font-bold text-muted-foreground">IE / RG:</span>
                  <p>{viewRecord.inscricao_estadual || '-'}</p>
                </div>
                <div>
                  <span className="font-bold text-muted-foreground">Endereço:</span>
                  <p>
                    {viewRecord.logradouro}, {viewRecord.numero_end} - {viewRecord.bairro},{' '}
                    {viewRecord.municipio}/{viewRecord.uf}
                  </p>
                </div>
                <div>
                  <span className="font-bold text-muted-foreground">Contatos:</span>
                  <p>
                    {viewRecord.telefone} | {viewRecord.whatsapp} | {viewRecord.email}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* MODAL DE HISTÓRICO IMUTÁVEL DE EVENTOS */}
      <Dialog open={!!historyRecord} onOpenChange={() => setHistoryRecord(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-black text-foreground flex items-center gap-2">
              <History className="w-5 h-5 text-[#C9A227]" />
              Histórico Completo — Solicitação #{historyRecord?.numero}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            {!historyRecord?.historico || historyRecord.historico.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                Nenhum evento registrado até o momento.
              </p>
            ) : (
              historyRecord.historico.map((h, i) => (
                <div key={i} className="border-l-2 border-[#005B2E] pl-3 py-1 space-y-0.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground">{h.acao}</span>
                    <span className="text-[11px] text-muted-foreground">
                      {new Date(h.data_hora).toLocaleString('pt-BR')}
                    </span>
                  </div>
                  <p className="text-muted-foreground">
                    Usuário: <span className="font-semibold">{h.usuario_nome}</span>
                  </p>
                  {h.motivo && <p className="text-amber-800">Motivo: {h.motivo}</p>}
                  {h.detalhes && <p className="text-slate-600">{h.detalhes}</p>}
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* MODAL DE CANCELAMENTO COM JUSTIFICATIVA */}
      <Dialog open={!!cancelRecord} onOpenChange={() => setCancelRecord(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-red-700 flex items-center gap-2">
              <XCircle className="w-5 h-5" /> Cancelar Solicitação #{cancelRecord?.numero}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2 text-xs">
            <p className="text-muted-foreground">
              Por regra de auditoria do Jetro, o cancelamento exige justificativa formal e ficará
              registrado no histórico da empresa.
            </p>
            <div className="space-y-1">
              <Label className="text-xs font-bold">Justificativa do Cancelamento *</Label>
              <Textarea
                value={motivoCancelamento}
                onChange={(e) => setMotivoCancelamento(e.target.value)}
                placeholder="Informe o motivo do cancelamento..."
                rows={3}
                className="text-xs"
              />
            </div>
          </div>
          <DialogFooter className="flex items-center justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setCancelRecord(null)}>
              Voltar
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleConfirmCancel}
              className="font-bold"
            >
              Confirmar Cancelamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
