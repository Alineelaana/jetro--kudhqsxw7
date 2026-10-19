import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/hooks/use-auth'
import { toast } from '@/hooks/use-toast'
import pb from '@/lib/pocketbase/client'
import { JetroTable, type JetroColumnDef } from '@/components/jetro-table'
import { aplicarDecisaoFinanceira } from '@/services/client-workflow'
import type { AprovacaoCreditoRecord, SituacaoCredito } from '@/lib/client-workflow-types'
import {
  ShieldCheck,
  DollarSign,
  AlertTriangle,
  Lock,
  Unlock,
  CheckCircle2,
  XCircle,
  FileText,
  Clock,
  History,
  Search,
  Eye,
  Check,
  RotateCcw,
  Plus,
} from 'lucide-react'

export function FinancialApprovalsEvolved() {
  const { user } = useAuth()
  const [approvals, setApprovals] = useState<AprovacaoCreditoRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'credito' | 'todas'>('credito')
  const [statusFilter, setStatusFilter] = useState('todos')

  // Painel de Análise e Decisão de Crédito
  const [selectedApproval, setSelectedApproval] = useState<AprovacaoCreditoRecord | null>(null)
  const [analiseOpen, setAnaliseOpen] = useState(false)
  const [savingDecisao, setSavingDecisao] = useState(false)

  // Campos de Decisão
  const [decisao, setDecisao] = useState<SituacaoCredito>('Aprovado')
  const [limiteAprovado, setLimiteAprovado] = useState('')
  const [condicoesAutorizadas, setCondicoesAutorizadas] = useState('28 dias boleto')
  const [validadeRevisao, setValidadeRevisao] = useState(
    new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  )
  const [motivoDecisao, setMotivoDecisao] = useState('')
  const [bloquearPrazo, setBloquearPrazo] = useState(false)
  const [motivoBloqueio, setMotivoBloqueio] = useState('')

  // Modal de Histórico de Auditoria
  const [historyOpen, setHistoryOpen] = useState(false)
  const [historyItems, setHistoryItems] = useState<any[]>([])

  // Modal Nova Solicitação Genérica (para manter 100% de compatibilidade financeira)
  const [genericModalOpen, setGenericModalOpen] = useState(false)
  const [genTipo, setGenTipo] = useState('Pagamento Antecipado')
  const [genSolicitante, setGenSolicitante] = useState('')
  const [genValor, setGenValor] = useState('')
  const [genMotivo, setGenMotivo] = useState('')

  const loadApprovals = async () => {
    setLoading(true)
    try {
      const records = await pb.collection('financial_approvals').getFullList({
        sort: '-created',
      })
      setApprovals(records as unknown as AprovacaoCreditoRecord[])
    } catch {
      toast({ title: 'Erro ao carregar aprovações financeiras', variant: 'destructive' })
    }
    setLoading(false)
  }

  useEffect(() => {
    loadApprovals()
  }, [])

  // Indicadores Reais
  const kpis = useMemo(() => {
    const pendentes = approvals.filter(
      (a) => a.status === 'Pendente de análise' || a.status === 'Pendente',
    ).length
    const emAnalise = approvals.filter((a) => a.status === 'Em análise').length
    const aprovados = approvals.filter((a) => a.status === 'Aprovado').length
    const comRestricoes = approvals.filter((a) => a.status === 'Aprovado com restrições').length
    const reprovados = approvals.filter(
      (a) => a.status === 'Reprovado' || a.status === 'Rejeitado',
    ).length
    const bloqueados = approvals.filter((a) => a.status === 'Bloqueado' || a.bloquear_prazo).length

    return { pendentes, emAnalise, aprovados, comRestricoes, reprovados, bloqueados }
  }, [approvals])

  // Assumir Análise
  const handleAssumirAnalise = async (appr: AprovacaoCreditoRecord) => {
    try {
      const hist = appr.historico_analise || []
      hist.push({
        data_hora: new Date().toISOString(),
        usuario_id: user?.id || '',
        usuario_nome: (user?.name as string) || (user?.email as string) || 'Analista Financeiro',
        acao: 'Análise de crédito assumida pelo analista',
        status: 'Em análise',
      })

      await pb.collection('financial_approvals').update(appr.id, {
        status: 'Em análise',
        aprovador: (user?.name as string) || (user?.email as string) || 'Analista',
        historico_analise: hist,
      })

      toast({ title: 'Análise assumida com sucesso' })
      loadApprovals()
    } catch (err: any) {
      toast({ title: 'Erro ao assumir análise', description: err.message, variant: 'destructive' })
    }
  }

  // Abrir Painel de Decisão de Crédito
  const handleAbrirAnalise = (appr: AprovacaoCreditoRecord) => {
    setSelectedApproval(appr)
    setDecisao((appr.status as SituacaoCredito) || 'Aprovado')
    setLimiteAprovado(appr.limite_aprovado || appr.limite_solicitado || '0.00')
    setCondicoesAutorizadas(appr.condicoes_autorizadas || '28 dias boleto')
    setValidadeRevisao(
      appr.validade_revisao ||
        new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    )
    setMotivoDecisao(appr.motivo_decisao || '')
    setBloquearPrazo(appr.bloquear_prazo || false)
    setMotivoBloqueio(appr.motivo_bloqueio || '')
    setAnaliseOpen(true)
  }

  // Aplicar Decisão
  const handleConfirmarDecisao = async () => {
    if (!selectedApproval) return
    if (!motivoDecisao.trim()) {
      toast({ title: 'Parecer / Motivo da decisão é obrigatório', variant: 'destructive' })
      return
    }

    setSavingDecisao(true)
    try {
      await aplicarDecisaoFinanceira({
        aprovacaoId: selectedApproval.id,
        clientId: selectedApproval.client_id || '',
        decisao,
        limiteAprovado,
        condicoesAutorizadas,
        validadeRevisao,
        motivoDecisao,
        bloquearPrazo: decisao === 'Bloqueado' ? true : bloquearPrazo,
        motivoBloqueio: decisao === 'Bloqueado' ? motivoDecisao : motivoBloqueio,
        analista: {
          id: user?.id || '',
          nome: (user?.name as string) || (user?.email as string) || 'Financeiro',
        },
      })

      toast({
        title: 'Decisão Financeira de Crédito Aplicada!',
        description: `Situação do cliente atualizada para ${decisao}. Limite: R$ ${limiteAprovado}.`,
      })

      setAnaliseOpen(false)
      loadApprovals()
    } catch (err: any) {
      toast({
        title: 'Erro ao aplicar decisão financeira',
        description: err.message,
        variant: 'destructive',
      })
    }
    setSavingDecisao(false)
  }

  // Criar aprovação genérica (preserva recursos já existentes da tela)
  const handleCriarGenerica = async () => {
    if (!genTipo || !genMotivo) {
      toast({ title: 'Preencha os campos obrigatórios', variant: 'destructive' })
      return
    }
    try {
      await pb.collection('financial_approvals').create({
        tipo_solicitacao: genTipo,
        categoria: 'Geral',
        solicitante: genSolicitante || user?.name || user?.email,
        data_hora: new Date().toISOString().split('T')[0],
        valor: genValor || '0.00',
        motivo: genMotivo,
        status: 'Pendente',
      })
      toast({ title: 'Solicitação financeira criada com sucesso' })
      setGenericModalOpen(false)
      setGenTipo('Pagamento Antecipado')
      setGenSolicitante('')
      setGenValor('')
      setGenMotivo('')
      loadApprovals()
    } catch (err: any) {
      toast({
        title: 'Erro ao criar solicitação',
        description: err.message,
        variant: 'destructive',
      })
    }
  }

  // Filtros
  const filteredApprovals = useMemo(() => {
    return approvals.filter((a) => {
      const isCredit =
        a.categoria === 'Crédito de Clientes' || a.tipo_solicitacao === 'Crédito de Clientes'
      if (activeTab === 'credito' && !isCredit) return false

      if (statusFilter === 'pendentes')
        return a.status === 'Pendente de análise' || a.status === 'Pendente'
      if (statusFilter === 'analise') return a.status === 'Em análise'
      if (statusFilter === 'aprovados') return a.status === 'Aprovado'
      if (statusFilter === 'bloqueados') return a.status === 'Bloqueado' || a.bloquear_prazo
      if (statusFilter === 'reprovados') return a.status === 'Reprovado' || a.status === 'Rejeitado'
      return true
    })
  }, [approvals, activeTab, statusFilter])

  // Colunas JetroTable
  const columns: JetroColumnDef<AprovacaoCreditoRecord>[] = [
    {
      id: 'id',
      title: 'Nº Protocolo',
      accessorKey: 'id',
      sortable: true,
      minWidth: 130,
      cell: ({ row }) => (
        <span className="font-mono font-bold text-xs text-[#005B2E]">
          {row.documento_relacionado || row.id.slice(0, 8)}
        </span>
      ),
    },
    {
      id: 'tipo',
      title: 'Tipo / Categoria',
      accessorKey: 'tipo_solicitacao',
      sortable: true,
      minWidth: 160,
      cell: ({ row }) => (
        <Badge
          className={
            row.categoria === 'Crédito de Clientes' ||
            row.tipo_solicitacao === 'Crédito de Clientes'
              ? 'bg-[#005B2E]/10 text-[#005B2E] border-[#005B2E]/30'
              : 'bg-slate-100 text-slate-700'
          }
        >
          {row.tipo_solicitacao || 'Geral'}
        </Badge>
      ),
    },
    {
      id: 'client_nome',
      title: 'Cliente / Razão Social',
      accessorKey: 'client_nome',
      sortable: true,
      minWidth: 220,
      cell: ({ row }) => (
        <div>
          <p className="font-bold text-foreground text-sm leading-tight">
            {row.client_nome || row.solicitante || '-'}
          </p>
          {row.client_codigo && (
            <p className="font-mono text-[11px] text-muted-foreground">
              Cód: {row.client_codigo} {row.cnpj_cpf ? `| Doc: ${row.cnpj_cpf}` : ''}
            </p>
          )}
        </div>
      ),
    },
    {
      id: 'rca_nome',
      title: 'RCA / Gerente',
      minWidth: 160,
      cell: ({ row }) => (
        <div>
          <p className="text-xs font-semibold">{row.rca_nome || '-'}</p>
          <p className="text-[10px] text-muted-foreground">{row.gerente_nome || '-'}</p>
        </div>
      ),
    },
    {
      id: 'limite_solicitado',
      title: 'Limite Solicitado',
      accessorKey: 'limite_solicitado',
      sortable: true,
      minWidth: 130,
      cell: ({ row }) => (
        <span className="font-mono text-xs font-semibold">
          R$ {Number(row.limite_solicitado || row.valor || 0).toLocaleString('pt-BR')}
        </span>
      ),
    },
    {
      id: 'limite_aprovado',
      title: 'Limite Aprovado',
      accessorKey: 'limite_aprovado',
      sortable: true,
      minWidth: 130,
      cell: ({ row }) => (
        <span className="font-mono text-xs font-bold text-[#005B2E]">
          R$ {Number(row.limite_aprovado || 0).toLocaleString('pt-BR')}
        </span>
      ),
    },
    {
      id: 'status',
      title: 'Situação',
      accessorKey: 'status',
      sortable: true,
      minWidth: 160,
      cell: ({ row }) => {
        const st = row.status
        if (st === 'Aprovado')
          return (
            <Badge className="bg-emerald-500/20 text-emerald-800 border-emerald-300">
              Aprovado
            </Badge>
          )
        if (st === 'Aprovado com restrições')
          return (
            <Badge className="bg-blue-500/20 text-blue-800 border-blue-300">
              Aprovado c/ Restrições
            </Badge>
          )
        if (st === 'Bloqueado' || row.bloquear_prazo)
          return (
            <Badge className="bg-rose-500/20 text-rose-800 border-rose-300 flex items-center gap-1">
              <Lock className="w-3 h-3" /> Bloqueado a Prazo
            </Badge>
          )
        if (st === 'Reprovado' || st === 'Rejeitado')
          return <Badge className="bg-red-500/20 text-red-800 border-red-300">Reprovado</Badge>
        if (st === 'Em análise')
          return (
            <Badge className="bg-purple-500/20 text-purple-800 border-purple-300">Em Análise</Badge>
          )
        return (
          <Badge className="bg-amber-500/20 text-amber-800 border-amber-300">
            Pendente de Análise
          </Badge>
        )
      },
    },
    {
      id: 'acoes',
      title: 'Ações',
      minWidth: 180,
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          {row.status === 'Pendente de análise' && (
            <Button
              size="sm"
              variant="outline"
              title="Assumir Análise"
              onClick={() => handleAssumirAnalise(row)}
              className="h-7 text-xs border-[#005B2E] text-[#005B2E] hover:bg-emerald-50"
            >
              Assumir
            </Button>
          )}

          <Button
            size="sm"
            title="Painel de Decisão Financeira"
            onClick={() => handleAbrirAnalise(row)}
            className="h-7 text-xs bg-[#005B2E] hover:bg-[#004724] text-white font-bold"
          >
            <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Parecer
          </Button>

          <Button
            size="sm"
            variant="ghost"
            title="Histórico de Análise"
            onClick={() => {
              setHistoryItems(row.historico_analise || [])
              setHistoryOpen(true)
            }}
            className="h-7 w-7 p-0 text-[#C9A227]"
          >
            <History className="w-3.5 h-3.5" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* CABEÇALHO */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-[#005B2E]" />
            Aprovações Financeiras & Análise de Crédito de Clientes
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Governança financeira centralizada: limites, prazos autorizados, bloqueios e alçadas de
            crédito no Jetro ERP.
          </p>
        </div>
        <Button
          onClick={() => setGenericModalOpen(true)}
          variant="outline"
          className="text-xs font-bold border-slate-300"
        >
          <Plus className="w-4 h-4 mr-1.5" /> Outra Aprovação Financeira
        </Button>
      </div>

      {/* INDICADORES REAIS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        <Card
          onClick={() => setStatusFilter('pendentes')}
          className={`cursor-pointer transition-all border ${
            statusFilter === 'pendentes'
              ? 'ring-2 ring-amber-500 bg-amber-50/50'
              : 'hover:border-amber-400'
          }`}
        >
          <CardContent className="p-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Pendentes</span>
              <Clock className="w-3.5 h-3.5 text-amber-600" />
            </div>
            <p className="text-xl font-black text-amber-700 mt-1">{kpis.pendentes}</p>
            <span className="text-[10px] text-muted-foreground">Aguardando decisão</span>
          </CardContent>
        </Card>

        <Card
          onClick={() => setStatusFilter('analise')}
          className={`cursor-pointer transition-all border ${
            statusFilter === 'analise'
              ? 'ring-2 ring-purple-500 bg-purple-50/50'
              : 'hover:border-purple-400'
          }`}
        >
          <CardContent className="p-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Em Análise</span>
              <FileText className="w-3.5 h-3.5 text-purple-600" />
            </div>
            <p className="text-xl font-black text-purple-700 mt-1">{kpis.emAnalise}</p>
            <span className="text-[10px] text-muted-foreground">Com analista</span>
          </CardContent>
        </Card>

        <Card
          onClick={() => setStatusFilter('aprovados')}
          className={`cursor-pointer transition-all border ${
            statusFilter === 'aprovados'
              ? 'ring-2 ring-emerald-500 bg-emerald-50/50'
              : 'hover:border-emerald-400'
          }`}
        >
          <CardContent className="p-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Aprovados</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <p className="text-xl font-black text-emerald-700 mt-1">{kpis.aprovados}</p>
            <span className="text-[10px] text-muted-foreground">Limite liberado</span>
          </CardContent>
        </Card>

        <Card
          onClick={() => setStatusFilter('todos')}
          className={`cursor-pointer transition-all border ${
            statusFilter === 'todos'
              ? 'ring-2 ring-blue-500 bg-blue-50/50'
              : 'hover:border-blue-400'
          }`}
        >
          <CardContent className="p-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Com Restrições</span>
              <AlertTriangle className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <p className="text-xl font-black text-blue-700 mt-1">{kpis.comRestricoes}</p>
            <span className="text-[10px] text-muted-foreground">Condições especiais</span>
          </CardContent>
        </Card>

        <Card
          onClick={() => setStatusFilter('bloqueados')}
          className={`cursor-pointer transition-all border ${
            statusFilter === 'bloqueados'
              ? 'ring-2 ring-rose-500 bg-rose-50/50'
              : 'hover:border-rose-400'
          }`}
        >
          <CardContent className="p-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Bloqueados</span>
              <Lock className="w-3.5 h-3.5 text-rose-600" />
            </div>
            <p className="text-xl font-black text-rose-700 mt-1">{kpis.bloqueados}</p>
            <span className="text-[10px] text-muted-foreground">Venda a prazo vedada</span>
          </CardContent>
        </Card>

        <Card
          onClick={() => setStatusFilter('reprovados')}
          className={`cursor-pointer transition-all border ${
            statusFilter === 'reprovados'
              ? 'ring-2 ring-red-500 bg-red-50/50'
              : 'hover:border-red-400'
          }`}
        >
          <CardContent className="p-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Reprovados</span>
              <XCircle className="w-3.5 h-3.5 text-red-600" />
            </div>
            <p className="text-xl font-black text-red-700 mt-1">{kpis.reprovados}</p>
            <span className="text-[10px] text-muted-foreground">Crédito indeferido</span>
          </CardContent>
        </Card>
      </div>

      {/* NAVEGAÇÃO DE CATEGORIAS DENTRO DA TELA */}
      <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-2">
          <TabsList className="bg-muted/60 p-1">
            <TabsTrigger value="credito" className="text-xs font-bold gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-[#005B2E]" />
              Crédito de Clientes (Encaminhados pelo Comercial)
            </TabsTrigger>
            <TabsTrigger value="todas" className="text-xs font-bold gap-1.5">
              <FileText className="w-3.5 h-3.5 text-[#005B2E]" />
              Todas as Solicitações Financeiras ({approvals.length})
            </TabsTrigger>
          </TabsList>

          {statusFilter !== 'todos' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStatusFilter('todos')}
              className="text-xs text-muted-foreground"
            >
              Limpar filtro de status
            </Button>
          )}
        </div>

        <TabsContent value="credito" className="space-y-4">
          <JetroTable
            columns={columns}
            data={filteredApprovals}
            loading={loading}
            pageSize={10}
            preferenceKey="financeiro_aprovacoes_credito_grid"
            exportTitle="Aprovacoes_Credito_Clientes_Jetro"
          />
        </TabsContent>

        <TabsContent value="todas" className="space-y-4">
          <JetroTable
            columns={columns}
            data={filteredApprovals}
            loading={loading}
            pageSize={10}
            preferenceKey="financeiro_aprovacoes_todas_grid"
            exportTitle="Aprovacoes_Financeiras_Jetro"
          />
        </TabsContent>
      </Tabs>

      {/* PAINEL DE ANÁLISE E DECISÃO DE CRÉDITO (A, B, C, D) */}
      <Dialog open={analiseOpen} onOpenChange={setAnaliseOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-foreground flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#005B2E]" />
              Parecer Financeiro & Decisão de Crédito
            </DialogTitle>
          </DialogHeader>

          {selectedApproval && (
            <div className="space-y-5 pt-2 text-xs">
              {/* PAINEL A: IDENTIFICAÇÃO DO CLIENTE */}
              <div className="bg-muted/40 p-3 rounded-lg border border-border space-y-2">
                <span className="font-bold text-[#005B2E] uppercase block text-xs">
                  A. Identificação Oficial do Cliente
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <span className="text-muted-foreground block">Cliente:</span>
                    <span className="font-bold text-foreground text-sm">
                      {selectedApproval.client_nome || selectedApproval.solicitante}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Código Oficial:</span>
                    <span className="font-mono font-bold text-[#005B2E]">
                      {selectedApproval.client_codigo ||
                        selectedApproval.documento_relacionado ||
                        '-'}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">CPF / CNPJ:</span>
                    <span className="font-mono">{selectedApproval.cnpj_cpf || '-'}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-border/50">
                  <div>
                    <span className="text-muted-foreground">RCA Principal: </span>
                    <span className="font-semibold">{selectedApproval.rca_nome || '-'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Gerente Comercial: </span>
                    <span className="font-semibold">{selectedApproval.gerente_nome || '-'}</span>
                  </div>
                </div>
              </div>

              {/* PAINEL B: INFORMAÇÕES PARA ANÁLISE */}
              <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-200 space-y-2">
                <span className="font-bold text-blue-900 uppercase block text-xs">
                  B. Dados Cadastrais & Limite Solicitado pelo Comercial
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-muted-foreground block">Limite Pretendido:</span>
                    <span className="font-mono font-bold text-base text-blue-900">
                      R${' '}
                      {Number(
                        selectedApproval.limite_solicitado || selectedApproval.valor || 0,
                      ).toLocaleString('pt-BR')}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Condição Solicitada:</span>
                    <span className="font-semibold text-foreground">
                      {selectedApproval.condicoes_autorizadas || '28 dias boleto'}
                    </span>
                  </div>
                </div>
                {selectedApproval.motivo && (
                  <div className="text-[11px] text-blue-800 bg-white p-2 rounded border border-blue-100">
                    <span className="font-bold">Contexto Comercial: </span>
                    {selectedApproval.motivo}
                  </div>
                )}
              </div>

              {/* PAINEL C: DECISÃO DE CRÉDITO */}
              <div className="space-y-3">
                <span className="font-bold text-[#005B2E] uppercase block text-xs">
                  C. Decisão do Financeiro (Persistência & Atualização Automática do Cliente)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-bold">Situação do Crédito *</Label>
                    <Select
                      value={decisao}
                      onValueChange={(v: SituacaoCredito) => {
                        setDecisao(v)
                        if (v === 'Bloqueado') setBloquearPrazo(true)
                      }}
                    >
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Aprovado">Aprovado</SelectItem>
                        <SelectItem value="Aprovado com restrições">
                          Aprovado com Restrições
                        </SelectItem>
                        <SelectItem value="Reprovado">Reprovado</SelectItem>
                        <SelectItem value="Bloqueado">Bloqueado</SelectItem>
                        <SelectItem value="Em revisão">Em Revisão</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-bold">Limite Aprovado (R$) *</Label>
                    <Input
                      value={limiteAprovado}
                      onChange={(e) => setLimiteAprovado(e.target.value)}
                      placeholder="0.00"
                      className="h-9 text-xs font-mono font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-bold">Próxima Revisão</Label>
                    <Input
                      type="date"
                      value={validadeRevisao}
                      onChange={(e) => setValidadeRevisao(e.target.value)}
                      className="h-9 text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-bold">Condições / Prazos Autorizados</Label>
                  <Input
                    value={condicoesAutorizadas}
                    onChange={(e) => setCondicoesAutorizadas(e.target.value)}
                    placeholder="Ex: 21/28 dias boleto, limite quinzenal..."
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-bold">
                    Motivo / Parecer Técnico do Financeiro *
                  </Label>
                  <Textarea
                    value={motivoDecisao}
                    onChange={(e) => setMotivoDecisao(e.target.value)}
                    placeholder="Parecer formal da análise de crédito, referências checadas, restrições..."
                    rows={2}
                    className="text-xs"
                  />
                </div>
              </div>

              {/* PAINEL D: BLOQUEIOS OPERACIONAIS DE VENDAS A PRAZO */}
              <div className="bg-rose-50/60 p-3 rounded-lg border border-rose-200 space-y-2">
                <span className="font-bold text-rose-900 uppercase block text-xs flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-rose-700" />
                  D. Bloqueio Operacional de Vendas a Prazo
                </span>
                <p className="text-[11px] text-rose-800">
                  O bloqueio tem efeito real na validação de pedidos a prazo no Jetro ERP, sem
                  travar vendas à vista permitidas.
                </p>

                <div className="flex items-center gap-2 pt-1">
                  <Switch checked={bloquearPrazo} onCheckedChange={setBloquearPrazo} />
                  <span className="font-bold text-rose-950 text-xs">
                    Bloquear Vendas a Prazo para este cliente
                  </span>
                </div>

                {bloquearPrazo && (
                  <div className="space-y-1 pt-1">
                    <Label className="text-xs font-bold text-rose-950">Motivo do Bloqueio *</Label>
                    <Input
                      value={motivoBloqueio}
                      onChange={(e) => setMotivoBloqueio(e.target.value)}
                      placeholder="Ex: Restrição cadastral, falta de referências, limite não aprovado..."
                      className="h-9 text-xs border-rose-300"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter className="flex items-center justify-between gap-2 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => setAnaliseOpen(false)}
              disabled={savingDecisao}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleConfirmarDecisao}
              disabled={savingDecisao}
              className="bg-[#005B2E] hover:bg-[#004724] text-white font-bold"
            >
              <CheckCircle2 className="w-4 h-4 mr-1.5" /> Aplicar e Persistir Parecer Financeiro
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL DE HISTÓRICO DE AUDITORIA */}
      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-black text-foreground flex items-center gap-2">
              <History className="w-5 h-5 text-[#C9A227]" />
              Histórico da Análise Financeira
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            {historyItems.length === 0 ? (
              <p className="text-xs text-muted-foreground">Nenhum evento registrado.</p>
            ) : (
              historyItems.map((ev, i) => (
                <div key={i} className="border-l-2 border-[#005B2E] pl-3 py-1 space-y-0.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground">{ev.acao}</span>
                    <span className="text-[11px] text-muted-foreground">
                      {ev.data_hora ? new Date(ev.data_hora).toLocaleString('pt-BR') : '-'}
                    </span>
                  </div>
                  <p className="text-muted-foreground">
                    Analista: <span className="font-semibold">{ev.usuario_nome || 'Sistema'}</span>
                  </p>
                  {ev.detalhes && <p className="text-slate-700">{ev.detalhes}</p>}
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* MODAL PARA OUTRA APROVAÇÃO FINANCEIRA GENÉRICA */}
      <Dialog open={genericModalOpen} onOpenChange={setGenericModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-foreground">
              Nova Solicitação Financeira
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2 text-xs">
            <div className="space-y-1">
              <Label className="text-xs font-bold">Tipo de Solicitação *</Label>
              <Input
                value={genTipo}
                onChange={(e) => setGenTipo(e.target.value)}
                placeholder="Ex: Pagamento Antecipado, Reembolso..."
                className="h-9 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-bold">Solicitante</Label>
              <Input
                value={genSolicitante}
                onChange={(e) => setGenSolicitante(e.target.value)}
                placeholder={user?.name || 'Seu nome'}
                className="h-9 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-bold">Valor (R$)</Label>
              <Input
                value={genValor}
                onChange={(e) => setGenValor(e.target.value)}
                placeholder="0.00"
                className="h-9 text-xs font-mono"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-bold">Motivo / Justificativa *</Label>
              <Textarea
                value={genMotivo}
                onChange={(e) => setGenMotivo(e.target.value)}
                rows={2}
                className="text-xs"
              />
            </div>
          </div>
          <DialogFooter className="flex items-center justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setGenericModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              size="sm"
              onClick={handleCriarGenerica}
              className="bg-[#005B2E] hover:bg-[#004724] text-white font-bold"
            >
              Criar Solicitação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
