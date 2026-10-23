import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  TrendingUp,
  ShoppingCart,
  Users,
  FileCheck2,
  RotateCcw,
  Percent,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Building2,
  PlusCircle,
  FileText,
  Clock,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useBrand } from '@/hooks/use-brand'
import { useRealtime } from '@/hooks/use-realtime'
import { toast } from '@/hooks/use-toast'
import pb from '@/lib/pocketbase/client'
import { JetroTable, type JetroColumnDef } from '@/components/jetro-table'
import { SalesDashboard } from '@/components/sales/sales-dashboard'

interface RecentOrderRow {
  id: string
  code: string
  customer_name: string
  total_amount: number
  status: string
  created: string
}

export function ScreenCentralComercial() {
  const navigate = useNavigate()
  const { brand, empresasDisponiveis, empresaAtivaId } = useBrand()
  const [currentTab, setCurrentTab] = useState('visao-geral')
  const [refreshing, setRefreshing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [recentOrders, setRecentOrders] = useState<RecentOrderRow[]>([])

  const [stats, setStats] = useState({
    pedidosAbertos: 0,
    faturamentoMes: 0,
    pipelineCrm: 0,
    contratosAtivos: 0,
    devolucoesAbertas: 0,
    comissoesMes: 0,
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

  const loadKpis = async () => {
    try {
      const filterEmpresa = empresaAtivaId ? `empresa_id="${empresaAtivaId}"` : ''

      const [ordersRes, oppsRes, contractsRes, returnsRes] = await Promise.all([
        pb
          .collection('sales_orders')
          .getList(1, 50, {
            sort: '-created',
            filter: filterEmpresa || undefined,
          })
          .catch(() => ({ items: [], totalItems: 0 })),
        pb
          .collection('crm_opportunities')
          .getList(1, 50, {
            filter: filterEmpresa
              ? `${filterEmpresa} && status != "Perdida"`
              : 'status != "Perdida"',
          })
          .catch(() => ({ items: [], totalItems: 0 })),
        pb
          .collection('sales_contracts')
          .getList(1, 50, {
            filter: filterEmpresa ? `${filterEmpresa} && status = "Ativo"` : 'status = "Ativo"',
          })
          .catch(() => ({ items: [], totalItems: 0 })),
        pb
          .collection('sales_returns')
          .getList(1, 50, {
            filter: filterEmpresa
              ? `${filterEmpresa} && status != "Concluída"`
              : 'status != "Concluída"',
          })
          .catch(() => ({ items: [], totalItems: 0 })),
      ])

      const orders = ordersRes.items || []
      const opps = oppsRes.items || []

      // 1. Pedidos abertos
      const abertos = orders.filter((o: any) =>
        ['Pendente', 'Em Aberto', 'Aprovado', 'Em Separação'].includes(o.status || 'Pendente'),
      ).length

      // 2. Faturamento mês
      const totalFat = orders
        .filter((o: any) => ['Faturado', 'Concluído', 'Entregue'].includes(o.status || ''))
        .reduce(
          (acc: number, curr: any) =>
            acc + (Number(curr.total_amount || curr.valor_total || 0) || 0),
          0,
        )

      // 3. Pipeline CRM
      const pipelineTotal = opps.reduce(
        (acc: number, curr: any) => acc + (Number(curr.value || curr.valor || 0) || 0),
        0,
      )

      // 4. Contratos Ativos
      const contratos = contractsRes.totalItems || contractsRes.items.length || 0

      // 5. Devoluções abertas
      const devolucoes = returnsRes.totalItems || returnsRes.items.length || 0

      // 6. Estimativa de comissões (média 3.5% sobre faturado)
      const comissoes = totalFat * 0.035

      setStats({
        pedidosAbertos: abertos,
        faturamentoMes: totalFat,
        pipelineCrm: pipelineTotal,
        contratosAtivos: contratos,
        devolucoesAbertas: devolucoes,
        comissoesMes: comissoes,
      })

      // Linhas da tabela recente
      const formattedRecent: RecentOrderRow[] = orders.slice(0, 10).map((o: any) => ({
        id: o.id,
        code: o.order_number || o.codigo || o.id.slice(0, 8),
        customer_name: o.customer_name || o.cliente_nome || 'Cliente Consumidor',
        total_amount: Number(o.total_amount || o.valor_total || 0) || 0,
        status: o.status || 'Pendente',
        created: o.created ? new Date(o.created).toLocaleDateString('pt-BR') : '-',
      }))
      setRecentOrders(formattedRecent)
    } catch {
      // safe fallback
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadKpis()
  }, [empresaAtivaId])

  useRealtime('sales_orders', () => loadKpis())
  useRealtime('crm_opportunities', () => loadKpis())
  useRealtime('sales_contracts', () => loadKpis())
  useRealtime('sales_returns', () => loadKpis())

  const handleRefresh = () => {
    setRefreshing(true)
    loadKpis()
    toast({ title: 'Dados da Central Comercial atualizados' })
  }

  const fmtCurrency = (v: number) =>
    v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  const columns: JetroColumnDef<RecentOrderRow>[] = [
    {
      id: 'code',
      header: 'Pedido',
      accessorKey: 'code',
      cell: ({ value }) => <span className="font-bold text-foreground">#{String(value)}</span>,
    },
    {
      id: 'customer_name',
      header: 'Cliente',
      accessorKey: 'customer_name',
      cell: ({ value }) => <span className="font-medium text-foreground">{String(value)}</span>,
    },
    {
      id: 'total_amount',
      header: 'Valor Total',
      accessorKey: 'total_amount',
      dataType: 'currency',
      cell: ({ value }) => (
        <span className="font-semibold text-emerald-700">{fmtCurrency(Number(value) || 0)}</span>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      accessorKey: 'status',
      dataType: 'badge',
      cell: ({ value }) => {
        const s = String(value || '')
        const isGreen = ['Faturado', 'Concluído', 'Aprovado'].includes(s)
        const isYellow = ['Pendente', 'Em Aberto', 'Em Separação'].includes(s)
        return (
          <Badge
            variant="outline"
            className={
              isGreen
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : isYellow
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
      id: 'created',
      header: 'Data',
      accessorKey: 'created',
      cell: ({ value }) => <span className="text-xs text-muted-foreground">{String(value)}</span>,
    },
  ]

  return (
    <div className="space-y-4">
      {/* CABEÇALHO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#005B2E] text-white shadow-sm">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-black text-foreground tracking-tight">
                Central Comercial
              </h1>
              <Badge
                variant="outline"
                className="text-xs bg-[#005B2E]/10 text-[#005B2E] font-bold border-[#005B2E]/30"
              >
                Torre de Controle de Vendas & CRM
              </Badge>
              {empresaAtivaId && (
                <Badge variant="secondary" className="text-xs flex items-center gap-1 font-medium">
                  <Building2 className="w-3 h-3 text-[#005B2E]" />
                  {empresaAtualNome}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Monitoramento integrado de pedidos abertos, faturamento mensal, funil de vendas,
              contratos vigentes, devoluções e apuração de comissões com isolamento multitenancy.
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
            onClick={() => navigate('/admin/comercial/pedidos-faturamento')}
            className="text-xs bg-[#005B2E] hover:bg-[#004724] text-white font-bold"
          >
            <PlusCircle className="w-3.5 h-3.5 mr-1.5" />
            Novo Pedido
          </Button>
        </div>
      </div>

      {/* 6 INDICADORES CLICÁVEIS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* 1. Pedidos Abertos -> Pedidos e Faturamento */}
        <button
          type="button"
          onClick={() => navigate('/admin/comercial/pedidos-faturamento')}
          className="text-left p-3 rounded-xl border-2 border-amber-200 bg-amber-50/40 hover:border-amber-500 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-800">Pedidos Abertos</span>
            <ShoppingCart className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <span className="text-2xl font-black text-amber-700 block mt-1">
            {stats.pedidosAbertos}
          </span>
          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
            Pedidos & Fat. <ChevronRight className="w-2.5 h-2.5" />
          </span>
        </button>

        {/* 2. Faturamento Mês -> Relatórios Comerciais */}
        <button
          type="button"
          onClick={() => navigate('/admin/comercial/relatorios')}
          className="text-left p-3 rounded-xl border-2 border-emerald-200 bg-emerald-50/40 hover:border-[#005B2E] hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-800">Faturamento Mês</span>
            <ExternalLink className="w-3.5 h-3.5 text-muted-foreground group-hover:text-[#005B2E]" />
          </div>
          <span className="text-lg font-black text-[#005B2E] block mt-1 truncate">
            {fmtCurrency(stats.faturamentoMes)}
          </span>
          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
            Relatórios <ChevronRight className="w-2.5 h-2.5" />
          </span>
        </button>

        {/* 3. Pipeline CRM -> CRM */}
        <button
          type="button"
          onClick={() => navigate('/admin/comercial/crm')}
          className="text-left p-3 rounded-xl border-2 border-blue-200 bg-blue-50/40 hover:border-blue-500 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-blue-800">Pipeline CRM</span>
            <Users className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <span className="text-lg font-black text-blue-700 block mt-1 truncate">
            {fmtCurrency(stats.pipelineCrm)}
          </span>
          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
            Funil & Leads <ChevronRight className="w-2.5 h-2.5" />
          </span>
        </button>

        {/* 4. Contratos Ativos -> Contratos e Devoluções */}
        <button
          type="button"
          onClick={() => navigate('/admin/comercial/contratos-devolucoes')}
          className="text-left p-3 rounded-xl border-2 border-purple-200 bg-purple-50/40 hover:border-purple-500 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-purple-800">Contratos Ativos</span>
            <FileCheck2 className="w-3.5 h-3.5 text-purple-600" />
          </div>
          <span className="text-2xl font-black text-purple-700 block mt-1">
            {stats.contratosAtivos}
          </span>
          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
            Contratos <ChevronRight className="w-2.5 h-2.5" />
          </span>
        </button>

        {/* 5. Devoluções Abertas -> Contratos e Devoluções (Aba Devoluções) */}
        <button
          type="button"
          onClick={() => navigate('/admin/comercial/contratos-devolucoes')}
          className="text-left p-3 rounded-xl border-2 border-rose-200 bg-rose-50/40 hover:border-rose-500 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-rose-800">Devoluções</span>
            <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
          </div>
          <span className="text-2xl font-black text-rose-700 block mt-1">
            {stats.devolucoesAbertas}
          </span>
          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
            Devoluções <ChevronRight className="w-2.5 h-2.5" />
          </span>
        </button>

        {/* 6. Comissões Mês -> Comissões */}
        <button
          type="button"
          onClick={() => navigate('/admin/comercial/comissoes')}
          className="text-left p-3 rounded-xl border-2 border-teal-200 bg-teal-50/40 hover:border-teal-500 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-teal-800">Comissões Mês</span>
            <Percent className="w-3.5 h-3.5 text-teal-600" />
          </div>
          <span className="text-lg font-black text-teal-700 block mt-1 truncate">
            {fmtCurrency(stats.comissoesMes)}
          </span>
          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
            Regras & Mix <ChevronRight className="w-2.5 h-2.5" />
          </span>
        </button>
      </div>

      {/* ABAS DA CENTRAL COMERCIAL */}
      <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-4">
        <TabsList className="bg-muted/60 p-1 rounded-xl grid grid-cols-2 max-w-md h-auto gap-1">
          <TabsTrigger
            value="visao-geral"
            className="text-xs py-2 font-bold flex items-center gap-1.5"
          >
            <TrendingUp className="w-3.5 h-3.5 text-[#005B2E]" />
            <span>Visão Operacional</span>
          </TabsTrigger>
          <TabsTrigger
            value="analytics"
            className="text-xs py-2 font-bold flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Painel de Desempenho</span>
          </TabsTrigger>
        </TabsList>

        {/* ABA 1: VISÃO OPERACIONAL COM ÚLTIMOS PEDIDOS */}
        <TabsContent value="visao-geral" className="space-y-4">
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    Últimos Pedidos Movimentados
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Acompanhamento em tempo real das vendas da empresa ativa.
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate('/admin/vendas/consulta-pedidos')}
                  className="text-xs font-semibold"
                >
                  <FileText className="w-3.5 h-3.5 mr-1.5 text-[#005B2E]" />
                  Consulta Avançada de Pedidos
                </Button>
              </div>

              <JetroTable<RecentOrderRow>
                data={recentOrders}
                columns={columns}
                pageSize={10}
                screenId="comercial-central"
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA 2: PAINEL DE DESEMPENHO / SALES DASHBOARD */}
        <TabsContent value="analytics" className="space-y-4">
          <SalesDashboard />
        </TabsContent>
      </Tabs>
    </div>
  )
}
