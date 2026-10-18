import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  chamadosService,
  STATUS_LABELS,
  PRIORIDADE_LABELS,
  type Chamado,
  type ChamadoStatus,
  type ChamadoPrioridade,
  type ChamadoSlaConfig,
  type SituacaoSLA,
} from '@/services/chamados'
import { useAuth } from '@/hooks/use-auth'
import { toast } from 'sonner'
import RelatorioChamadosModal from './relatorio-chamados-modal'
import {
  LayoutDashboard,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  FileDown,
  Building2,
  Users,
  Search,
  MessageSquare,
  TrendingUp,
  Inbox,
  Filter,
  ArrowUpRight,
  Sparkles,
  Layers,
  ChevronRight,
  ShieldCheck,
  CheckCircle,
  XCircle,
  HelpCircle,
  ExternalLink,
  Loader2,
} from 'lucide-react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

export default function PainelChamadosScreen() {
  const navigate = useNavigate()
  const { user } = useAuth()

  // Permissões
  const isMasterOrAdmin =
    user?.role === 'SUP' ||
    (typeof user?.perfil_acesso === 'string' &&
      (user.perfil_acesso.toLowerCase().includes('admin') ||
        user.perfil_acesso.toLowerCase().includes('master')))

  const [loading, setLoading] = useState(true)
  const [chamados, setChamados] = useState<Chamado[]>([])
  const [slaConfigs, setSlaConfigs] = useState<ChamadoSlaConfig[]>([])
  const [setores, setSetores] = useState<Array<{ id: string; name: string }>>([])
  const [usuarios, setUsuarios] = useState<Array<{ id: string; name: string; email: string }>>([])
  const [comunicacoesQtd, setComunicacoesQtd] = useState<number>(0)
  const [chamadosComInteracaoQtd, setChamadosComInteracaoQtd] = useState<number>(0)

  // Modal de Relatório PDF
  const [relatorioModalAberto, setRelatorioModalAberto] = useState(false)

  // Filtros Globais
  const [atalhoPeriodo, setAtalhoPeriodo] = useState<
    'hoje' | '7dias' | 'esteMes' | 'mesAnterior' | 'personalizado' | 'todos'
  >('esteMes')
  const [dataInicio, setDataInicio] = useState<string>('')
  const [dataFim, setDataFim] = useState<string>('')
  const [filtroSetorResp, setFiltroSetorResp] = useState<string>('todos')
  const [filtroSetorSol, setFiltroSetorSol] = useState<string>('todos')
  const [filtroProfResp, setFiltroProfResp] = useState<string>('todos')
  const [filtroSolicitante, setFiltroSolicitante] = useState<string>('todos')
  const [filtroPrioridade, setFiltroPrioridade] = useState<string>('todos')
  const [filtroStatus, setFiltroStatus] = useState<string>('todos')
  const [filtroSla, setFiltroSla] = useState<'todos' | 'dentro' | 'proximo' | 'atrasado'>('todos')
  const [buscaTexto, setBuscaTexto] = useState<string>('')

  // Agrupamento temporal do gráfico de evolução (dia / semana / mês)
  const [agrupamentoEvolucao, setAgrupamentoEvolucao] = useState<'dia' | 'mes'>('dia')

  // Inicializar datas com base no atalho
  const aplicarAtalhoPeriodo = (
    tipo: 'hoje' | '7dias' | 'esteMes' | 'mesAnterior' | 'personalizado' | 'todos',
  ) => {
    setAtalhoPeriodo(tipo)
    const now = new Date()
    const fmt = (d: Date) => d.toISOString().split('T')[0]

    if (tipo === 'hoje') {
      const d = fmt(now)
      setDataInicio(d)
      setDataFim(d)
    } else if (tipo === '7dias') {
      const seteDiasAtras = new Date(now.getTime() - 7 * 24 * 3600 * 1000)
      setDataInicio(fmt(seteDiasAtras))
      setDataFim(fmt(now))
    } else if (tipo === 'esteMes') {
      const primeiroDia = new Date(now.getFullYear(), now.getMonth(), 1)
      const ultimoDia = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      setDataInicio(fmt(primeiroDia))
      setDataFim(fmt(ultimoDia))
    } else if (tipo === 'mesAnterior') {
      const primeiroDia = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const ultimoDia = new Date(now.getFullYear(), now.getMonth(), 0)
      setDataInicio(fmt(primeiroDia))
      setDataFim(fmt(ultimoDia))
    } else if (tipo === 'todos') {
      setDataInicio('')
      setDataFim('')
    }
  }

  // Carregamento de dados com respeito ao escopo de permissões
  const carregarDados = async () => {
    setLoading(true)
    try {
      // Regra de Permissões H: Master/Admin veem todos; outros veem apenas os seus (solicitante, atribuído ou participante)
      let filtroPermissao: string | undefined = undefined
      if (!isMasterOrAdmin && user?.id) {
        filtroPermissao = `solicitante = '${user.id}' || profissional_responsavel = '${user.id}' || participantes ~ '${user.id}'`
      }

      const [chamadosDb, slaDb, setoresDb, usuariosDb] = await Promise.all([
        chamadosService.listarTodosChamadosParaDashboard(filtroPermissao),
        chamadosService.listarSlaConfigs().catch(() => []),
        chamadosService.getSetores().catch(() => []),
        chamadosService.getUsuariosAtivos().catch(() => []),
      ])

      setChamados(chamadosDb)
      setSlaConfigs(slaDb)
      setSetores(setoresDb as Array<{ id: string; name: string }>)
      setUsuarios(usuariosDb as Array<{ id: string; name: string; email: string }>)

      // Buscar comunicações reais para estatísticas de interação
      const chamadosIds = chamadosDb.map((c) => c.id)
      const coms = await chamadosService.listarTodasComunicacoes(chamadosIds.slice(0, 50))
      setComunicacoesQtd(coms.length)
      const chamadosComMsg = new Set(coms.map((c) => c.chamado))
      setChamadosComInteracaoQtd(chamadosComMsg.size)
    } catch (err: any) {
      toast.error('Erro ao carregar dados do painel: ' + (err.message || 'Falha de conexão.'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    aplicarAtalhoPeriodo('esteMes')
    carregarDados()
  }, [])

  // Filtragem Dinâmica dos Chamados
  const chamadosFiltrados = useMemo(() => {
    return chamados.filter((c) => {
      // 1. Período
      if (dataInicio) {
        const dCriacao = c.created.split('T')[0]
        if (dCriacao < dataInicio) return false
      }
      if (dataFim) {
        const dCriacao = c.created.split('T')[0]
        if (dCriacao > dataFim) return false
      }

      // 2. Setor Responsável
      if (filtroSetorResp !== 'todos' && c.setor_responsavel !== filtroSetorResp) {
        return false
      }

      // 3. Setor Solicitante
      if (filtroSetorSol !== 'todos') {
        const setorSolNome = c.expand?.solicitante?.departamento || ''
        if (setorSolNome !== filtroSetorSol) return false
      }

      // 4. Profissional Responsável
      if (filtroProfResp !== 'todos' && c.profissional_responsavel !== filtroProfResp) {
        return false
      }

      // 5. Solicitante
      if (filtroSolicitante !== 'todos' && c.solicitante !== filtroSolicitante) {
        return false
      }

      // 6. Prioridade
      if (filtroPrioridade !== 'todos' && c.prioridade !== filtroPrioridade) {
        return false
      }

      // 7. Status
      if (filtroStatus !== 'todos' && c.status !== filtroStatus) {
        return false
      }

      // 8. SLA
      if (filtroSla !== 'todos') {
        const sit = chamadosService.calcularSituacaoSla(c, slaConfigs)
        if (filtroSla === 'atrasado' && !sit.estaAtrasado) return false
        if (filtroSla === 'proximo' && sit.situacao !== 'proximo_vencimento') return false
        if (filtroSla === 'dentro' && sit.situacao !== 'dentro_prazo') return false
      }

      // 9. Busca de Texto
      if (buscaTexto.trim()) {
        const q = buscaTexto.toLowerCase()
        const matchNum = c.numero?.toLowerCase().includes(q)
        const matchAssunto = c.assunto?.toLowerCase().includes(q)
        const matchDesc = c.descricao?.toLowerCase().includes(q)
        const matchSol = c.expand?.solicitante?.name?.toLowerCase().includes(q)
        const matchProf = c.expand?.profissional_responsavel?.name?.toLowerCase().includes(q)
        if (!matchNum && !matchAssunto && !matchDesc && !matchSol && !matchProf) {
          return false
        }
      }

      return true
    })
  }, [
    chamados,
    slaConfigs,
    dataInicio,
    dataFim,
    filtroSetorResp,
    filtroSetorSol,
    filtroProfResp,
    filtroSolicitante,
    filtroPrioridade,
    filtroStatus,
    filtroSla,
    buscaTexto,
  ])

  // ================= CÁLCULO DOS INDICADORES E GRÁFICOS (DADOS REAIS DO BANCO) =================
  const kpis = useMemo(() => {
    const total = chamadosFiltrados.length
    const novos = chamadosFiltrados.filter((c) => c.status === 'novo').length
    const andamento = chamadosFiltrados.filter((c) => c.status === 'andamento').length
    const aprovacao = chamadosFiltrados.filter((c) => c.status === 'aprovacao').length
    const finalizados = chamadosFiltrados.filter((c) => c.status === 'finalizado').length
    const cancelados = chamadosFiltrados.filter((c) => c.status === 'cancelado').length

    let atrasados = 0
    let proximosVencimento = 0
    let noPrazo = 0
    let tempoTotalResolucaoHoras = 0
    let totalComResolucao = 0

    chamadosFiltrados.forEach((c) => {
      const sit = chamadosService.calcularSituacaoSla(c, slaConfigs)
      if (sit.estaAtrasado) {
        atrasados++
      } else if (sit.situacao === 'proximo_vencimento') {
        proximosVencimento++
      } else {
        noPrazo++
      }

      if (c.status === 'finalizado') {
        const ini = new Date(c.created).getTime()
        const fim = c.data_conclusao
          ? new Date(c.data_conclusao).getTime()
          : new Date(c.updated).getTime()
        const diffH = Math.max((fim - ini) / (3600 * 1000), 0.1)
        tempoTotalResolucaoHoras += diffH
        totalComResolucao++
      }
    })

    const percentualSla = total > 0 ? Math.round(((total - atrasados) / total) * 100) : 100
    const taxaResolucao = total > 0 ? Math.round((finalizados / total) * 100) : 0
    const tempoMedioResolucao =
      totalComResolucao > 0 ? (tempoTotalResolucaoHoras / totalComResolucao).toFixed(1) : '0.0'

    return {
      total,
      novos,
      andamento,
      aprovacao,
      finalizados,
      cancelados,
      atrasados,
      proximosVencimento,
      noPrazo,
      percentualSla,
      taxaResolucao,
      tempoMedioResolucao,
    }
  }, [chamadosFiltrados, slaConfigs])

  // Gráfico de Linha: Evolução temporal de aberturas
  const dadosEvolucao = useMemo(() => {
    const mapa: Record<string, { data: string; total: number; finalizados: number }> = {}

    chamadosFiltrados.forEach((c) => {
      let chave = ''
      if (agrupamentoEvolucao === 'dia') {
        chave = c.created.split('T')[0]
      } else {
        // Mês (YYYY-MM)
        chave = c.created.substring(0, 7)
      }

      if (!mapa[chave]) {
        mapa[chave] = { data: chave, total: 0, finalizados: 0 }
      }
      mapa[chave].total++
      if (c.status === 'finalizado') {
        mapa[chave].finalizados++
      }
    })

    const ordenados = Object.values(mapa).sort((a, b) => a.data.localeCompare(b.data))

    // Formatar rótulo visual
    return ordenados.map((item) => {
      let label = item.data
      if (agrupamentoEvolucao === 'dia') {
        const partes = item.data.split('-')
        if (partes.length === 3) label = `${partes[2]}/${partes[1]}`
      }
      return {
        ...item,
        label,
      }
    })
  }, [chamadosFiltrados, agrupamentoEvolucao])

  // Tabela e gráfico por profissional
  const dadosProfissionais = useMemo(() => {
    const map: Record<
      string,
      {
        id: string
        nome: string
        email: string
        total: number
        andamento: number
        pendentes: number
        finalizados: number
        atrasados: number
        tempoTotalHoras: number
      }
    > = {}

    chamadosFiltrados.forEach((c) => {
      const id = c.profissional_responsavel || 'sem_atribuicao'
      const nome = c.expand?.profissional_responsavel?.name || 'Não atribuído'
      const email = c.expand?.profissional_responsavel?.email || ''

      if (!map[id]) {
        map[id] = {
          id,
          nome,
          email,
          total: 0,
          andamento: 0,
          pendentes: 0,
          finalizados: 0,
          atrasados: 0,
          tempoTotalHoras: 0,
        }
      }

      map[id].total++
      if (c.status === 'andamento') map[id].andamento++
      if (c.status === 'novo' || c.status === 'aprovacao') map[id].pendentes++
      if (c.status === 'finalizado') {
        map[id].finalizados++
        const ini = new Date(c.created).getTime()
        const fim = c.data_conclusao
          ? new Date(c.data_conclusao).getTime()
          : new Date(c.updated).getTime()
        map[id].tempoTotalHoras += Math.max((fim - ini) / (3600 * 1000), 0.1)
      }

      const sit = chamadosService.calcularSituacaoSla(c, slaConfigs)
      if (sit.estaAtrasado) map[id].atrasados++
    })

    return Object.values(map).sort((a, b) => b.total - a.total)
  }, [chamadosFiltrados, slaConfigs])

  // Tabela por solicitante
  const dadosSolicitantes = useMemo(() => {
    const map: Record<
      string,
      {
        id: string
        nome: string
        setor: string
        total: number
        andamento: number
        pendentes: number
        finalizados: number
      }
    > = {}

    chamadosFiltrados.forEach((c) => {
      const id = c.solicitante || 'sem_solicitante'
      const nome = c.expand?.solicitante?.name || 'Desconhecido'
      const setor = c.expand?.solicitante?.departamento || 'Geral'

      if (!map[id]) {
        map[id] = {
          id,
          nome,
          setor,
          total: 0,
          andamento: 0,
          pendentes: 0,
          finalizados: 0,
        }
      }

      map[id].total++
      if (c.status === 'andamento') map[id].andamento++
      if (c.status === 'novo' || c.status === 'aprovacao') map[id].pendentes++
      if (c.status === 'finalizado') map[id].finalizados++
    })

    return Object.values(map)
      .sort((a, b) => b.total - a.total)
      .slice(0, 10)
  }, [chamadosFiltrados])

  // Distribuição por Setor Responsável vs Solicitante
  const distribuicaoSetor = useMemo(() => {
    const respMap: Record<string, number> = {}
    const solMap: Record<string, number> = {}

    chamadosFiltrados.forEach((c) => {
      const nomeResp = c.expand?.setor_responsavel?.name || 'Sem setor'
      respMap[nomeResp] = (respMap[nomeResp] || 0) + 1

      const nomeSol = c.expand?.solicitante?.departamento || 'Geral'
      solMap[nomeSol] = (solMap[nomeSol] || 0) + 1
    })

    const arrayResp = Object.entries(respMap).map(([name, value]) => ({ name, value }))
    const arraySol = Object.entries(solMap).map(([name, value]) => ({ name, value }))

    return {
      responsaveis: arrayResp.sort((a, b) => b.value - a.value),
      solicitantes: arraySol.sort((a, b) => b.value - a.value),
    }
  }, [chamadosFiltrados])

  // Distribuição por Prioridade
  const dadosPrioridade = useMemo(() => {
    const prioCont: Record<string, number> = {
      urgente: 0,
      alta: 0,
      normal: 0,
      baixa: 0,
    }
    chamadosFiltrados.forEach((c) => {
      const p = c.prioridade || 'normal'
      prioCont[p] = (prioCont[p] || 0) + 1
    })
    return [
      { name: 'Urgente', value: prioCont.urgente, color: '#dc2626' },
      { name: 'Alta', value: prioCont.alta, color: '#ea580c' },
      { name: 'Normal', value: prioCont.normal, color: '#2563eb' },
      { name: 'Baixa', value: prioCont.baixa, color: '#64748b' },
    ]
  }, [chamadosFiltrados])

  // Leitura Gerencial Automática e Verificável
  const leituraGerencial = useMemo(() => {
    if (chamadosFiltrados.length === 0) {
      return [
        'Nenhum chamado registrado no período e filtros selecionados.',
        'Ajuste os filtros de data para visualizar o histórico consolidado.',
      ]
    }

    const observacoes: string[] = []

    // SLA
    if (kpis.percentualSla >= 90) {
      observacoes.push(
        `Índice de SLA excelente (${kpis.percentualSla}% cumprido), mantendo alto padrão de resposta aos usuários.`,
      )
    } else if (kpis.percentualSla >= 75) {
      observacoes.push(
        `Índice de SLA moderado (${kpis.percentualSla}%). Há ${kpis.atrasados} chamado(s) com prazo extrapolado demandando atenção.`,
      )
    } else {
      observacoes.push(
        `Atenção crítica ao SLA: apenas ${kpis.percentualSla}% das demandas estão no prazo (${kpis.atrasados} atrasadas).`,
      )
    }

    // Setor mais acionado
    if (distribuicaoSetor.responsaveis.length > 0) {
      const topSetor = distribuicaoSetor.responsaveis[0]
      const partSetor = Math.round((topSetor.value / kpis.total) * 100)
      observacoes.push(
        `O setor responsável com maior concentração de demandas é "${topSetor.name}", representando ${partSetor}% do total (${topSetor.value} chamados).`,
      )
    }

    // Profissional com mais demandas
    if (dadosProfissionais.length > 0 && dadosProfissionais[0].id !== 'sem_atribuicao') {
      const topProf = dadosProfissionais[0]
      observacoes.push(
        `O profissional "${topProf.nome}" lidera as atribuições com ${topProf.total} chamados, sendo ${topProf.finalizados} concluídos e ${topProf.atrasados} em atraso.`,
      )
    }

    // Tempo de resolução
    if (Number(kpis.tempoMedioResolucao) > 0) {
      observacoes.push(
        `O ciclo médio de resolução das demandas finalizadas está em ${kpis.tempoMedioResolucao} horas.`,
      )
    } else {
      observacoes.push('Não há chamados finalizados com tempo de ciclo consolidado no período.')
    }

    // Interações
    if (comunicacoesQtd > 0) {
      const mediaInteracoes = (comunicacoesQtd / Math.max(kpis.total, 1)).toFixed(1)
      observacoes.push(
        `Registradas ${comunicacoesQtd} mensagens/interações no histórico, com média de ${mediaInteracoes} por chamado.`,
      )
    }

    return observacoes
  }, [chamadosFiltrados, kpis, distribuicaoSetor, dadosProfissionais, comunicacoesQtd])

  // Descrição legível dos filtros aplicados
  const filtrosAtivosDescricao = useMemo(() => {
    const lista: string[] = []
    if (dataInicio && dataFim) lista.push(`De ${dataInicio} até ${dataFim}`)
    if (filtroSetorResp !== 'todos') {
      const s = setores.find((x) => x.id === filtroSetorResp)
      lista.push(`Setor Resp: ${s?.name || filtroSetorResp}`)
    }
    if (filtroProfResp !== 'todos') {
      const p = usuarios.find((x) => x.id === filtroProfResp)
      lista.push(`Responsável: ${p?.name || filtroProfResp}`)
    }
    if (filtroPrioridade !== 'todos') lista.push(`Prioridade: ${filtroPrioridade}`)
    if (filtroStatus !== 'todos') lista.push(`Status: ${filtroStatus}`)
    if (filtroSla !== 'todos') lista.push(`SLA: ${filtroSla}`)
    return lista
  }, [
    dataInicio,
    dataFim,
    filtroSetorResp,
    filtroProfResp,
    filtroPrioridade,
    filtroStatus,
    filtroSla,
    setores,
    usuarios,
  ])

  // Limpar todos os filtros
  const limparFiltros = () => {
    aplicarAtalhoPeriodo('esteMes')
    setFiltroSetorResp('todos')
    setFiltroSetorSol('todos')
    setFiltroProfResp('todos')
    setFiltroSolicitante('todos')
    setFiltroPrioridade('todos')
    setFiltroStatus('todos')
    setFiltroSla('todos')
    setBuscaTexto('')
  }

  // Cores do gráfico de rosca
  const CORES_GRAFICO = ['#005B2E', '#C9A227', '#1E40AF', '#854D0E', '#065F46', '#991B1B']

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      {/* ================= CABEÇALHO JETRO CORPORATIVO ================= */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-[#002817] text-[#C9A227] rounded-lg shadow-sm border border-[#C9A227]/30">
              <LayoutDashboard className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-foreground">
                  Painel Gerencial de Chamados
                </h1>
                <Badge
                  variant="outline"
                  className="bg-[#002817]/5 text-[#002817] border-[#002817]/20 dark:text-[#C9A227] dark:border-[#C9A227]/30 text-xs font-semibold"
                >
                  Etapa 2 • Dashboard Executivo
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                Visão executiva em tempo real: volume de demandas, cumprimento de SLA, produtividade
                e auditoria analítica.
              </p>
            </div>
          </div>
        </div>

        {/* Ações Rápidas */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={carregarDados}
            disabled={loading}
            className="gap-1.5 text-xs font-medium"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>

          {isMasterOrAdmin && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/admin/chamados/sla')}
              className="gap-1.5 text-xs font-medium border-[#002817]/20 hover:bg-[#002817]/5"
            >
              <Clock className="w-3.5 h-3.5 text-[#002817] dark:text-[#C9A227]" />
              Matriz SLA
            </Button>
          )}

          <Button
            size="sm"
            onClick={() => setRelatorioModalAberto(true)}
            className="bg-[#002817] hover:bg-[#003820] text-[#E4C46A] border border-[#C9A227]/40 shadow-sm gap-2 font-semibold text-xs"
          >
            <FileDown className="w-4 h-4" />
            Gerar Relatório PDF
          </Button>
        </div>
      </div>

      {/* ================= BARRA DE FILTROS GLOBAIS INTEGRADOS ================= */}
      <Card className="shadow-sm border-t-2 border-t-[#002817]">
        <CardContent className="pt-4 pb-4 space-y-3">
          {/* Linha 1: Atalhos Rápidos de Período + Busca */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground mr-1 flex items-center gap-1">
                <Filter className="w-3 h-3" />
                Período:
              </span>
              {(
                [
                  { id: 'hoje', label: 'Hoje' },
                  { id: '7dias', label: 'Últimos 7 dias' },
                  { id: 'esteMes', label: 'Este mês' },
                  { id: 'mesAnterior', label: 'Mês anterior' },
                  { id: 'todos', label: 'Todo o histórico' },
                ] as const
              ).map((at) => (
                <Button
                  key={at.id}
                  type="button"
                  size="sm"
                  variant={atalhoPeriodo === at.id ? 'default' : 'outline'}
                  onClick={() => aplicarAtalhoPeriodo(at.id)}
                  className={`h-7 text-xs px-2.5 ${
                    atalhoPeriodo === at.id
                      ? 'bg-[#002817] text-[#E4C46A] hover:bg-[#003820]'
                      : 'text-muted-foreground'
                  }`}
                >
                  {at.label}
                </Button>
              ))}
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nº, assunto, pessoa..."
                  className="h-8 pl-8 text-xs"
                  value={buscaTexto}
                  onChange={(e) => setBuscaTexto(e.target.value)}
                />
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={limparFiltros}
                className="h-8 text-xs text-muted-foreground hover:text-foreground"
                title="Limpar todos os filtros"
              >
                Limpar
              </Button>
            </div>
          </div>

          {/* Linha 2: Filtros Combinados (Datas + Setores + Responsável + Prioridade + Status + SLA) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2.5 pt-2 border-t">
            <div className="space-y-1">
              <Label className="text-[11px] font-medium text-muted-foreground">Data Início</Label>
              <Input
                type="date"
                className="h-8 text-xs"
                value={dataInicio}
                onChange={(e) => {
                  setAtalhoPeriodo('personalizado')
                  setDataInicio(e.target.value)
                }}
              />
            </div>

            <div className="space-y-1">
              <Label className="text-[11px] font-medium text-muted-foreground">Data Fim</Label>
              <Input
                type="date"
                className="h-8 text-xs"
                value={dataFim}
                onChange={(e) => {
                  setAtalhoPeriodo('personalizado')
                  setDataFim(e.target.value)
                }}
              />
            </div>

            <div className="space-y-1">
              <Label className="text-[11px] font-medium text-muted-foreground">
                Setor Responsável
              </Label>
              <Select value={filtroSetorResp} onValueChange={setFiltroSetorResp}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Setores</SelectItem>
                  {setores.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-[11px] font-medium text-muted-foreground">
                Profissional Resp.
              </Label>
              <Select value={filtroProfResp} onValueChange={setFiltroProfResp}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  {usuarios.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-[11px] font-medium text-muted-foreground">Prioridade</Label>
              <Select value={filtroPrioridade} onValueChange={setFiltroPrioridade}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas</SelectItem>
                  <SelectItem value="urgente">Urgente</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="baixa">Baixa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-[11px] font-medium text-muted-foreground">Status</Label>
              <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="novo">Novo</SelectItem>
                  <SelectItem value="andamento">Em Atendimento</SelectItem>
                  <SelectItem value="aprovacao">Aguardando Aprovação</SelectItem>
                  <SelectItem value="finalizado">Finalizado</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-[11px] font-medium text-muted-foreground">Situação SLA</Label>
              <Select value={filtroSla} onValueChange={(v: any) => setFiltroSla(v)}>
                <SelectTrigger className="h-8 text-xs font-semibold">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="dentro" className="text-emerald-700 font-medium">
                    Dentro do Prazo
                  </SelectItem>
                  <SelectItem value="proximo" className="text-amber-600 font-medium">
                    Próximo do Vencimento
                  </SelectItem>
                  <SelectItem value="atrasado" className="text-rose-700 font-medium">
                    Fora do Prazo (Atrasado)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ================= BLOCO A: RESUMO EXECUTIVO ================= */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-6 bg-[#002817] rounded-sm" />
            <h2 className="text-lg font-bold tracking-tight text-foreground">
              Bloco 1: Resumo Executivo & Indicadores de SLA
            </h2>
          </div>
          <span className="text-xs text-muted-foreground">
            {chamadosFiltrados.length} chamado(s) consolidado(s)
          </span>
        </div>

        {/* 6 Cards de Indicadores Principais */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Total */}
          <Card className="border-t-4 border-t-[#C9A227] shadow-sm hover:shadow transition-shadow">
            <CardContent className="p-3.5">
              <div className="flex items-center justify-between text-muted-foreground mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider">Total</span>
                <Inbox className="w-4 h-4 text-[#C9A227]" />
              </div>
              <div className="text-2xl font-black text-foreground">{kpis.total}</div>
              <p className="text-[10px] text-muted-foreground mt-0.5">Chamados no período</p>
            </CardContent>
          </Card>

          {/* % SLA Cumprido */}
          <Card className="border-t-4 border-t-emerald-600 shadow-sm hover:shadow transition-shadow">
            <CardContent className="p-3.5">
              <div className="flex items-center justify-between text-muted-foreground mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider">SLA Cumprido</span>
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400">
                {kpis.percentualSla}%
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {kpis.noPrazo + kpis.proximosVencimento} de {kpis.total} no prazo
              </p>
            </CardContent>
          </Card>

          {/* Fora do Prazo / Atrasados */}
          <Card
            className={`border-t-4 ${
              kpis.atrasados > 0 ? 'border-t-rose-600 bg-rose-50/20' : 'border-t-muted'
            } shadow-sm hover:shadow transition-shadow cursor-pointer`}
            onClick={() => setFiltroSla(filtroSla === 'atrasado' ? 'todos' : 'atrasado')}
            title="Clique para filtrar apenas atrasados"
          >
            <CardContent className="p-3.5">
              <div className="flex items-center justify-between text-muted-foreground mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider">Atrasados</span>
                <AlertTriangle className="w-4 h-4 text-rose-600" />
              </div>
              <div className="text-2xl font-black text-rose-600">{kpis.atrasados}</div>
              <p className="text-[10px] text-muted-foreground mt-0.5">Fora da meta SLA</p>
            </CardContent>
          </Card>

          {/* Taxa de Resolução */}
          <Card className="border-t-4 border-t-blue-600 shadow-sm hover:shadow transition-shadow">
            <CardContent className="p-3.5">
              <div className="flex items-center justify-between text-muted-foreground mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider">
                  Taxa Resolução
                </span>
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-black text-blue-700 dark:text-blue-400">
                {kpis.taxaResolucao}%
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {kpis.finalizados} concluídos
              </p>
            </CardContent>
          </Card>

          {/* Tempo Médio de Resolução */}
          <Card className="border-t-4 border-t-purple-600 shadow-sm hover:shadow transition-shadow">
            <CardContent className="p-3.5">
              <div className="flex items-center justify-between text-muted-foreground mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider">Tempo Médio</span>
                <Clock className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-2xl font-black text-purple-700 dark:text-purple-400">
                {kpis.tempoMedioResolucao}h
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5">Abertura até conclusão</p>
            </CardContent>
          </Card>

          {/* Fila Ativa Pendente */}
          <Card className="border-t-4 border-t-amber-500 shadow-sm hover:shadow transition-shadow">
            <CardContent className="p-3.5">
              <div className="flex items-center justify-between text-muted-foreground mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider">Fila Ativa</span>
                <TrendingUp className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-black text-amber-600">
                {kpis.novos + kpis.andamento + kpis.aprovacao}
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5">Em atendimento</p>
            </CardContent>
          </Card>
        </div>

        {/* Funil Operacional de Status */}
        <Card className="shadow-sm">
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Funil Operacional de Resolução
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5">
              {/* Novo */}
              <div
                onClick={() => setFiltroStatus(filtroStatus === 'novo' ? 'todos' : 'novo')}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  filtroStatus === 'novo'
                    ? 'ring-2 ring-blue-500 bg-blue-50/50'
                    : 'hover:bg-muted/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-blue-700 dark:text-blue-400">
                    1. Triagem / Novo
                  </span>
                  <Badge variant="outline" className="text-[10px]">
                    {kpis.total > 0 ? Math.round((kpis.novos / kpis.total) * 100) : 0}%
                  </Badge>
                </div>
                <div className="text-xl font-bold mt-1">{kpis.novos}</div>
                <div className="text-[11px] text-muted-foreground">Aguardando início</div>
              </div>

              {/* Andamento */}
              <div
                onClick={() =>
                  setFiltroStatus(filtroStatus === 'andamento' ? 'todos' : 'andamento')
                }
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  filtroStatus === 'andamento'
                    ? 'ring-2 ring-amber-500 bg-amber-50/50'
                    : 'hover:bg-muted/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                    2. Em Atendimento
                  </span>
                  <Badge variant="outline" className="text-[10px]">
                    {kpis.total > 0 ? Math.round((kpis.andamento / kpis.total) * 100) : 0}%
                  </Badge>
                </div>
                <div className="text-xl font-bold mt-1">{kpis.andamento}</div>
                <div className="text-[11px] text-muted-foreground">Trabalho em execução</div>
              </div>

              {/* Aprovação */}
              <div
                onClick={() =>
                  setFiltroStatus(filtroStatus === 'aprovacao' ? 'todos' : 'aprovacao')
                }
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  filtroStatus === 'aprovacao'
                    ? 'ring-2 ring-purple-500 bg-purple-50/50'
                    : 'hover:bg-muted/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-purple-700 dark:text-purple-400">
                    3. Aprovação
                  </span>
                  <Badge variant="outline" className="text-[10px]">
                    {kpis.total > 0 ? Math.round((kpis.aprovacao / kpis.total) * 100) : 0}%
                  </Badge>
                </div>
                <div className="text-xl font-bold mt-1">{kpis.aprovacao}</div>
                <div className="text-[11px] text-muted-foreground">Validação com solicitante</div>
              </div>

              {/* Finalizado */}
              <div
                onClick={() =>
                  setFiltroStatus(filtroStatus === 'finalizado' ? 'todos' : 'finalizado')
                }
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  filtroStatus === 'finalizado'
                    ? 'ring-2 ring-emerald-500 bg-emerald-50/50'
                    : 'hover:bg-muted/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                    4. Finalizado
                  </span>
                  <Badge variant="outline" className="text-[10px]">
                    {kpis.total > 0 ? Math.round((kpis.finalizados / kpis.total) * 100) : 0}%
                  </Badge>
                </div>
                <div className="text-xl font-bold mt-1 text-emerald-600">{kpis.finalizados}</div>
                <div className="text-[11px] text-muted-foreground">Demanda entregue</div>
              </div>

              {/* Cancelados (exibidos separadamente como pedido) */}
              <div
                onClick={() =>
                  setFiltroStatus(filtroStatus === 'cancelado' ? 'todos' : 'cancelado')
                }
                className={`p-3 rounded-lg border border-dashed cursor-pointer transition-all ${
                  filtroStatus === 'cancelado'
                    ? 'ring-2 ring-slate-400 bg-slate-100 dark:bg-slate-900'
                    : 'hover:bg-muted/20 opacity-80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground">Cancelados</span>
                  <Badge variant="secondary" className="text-[10px]">
                    {kpis.cancelados}
                  </Badge>
                </div>
                <div className="text-xl font-bold mt-1 text-muted-foreground">
                  {kpis.cancelados}
                </div>
                <div className="text-[11px] text-muted-foreground">Descontinuados com motivo</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Gráfico de Linhas de Evolução Temporal + Distribuição Setorial Responsável vs Solicitante */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Evolução de Aberturas (2/3 da largura) */}
          <Card className="lg:col-span-2 shadow-sm">
            <CardHeader className="py-3 px-4 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <span>Evolução Temporal de Aberturas vs Conclusões</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Acompanhe a curva de novas solicitações e fechamentos ao longo do período.
                </CardDescription>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant={agrupamentoEvolucao === 'dia' ? 'default' : 'outline'}
                  onClick={() => setAgrupamentoEvolucao('dia')}
                  className="h-7 text-xs px-2"
                >
                  Dia
                </Button>
                <Button
                  size="sm"
                  variant={agrupamentoEvolucao === 'mes' ? 'default' : 'outline'}
                  onClick={() => setAgrupamentoEvolucao('mes')}
                  className="h-7 text-xs px-2"
                >
                  Mês
                </Button>
              </div>
            </CardHeader>
            <CardContent className="px-2 pb-3">
              {dadosEvolucao.length === 0 ? (
                <div className="h-64 flex items-center justify-center text-xs text-muted-foreground">
                  Nenhum dado temporal no período selecionado.
                </div>
              ) : (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={dadosEvolucao}
                      margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="label" fontSize={11} stroke="#888888" />
                      <YAxis fontSize={11} stroke="#888888" allowDecimals={false} />
                      <RechartsTooltip />
                      <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                      <Line
                        type="monotone"
                        dataKey="total"
                        name="Abertos"
                        stroke="#002817"
                        strokeWidth={2.5}
                        dot={{ r: 3, fill: '#002817' }}
                        activeDot={{ r: 5 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="finalizados"
                        name="Concluídos"
                        stroke="#10b981"
                        strokeWidth={2}
                        dot={{ r: 3, fill: '#10b981' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Distribuição por Setor Responsável vs Solicitante (1/3) */}
          <Card className="shadow-sm">
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm font-bold">Distribuição por Setor</CardTitle>
              <CardDescription className="text-xs">
                Comparativo entre setor destino (responsável) e setor de origem (solicitante).
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 pb-4 pt-1 space-y-4">
              {/* Setores Responsáveis Mais Demandados */}
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                  Setor Responsável (Destino)
                </span>
                <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                  {distribuicaoSetor.responsaveis.length === 0 ? (
                    <span className="text-xs text-muted-foreground">Sem dados</span>
                  ) : (
                    distribuicaoSetor.responsaveis.map((s, idx) => {
                      const perc = kpis.total > 0 ? Math.round((s.value / kpis.total) * 100) : 0
                      return (
                        <div
                          key={s.name}
                          onClick={() => {
                            const match = setores.find((x) => x.name === s.name)
                            if (match) setFiltroSetorResp(match.id)
                          }}
                          className="flex items-center justify-between text-xs p-1.5 rounded bg-muted/40 hover:bg-muted/80 cursor-pointer transition-colors"
                        >
                          <span className="font-medium truncate max-w-[140px]">{s.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#002817] dark:text-[#E4C46A]">
                              {s.value}
                            </span>
                            <span className="text-[10px] text-muted-foreground">({perc}%)</span>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>

              {/* Setores Solicitantes Mais Ativos */}
              <div className="pt-2 border-t">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                  Setor Solicitante (Origem)
                </span>
                <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                  {distribuicaoSetor.solicitantes.length === 0 ? (
                    <span className="text-xs text-muted-foreground">Sem dados</span>
                  ) : (
                    distribuicaoSetor.solicitantes.map((s) => {
                      const perc = kpis.total > 0 ? Math.round((s.value / kpis.total) * 100) : 0
                      return (
                        <div
                          key={s.name}
                          onClick={() => setFiltroSetorSol(s.name)}
                          className="flex items-center justify-between text-xs p-1.5 rounded bg-muted/40 hover:bg-muted/80 cursor-pointer transition-colors"
                        >
                          <span className="font-medium truncate max-w-[140px]">{s.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-foreground">{s.value}</span>
                            <span className="text-[10px] text-muted-foreground">({perc}%)</span>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ================= BLOCO B: PRODUTIVIDADE E PARTICIPAÇÃO ================= */}
      <div className="space-y-4 pt-4 border-t">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-6 bg-[#C9A227] rounded-sm" />
            <h2 className="text-lg font-bold tracking-tight text-foreground">
              Bloco 2: Produtividade por Profissional & Participação
            </h2>
          </div>
          <span className="text-xs text-muted-foreground">
            Clique em qualquer profissional para aplicar filtro cruzado
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Tabela por Profissional Responsável (2/3 da largura) */}
          <Card className="lg:col-span-2 shadow-sm">
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm font-bold flex items-center justify-between">
                <span>Desempenho por Profissional Responsável</span>
                <Badge variant="outline" className="text-xs">
                  {dadosProfissionais.length} profissional(is)
                </Badge>
              </CardTitle>
              <CardDescription className="text-xs">
                Volume de chamados, taxa de conclusão, atrasos e SLA cumprido por colaborador
                responsável.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead>Profissional</TableHead>
                      <TableHead className="text-center">Total</TableHead>
                      <TableHead className="text-center">Em And.</TableHead>
                      <TableHead className="text-center">Pend.</TableHead>
                      <TableHead className="text-center">Concluídos</TableHead>
                      <TableHead className="text-center">Atrasados</TableHead>
                      <TableHead className="text-center">% Conclusão</TableHead>
                      <TableHead className="text-center">SLA Cumprido</TableHead>
                      <TableHead className="text-right">Tempo Médio</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dadosProfissionais.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={9}
                          className="text-center py-8 text-xs text-muted-foreground"
                        >
                          Nenhum profissional encontrado com os filtros atuais.
                        </TableCell>
                      </TableRow>
                    ) : (
                      dadosProfissionais.map((p) => {
                        const percConcl =
                          p.total > 0 ? Math.round((p.finalizados / p.total) * 100) : 0
                        const percSla =
                          p.total > 0 ? Math.round(((p.total - p.atrasados) / p.total) * 100) : 100
                        const tMedio =
                          p.finalizados > 0
                            ? (p.tempoTotalHoras / p.finalizados).toFixed(1) + 'h'
                            : '—'
                        const isSelecionado = filtroProfResp === p.id

                        return (
                          <TableRow
                            key={p.id}
                            onClick={() => {
                              if (p.id !== 'sem_atribuicao') {
                                setFiltroProfResp(isSelecionado ? 'todos' : p.id)
                              }
                            }}
                            className={`cursor-pointer transition-colors ${
                              isSelecionado ? 'bg-[#002817]/10 font-medium' : 'hover:bg-muted/40'
                            }`}
                          >
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Users className="w-3.5 h-3.5 text-muted-foreground" />
                                <div>
                                  <span className="font-semibold text-xs block text-foreground">
                                    {p.nome}
                                  </span>
                                  {p.email && (
                                    <span className="text-[10px] text-muted-foreground">
                                      {p.email}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-center font-bold">{p.total}</TableCell>
                            <TableCell className="text-center">{p.andamento}</TableCell>
                            <TableCell className="text-center">{p.pendentes}</TableCell>
                            <TableCell className="text-center text-emerald-600 font-bold">
                              {p.finalizados}
                            </TableCell>
                            <TableCell className="text-center">
                              <span
                                className={`font-bold ${
                                  p.atrasados > 0 ? 'text-rose-600' : 'text-muted-foreground'
                                }`}
                              >
                                {p.atrasados}
                              </span>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant="outline" className="text-[10px]">
                                {percConcl}%
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge
                                variant="outline"
                                className={`text-[10px] ${
                                  percSla >= 90
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : percSla >= 75
                                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                                      : 'bg-rose-50 text-rose-700 border-rose-200'
                                }`}
                              >
                                {percSla}%
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right text-xs font-mono">{tMedio}</TableCell>
                          </TableRow>
                        )
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Ranking dos Maiores Solicitantes (1/3 da largura) */}
          <Card className="shadow-sm">
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm font-bold">Maiores Solicitantes</CardTitle>
              <CardDescription className="text-xs">
                Usuários com maior volume de aberturas de chamados no período.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto max-h-[380px]">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead>Solicitante</TableHead>
                      <TableHead className="text-center">Abertos</TableHead>
                      <TableHead className="text-center">Concluídos</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dadosSolicitantes.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={3}
                          className="text-center py-8 text-xs text-muted-foreground"
                        >
                          Nenhum solicitante identificado.
                        </TableCell>
                      </TableRow>
                    ) : (
                      dadosSolicitantes.map((s) => {
                        const isSel = filtroSolicitante === s.id
                        return (
                          <TableRow
                            key={s.id}
                            onClick={() => {
                              if (s.id !== 'sem_solicitante') {
                                setFiltroSolicitante(isSel ? 'todos' : s.id)
                              }
                            }}
                            className={`cursor-pointer transition-colors ${
                              isSel ? 'bg-[#002817]/10 font-medium' : 'hover:bg-muted/40'
                            }`}
                          >
                            <TableCell>
                              <div>
                                <span className="font-semibold text-xs block text-foreground">
                                  {s.nome}
                                </span>
                                <span className="text-[10px] text-muted-foreground">{s.setor}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-center font-bold text-xs">
                              {s.total}
                            </TableCell>
                            <TableCell className="text-center text-emerald-600 font-bold text-xs">
                              {s.finalizados}
                            </TableCell>
                          </TableRow>
                        )
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ================= BLOCO C: DETALHAMENTO OPERACIONAL ================= */}
      <div className="space-y-4 pt-4 border-t">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-6 bg-[#005B2E] rounded-sm" />
            <h2 className="text-lg font-bold tracking-tight text-foreground">
              Bloco 3: Detalhamento Operacional & Auditoria de Chamados
            </h2>
          </div>
          <span className="text-xs text-muted-foreground">
            Exibindo os últimos chamados atualizados com links diretos
          </span>
        </div>

        {/* Indicadores de Comunicação e Prioridade */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Card Comunicação */}
          <Card className="shadow-sm">
            <CardContent className="p-3.5 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Comunicações
                </span>
                <div className="text-xl font-bold mt-0.5">{comunicacoesQtd}</div>
                <p className="text-[10px] text-muted-foreground">Mensagens trocadas no histórico</p>
              </div>
              <div className="p-2 bg-blue-50 text-blue-700 rounded-lg dark:bg-blue-950 dark:text-blue-300">
                <MessageSquare className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>

          {/* Chamados com Interação */}
          <Card className="shadow-sm">
            <CardContent className="p-3.5 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Com Interações
                </span>
                <div className="text-xl font-bold mt-0.5">{chamadosComInteracaoQtd}</div>
                <p className="text-[10px] text-muted-foreground">Chamados com diálogo registrado</p>
              </div>
              <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg dark:bg-emerald-950 dark:text-emerald-300">
                <Users className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>

          {/* Gráfico de Pizza / Prioridade (col-span-2) */}
          <Card className="md:col-span-2 shadow-sm">
            <CardContent className="p-3.5 flex items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                  Distribuição por Prioridade
                </span>
                <div className="flex items-center gap-3 mt-2">
                  {dadosPrioridade.map((item) => (
                    <div
                      key={item.name}
                      onClick={() =>
                        setFiltroPrioridade(
                          filtroPrioridade === item.name.toLowerCase()
                            ? 'todos'
                            : item.name.toLowerCase(),
                        )
                      }
                      className="cursor-pointer hover:opacity-80 transition-opacity"
                    >
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-xs font-semibold">{item.name}:</span>
                        <span className="text-xs font-bold">{item.value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="w-24 h-16">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dadosPrioridade}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={15}
                      outerRadius={30}
                      paddingAngle={2}
                    >
                      {dadosPrioridade.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabela de Chamados Recentes com Situação de SLA Real */}
        <Card className="shadow-sm">
          <CardHeader className="py-3 px-4 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold">Relação Operacional de Chamados</CardTitle>
              <CardDescription className="text-xs">
                Clique na linha ou no botão de detalhes para inspecionar e interagir com o chamado.
              </CardDescription>
            </div>
            <span className="text-xs text-muted-foreground">
              Mostrando {Math.min(chamadosFiltrados.length, 30)} de {chamadosFiltrados.length}
            </span>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="w-[120px]">Número</TableHead>
                    <TableHead>Assunto / Título</TableHead>
                    <TableHead>Solicitante</TableHead>
                    <TableHead>Setor Destino</TableHead>
                    <TableHead>Responsável</TableHead>
                    <TableHead className="text-center">Prioridade</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-center">Abertura</TableHead>
                    <TableHead className="text-center">Prazo SLA</TableHead>
                    <TableHead className="text-center">Situação</TableHead>
                    <TableHead className="text-right w-[80px]">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {chamadosFiltrados.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={11}
                        className="text-center py-12 text-xs text-muted-foreground"
                      >
                        Nenhum chamado encontrado com os filtros aplicados.
                      </TableCell>
                    </TableRow>
                  ) : (
                    chamadosFiltrados.slice(0, 30).map((c) => {
                      const situacao = chamadosService.calcularSituacaoSla(c, slaConfigs)
                      const prioridadeInfo = PRIORIDADE_LABELS[c.prioridade]
                      const statusInfo = STATUS_LABELS[c.status]

                      let badgeSlaCor =
                        'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300'
                      let badgeSlaTexto = 'Dentro do Prazo'
                      if (situacao.estaAtrasado) {
                        badgeSlaCor =
                          'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-300'
                        badgeSlaTexto = 'Atrasado'
                      } else if (situacao.situacao === 'proximo_vencimento') {
                        badgeSlaCor =
                          'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300'
                        badgeSlaTexto = 'Próximo do Vencimento'
                      }

                      const dtAbertura = new Date(c.created).toLocaleDateString('pt-BR')
                      const dtPrazo = situacao.prazoLimite.toLocaleDateString('pt-BR')

                      return (
                        <TableRow
                          key={c.id}
                          className="hover:bg-muted/40 cursor-pointer"
                          onClick={() => navigate(`/admin/chamados/${c.id}`)}
                        >
                          <TableCell className="font-mono font-bold text-xs text-[#002817] dark:text-[#E4C46A]">
                            {c.numero}
                          </TableCell>
                          <TableCell className="max-w-xs truncate font-medium text-xs">
                            {c.assunto}
                          </TableCell>
                          <TableCell className="text-xs">
                            {c.expand?.solicitante?.name || 'Desconhecido'}
                          </TableCell>
                          <TableCell className="text-xs">
                            {c.expand?.setor_responsavel?.name || '—'}
                          </TableCell>
                          <TableCell className="text-xs">
                            {c.expand?.profissional_responsavel?.name || (
                              <span className="text-muted-foreground italic">Não atribuído</span>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge
                              variant="outline"
                              className={`${prioridadeInfo?.badgeClass || 'bg-slate-100'} text-[10px] font-semibold uppercase`}
                            >
                              {prioridadeInfo?.label || c.prioridade}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge
                              variant="outline"
                              className={`${statusInfo?.bg || 'bg-slate-100'} ${statusInfo?.text || 'text-slate-800'} ${statusInfo?.border || 'border-slate-200'} text-[10px] font-semibold`}
                            >
                              {statusInfo?.label || c.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center text-xs text-muted-foreground font-mono">
                            {dtAbertura}
                          </TableCell>
                          <TableCell className="text-center text-xs text-muted-foreground font-mono">
                            {dtPrazo}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge
                              variant="outline"
                              className={`${badgeSlaCor} text-[10px] font-bold`}
                            >
                              {badgeSlaTexto}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0"
                              onClick={(e) => {
                                e.stopPropagation()
                                navigate(`/admin/chamados/${c.id}`)
                              }}
                              title="Abrir detalhes do chamado"
                            >
                              <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ================= BLOCO G: LEITURA GERENCIAL AUTOMÁTICA ================= */}
      <Card className="bg-[#002817]/5 border border-[#002817]/20 shadow-sm">
        <CardContent className="p-4 md:p-5">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-[#002817] dark:text-[#C9A227]" />
            <h3 className="text-sm font-bold text-[#002817] dark:text-[#E4C46A] uppercase tracking-wider">
              Leitura Gerencial de Desempenho Operacional (Base de Dados Real)
            </h3>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            Análises verificáveis geradas dinamicamente com base nos chamados ativos, histórico de
            comunicações e prazos reais de SLA configurados.
          </p>

          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-foreground/90">
            {leituraGerencial.map((obs, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2 bg-background p-2.5 rounded-md border shadow-xs"
              >
                <ChevronRight className="w-4 h-4 text-[#005B2E] mt-0.5 shrink-0" />
                <span>{obs}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Modal de Configuração e Geração de Relatório PDF */}
      <RelatorioChamadosModal
        aberto={relatorioModalAberto}
        onClose={() => setRelatorioModalAberto(false)}
        chamadosFiltrados={chamadosFiltrados}
        slaConfigs={slaConfigs}
        periodoLabel={
          dataInicio && dataFim
            ? `${dataInicio} a ${dataFim}`
            : atalhoPeriodo === 'esteMes'
              ? 'Mês Atual'
              : 'Todo o Histórico'
        }
        filtrosAtivosDescricao={filtrosAtivosDescricao}
      />
    </div>
  )
}
