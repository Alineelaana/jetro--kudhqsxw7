import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Megaphone,
  Briefcase,
  FolderOpen,
  Store,
  Handshake,
  FileSpreadsheet,
  FileCheck2,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Building2,
  PlusCircle,
  TrendingUp,
  DollarSign,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useBrand } from '@/hooks/use-brand'
import { useRealtime } from '@/hooks/use-realtime'
import { toast } from '@/hooks/use-toast'
import pb from '@/lib/pocketbase/client'
import { JetroTable, type JetroColumnDef } from '@/components/jetro-table'
import { MarketingCockpit } from '@/components/marketing/marketing-cockpit'
import { TmDashboard } from '@/components/trade-marketing/tm-dashboard'
import { SaCockpit } from '@/components/supplier-allowance/sa-cockpit'
import type { TradeMarketingAction } from '@/lib/trade-marketing-types'

interface RecentJobRow {
  id: string
  code: string
  title: string
  requester: string
  priority: string
  status: string
  deadline: string
}

export function ScreenCentralMarketing() {
  const navigate = useNavigate()
  const { brand, empresasDisponiveis, empresaAtivaId } = useBrand()
  const [currentTab, setCurrentTab] = useState<'geral' | 'marketing' | 'trade' | 'verbas'>('geral')
  const [refreshing, setRefreshing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [recentJobs, setRecentJobs] = useState<RecentJobRow[]>([])
  const [tradeActions, setTradeActions] = useState<TradeMarketingAction[]>([])

  const [stats, setStats] = useState({
    jobsEmAberto: 0,
    solicitacoesPendentes: 0,
    acoesTradeAtivas: 0,
    acordosVerbaAtivos: 0,
    cotacoesAbertas: 0,
    saldoVerbasTotal: 0,
  })

  const empresaAtualNome = useMemo(() => {
    const emp = empresasDisponiveis?.find((e: any) => e.id === empresaAtivaId)
    return (
      emp?.nome_fantasia ||
      emp?.razao_social ||
      brand?.nomeExibicao ||
      brand?.empresaNome ||
      'Todas as Empresas'
    )
  }, [empresasDisponiveis, empresaAtivaId, brand])

  const loadData = async () => {
    try {
      const filterEmpresa = empresaAtivaId ? `empresa_id="${empresaAtivaId}"` : ''

      const [jobsRes, requestsRes, actionsRes, agreementsRes, accountsRes, quotationsRes] =
        await Promise.all([
          pb
            .collection('mk_jobs')
            .getList(1, 50, {
              sort: '-created',
              filter: filterEmpresa || undefined,
            })
            .catch(() => ({ items: [], totalItems: 0 })),
          pb
            .collection('mk_requests')
            .getList(1, 50, {
              filter: filterEmpresa
                ? `${filterEmpresa} && status != "concluido" && status != "cancelado"`
                : 'status != "concluido" && status != "cancelado"',
            })
            .catch(() => ({ items: [], totalItems: 0 })),
          pb
            .collection('trade_marketing_actions')
            .getList(1, 50, {
              sort: '-created',
              filter: filterEmpresa || undefined,
            })
            .catch(() => ({ items: [], totalItems: 0 })),
          pb
            .collection('sa_agreements')
            .getList(1, 50, {
              filter: filterEmpresa ? `${filterEmpresa} && status = "ativo"` : 'status = "ativo"',
            })
            .catch(() => ({ items: [], totalItems: 0 })),
          pb
            .collection('sa_current_accounts')
            .getList(1, 100, {
              filter: filterEmpresa || undefined,
            })
            .catch(() => ({ items: [], totalItems: 0 })),
          pb
            .collection('mk_external_quotations')
            .getList(1, 50, {
              filter: filterEmpresa
                ? `${filterEmpresa} && status != "encerrada" && status != "cancelada"`
                : 'status != "encerrada" && status != "cancelada"',
            })
            .catch(() => ({ items: [], totalItems: 0 })),
        ])

      const jobs = jobsRes.items || []
      const actions = (actionsRes.items || []) as unknown as TradeMarketingAction[]
      setTradeActions(actions)

      // KPIs
      const openJobs = jobs.filter(
        (j: any) => !['encerrado', 'cancelado'].includes(j.status),
      ).length
      const openRequests = requestsRes.totalItems || requestsRes.items.length || 0
      const activeActions = actions.filter((a) =>
        ['aprovado', 'execucao', 'planejamento'].includes(a.status),
      ).length
      const activeAgreements = agreementsRes.totalItems || agreementsRes.items.length || 0
      const openQuotations = quotationsRes.totalItems || quotationsRes.items.length || 0

      const totalBalance = (accountsRes.items || []).reduce(
        (acc: number, curr: any) => acc + (Number(curr.balance || curr.saldo_atual || 0) || 0),
        0,
      )

      setStats({
        jobsEmAberto: openJobs,
        solicitacoesPendentes: openRequests,
        acoesTradeAtivas: activeActions,
        acordosVerbaAtivos: activeAgreements,
        cotacoesAbertas: openQuotations,
        saldoVerbasTotal: totalBalance,
      })

      // Linhas da tabela
      const formattedJobs: RecentJobRow[] = jobs.slice(0, 10).map((j: any) => ({
        id: j.id,
        code: j.job_number || j.codigo || j.id.slice(0, 8),
        title: j.title || 'Sem título',
        requester: j.created_by_name || j.solicitante || 'Marketing',
        priority: j.priority || 'media',
        status: j.status || 'briefing',
        deadline: j.deadline ? new Date(j.deadline).toLocaleDateString('pt-BR') : '—',
      }))
      setRecentJobs(formattedJobs)
    } catch {
      // safe fallback
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [empresaAtivaId])

  useRealtime('mk_jobs', () => loadData())
  useRealtime('mk_requests', () => loadData())
  useRealtime('trade_marketing_actions', () => loadData())
  useRealtime('sa_agreements', () => loadData())
  useRealtime('sa_current_accounts', () => loadData())
  useRealtime('mk_external_quotations', () => loadData())

  const handleRefresh = () => {
    setRefreshing(true)
    loadData()
    toast({ title: 'Central de Marketing e Verbas atualizada' })
  }

  const fmtCurrency = (v: number) =>
    v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  const columns: JetroColumnDef<RecentJobRow>[] = [
    {
      id: 'code',
      header: 'Job',
      accessorKey: 'code',
      cell: ({ value }) => <span className="font-bold text-[#005B2E]">#{String(value)}</span>,
    },
    {
      id: 'title',
      header: 'Título da Demanda',
      accessorKey: 'title',
      cell: ({ value }) => <span className="font-medium text-foreground">{String(value)}</span>,
    },
    {
      id: 'requester',
      header: 'Solicitante',
      accessorKey: 'requester',
      cell: ({ value }) => <span className="text-xs text-muted-foreground">{String(value)}</span>,
    },
    {
      id: 'priority',
      header: 'Prioridade',
      accessorKey: 'priority',
      dataType: 'badge',
      cell: ({ value }) => {
        const p = String(value || 'media').toLowerCase()
        const isHigh = ['alta', 'urgente'].includes(p)
        return (
          <Badge
            variant="outline"
            className={
              isHigh
                ? 'bg-rose-50 text-rose-700 border-rose-200'
                : 'bg-slate-50 text-slate-700 border-slate-200'
            }
          >
            {p}
          </Badge>
        )
      },
    },
    {
      id: 'status',
      header: 'Status',
      accessorKey: 'status',
      dataType: 'badge',
      cell: ({ value }) => {
        const s = String(value || '')
        const isDone = ['concluido', 'encerrado', 'aprovado'].includes(s)
        const isProgress = ['em_andamento', 'criacao', 'revisao_marketing'].includes(s)
        return (
          <Badge
            variant="outline"
            className={
              isDone
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : isProgress
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-slate-50 text-slate-700 border-slate-200'
            }
          >
            {s}
          </Badge>
        )
      },
    },
    {
      id: 'deadline',
      header: 'Prazo',
      accessorKey: 'deadline',
      cell: ({ value }) => <span className="text-xs text-muted-foreground">{String(value)}</span>,
    },
  ]

  return (
    <div className="space-y-4">
      {/* CABEÇALHO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#005B2E] text-white shadow-sm">
            <Megaphone className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-black text-foreground tracking-tight">
                Central de Marketing e Verbas
              </h1>
              <Badge
                variant="outline"
                className="text-xs bg-[#005B2E]/10 text-[#005B2E] font-bold border-[#005B2E]/30"
              >
                Torre de Controle Unificada
              </Badge>
              {empresaAtivaId && (
                <Badge variant="secondary" className="text-xs flex items-center gap-1 font-medium">
                  <Building2 className="w-3 h-3 text-[#005B2E]" />
                  {empresaAtualNome}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Monitoramento integrado de campanhas corporativas, jobs criativos, ações de trade
              marketing no PDV e governança financeira de verbas de fornecedores.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
            className="text-xs focus-visible:ring-[#005B2E]"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${refreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button
            size="sm"
            onClick={() => navigate('/admin/marketing/solicitacoes-jobs')}
            className="text-xs bg-[#005B2E] hover:bg-[#004724] text-white font-bold"
          >
            <PlusCircle className="w-3.5 h-3.5 mr-1.5" />
            Nova Demanda
          </Button>
        </div>
      </div>

      {/* 6 INDICADORES CLICÁVEIS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* 1. Jobs em Aberto -> Solicitações e Jobs */}
        <button
          type="button"
          onClick={() => navigate('/admin/marketing/solicitacoes-jobs')}
          className="text-left p-3 rounded-xl border-2 border-emerald-200 bg-emerald-50/40 hover:border-[#005B2E] hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-800">Jobs Ativos</span>
            <Briefcase className="w-3.5 h-3.5 text-[#005B2E]" />
          </div>
          <span className="text-2xl font-black text-[#005B2E] block mt-1">
            {stats.jobsEmAberto}
          </span>
          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
            Jobs & Criação <ChevronRight className="w-2.5 h-2.5" />
          </span>
        </button>

        {/* 2. Solicitações Pendentes -> Solicitações e Jobs */}
        <button
          type="button"
          onClick={() => navigate('/admin/marketing/solicitacoes-jobs')}
          className="text-left p-3 rounded-xl border-2 border-amber-200 bg-amber-50/40 hover:border-amber-500 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-800">Solicitações</span>
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <span className="text-2xl font-black text-amber-700 block mt-1">
            {stats.solicitacoesPendentes}
          </span>
          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
            Briefings <ChevronRight className="w-2.5 h-2.5" />
          </span>
        </button>

        {/* 3. Ações Trade Ativas -> Trade Marketing */}
        <button
          type="button"
          onClick={() => navigate('/admin/marketing/trade-marketing')}
          className="text-left p-3 rounded-xl border-2 border-blue-200 bg-blue-50/40 hover:border-blue-500 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-blue-800">Ações no PDV</span>
            <Store className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <span className="text-2xl font-black text-blue-700 block mt-1">
            {stats.acoesTradeAtivas}
          </span>
          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
            Trade & PDV <ChevronRight className="w-2.5 h-2.5" />
          </span>
        </button>

        {/* 4. Acordos de Verba -> Verbas de Fornecedor */}
        <button
          type="button"
          onClick={() => navigate('/admin/marketing/verbas-fornecedor')}
          className="text-left p-3 rounded-xl border-2 border-purple-200 bg-purple-50/40 hover:border-purple-500 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-purple-800">Acordos Vigentes</span>
            <Handshake className="w-3.5 h-3.5 text-purple-600" />
          </div>
          <span className="text-2xl font-black text-purple-700 block mt-1">
            {stats.acordosVerbaAtivos}
          </span>
          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
            Contratos <ChevronRight className="w-2.5 h-2.5" />
          </span>
        </button>

        {/* 5. Saldo Total de Verbas -> Verbas de Fornecedor */}
        <button
          type="button"
          onClick={() => navigate('/admin/marketing/verbas-fornecedor')}
          className="text-left p-3 rounded-xl border-2 border-teal-200 bg-teal-50/40 hover:border-teal-500 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-teal-800">Saldo de Verbas</span>
            <DollarSign className="w-3.5 h-3.5 text-teal-600" />
          </div>
          <span className="text-lg font-black text-teal-700 block mt-1 truncate">
            {fmtCurrency(stats.saldoVerbasTotal)}
          </span>
          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
            Conta Corrente <ChevronRight className="w-2.5 h-2.5" />
          </span>
        </button>

        {/* 6. Cotações Abertas -> Cotações Externas */}
        <button
          type="button"
          onClick={() => navigate('/admin/marketing/cotacoes-externas')}
          className="text-left p-3 rounded-xl border-2 border-rose-200 bg-rose-50/40 hover:border-rose-500 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-rose-800">Cotações Abertas</span>
            <FileSpreadsheet className="w-3.5 h-3.5 text-rose-600" />
          </div>
          <span className="text-2xl font-black text-rose-700 block mt-1">
            {stats.cotacoesAbertas}
          </span>
          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
            Cotações <ChevronRight className="w-2.5 h-2.5" />
          </span>
        </button>
      </div>

      {/* ABAS DA TORRE DE CONTROLE */}
      <Tabs value={currentTab} onValueChange={(v) => setCurrentTab(v as any)} className="space-y-4">
        <TabsList className="bg-muted/60 p-1 rounded-xl grid grid-cols-4 max-w-xl h-auto gap-1">
          <TabsTrigger value="geral" className="text-xs py-2 font-bold flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-[#005B2E]" />
            <span>Visão Consolidada</span>
          </TabsTrigger>
          <TabsTrigger
            value="marketing"
            className="text-xs py-2 font-bold flex items-center gap-1.5"
          >
            <Megaphone className="w-3.5 h-3.5 text-blue-600" />
            <span>Mkt Enterprise</span>
          </TabsTrigger>
          <TabsTrigger value="trade" className="text-xs py-2 font-bold flex items-center gap-1.5">
            <Store className="w-3.5 h-3.5 text-amber-600" />
            <span>Trade Marketing</span>
          </TabsTrigger>
          <TabsTrigger value="verbas" className="text-xs py-2 font-bold flex items-center gap-1.5">
            <Handshake className="w-3.5 h-3.5 text-purple-600" />
            <span>Verbas Ledger</span>
          </TabsTrigger>
        </TabsList>

        {/* ABA 1: VISÃO CONSOLIDADA */}
        <TabsContent value="geral" className="space-y-4">
          <Card className="border-2 border-[#005B2E]/20 shadow-sm">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    Demandas e Jobs Recentes em Execução
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Fluxo ágil de produção de materiais corporativos e campanhas sazonais
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate('/admin/marketing/solicitacoes-jobs')}
                  className="text-xs text-[#005B2E] border-[#005B2E]/40"
                >
                  Ver Todos os Jobs <ExternalLink className="w-3 h-3 ml-1" />
                </Button>
              </div>

              <JetroTable
                columns={columns}
                data={recentJobs}
                loading={loading}
                emptyMessage="Nenhum job de marketing em andamento no momento."
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA 2: MARKETING ENTERPRISE COCKPIT */}
        <TabsContent value="marketing" className="space-y-4">
          <MarketingCockpit />
        </TabsContent>

        {/* ABA 3: TRADE MARKETING DASHBOARD */}
        <TabsContent value="trade" className="space-y-4">
          <TmDashboard actions={tradeActions} />
        </TabsContent>

        {/* ABA 4: VERBAS LEDGER COCKPIT */}
        <TabsContent value="verbas" className="space-y-4">
          <SaCockpit />
        </TabsContent>
      </Tabs>
    </div>
  )
}
