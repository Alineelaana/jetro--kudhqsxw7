import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Inbox,
  RefreshCw,
  Building2,
  Plus,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Search,
  Filter,
  Eye,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  FileText,
  UserCheck,
  Layers,
} from 'lucide-react'
import { useBrand } from '@/hooks/use-brand'
import { useAuth } from '@/hooks/use-auth'
import { toast } from '@/hooks/use-toast'
import {
  chamadosService,
  type Chamado,
  type ChamadoSlaConfig,
  type ChamadoPrioridade,
  type ChamadoStatus,
  STATUS_LABELS,
  PRIORIDADE_LABELS,
} from '@/services/chamados'

export function ScreenCentralChamados() {
  const navigate = useNavigate()
  const { brand, empresasDisponiveis, empresaAtivaId } = useBrand()
  const { user } = useAuth()

  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)
  const [chamados, setChamados] = useState<Chamado[]>([])
  const [slaConfigs, setSlaConfigs] = useState<ChamadoSlaConfig[]>([])

  // Filtro de indicador selecionado ao clicar nos cards
  const [filtroIndicador, setFiltroIndicador] = useState<
    'todos' | 'abertos' | 'andamento' | 'resolvidos' | 'sla_risco' | 'urgentes'
  >('todos')
  const [buscaTexto, setBuscaTexto] = useState('')

  const empresaAtualNome =
    empresasDisponiveis?.find((e: any) => e.id === empresaAtivaId)?.nome_fantasia ||
    brand?.nomeExibicao ||
    'Todas as Empresas'

  const carregarDados = async () => {
    try {
      setLoading(true)
      const [resChamados, resSla] = await Promise.all([
        chamadosService.listarMeusChamados({ perPage: 150, sort: '-created' }),
        chamadosService.listarSlaConfigs().catch(() => []),
      ])
      setChamados(resChamados.items || [])
      setSlaConfigs(resSla || [])
    } catch (err: any) {
      toast({
        title: 'Erro ao carregar Central de Chamados',
        description: err.message || 'Falha ao buscar indicadores operacionais.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarDados()
  }, [refreshKey])

  const handleRefresh = () => {
    setRefreshKey((k) => k + 1)
    toast({ title: 'Central de Chamados atualizada' })
  }

  // Cálculos de Indicadores
  const indicadores = useMemo(() => {
    let abertos = 0
    let emAtendimento = 0
    let resolvidos = 0
    let slaRisco = 0
    let urgentes = 0

    chamados.forEach((c) => {
      // Abertos: status 'novo'
      if (c.status === 'novo') abertos++

      // Em Atendimento: status 'andamento' ou 'aprovacao'
      if (c.status === 'andamento' || c.status === 'aprovacao') emAtendimento++

      // Resolvidos: status 'finalizado'
      if (c.status === 'finalizado') resolvidos++

      // Urgentes ativos
      if (c.prioridade === 'urgente' && c.status !== 'finalizado' && c.status !== 'cancelado') {
        urgentes++
      }

      // SLA em risco: atrasado ou próximo do vencimento (não finalizado e não cancelado)
      if (c.status !== 'finalizado' && c.status !== 'cancelado') {
        const sit = chamadosService.calcularSituacaoSla(c, slaConfigs)
        if (sit.estaAtrasado || sit.situacao === 'proximo_vencimento') {
          slaRisco++
        }
      }
    })

    return {
      total: chamados.length,
      abertos,
      emAtendimento,
      resolvidos,
      slaRisco,
      urgentes,
    }
  }, [chamados, slaConfigs])

  // Lista filtrada pelos cards e pela busca textual
  const chamadosFiltrados = useMemo(() => {
    return chamados.filter((c) => {
      // 1. Filtro do card clicado
      if (filtroIndicador === 'abertos' && c.status !== 'novo') return false
      if (filtroIndicador === 'andamento' && c.status !== 'andamento' && c.status !== 'aprovacao')
        return false
      if (filtroIndicador === 'resolvidos' && c.status !== 'finalizado') return false
      if (filtroIndicador === 'urgentes') {
        if (c.prioridade !== 'urgente' || c.status === 'finalizado' || c.status === 'cancelado')
          return false
      }
      if (filtroIndicador === 'sla_risco') {
        if (c.status === 'finalizado' || c.status === 'cancelado') return false
        const sit = chamadosService.calcularSituacaoSla(c, slaConfigs)
        if (!sit.estaAtrasado && sit.situacao !== 'proximo_vencimento') return false
      }

      // 2. Busca textual
      if (buscaTexto.trim()) {
        const q = buscaTexto.toLowerCase()
        const num = (c.numero || '').toLowerCase()
        const ass = (c.assunto || '').toLowerCase()
        const desc = (c.descricao || '').toLowerCase()
        const sol = (c.expand?.solicitante?.name || c.solicitante || '').toLowerCase()
        const resp = (c.expand?.profissional_responsavel?.name || '').toLowerCase()
        const setor = (c.expand?.setor_responsavel?.name || '').toLowerCase()

        if (
          !num.includes(q) &&
          !ass.includes(q) &&
          !desc.includes(q) &&
          !sol.includes(q) &&
          !resp.includes(q) &&
          !setor.includes(q)
        ) {
          return false
        }
      }

      return true
    })
  }, [chamados, filtroIndicador, buscaTexto, slaConfigs])

  return (
    <div className="space-y-5">
      {/* CABEÇALHO PADRÃO MULTITENANT */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#005B2E] text-white shadow-sm">
            <Inbox className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-black text-foreground tracking-tight">
                Central de Chamados
              </h1>
              <Badge
                variant="outline"
                className="text-xs bg-[#005B2E]/10 text-[#005B2E] font-bold border-[#005B2E]/30"
              >
                TI & Suporte Corporativo
              </Badge>
              {empresaAtivaId && (
                <Badge variant="secondary" className="text-xs flex items-center gap-1 font-medium">
                  <Building2 className="w-3 h-3 text-[#005B2E]" />
                  {empresaAtualNome}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Visão consolidada de tickets, indicadores operacionais de TI, monitoramento de SLA e
              fluxos de atendimento.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleRefresh}
            disabled={loading}
            className="text-xs focus-visible:ring-[#005B2E]"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>

          <Button
            size="sm"
            onClick={() => navigate('/admin/chamados/meus-chamados?tab=novo')}
            className="bg-[#002817] hover:bg-[#00381C] text-[#E4C46A] border border-[#C9A227]/60 font-bold text-xs flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Chamado</span>
          </Button>
        </div>
      </div>

      {/* INDICADORES CLICÁVEIS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total */}
        <button
          type="button"
          onClick={() => setFiltroIndicador('todos')}
          className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
            filtroIndicador === 'todos'
              ? 'bg-[#002817] text-white border-[#C9A227] shadow-md ring-2 ring-[#C9A227]/50'
              : 'bg-card hover:bg-muted/50 border-border text-foreground hover:border-[#005B2E]'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold opacity-80">
            <span>Total Geral</span>
            <Layers className="w-4 h-4 text-[#C9A227]" />
          </div>
          <div className="text-2xl font-black mt-1 font-mono tracking-tight">
            {indicadores.total}
          </div>
          <div className="text-[10px] mt-1 opacity-70">Todos os chamados</div>
        </button>

        {/* Abertos */}
        <button
          type="button"
          onClick={() => setFiltroIndicador('abertos')}
          className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
            filtroIndicador === 'abertos'
              ? 'bg-blue-900 text-white border-blue-400 shadow-md ring-2 ring-blue-400/50'
              : 'bg-card hover:bg-muted/50 border-border text-foreground hover:border-blue-500'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold text-blue-600 dark:text-blue-400">
            <span>Abertos</span>
            <Inbox className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black mt-1 font-mono tracking-tight text-blue-700 dark:text-blue-300">
            {indicadores.abertos}
          </div>
          <div className="text-[10px] mt-1 text-muted-foreground">Aguardando início</div>
        </button>

        {/* Em Atendimento */}
        <button
          type="button"
          onClick={() => setFiltroIndicador('andamento')}
          className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
            filtroIndicador === 'andamento'
              ? 'bg-amber-900 text-white border-amber-400 shadow-md ring-2 ring-amber-400/50'
              : 'bg-card hover:bg-muted/50 border-border text-foreground hover:border-amber-500'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold text-amber-600 dark:text-amber-400">
            <span>Em Atendimento</span>
            <Clock className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black mt-1 font-mono tracking-tight text-amber-700 dark:text-amber-300">
            {indicadores.emAtendimento}
          </div>
          <div className="text-[10px] mt-1 text-muted-foreground">Andamento / Aprovação</div>
        </button>

        {/* Resolvidos */}
        <button
          type="button"
          onClick={() => setFiltroIndicador('resolvidos')}
          className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
            filtroIndicador === 'resolvidos'
              ? 'bg-emerald-900 text-white border-emerald-400 shadow-md ring-2 ring-emerald-400/50'
              : 'bg-card hover:bg-muted/50 border-border text-foreground hover:border-emerald-500'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <span>Resolvidos</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black mt-1 font-mono tracking-tight text-emerald-700 dark:text-emerald-300">
            {indicadores.resolvidos}
          </div>
          <div className="text-[10px] mt-1 text-muted-foreground">Finalizados com sucesso</div>
        </button>

        {/* SLA em Risco */}
        <button
          type="button"
          onClick={() => setFiltroIndicador('sla_risco')}
          className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
            filtroIndicador === 'sla_risco'
              ? 'bg-rose-950 text-white border-rose-500 shadow-md ring-2 ring-rose-500/50'
              : 'bg-rose-50/40 dark:bg-rose-950/20 hover:bg-rose-100/50 border-rose-200 dark:border-rose-900/50 text-foreground'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-rose-700 dark:text-rose-300">
            <span>SLA em Risco</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black mt-1 font-mono tracking-tight text-rose-700 dark:text-rose-300">
            {indicadores.slaRisco}
          </div>
          <div className="text-[10px] mt-1 text-rose-600/80 dark:text-rose-400/80 font-medium">
            Próximos / Atrasados
          </div>
        </button>

        {/* Urgentes */}
        <button
          type="button"
          onClick={() => setFiltroIndicador('urgentes')}
          className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
            filtroIndicador === 'urgentes'
              ? 'bg-orange-950 text-white border-orange-500 shadow-md ring-2 ring-orange-500/50'
              : 'bg-card hover:bg-muted/50 border-border text-foreground hover:border-orange-500'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold text-orange-600 dark:text-orange-400">
            <span>Urgentes Ativos</span>
            <Flame className="w-4 h-4 text-orange-600" />
          </div>
          <div className="text-2xl font-black mt-1 font-mono tracking-tight text-orange-700 dark:text-orange-300">
            {indicadores.urgentes}
          </div>
          <div className="text-[10px] mt-1 text-muted-foreground">Prioridade máxima</div>
        </button>
      </div>

      {/* PAINEL INFORMATIVO E ACESSO RÁPIDO */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border shadow-xs bg-card">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-xs font-bold flex items-center justify-between">
              <span className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-[#005B2E]" />
                Atendimento por Fila
              </span>
              <Badge variant="outline" className="text-[10px]">
                TI / Huram
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 text-xs text-muted-foreground">
            Acompanhe o volume distribuído para cada profissional da equipe e redistribua demandas
            na tela dedicada de Painel & SLA.
            <div className="mt-3">
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate('/admin/chamados/painel-sla')}
                className="w-full text-xs font-semibold text-[#005B2E] border-[#005B2E]/30"
              >
                Abrir Painel de Atendimento →
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-xs bg-card">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-xs font-bold flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600" />
                Matriz de Prazos (SLA)
              </span>
              <Badge variant="outline" className="text-[10px]">
                {slaConfigs.length} regras
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 text-xs text-muted-foreground">
            Políticas de atendimento e resolução por prioridade e setor responsável com alertas
            automáticos de expiração.
            <div className="mt-3">
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate('/admin/chamados/painel-sla')}
                className="w-full text-xs font-semibold text-amber-700 border-amber-300"
              >
                Gerenciar Regras de SLA →
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-xs bg-card">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-xs font-bold flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                Minhas Demandas
              </span>
              <Badge variant="outline" className="text-[10px]">
                Portal
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 text-xs text-muted-foreground">
            Acompanhe o andamento dos chamados abertos por você, anexe documentos e aprove entregas
            de suporte.
            <div className="mt-3">
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate('/admin/chamados/meus-chamados')}
                className="w-full text-xs font-semibold text-blue-700 border-blue-300"
              >
                Ir para Meus Chamados →
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* LISTAGEM FILTRADA DOS CHAMADOS */}
      <Card className="border-border shadow-xs">
        <CardHeader className="py-3 px-4 bg-muted/30 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
              <span>Fila Operacional</span>
              <Badge className="bg-[#002817] text-[#E4C46A] border border-[#C9A227]/40 text-xs font-mono">
                {chamadosFiltrados.length} registro(s)
              </Badge>
              {filtroIndicador !== 'todos' && (
                <Badge variant="secondary" className="text-xs uppercase font-bold">
                  Filtro: {filtroIndicador}
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="text-xs">
              Clique em qualquer registro para abrir a tela de acompanhamento e histórico detalhado.
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar número, assunto, solicitante..."
                value={buscaTexto}
                onChange={(e) => setBuscaTexto(e.target.value)}
                className="pl-8 text-xs h-8"
              />
            </div>
            {filtroIndicador !== 'todos' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFiltroIndicador('todos')}
                className="h-8 text-xs"
              >
                Limpar Filtro
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="py-12 text-center text-xs text-muted-foreground">
              Carregando fila operacional da Central...
            </div>
          ) : chamadosFiltrados.length === 0 ? (
            <div className="py-12 text-center text-xs text-muted-foreground space-y-2">
              <p>Nenhum chamado localizado com os filtros selecionados.</p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setFiltroIndicador('todos')
                  setBuscaTexto('')
                }}
                className="text-xs text-[#005B2E]"
              >
                Limpar todos os filtros
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/60 text-muted-foreground border-b border-border text-[11px] uppercase font-bold">
                  <tr>
                    <th className="py-2.5 px-3">Número</th>
                    <th className="py-2.5 px-3">Assunto</th>
                    <th className="py-2.5 px-3">Solicitante</th>
                    <th className="py-2.5 px-3">Setor</th>
                    <th className="py-2.5 px-3">Responsável</th>
                    <th className="py-2.5 px-3">Prioridade</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Situação SLA</th>
                    <th className="py-2.5 px-3">Abertura</th>
                    <th className="py-2.5 px-3 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {chamadosFiltrados.map((ch) => {
                    const statusCfg = STATUS_LABELS[ch.status] || {
                      label: ch.status,
                      bg: 'bg-slate-100',
                      text: 'text-slate-800',
                      border: 'border-slate-300',
                    }
                    const prioridadeCfg = PRIORIDADE_LABELS[ch.prioridade] || {
                      label: ch.prioridade,
                      badgeClass: 'bg-slate-100 text-slate-800',
                    }
                    const sitSla = chamadosService.calcularSituacaoSla(ch, slaConfigs)

                    const dataAbertura = ch.created
                      ? new Date(ch.created).toLocaleDateString('pt-BR')
                      : '—'

                    return (
                      <tr
                        key={ch.id}
                        className="hover:bg-muted/40 transition-colors group cursor-pointer"
                        onClick={() =>
                          navigate(`/admin/chamados/meus-chamados?tab=detalhe&id=${ch.id}`)
                        }
                      >
                        <td className="py-2.5 px-3 font-mono font-bold text-[#005B2E] dark:text-[#E4C46A] whitespace-nowrap">
                          {ch.numero}
                        </td>
                        <td
                          className="py-2.5 px-3 font-semibold text-foreground max-w-[220px] truncate"
                          title={ch.assunto}
                        >
                          {ch.assunto}
                        </td>
                        <td className="py-2.5 px-3 text-muted-foreground max-w-[130px] truncate">
                          {ch.expand?.solicitante?.name || ch.solicitante || 'Sistema'}
                        </td>
                        <td className="py-2.5 px-3 text-muted-foreground max-w-[120px] truncate">
                          {ch.expand?.setor_responsavel?.name || 'Geral'}
                        </td>
                        <td className="py-2.5 px-3 text-foreground max-w-[130px] truncate">
                          {ch.expand?.profissional_responsavel?.name || 'Não atribuído'}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span
                            className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-full border ${prioridadeCfg.badgeClass}`}
                          >
                            {prioridadeCfg.label}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}
                          >
                            {statusCfg.label}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${sitSla.badgeClass}`}
                          >
                            {sitSla.rotulo}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-muted-foreground whitespace-nowrap">
                          {dataAbertura}
                        </td>
                        <td className="py-2.5 px-3 text-right whitespace-nowrap">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation()
                              navigate(`/admin/chamados/meus-chamados?tab=detalhe&id=${ch.id}`)
                            }}
                            className="h-6 px-2 text-[11px] text-[#005B2E] dark:text-[#E4C46A] hover:bg-[#005B2E]/10 flex items-center gap-1 ml-auto"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Detalhes</span>
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
